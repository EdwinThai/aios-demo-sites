// Fallback: visa .reveal-sektioner direkt om IntersectionObserver saknas.
// Själva interaktionen (hero-animation, bokning, uppräkning) sköts av site-kit.js.
(function () {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
})();
