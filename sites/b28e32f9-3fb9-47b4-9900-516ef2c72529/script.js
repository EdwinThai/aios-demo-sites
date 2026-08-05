// ===== MOBILE NAV TOGGLE =====
(function () {
  var toggle = document.querySelector('.nav__toggle');
  var list   = document.querySelector('.nav__list');
  if (!toggle || !list) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    list.classList.toggle('open', !expanded);
  });

  // Close nav on link click (mobile)
  list.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      list.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ===== MOBILE CARD TAP-TO-FLIP =====
// On touch devices there is no :hover — allow tap to toggle flip
(function () {
  function isTouchDevice() {
    return window.matchMedia('(hover: none)').matches;
  }

  if (!isTouchDevice()) return;

  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });
  });
})();
