/* ============================================================
   ELLESSE — script.js
   ============================================================ */

// --- MOBILE NAV TOGGLE ---
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });

  // Close nav on link click
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    });
  });
})();

// --- SCROLL FADE-IN (IntersectionObserver) ---
(function () {
  var elems = document.querySelectorAll('.fade-in-elem');
  if (!elems.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elems.forEach(function (el) {
    observer.observe(el);
  });
})();

// --- OPEN / CLOSED INDICATOR ---
(function () {
  var indicator = document.getElementById('open-indicator');
  if (!indicator) return;

  // Opening hours: { day (0=Sun): { open: [h,m], close: [h,m] } | null }
  var schedule = {
    0: null,               // Sunday
    1: { open: [9, 0], close: [18, 0] },  // Monday
    2: { open: [9, 0], close: [18, 0] },  // Tuesday
    3: null,               // Wednesday
    4: { open: [9, 0], close: [18, 0] },  // Thursday
    5: { open: [9, 0], close: [16, 0] },  // Friday
    6: null                // Saturday
  };

  function check() {
    var now = new Date();
    var day = now.getDay();
    var h = now.getHours();
    var m = now.getMinutes();
    var todaySchedule = schedule[day];

    var dot = document.createElement('span');
    dot.className = 'status-dot';
    dot.setAttribute('aria-hidden', 'true');

    var text = document.createElement('span');

    if (
      todaySchedule &&
      (h > todaySchedule.open[0] ||
        (h === todaySchedule.open[0] && m >= todaySchedule.open[1])) &&
      (h < todaySchedule.close[0] ||
        (h === todaySchedule.close[0] && m < todaySchedule.close[1]))
    ) {
      indicator.classList.add('is-open');
      text.textContent = 'Öppet nu – stänger ' + pad(todaySchedule.close[0]) + ':' + pad(todaySchedule.close[1]);
    } else {
      indicator.classList.add('is-closed');
      // Find next open day
      var nextText = 'Stängt just nu';
      for (var i = 1; i <= 7; i++) {
        var nextDay = (day + i) % 7;
        if (schedule[nextDay]) {
          var dayNames = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
          nextText = 'Stängt just nu – öppnar ' + dayNames[nextDay] + ' ' +
            pad(schedule[nextDay].open[0]) + ':' + pad(schedule[nextDay].open[1]);
          break;
        }
      }
      text.textContent = nextText;
    }

    indicator.innerHTML = '';
    indicator.appendChild(dot);
    indicator.appendChild(text);
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  check();
})();

// --- SERVICE CARD MOBILE TAP-TO-FLIP ---
(function () {
  if (window.matchMedia('(hover: hover)').matches) return; // desktop with hover, skip

  var cards = document.querySelectorAll('.service-card');
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      this.classList.toggle('flipped');
    });
  });
})();
