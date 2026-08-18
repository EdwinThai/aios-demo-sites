/* ===========================
   SALLADSHUSET — SCRIPT.JS
   =========================== */

'use strict';

// --- NAV TOGGLE (MOBILE) ---
const navToggle = document.querySelector('.nav-toggle');
const mainNav   = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when a link is clicked
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- SCROLL FADE-IN (IntersectionObserver) ---
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeEls.forEach(el => observer.observe(el));
} else {
  // Ensure all elements are visible if reduced motion
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('is-visible'));
}

// --- COUNT-UP ANIMATION ---
function animateCountUp(el, target, duration) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

if (!prefersReduced) {
  const countEls = document.querySelectorAll('[data-target]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animateCountUp(el, target, 1800);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  countEls.forEach(el => countObserver.observe(el));
}

// --- OPEN STATUS INDICATOR ---
function updateOpenStatus() {
  const statusEl = document.getElementById('open-status');
  const dotEl    = document.querySelector('.open-dot');
  if (!statusEl || !dotEl) return;

  const now  = new Date();
  const day  = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const hour = now.getHours();
  const min  = now.getMinutes();
  const time = hour * 60 + min;

  // Opening hours:
  // Mon (1): closed
  // Tue (2): 15:00-01:00 (next day) => 900-1440+60 = treat as 900-1500 min spanning midnight
  // Wed (3): 16:00-03:00
  // Thu (4): 16:00-03:00
  // Fri (5): 16:00-03:00
  // Sat (6): 16:00-03:00
  // Sun (0): closed

  let isOpen = false;
  let nextInfo = '';

  // Check if current time falls in any open window
  // For times past midnight (00:00-03:00), treat the previous day as still "open"
  if (day === 2 && time >= 900) { isOpen = true; } // Tue 15:00+
  if (day === 3 && time >= 960) { isOpen = true; } // Wed 16:00+
  if (day === 4 && time >= 960) { isOpen = true; } // Thu 16:00+
  if (day === 5 && time >= 960) { isOpen = true; } // Fri 16:00+
  if (day === 6 && time >= 960) { isOpen = true; } // Sat 16:00+

  // Handle post-midnight openings (01:00 Tue->Wed, 03:00 Wed-Sat nights)
  if (day === 3 && time < 60)  { isOpen = true; }  // Wed 00:00-01:00 (Tue night)
  if (day === 4 && time < 180) { isOpen = true; }  // Thu 00:00-03:00 (Wed night)
  if (day === 5 && time < 180) { isOpen = true; }  // Fri 00:00-03:00 (Thu night)
  if (day === 6 && time < 180) { isOpen = true; }  // Sat 00:00-03:00 (Fri night)
  if (day === 0 && time < 180) { isOpen = true; }  // Sun 00:00-03:00 (Sat night)

  if (isOpen) {
    statusEl.textContent = 'Öppet nu';
    dotEl.style.background = '#4A6741';
  } else {
    statusEl.textContent = 'Stängt just nu';
    dotEl.style.background = '#909090';
    dotEl.style.animation = 'none';
  }
}

updateOpenStatus();

// --- MOBILE FLIP CARD TOUCH TOGGLE ---
if ('ontouchstart' in window) {
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      const inner = card.querySelector('.flip-card-inner');
      if (!inner) return;
      const isFlipped = inner.style.transform === 'rotateY(180deg)';
      inner.style.transform = isFlipped ? '' : 'rotateY(180deg)';
    });
  });
}
