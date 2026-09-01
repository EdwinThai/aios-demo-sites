(function () {
  'use strict';


  // Manuellt satt via portalens "Tillfälligt stängt"-flöde — sätts av och
  // tas bort av företaget själva i chatten igen, ingen datumlogik här.
  var TEMPORARY_CLOSURE = { active: true, period: "v43–v48", message: "sjuk" };
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen.toString());
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function updateOpenStatus() {
    var statusEl = document.getElementById('open-status');
    if (!statusEl) return;


    if (TEMPORARY_CLOSURE.active) {
      statusEl.innerHTML = '';
      var closedDot = document.createElement('span');
      closedDot.className = 'dot';
      var closedLabel = document.createElement('span');
      var periodSpan = document.createElement('span');
      periodSpan.className = 'closure-period';
      periodSpan.textContent = TEMPORARY_CLOSURE.period ? ('Stängt ' + TEMPORARY_CLOSURE.period) : 'Stängt';
      closedLabel.appendChild(periodSpan);
      if (TEMPORARY_CLOSURE.message) {
        var sepSpan = document.createElement('span');
        sepSpan.className = 'closure-sep';
        sepSpan.textContent = ' · ';
        var msgSpan = document.createElement('span');
        msgSpan.className = 'closure-message';
        msgSpan.textContent = TEMPORARY_CLOSURE.message;
        closedLabel.appendChild(sepSpan);
        closedLabel.appendChild(msgSpan);
      }
      statusEl.classList.remove('is-open');
      statusEl.appendChild(closedDot);
      statusEl.appendChild(closedLabel);
      return;
    }
    var now = new Date();
    var formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Stockholm', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    });
    var parts = formatter.formatToParts(now);
    var weekday = parts.find(function (p) { return p.type === 'weekday'; }).value;
    var hour = parseInt(parts.find(function (p) { return p.type === 'hour'; }).value, 10);
    var minute = parseInt(parts.find(function (p) { return p.type === 'minute'; }).value, 10);
    var minutes = hour * 60 + minute;

    var dayMap = {
      'mån': { open: 10 * 60 + 30, close: 14 * 60 + 20 }, 'tis': { open: 3 * 60 + 45, close: 12 * 60 + 56 },
      'ons': { open: 8 * 60, close: 17 * 60 }, 'tor': { open: 8 * 60, close: 17 * 60 },
      'fre': { open: 8 * 60, close: 17 * 60 }, 'lör': { open: 9 * 60, close: 19 * 60 + 30 }
    };
    var today = dayMap[weekday];
    var isOpen = !!(today && minutes >= today.open && minutes < today.close);

    statusEl.innerHTML = '';
    var dot = document.createElement('span');
    dot.className = 'dot';
    var label = document.createElement('span');
    label.textContent = isOpen ? 'Just nu öppet' : 'Just nu stängt';
    statusEl.classList.toggle('is-open', isOpen);
    statusEl.appendChild(dot);
    statusEl.appendChild(label);
  }
  updateOpenStatus();
})();
