/* ===== ELLESSE – SCRIPT.JS ===== */

(function () {
  'use strict';

  /* ---- MOBILE MENU ---- */
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.getElementById('main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
      document.body.style.overflow = expanded ? '' : 'hidden';
    });

    // Close on nav link click
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- SCROLL FADE-IN ---- */
  const fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all
    fadeEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---- FLIP CARDS ON TOUCH/CLICK (mobile) ---- */
  const flipCards = document.querySelectorAll('.flip-card');
  const isTouch = () => window.matchMedia('(hover: none)').matches;

  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      if (isTouch()) {
        card.classList.toggle('flipped');
      }
    });
  });

  /* ---- OPEN/CLOSED STATUS INDICATOR ---- */
  const statusEl = document.getElementById('open-status');
  if (statusEl) {
    const schedule = {
      // day (0=Sun): [openHour, openMin, closeHour, closeMin] or null if closed
      0: null,                    // Sunday
      1: [9, 0, 18, 0],           // Monday
      2: [9, 0, 18, 0],           // Tuesday
      3: null,                    // Wednesday
      4: [9, 0, 18, 0],           // Thursday
      5: [9, 0, 16, 0],           // Friday
      6: null,                    // Saturday
    };

    function isOpenNow() {
      const now  = new Date();
      const day  = now.getDay();
      const hours = schedule[day];
      if (!hours) return false;
      const [oh, om, ch, cm] = hours;
      const nowMins  = now.getHours() * 60 + now.getMinutes();
      const openMins = oh * 60 + om;
      const closeMins= ch * 60 + cm;
      return nowMins >= openMins && nowMins < closeMins;
    }

    function renderStatus() {
      const open = isOpenNow();
      statusEl.className = 'open-status ' + (open ? 'is-open' : 'is-closed');
      statusEl.innerHTML = '<span class="dot" aria-hidden="true"></span>' +
        (open ? 'Just nu öppet' : 'Just nu stängt');
    }

    renderStatus();
    // Refresh every minute
    setInterval(renderStatus, 60000);
  }

})();
