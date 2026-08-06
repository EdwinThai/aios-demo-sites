// ===== Vi's Tea — vanilla JS =====

// --- Mobile nav toggle ---
const navToggle = document.querySelector('.nav-toggle');
const mainNav   = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when a link inside it is clicked
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- Flip cards: touch / click toggle for mobile (no hover) ---
// We detect if the device is a coarse-pointer (touch) device
const isTouchDevice = window.matchMedia('(hover: none)').matches;

if (isTouchDevice) {
  document.querySelectorAll('.card-wrapper').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}

// --- Smooth header hide/show on scroll (optional UX) ---
let lastScrollY = window.scrollY;
const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;
  if (header) {
    if (currentY > lastScrollY && currentY > 80) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
  }
  lastScrollY = currentY;
}, { passive: true });

// Make sure header transition is smooth
if (header) {
  header.style.transition = 'transform 0.3s ease';
}
