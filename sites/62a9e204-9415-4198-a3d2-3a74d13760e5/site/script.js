(function(){
  'use strict';

  // Year in footer
  var yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  // Theme toggle
  var themeBtn = document.getElementById('themeToggle');
  if(themeBtn){
    themeBtn.addEventListener('click', function(){
      var current = document.documentElement.getAttribute('data-theme');
      var next;
      if(current === 'dark'){ next = 'light'; }
      else if(current === 'light'){ next = 'dark'; }
      else {
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        next = prefersDark ? 'light' : 'dark';
      }
      document.documentElement.setAttribute('data-theme', next);
      try{ localStorage.setItem('theme', next); }catch(e){}
    });
  }

  // Mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if(navToggle && mainNav){
    navToggle.addEventListener('click', function(){
      var open = mainNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mainNav.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded','false');
      });
    });
  }

  // Header scroll state
  var header = document.getElementById('siteHeader');
  function onScrollHeader(){
    if(!header) return;
    if(window.scrollY > 20){ header.classList.add('is-scrolled'); }
    else{ header.classList.remove('is-scrolled'); }
  }
  document.addEventListener('scroll', onScrollHeader, { passive:true });
  onScrollHeader();

  // Name-write progress (fallback in case site-kit does not already handle it)
  var nameWrite = document.querySelector('.name-write');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function updateNameProgress(){
    if(!nameWrite) return;
    var p = reduceMotion ? 100 : Math.max(0, Math.min(100, (window.scrollY / 180) * 100));
    nameWrite.style.setProperty('--progress', p + '%');
  }
  document.addEventListener('scroll', updateNameProgress, { passive:true });
  updateNameProgress();

  // Parallax blobs
  var blobs = document.querySelectorAll('.blob');
  var ticking = false;
  function applyParallax(){
    if(reduceMotion) return;
    var sy = window.scrollY;
    blobs.forEach(function(b, i){
      var speed = 0.08 + i * 0.05;
      b.style.transform = 'translateY(' + (sy * speed) + 'px)';
    });
    ticking = false;
  }
  document.addEventListener('scroll', function(){
    if(!ticking){
      window.requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive:true });

  var heroEl = document.getElementById('hero');
  if(heroEl && !reduceMotion){
    heroEl.addEventListener('mousemove', function(e){
      var rect = heroEl.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      blobs.forEach(function(b, i){
        var strength = 12 + i * 6;
        b.style.transform += ' translate(' + (x * strength) + 'px, ' + (y * strength) + 'px)';
      });
    });
  }

  // Open / closed status (Mon-Fri 10:00-18:00)
  var statusEl = document.getElementById('openStatus');
  function updateOpenStatus(){
    if(!statusEl) return;
    var now = new Date();
    var day = now.getDay(); // 0 sun .. 6 sat
    var minutes = now.getHours() * 60 + now.getMinutes();
    var isOpenDay = day >= 1 && day <= 5;
    var isOpenTime = minutes >= 600 && minutes < 1080; // 10:00-18:00
    var open = isOpenDay && isOpenTime;
    statusEl.innerHTML = '<span class="status-dot ' + (open ? 'open' : '') + '"></span>' + (open ? 'Öppet just nu' : 'Stängt just nu');
  }
  updateOpenStatus();
  setInterval(updateOpenStatus, 60000);

})();
