document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('grains-list');
  const moreBtn = document.getElementById('grains-more');
  const sectionAnchor = document.getElementById('parutions');
  if (!list) return;

  // Détecter mobile pour désactiver features gourmandes
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 768;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  function parseYearMonth(s) {
    if (!s) return { year: 0, month: 0 };
    const m = String(s).match(/^(\d{4})-(\d{2})$/);
    if (!m) return { year: 0, month: 0 };
    return { year: parseInt(m[1], 10) || 0, month: parseInt(m[2], 10) || 0 };
  }

  // Libellé et tri - utiliser requestAnimationFrame pour éviter le freeze
  const cards = Array.from(list.querySelectorAll('.doc-card'));

  // Traiter les cartes par lots pour éviter le freeze
  function processCardsInBatches(cards, batchSize = 5) {
    let index = 0;

    function processBatch() {
      const end = Math.min(index + batchSize, cards.length);

      for (let i = index; i < end; i++) {
        const card = cards[i];
        const { year, month } = parseYearMonth(card.dataset.gsdate || '');
        const titleEl = card.querySelector('.doc-title');
        const monthName = month ? cap(MONTHS[month-1]) : '';
        if (titleEl) {
          if (year && monthName) titleEl.textContent = `Grain de Sel · ${monthName} ${year}`;
          else if (year) titleEl.textContent = `Grain de Sel · ${year}`;
          else titleEl.textContent = 'Grain de Sel';
        }
        card.setAttribute('title', titleEl ? titleEl.textContent : 'Grain de Sel');
        card.dataset.year = String(year || 0);
        card.dataset.month = String(month || 0);
      }

      index = end;

      if (index < cards.length) {
        requestAnimationFrame(processBatch);
      } else {
        // Une fois le traitement terminé, trier et réorganiser
        sortAndDisplayCards();
      }
    }

    processBatch();
  }

  function sortAndDisplayCards() {
    cards.sort((a, b) => {
      const yb = parseInt(b.dataset.year || '0', 10);
      const ya = parseInt(a.dataset.year || '0', 10);
      if (yb !== ya) return yb - ya;
      const mb = parseInt(b.dataset.month || '0', 10);
      const ma = parseInt(a.dataset.month || '0', 10);
      return mb - ma;
    });

    // Utiliser un fragment pour minimiser les reflows
    const fragment = document.createDocumentFragment();
    cards.forEach(c => fragment.appendChild(c));
    list.appendChild(fragment);

    // Initialiser l'affichage après le tri
    initializeDisplay();
  }

  // Pré-connexion et préchargement des PDFs - désactivé sur mobile
  function preconnect(url) {
    if (isMobile || prefersReducedMotion) return; // Désactiver sur mobile
    try {
      const origin = new URL(url, location.href).origin;
      const id = 'preconnect-' + btoa(origin).replace(/=+/g,'');
      if (document.getElementById(id)) return;
      const dns = document.createElement('link');
      dns.rel = 'dns-prefetch';
      dns.href = origin;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(dns);
      document.head.appendChild(link);
    } catch (_) {}
  }

  function prefetchPdf(url) {
    if (isMobile || prefersReducedMotion) return; // Désactiver sur mobile
    try {
      if (!url) return;
      const id = 'prefetch-' + btoa(url).replace(/=+/g,'');
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'prefetch';
      link.as = 'document';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    } catch (_) {}
  }

  function initializeDisplay() {
    const firstHref = cards[0]?.getAttribute('href');
    if (firstHref && !isMobile) preconnect(firstHref);

    // Prefetch au survol/focus - désactivé sur mobile
    if (!isMobile && !prefersReducedMotion) {
      cards.forEach(card => {
        const href = card.getAttribute('href');
        if (!href) return;
        let armed = false;
        const arm = () => { if (armed) return; armed = true; prefetchPdf(href); };
        card.addEventListener('pointerenter', arm, { passive: true });
        card.addEventListener('focus', arm, { passive: true, capture: true });
      });
    }

    // Prefetch des premières visibles - fortement réduit sur mobile
    const PREFETCH_PREROLL = isMobile ? 1 : 3;
    const scheduled = new WeakSet();
    const prefetchIo = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !isMobile) {
          const href = e.target.getAttribute('href');
          if (href) prefetchPdf(href);
          prefetchIo.unobserve(e.target);
        }
      }
    }, { rootMargin: '200px 0px', threshold: 0.1 });

    function schedulePrefetch() {
      if (isMobile || prefersReducedMotion) return; // Désactiver sur mobile
      let count = 0;
      for (const card of cards) {
        const visible = card.style.display !== 'none';
        if (visible && count < PREFETCH_PREROLL && !scheduled.has(card)) {
          scheduled.add(card);
          prefetchIo.observe(card);
          count++;
        }
      }
    }

    // Afficher par paliers de 8 avec toggle Voir plus / Voir moins
    const CHUNK = 8;
    const INITIAL = CHUNK;
    let shown = Math.min(INITIAL, cards.length);

    function applyShowLimit() {
      // Utiliser requestAnimationFrame pour éviter les freeze
      requestAnimationFrame(() => {
        cards.forEach((card, idx) => {
          card.style.display = idx < shown ? '' : 'none';
        });
        if (!moreBtn) return;
        const allShown = shown >= cards.length;
        moreBtn.textContent = allShown ? 'Voir moins' : 'Voir plus';
        moreBtn.setAttribute('aria-expanded', allShown ? 'true' : 'false');
        moreBtn.style.display = cards.length > INITIAL ? '' : 'none';
        schedulePrefetch();
      });
    }

    if (moreBtn) {
      moreBtn.addEventListener('click', () => {
        const allShown = shown >= cards.length;
        if (allShown) {
          shown = INITIAL;
          applyShowLimit();
          if (sectionAnchor) {
            requestAnimationFrame(() => {
              sectionAnchor.scrollIntoView({ behavior: isMobile ? 'auto' : 'smooth', block: 'start' });
            });
          }
        } else {
          shown = Math.min(shown + CHUNK, cards.length);
          applyShowLimit();
        }
      });
    }

    applyShowLimit();
  }

  // Démarrer le traitement par lots
  processCardsInBatches(cards, isMobile ? 3 : 5);
});

