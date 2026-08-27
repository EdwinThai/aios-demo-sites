/* ============================================================
   Salong Veronica Enescu — script.js
   ============================================================ */

(function () {
  'use strict';

  /* --- SCROLL-BASED HEADER --- */
  var header = document.getElementById('top') || document.querySelector('.site-header');
  function onScroll() {
    if (window.scrollY > 40) {
      header && header.classList.add('scrolled');
    } else {
      header && header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- MOBILE MENU --- */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  var mobileLinks = document.querySelectorAll('.mobile-link');

  function openMenu() {
    hamburger.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    hamburger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      if (mobileMenu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* --- INTERSECTION OBSERVER: FADE IN --- */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeEls.forEach(function (el) {
      if (prefersReduced) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* --- SERVICE CARD FLIP (touch/click for mobile) --- */
  var serviceCards = document.querySelectorAll('.service-card');

  function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  if (isTouchDevice()) {
    serviceCards.forEach(function (card) {
      card.addEventListener('click', function () {
        var isFlipped = card.classList.contains('is-flipped');
        // Close all others
        serviceCards.forEach(function (c) { c.classList.remove('is-flipped'); });
        if (!isFlipped) {
          card.classList.add('is-flipped');
        }
      });
    });
  }

  /* --- SMOOTH ANCHOR OFFSET (account for fixed header) --- */
  var HEADER_HEIGHT = 80;
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_HEIGHT;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

})();