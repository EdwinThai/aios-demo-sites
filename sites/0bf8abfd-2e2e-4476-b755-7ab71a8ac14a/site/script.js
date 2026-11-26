/* Vanlig sida: ingen värld. */
/* Scroll-driven motion for a page carried by the logo or the name (2026-11-17, Axel: "det händer något som gör
   wow-faktorn snabbt när man börjar scrolla", then a clean page, and the logo or the name binds it together at the end).
   Two numbers on <html>, eased toward the real scroll with a short spring so a phone's flick stays smooth, written once
   per frame and only when they change:
     --in  0..1  how far the start of the scroll has come (0 at the top, 1 after --in-langd of a screen, default 0.8)
     --ut  0..1  how much of the footer is in view (0 before it, 1 when all of it is, or the page's end is reached)
   and the classes .har-scrollat (left the top) and .vid-slutet (--ut past 0.5). The page's own CSS turns them into
   transform, opacity, filter or clip-path; nothing here moves anything by itself. With reduced motion: --in 1 at once
   (the hero as it ends) only after the first scroll, and --ut 1 (the ending as it ends) once the footer shows. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var len = parseFloat(getComputedStyle(root).getPropertyValue("--in-langd")) || 0.8;
  var foot = document.querySelector(".site-footer");
  var inV = 0, utV = 0, inT = 0, utT = 0, lastIn = -1, lastUt = -1, running = false;
  function targets() {
    var y = window.scrollY || 0, h = window.innerHeight || 1;
    inT = Math.max(0, Math.min(1, y / (h * len)));
    var max = Math.max(1, document.documentElement.scrollHeight - h);
    if (foot) {
      var r = foot.getBoundingClientRect();
      utT = Math.max(0, Math.min(1, (h - r.top) / Math.max(1, Math.min(r.height, h))));
    }
    if (y >= max - 2) utT = 1;
    if (reduce) { inT = inT > 0 ? 1 : 0; utT = utT > 0 ? 1 : 0; }
  }
  function write() {
    if (Math.abs(inV - lastIn) > 0.0005) { root.style.setProperty("--in", inV.toFixed(4)); lastIn = inV; }
    if (Math.abs(utV - lastUt) > 0.0005) { root.style.setProperty("--ut", utV.toFixed(4)); lastUt = utV; }
    root.classList.toggle("har-scrollat", inV > 0.02);
    root.classList.toggle("vid-slutet", utV > 0.5);
  }
  function frame() {
    var k = reduce ? 1 : 0.16;
    inV += (inT - inV) * k; utV += (utT - utV) * k;
    if (Math.abs(inT - inV) < 0.001) inV = inT;
    if (Math.abs(utT - utV) < 0.001) utV = utT;
    write();
    if (inV !== inT || utV !== utT) requestAnimationFrame(frame); else running = false;
  }
  function kick() { targets(); if (!running) { running = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick, { passive: true });
  targets(); inV = inT; utV = utT; write();
})();
