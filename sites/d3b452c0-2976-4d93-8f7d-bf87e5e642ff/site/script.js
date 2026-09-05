/* ==============================================
   ELLESSE – script.js
   Vanilla JS — no external dependencies
   ============================================== */

'use strict';

// ---------- HEADER: scroll shadow ----------
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---------- MOBILE NAV ----------
const navToggle = document.getElementById('nav-toggle');
const mainNav   = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Stäng meny' : 'Öppna meny');
  });

  // Close on nav link click
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Öppna meny');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      mainNav.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---------- FADE-IN ON SCROLL (IntersectionObserver) ----------
const fadeEls = document.querySelectorAll('.fade-in');
if ('IntersectionObserver' in window && fadeEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );
  fadeEls.forEach(el => observer.observe(el));
} else {
  // Fallback: just show everything
  fadeEls.forEach(el => el.classList.add('is-visible'));
}

// ---------- SERVICE CARD TOUCH FLIP ----------
// On touch devices (hover:none), tapping a card flips it.
const isTouchDevice = window.matchMedia('(hover: none)').matches;
if (!isTouchDevice) {
  // Desktop: cards are flipped via CSS :hover — no JS needed.
  // But for the featured card we handle a click toggle since it
  // doesn't participate in the standard 4-column flip pattern.
  const featured = document.querySelector('.service-card--featured');
  if (featured) {
    featured.addEventListener('click', () => {
      featured.classList.toggle('is-flipped');
    });
  }
} else {
  // Touch: all cards toggle on tap
  document.querySelectorAll('.service-card').forEach(card => {
    // On touch/mobile, CSS already shows both sides stacked (see media query),
    // so no JS flip needed — but keep the class for potential future use.
  });
}

// ---------- SMOOTH ACTIVE NAV LINK ----------
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.main-nav a');

if (sections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.style.color = (href === `#${id}`) ? 'var(--accent-dark)' : '';
            link.style.background = (href === `#${id}`) ? 'rgba(200,168,152,0.12)' : '';
          });
        }
      });
    },
    { threshold: 0.35 }
  );
  sections.forEach(s => sectionObserver.observe(s));
}
