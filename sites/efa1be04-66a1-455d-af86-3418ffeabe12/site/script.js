// Öppet nu-markör, baserad på de verifierade öppettiderna (Europe/Stockholm).
(function () {
  var el = document.getElementById('openStatus');
  var txt = document.getElementById('openStatusText');
  if (!el || !txt) return;
  // 0 = söndag ... 6 = lördag; [öppnar, stänger] i timmar
  var hours = { 0: null, 1: [9, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [10, 16] };
  var parts;
  try {
    parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Stockholm', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
    }).formatToParts(new Date());
  } catch (e) { return; }
  var map = {};
  parts.forEach(function (p) { map[p.type] = p.value; });
  var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  var d = days[map.weekday];
  var t = (parseInt(map.hour, 10) % 24) + parseInt(map.minute, 10) / 60;
  var h = hours[d];
  if (h && t >= h[0] && t < h[1]) {
    el.classList.add('is-open');
    txt.textContent = 'Öppet nu till ' + h[1] + ':00';
  } else {
    txt.textContent = 'Stängt just nu';
  }
})();
