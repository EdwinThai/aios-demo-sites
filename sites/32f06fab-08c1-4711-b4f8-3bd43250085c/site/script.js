/* ===================================
   STUDIO MIKAELA — script.js
   =================================== */

'use strict';

// --- SCROLL: Header shadow ---
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

// --- NAV TOGGLE (mobile) ---
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- SCROLL ANIMATION: IntersectionObserver ---
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  const animEls = document.querySelectorAll('.animate-on-scroll');

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

  animEls.forEach(el => observer.observe(el));
} else {
  // Immediately make all visible
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    el.classList.add('is-visible');
  });
}

// --- MOBILE FLIP CARDS: tap to toggle ---
const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (isTouch) {
  const flipCards = document.querySelectorAll('.service-card:not(.service-card--no-img)');
  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
  });
}

// --- COUNT-UP ANIMATION for rating numbers ---
function countUp(el, target, duration) {
  if (prefersReduced) {
    el.textContent = target.toFixed(1);
    return;
  }
  const startTime = performance.now();
  const startVal = 0;

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (startVal + (target - startVal) * eased).toFixed(1);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Observe rating numbers
const ratingEls = document.querySelectorAll('.rating-big, .reviews-score');

const ratingObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseFloat(entry.target.textContent);
      if (!isNaN(target)) {
        countUp(entry.target, target, 1800);
      }
      ratingObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

ratingEls.forEach(el => ratingObserver.observe(el));
