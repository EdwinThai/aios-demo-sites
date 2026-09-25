(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme toggle */
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var html = document.documentElement;
      var current = html.getAttribute('data-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = current ? current === 'dark' : prefersDark;
      var next = isDark ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('ph-theme', next); } catch (e) {}
    });
  }

  /* Mobile nav */
  var mobileToggle = document.getElementById('mobileToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Hero parallax */
  var heroBg = document.getElementById('heroBg');
  if (heroBg && !reduceMotion) {
    var ticking = false;
    var mouseX = 0, mouseY = 0;

    function updateTransform() {
      var scrollY = window.scrollY || window.pageYOffset;
      var translateY = scrollY * 0.35;
      heroBg.style.transform = 'translate3d(' + mouseX + 'px,' + (translateY + mouseY) + 'px,0) scale(1.08)';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateTransform);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('mousemove', function (e) {
      var w = window.innerWidth, h = window.innerHeight;
      mouseX = ((e.clientX / w) - 0.5) * 16;
      mouseY = ((e.clientY / h) - 0.5) * 10;
      if (!ticking) {
        window.requestAnimationFrame(updateTransform);
        ticking = true;
      }
    });
  }

  /* Footer year */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
