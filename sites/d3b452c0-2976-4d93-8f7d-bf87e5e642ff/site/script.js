/* =========================================================
   ELLESSE — script.js
   ========================================================= */

// ── Year in footer ─────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Mobile nav ─────────────────────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const mainNav   = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav.classList.toggle('is-open', !expanded);
    document.body.style.overflow = !expanded ? 'hidden' : '';
  });

  // Close nav when a link is clicked
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

// ── Scroll fade-in (IntersectionObserver) ─────────────────
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
  // Fallback: show all immediately
  fadeEls.forEach(el => el.classList.add('is-visible'));
}

// ── Mobile card toggle (replaces hover-flip on touch) ──────
function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

if (isTouchDevice()) {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('tapped');
    });
  });
}

// ── Live opening-hours status ──────────────────────────────
// Based on verified opening hours:
// Mon: 09-18, Tue: 09-18, Wed: closed,
// Thu: 09-18, Fri: 09-16, Sat: closed, Sun: closed
function checkOpenStatus() {
  const statusDot  = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  if (!statusDot || !statusText) return;

  const now     = new Date();
  const day     = now.getDay();   // 0=Sun,1=Mon,...,6=Sat
  const hour    = now.getHours();
  const minutes = now.getMinutes();
  const time    = hour * 60 + minutes;

  const opens = 9 * 60;      // 09:00
  const closeWeekday = 18 * 60; // 18:00
  const closeFriday  = 16 * 60; // 16:00

  let isOpen = false;
  let nextInfo = '';

  if (day === 1 || day === 2) {
    // Mon, Tue: 09–18
    isOpen = time >= opens && time < closeWeekday;
    nextInfo = isOpen ? 'Stänger 18:00' : (time < opens ? 'Öppnar 09:00' : 'Öppnar igen måndag 09:00');
  } else if (day === 3) {
    // Wed: closed
    isOpen = false;
    nextInfo = 'Öppnar torsdag 09:00';
  } else if (day === 4) {
    // Thu: 09–18
    isOpen = time >= opens && time < closeWeekday;
    nextInfo = isOpen ? 'Stänger 18:00' : (time < opens ? 'Öppnar 09:00' : 'Öppnar måndag 09:00');
  } else if (day === 5) {
    // Fri: 09–16
    isOpen = time >= opens && time < closeFriday;
    nextInfo = isOpen ? 'Stänger 16:00' : (time < opens ? 'Öppnar 09:00' : 'Öppnar måndag 09:00');
  } else {
    // Sat (6), Sun (0)
    isOpen = false;
    nextInfo = 'Öppnar måndag 09:00';
  }

  if (isOpen) {
    statusDot.className  = 'status-dot open';
    statusText.textContent = 'Öppet nu — ' + nextInfo;
  } else {
    statusDot.className  = 'status-dot closed-dot';
    statusText.textContent = 'Stängt just nu — ' + nextInfo;
  }
}

checkOpenStatus();
