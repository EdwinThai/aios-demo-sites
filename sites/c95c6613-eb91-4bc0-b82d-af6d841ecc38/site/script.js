// =========================================
// KLIPPOTEK PASSAGEN – VANILLA JS
// =========================================

// --- MOBILE NAV TOGGLE ---
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav when clicking outside
  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();


// --- FLIP CARDS: TOUCH / CLICK TOGGLE ON MOBILE ---
// On touch devices (no hover), tap the card to flip it.
(function () {
  var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (!isTouchDevice) return;

  var cards = document.querySelectorAll('.flip-card');

  // On small screens, cards are displayed flat (CSS handles this via media query).
  // On larger touch screens (e.g. tablets) where the CSS flip is still active,
  // we allow tap-to-flip.
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      // Only toggle flip class if the card still uses 3D (i.e. not in stacked mobile mode)
      var inner = card.querySelector('.flip-card-inner');
      if (!inner) return;

      // Check if card is in flat/stacked mode (position: static via media query)
      var computedPos = window.getComputedStyle(inner).position;
      if (computedPos === 'static') return; // stacked layout, no flip needed

      card.classList.toggle('flipped');
    });

    // Keyboard accessibility
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var inner = card.querySelector('.flip-card-inner');
        if (!inner) return;
        var computedPos = window.getComputedStyle(inner).position;
        if (computedPos === 'static') return;
        card.classList.toggle('flipped');
      }
    });
  });
})();


// --- SMOOTH HEADER SHADOW ON SCROLL ---
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      header.style.boxShadow = '0 2px 16px rgba(46,31,26,0.13)';
    } else {
      header.style.boxShadow = 'none';
    }
  }, { passive: true });
})();
