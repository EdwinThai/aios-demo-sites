/* =============================================
   LEVEO BYGG AB — Vanilla JS
   - Mobile nav toggle
   - Card flip on tap (mobile)
============================================= */

(function () {
  'use strict';

  /* ---------- MOBILE NAV ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var navList = document.querySelector('.nav-list');

  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      var isOpen = navList.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close nav when a link is clicked
    navList.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navList.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- CARD FLIP ON MOBILE (TAP) ----------
     On touch/pointer devices without hover (mobile),
     allow tapping a card to flip it.
     A second tap on the back flips it back.
  ------------------------------------------------- */
  var isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (isTouchDevice) {
    var cardWrappers = document.querySelectorAll('.card-wrapper');

    cardWrappers.forEach(function (wrapper) {
      var card = wrapper.querySelector('.card');
      if (!card) return;

      // Disable CSS hover on touch devices via pointer-events trick —
      // instead we drive everything via JS class
      wrapper.addEventListener('click', function () {
        // Check if any other card is flipped and reset it
        cardWrappers.forEach(function (other) {
          if (other !== wrapper) {
            var otherCard = other.querySelector('.card');
            if (otherCard) otherCard.classList.remove('is-flipped');
          }
        });
        card.classList.toggle('is-flipped');
      });
    });
  }

})();
