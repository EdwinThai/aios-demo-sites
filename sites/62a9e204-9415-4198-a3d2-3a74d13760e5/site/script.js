(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile nav */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Theme toggle */
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var html = document.documentElement;
      var current = html.getAttribute('data-theme');
      var isDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = isDark ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* Hero parallax: scroll + mouse tilt, transform-only */
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg && !reduceMotion) {
    var scrollY = 0, tiltX = 0, tiltY = 0, ticking = false;
    function apply() {
      heroBg.style.transform = 'translate3d(' + tiltX + 'px,' + (scrollY * 0.32 + tiltY) + 'px,0) scale(1.08)';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      scrollY = window.scrollY;
      if (!ticking) { window.requestAnimationFrame(apply); ticking = true; }
    }, { passive: true });
    window.addEventListener('mousemove', function (e) {
      tiltX = (e.clientX / window.innerWidth - 0.5) * 18;
      tiltY = (e.clientY / window.innerHeight - 0.5) * 12;
      window.requestAnimationFrame(apply);
    });
  }

  /* Open-now indicator based on verified opening hours (mån-fre 10-18) */
  var statusEl = document.querySelector('[data-open-status]');
  if (statusEl) {
    var hours = { 1: [10, 18], 2: [10, 18], 3: [10, 18], 4: [10, 18], 5: [10, 18] };
    var now = new Date();
    var day = now.getDay();
    var h = now.getHours() + now.getMinutes() / 60;
    var isOpen = !!hours[day] && h >= hours[day][0] && h < hours[day][1];
    statusEl.textContent = isOpen ? 'Öppet nu' : 'Stängt nu — öppnar igen enligt schemat nedan';
  }

  /* Footer year */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }
})();
