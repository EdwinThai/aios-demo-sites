/* ============================================
   ELLESSE — script.js
   ============================================ */

/* --- MOBILE NAV TOGGLE --- */
(function () {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const isOpen = nav.classList.contains('is-open');
    nav.classList.toggle('is-open', !isOpen);
    toggle.classList.toggle('is-active', !isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  // Close nav when a link inside it is clicked
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

/* --- SCROLL FADE-IN (IntersectionObserver) --- */
(function () {
  var elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(function (el, index) {
    if (!prefersReduced) {
      // Stagger delay for grid cards
      el.style.transitionDelay = (index * 0.04) + 's';
      // Cap delay to avoid very long waits
      if (index * 0.04 > 0.4) el.style.transitionDelay = '0.4s';
    }
    observer.observe(el);
  });
})();

/* --- LIVE OPEN/CLOSED STATUS --- */
(function () {
  var dot = document.getElementById('open-dot');
  var label = document.getElementById('open-label');
  if (!dot || !label) return;

  // Opening hours: [day_index (0=Sun)] -> [open_hour, open_min, close_hour, close_min] or null if closed
  var hours = {
    0: null,           // Söndag — Stängt
    1: [9, 0, 18, 0],  // Måndag
    2: [9, 0, 18, 0],  // Tisdag
    3: null,           // Onsdag — Stängt
    4: [9, 0, 18, 0],  // Torsdag
    5: [9, 0, 16, 0],  // Fredag
    6: null            // Lördag — Stängt
  };

  function checkStatus() {
    var now = new Date();
    var day = now.getDay();
    var todayHours = hours[day];

    if (!todayHours) {
      dot.className = 'open-dot is-closed';
      label.textContent = 'Stängt idag';
      return;
    }

    var openTime  = new Date(now); openTime.setHours(todayHours[0], todayHours[1], 0, 0);
    var closeTime = new Date(now); closeTime.setHours(todayHours[2], todayHours[3], 0, 0);

    if (now >= openTime && now < closeTime) {
      dot.className = 'open-dot is-open';
      var closeHour = todayHours[2];
      var closeMin  = todayHours[3];
      label.textContent = 'Öppet nu – stänger ' + closeHour + ':' +
        (closeMin === 0 ? '00' : closeMin);
    } else if (now < openTime) {
      dot.className = 'open-dot is-closed';
      label.textContent = 'Stängt — öppnar ' + todayHours[0] + ':00 idag';
    } else {
      dot.className = 'open-dot is-closed';
      // Find next open day
      var nextDay = (day + 1) % 7;
      var tries = 0;
      while (!hours[nextDay] && tries < 7) {
        nextDay = (nextDay + 1) % 7;
        tries++;
      }
      var dayNames = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
      if (hours[nextDay]) {
        label.textContent = 'Stängt — öppnar ' + dayNames[nextDay] + ' kl ' + hours[nextDay][0] + ':00';
      } else {
        label.textContent = 'Stängt';
      }
    }
  }

  checkStatus();
  setInterval(checkStatus, 60000);
})();

/* --- MOBILE CARD TOGGLE (touch / click) --- */
(function () {
  if (window.matchMedia('(hover: none)').matches || window.innerWidth < 768) {
    // On touch devices the CSS already shows both halves stacked, nothing extra needed.
    // But if we ever want a tap-to-reveal, this is the place. Currently a no-op.
  }
})();
