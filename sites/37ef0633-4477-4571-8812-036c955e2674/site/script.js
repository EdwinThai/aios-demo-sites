// ============================================================
// FIXONFIX – Vanilla JS
// ============================================================

// Footer year
document.addEventListener('DOMContentLoaded', function () {
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var navList = document.getElementById('nav-menu');

  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      var isOpen = navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close nav when a link is clicked
    var navLinks = navList.querySelectorAll('a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navList.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Mobile flip-card tap toggle
  // On desktop hover is handled by CSS; on mobile we detect touch/click.
  // We check if it's a touch device and if so, the mobile CSS already
  // renders both sides stacked – no JS flip needed. But we keep the
  // .flipped class logic for any intermediate viewport edge cases.
  var isTouchDevice = window.matchMedia('(hover: none)').matches;
  if (isTouchDevice) {
    // On genuine touch devices the mobile CSS overrides perspective/transform,
    // so both faces are visible stacked. Nothing extra needed.
    return;
  }

  // For mouse devices at narrow widths (rare edge case) – not needed
  // because the mobile breakpoint removes 3D entirely via CSS.
});
