(function () {
  var el = document.getElementById('openStatus');
  var txt = document.getElementById('openStatusText');
  if (!el || !txt) return;
  var parts;
  try {
    parts = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Stockholm', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
    }).formatToParts(new Date());
  } catch (e) { return; }
  var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ''; };
  var day = get('weekday').toLowerCase().replace('.', '');
  var mins = parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10);
  var weekday = ['mån', 'tis', 'ons', 'tors', 'fre'].indexOf(day) !== -1;
  var open = weekday && mins >= 600 && mins < 1080;
  el.hidden = false;
  if (open) {
    el.classList.add('is-open');
    txt.textContent = 'Öppet nu · stänger 18:00';
  } else {
    txt.textContent = 'Stängt just nu';
  }
})();
