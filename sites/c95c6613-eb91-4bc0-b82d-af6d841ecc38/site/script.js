/* ==============================================
   KLIPPOTEK PASSAGEN — script.js
   ============================================== */

(function () {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var navList = document.querySelector('.main-nav ul');

  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      var isOpen = navList.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav when a link is clicked
    navList.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navList.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Flip cards: tap to flip on touch/no-hover devices ----------
     On desktop the CSS :hover handles it. On touch devices we toggle
     the .is-flipped class so content is never mouse-only.
  -------------------------------------------------------------------------- */
  var isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (isTouchDevice) {
    // On narrow mobile the flip cards are stacked (CSS), no JS flip needed.
    // On touch devices that are NOT narrow (e.g. large tablets) we still
    // honour tap-to-flip.
    var isNarrow = window.matchMedia('(max-width: 640px)').matches;

    if (!isNarrow) {
      document.querySelectorAll('.flip-card').forEach(function (card) {
        card.addEventListener('click', function () {
          card.classList.toggle('is-flipped');
        });

        // Also support Enter / Space for keyboard users
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.classList.toggle('is-flipped');
          }
        });
      });
    }
  }

})();
