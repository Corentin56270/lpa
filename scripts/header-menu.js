(() => {
  const toggle = document.querySelector('.header-menu-toggle');
  const nav = document.getElementById('header-nav');
  if (!toggle || !nav) {
    return;
  }

  const submenuToggles = Array.from(nav.querySelectorAll('.nav-submenu-toggle'));

  const closeAllSubmenus = () => {
    submenuToggles.forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
      const parentItem = btn.closest('.nav-item--has-children');
      if (parentItem) {
        parentItem.classList.remove('is-open');
      }
    });
  };

  const closeOnOutsideClick = (event) => {
    if (!nav.classList.contains('is-open')) {
      return;
    }
    const target = event.target;
    if (!nav.contains(target) && target !== toggle && !toggle.contains(target)) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      closeAllSubmenus();
    }
  };

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    nav.classList.toggle('is-open', !isExpanded);
    if (isExpanded) {
      closeAllSubmenus();
    }
  });

  submenuToggles.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const parentItem = btn.closest('.nav-item--has-children');
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      if (!isExpanded) {
        submenuToggles.forEach((otherBtn) => {
          if (otherBtn !== btn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            const otherItem = otherBtn.closest('.nav-item--has-children');
            if (otherItem) {
              otherItem.classList.remove('is-open');
            }
          }
        });
      }
      btn.setAttribute('aria-expanded', String(!isExpanded));
      if (parentItem) {
        parentItem.classList.toggle('is-open', !isExpanded);
      }
    });
  });

  const desktopMedia = window.matchMedia('(min-width: 1031px)');
  const handleDesktopChange = (event) => {
    if (event.matches) {
      closeAllSubmenus();
    }
  };
  if (typeof desktopMedia.addEventListener === 'function') {
    desktopMedia.addEventListener('change', handleDesktopChange);
  } else {
    desktopMedia.addListener(handleDesktopChange);
  }

  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      closeAllSubmenus();
      toggle.focus();
    }
  });

  document.addEventListener('click', closeOnOutsideClick);
})();

