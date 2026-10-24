(function () {
  // Mjuk intoning av salongsbilderna när de rullas in i vy (opacity only).
  var imgs = document.querySelectorAll('.gallery img');
  if (!('IntersectionObserver' in window) || !imgs.length) return;
  document.documentElement.classList.add('js');
  imgs.forEach(function (i) { i.classList.add('pre'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.remove('pre');
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  imgs.forEach(function (i) { io.observe(i); });
})();
