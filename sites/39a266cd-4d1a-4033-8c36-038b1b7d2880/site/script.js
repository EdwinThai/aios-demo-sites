// ===== YEAR =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== NAV TOGGLE =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen.toString());
  });

  // Close menu on nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== SCROLL FADE (IntersectionObserver) =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  const fadeSections = document.querySelectorAll('.fade-section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  fadeSections.forEach(el => observer.observe(el));
} else {
  // Ensure all sections are visible if reduced motion is preferred
  document.querySelectorAll('.fade-section').forEach(el => el.classList.add('is-visible'));
}

// ===== OPEN STATUS INDICATOR =====
function updateOpenStatus() {
  const statusEl = document.getElementById('open-status');
  if (!statusEl) return;

  // Opening hours (Swedish local time):
  // Mon–Fri: 09:00–18:00, Sat: 11:00–15:00, Sun: closed
  const now = new Date();
  // Use sv-SE locale to get local Swedish time
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find(p => p.type === 'weekday').value; // mån, tis, ons…
  const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
  const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);
  const timeInMinutes = hour * 60 + minute;

  const dayMap = {
    'mån': { open: 9 * 60, close: 18 * 60 },
    'tis': { open: 9 * 60, close: 18 * 60 },
    'ons': { open: 9 * 60, close: 18 * 60 },
    'tor': { open: 9 * 60, close: 18 * 60 },
    'fre': { open: 9 * 60, close: 18 * 60 },
    'lör': { open: 11 * 60, close: 15 * 60 },
    'sön': null
  };

  const todayHours = dayMap[weekday];
  let isOpen = false;

  if (todayHours && timeInMinutes >= todayHours.open && timeInMinutes < todayHours.close) {
    isOpen = true;
  }

  statusEl.innerHTML = '';
  const dot = document.createElement('span');
  dot.classList.add('dot');
  const label = document.createElement('span');

  if (isOpen) {
    statusEl.classList.add('is-open');
    statusEl.classList.remove('is-closed');
    label.textContent = 'Just nu öppet';
    label.style.color = '#4caf78';
  } else {
    statusEl.classList.add('is-closed');
    statusEl.classList.remove('is-open');
    label.textContent = 'Just nu stängt';
    label.style.color = 'var(--text-muted)';
  }

  statusEl.appendChild(dot);
  statusEl.appendChild(label);
}

updateOpenStatus();

// ===== FLIP CARDS — mobile touch toggle =====
document.querySelectorAll('.tjänst-card-wrap').forEach(wrap => {
  wrap.addEventListener('click', () => {
    // Only toggle on touch/click; hover handles desktop
    if (window.matchMedia('(hover: none)').matches) {
      wrap.classList.toggle('flipped');
    }
  });
});

// ===== HEADER SHADOW ON SCROLL =====
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.boxShadow = '0 2px 20px rgba(44,31,26,0.1)';
    } else {
      header.style.boxShadow = 'none';
    }
  }, { passive: true });
}