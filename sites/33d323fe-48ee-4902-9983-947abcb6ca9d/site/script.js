/* =============================================
   Leveo Bygg AB — Script
============================================= */

'use strict';

// ---- Mobile nav toggle ----
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu   = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close nav when a link is clicked
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', function (e) {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ---- Flip cards: tap-to-toggle on mobile (no :hover) ----
(function () {
  // Only relevant on touch/small screens — but we handle it universally
  // via the CSS mobile overrides (flat layout).
  // On desktop, CSS :hover handles the flip.
  // On mobile, the cards are stacked so both sides show; no JS flip needed.
  // This section handles keyboard accessibility (Enter/Space on focused card).
  var cards = document.querySelectorAll('.flip-card');
  cards.forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var inner = card.querySelector('.flip-card-inner');
        if (inner) {
          var flipped = inner.style.transform === 'rotateY(180deg)';
          inner.style.transform = flipped ? '' : 'rotateY(180deg)';
        }
      }
    });
  });
})();

// ---- Offert form: simple client-side feedback ----
(function () {
  var form = document.querySelector('.offert-form');
  if (!form) return;

  // Insert success message placeholder after form
  var successMsg = document.createElement('div');
  successMsg.className = 'form-success';
  successMsg.setAttribute('role', 'alert');
  successMsg.textContent = 'Tack! Vi har tagit emot din förfrågan och återkommer så snart vi kan.';
  form.parentNode.insertBefore(successMsg, form.nextSibling);

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic required field check
    var namn     = form.querySelector('#namn').value.trim();
    var telefon  = form.querySelector('#telefon').value.trim();
    if (!namn || !telefon) {
      var first = !namn ? form.querySelector('#namn') : form.querySelector('#telefon');
      first.focus();
      first.style.borderColor = '#F5A623';
      setTimeout(function () { first.style.borderColor = ''; }, 2000);
      return;
    }

    // Simulate submission (no backend)
    form.style.display = 'none';
    successMsg.style.display = 'block';
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
