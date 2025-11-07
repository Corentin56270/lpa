const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const baseDir = path.join(__dirname, '..');
  const pdfDir = path.join(baseDir, 'src', 'media', 'grains_de_sel');
  const thumbDir = path.join(pdfDir, 'thumbs');

  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

  const files = fs.readdirSync(pdfDir).filter(f => f.toLowerCase().endsWith('.pdf'));
  if (!files.length) {
    console.log('Aucun PDF trouvé dans', pdfDir);
    process.exit(0);
  }

  console.log('Génération des miniatures pour', files.length, 'PDFs...');

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    for (const file of files) {
      try {
        const name = file;
        const pdfPath = path.join(pdfDir, name);
        const outName = name.replace(/\.pdf$/i, '.png');
        const outPath = path.join(thumbDir, outName);

        // Skip si déjà présent
        if (fs.existsSync(outPath)) {
          console.log('Skip (exists):', outName);
          continue;
        }

        const page = await browser.newPage();
        const url = 'file://' + pdfPath;
        // Utiliser viewer PDF intégré via data URL pour garantir rendu page 1
        const viewerHtml = `
          <html><body style="margin:0; background:#fff;">
            <embed src="${url}#page=1&toolbar=0" type="application/pdf" width="100%" height="1200px">
          </body></html>`;
        await page.setContent(viewerHtml, { waitUntil: 'networkidle0' });

        // Attendre une courte période pour que le navigateur ait rendu
        await page.waitForTimeout(600);

        // Calculer zone d'aperçu: prise en compte d'une largeur raisonnable
        const clip = await page.evaluate(() => {
          const embed = document.querySelector('embed');
          const rect = embed.getBoundingClientRect();
          return { x: Math.max(0, rect.left), y: Math.max(0, rect.top), width: Math.round(rect.width), height: Math.round(Math.min(rect.height, 1200)) };
        });

        // Fallback clip
        if (!clip || clip.width < 100) {
          clip.width = 800; clip.height = 1100; clip.x = 0; clip.y = 0;
        }

        // Définir viewport correspondant pour un rendu propre
        await page.setViewport({ width: Math.max(800, clip.width), height: Math.max(600, clip.height), deviceScaleFactor: 1 });
        await page.screenshot({ path: outPath, clip, type: 'png', fullPage: false });
        console.log('Généré:', outName);
        await page.close();
      } catch (e) {
        console.error('Erreur sur', file, e.message || e);
      }
    }
  } finally {
    await browser.close();
  }

  console.log('Terminé.');
})();
