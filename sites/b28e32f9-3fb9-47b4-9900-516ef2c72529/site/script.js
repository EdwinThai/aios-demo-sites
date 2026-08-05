// Matcha House – script.js
// Mobile touch support for card-flip sections
// On devices without hover, a tap toggles the flip.

(function () {
  'use strict';

  // Only activate touch toggle when the device has no fine pointer (e.g. touch screens)
  var isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (!isTouchDevice) return;

  var wrappers = document.querySelectorAll('.card-flip-wrapper');

  wrappers.forEach(function (wrapper) {
    var inner = wrapper.querySelector('.card-flip');
    if (!inner) return;

    wrapper.addEventListener('click', function () {
      inner.classList.toggle('flipped');
    });

    // Keyboard accessibility: allow Enter / Space to flip
    wrapper.setAttribute('tabindex', '0');
    wrapper.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inner.classList.toggle('flipped');
      }
    });
  });
}());
