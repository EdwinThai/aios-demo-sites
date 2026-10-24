(function () {
  document.documentElement.classList.add('html-js');

  // Fade-in vid scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Öppet nu-markör utifrån verifierade tider (mån–fre 10–18, svensk tid)
  var dot = document.getElementById('statusDot');
  var line = document.getElementById('hoursLine');
  if (dot && line) {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Stockholm', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
      var day = get('weekday');
      var mins = parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10);
      var weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(day) !== -1;
      if (weekday && mins >= 600 && mins < 1080) {
        dot.classList.add('is-open');
        line.textContent = 'Öppet nu · stänger 18:00';
      }
    } catch (e) {}
  }
})();
