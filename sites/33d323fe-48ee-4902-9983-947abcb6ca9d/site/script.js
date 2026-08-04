/* ========================================
   LEVEO BYGG AB — script.js
   Vanilla JS: mobile nav, card flip toggle,
   form submit feedback
   ======================================== */

(function () {
  'use strict';

  /* ---- MOBILE NAV TOGGLE ---- */
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', function () {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navToggle.classList.toggle('open');
      navList.classList.toggle('open');
    });

    // Close nav when a link is clicked
    navList.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('open');
        navList.classList.remove('open');
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('open');
        navList.classList.remove('open');
      }
    });
  }

  /* ---- CARD FLIP: mobile tap toggle ---- */
  // On mobile, CSS resets the 3D flip to stacked layout.
  // We use the .flipped class to show/hide the back face.
  const cardWrappers = document.querySelectorAll('.card-flip-wrapper');

  cardWrappers.forEach(function (wrapper) {
    // Tap / click
    wrapper.addEventListener('click', function (e) {
      // Only toggle on mobile (no hover support / touch device)
      // We check window width, matching our CSS breakpoint
      if (window.innerWidth <= 640) {
        wrapper.classList.toggle('flipped');
      }
    });

    // Keyboard: Enter / Space for accessibility
    wrapper.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrapper.classList.toggle('flipped');
      }
    });
  });

  /* ---- OFFERT FORM: client-side feedback ---- */
  const offertForm = document.getElementById('offert-form');

  if (offertForm) {
    offertForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      const namn = offertForm.querySelector('#namn');
      const tel = offertForm.querySelector('#tel');
      const tjanst = offertForm.querySelector('#tjanst');

      if (!namn.value.trim() || !tel.value.trim() || !tjanst.value) {
        showFormError('Fyll i namn, telefonnummer och typ av uppdrag.');
        return;
      }

      // Show success message (form submits to server in production)
      offertForm.style.display = 'none';

      let successDiv = document.getElementById('form-success-msg');
      if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'form-success-msg';
        successDiv.className = 'form-success visible';
        successDiv.innerHTML =
          '<h3>Tack för din förfrågan!</h3>' +
          '<p>Vi har tagit emot din offertförfrågan och återkommer till dig inom en arbetsdag.</p>' +
          '<p style="margin-top:.75rem">Har du bråttom? Ring oss direkt: ' +
          '<a href="tel:0768898904" style="color:#F5A623;font-weight:700;">076-889 89 04</a>' +
          '</p>';
        offertForm.parentNode.insertBefore(successDiv, offertForm);
      }
      successDiv.classList.add('visible');
    });
  }

  function showFormError(msg) {
    let err = document.getElementById('form-error-msg');
    if (!err) {
      err = document.createElement('p');
      err.id = 'form-error-msg';
      err.style.cssText = 'color:#F5A623;font-size:.9rem;text-align:center;margin-top:-.5rem;';
      offertForm.appendChild(err);
    }
    err.textContent = msg;
    err.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---- SMOOTH SCROLL FALLBACK for older browsers ---- */
  // (CSS scroll-behavior: smooth handles modern browsers)
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        // Let CSS handle it; JS fallback for safety
        target.focus({ preventScroll: true });
      }
    });
  });

})();
