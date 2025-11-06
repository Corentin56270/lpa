#!/usr/bin/env node
/*
  Génère des miniatures PNG (page 1) pour chaque PDF dans src/media/grains_de_sel/
  - Sortie: src/media/grains_de_sel/thumbs/<basename>.png
  - Outils supportés: pdftoppm (Poppler) en priorité, fallback Ghostscript (gs)
  - Ne casse pas le build si aucun outil n'est dispo; se contente de logguer.
*/
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function hasCmd(cmd, args = ['--version']) {
  try {
    const res = spawnSync(cmd, args, { stdio: 'ignore' });
    return res.status === 0;
  } catch {
    return false;
  }
}

const root = path.resolve(__dirname, '..');
const pdfDir = path.join(root, 'src', 'media', 'grains_de_sel');
const thumbsDir = path.join(pdfDir, 'thumbs');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function listPdfs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .map(f => path.join(dir, f));
}

function newerThan(a, b) {
  try {
    const sa = fs.statSync(a);
    const sb = fs.statSync(b);
    return sa.mtimeMs > sb.mtimeMs;
  } catch {
    return false;
  }
}

(async function main() {
  if (!fs.existsSync(pdfDir)) {
    console.log('[thumbs] Dossier PDF introuvable, skip:', pdfDir);
    process.exit(0);
  }
  ensureDir(thumbsDir);

  const usePdftoppm = hasCmd('pdftoppm', ['-v']);
  const useGs = hasCmd('gs', ['--version']);

  if (!usePdftoppm && !useGs) {
    console.log('[thumbs] Ni pdftoppm ni gs disponibles, génération de miniatures sautée.');
    process.exit(0);
  }

  const pdfs = listPdfs(pdfDir);
  let made = 0, skipped = 0, failed = 0;

  for (const pdfPath of pdfs) {
    const base = path.basename(pdfPath, '.pdf');
    const outPng = path.join(thumbsDir, `${base}.png`);

    if (fs.existsSync(outPng) && !newerThan(pdfPath, outPng)) {
      skipped++;
      continue;
    }

    try {
      if (usePdftoppm) {
        const outBase = path.join(thumbsDir, base);
        const r = spawnSync('pdftoppm', ['-f', '1', '-l', '1', '-png', '-r', '110', pdfPath, outBase], { stdio: 'inherit' });
        if (r.status === 0) {
          const first = `${outBase}-1.png`;
          if (fs.existsSync(first)) {
            fs.renameSync(first, outPng);
          }
          made++;
          continue;
        }
      }
      if (useGs) {
        const r2 = spawnSync('gs', [
          '-sDEVICE=png16m',
          '-dSAFER', '-dBATCH', '-dNOPAUSE',
          '-dFirstPage=1', '-dLastPage=1',
          '-r110',
          `-sOutputFile=${outPng}`,
          pdfPath
        ], { stdio: 'inherit' });
        if (r2.status === 0) { made++; continue; }
      }
      failed++;
      console.warn('[thumbs] Échec génération pour', pdfPath);
    } catch (e) {
      failed++;
      console.warn('[thumbs] Erreur pour', pdfPath, e.message);
    }
  }

  console.log(`[thumbs] terminé: créés=${made}, inchangés=${skipped}, échecs=${failed}`);
  process.exit(0);
})();

