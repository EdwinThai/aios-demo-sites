/* The one background of the page. It stays still on the screen while the text scrolls over it, moves a little by itself,
   and the scroll drives it. Without WebGL the page keeps its plain colour.
   Two things only a shader that asks for them gets: a photo (canvas data-img -> sampler img, its size ir, il fading in
   once loaded) and a soft pointer (m: x in -1..1 eased with a slow spring, y, and how fast it moved; on a phone the
   scroll speed), and ft: how much of the footer is in view (0..1), for an ending that waits for the footer.
   Shaders that do not declare them are untouched. */
(function () {
  "use strict";
  var canvas = document.getElementById("rum");
  if (!canvas) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gl;
  try { gl = canvas.getContext("webgl", { antialias: false, depth: false, stencil: false, alpha: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
  if (!gl) { canvas.style.display = "none"; return; }
  function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var pr = gl.createProgram();
  gl.attachShader(pr, shader(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}"));
  gl.attachShader(pr, shader(gl.FRAGMENT_SHADER, ""));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { canvas.style.display = "none"; return; }
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ["r", "t", "pg", "y", "ys", "img", "ir", "il", "m", "ft"].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
  var imgW = 1, imgH = 1, loaded = 0, il = 0, src = canvas.getAttribute("data-img");
  if (src && U.img) {
    var tex = gl.createTexture(), im = new Image();
    im.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
      /* a power-of-two image gets mipmaps (no shimmer far away, and texture2D's bias can blur it softly) */
      var pot = (im.naturalWidth & (im.naturalWidth - 1)) === 0 && (im.naturalHeight & (im.naturalHeight - 1)) === 0;
      if (pot) gl.generateMipmap(gl.TEXTURE_2D);
      /* a picture seen at a slant (a ceiling, a floor) stays sharp: anisotropic filtering where the device has it */
      var an = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
      if (an && pot) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, pot ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, pot ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, pot ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      gl.uniform1i(U.img, 0);
      imgW = im.naturalWidth; imgH = im.naturalHeight; loaded = 1;
    };
    im.src = src;
  }
  var ftv = 0, mx = 0, my = 0, tx = 0, ty = 0, sp = 0, lastX = null, lastY = null, lastScroll = window.scrollY || 0;
  if (U.m && !reduce) {
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      var nx = e.clientX / window.innerWidth * 2 - 1, ny = e.clientY / window.innerHeight;
      if (lastX !== null) sp = Math.min(1, sp + Math.hypot(nx - lastX, ny - lastY) * 3);
      lastX = nx; lastY = ny; tx = nx; ty = ny;
    }, { passive: true });
  }
  var smooth = window.scrollY || 0, scale = 0.9, slow = 0, frames = 0, since = 0;
  function frame(now) {
    var d = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 2.5 : 1.75) * scale;   /* a phone's small canvas can afford more of its sharpness */
    var w = Math.round(window.innerWidth * d), h = Math.round(window.innerHeight * d);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    smooth += ((window.scrollY || 0) - smooth) * (reduce ? 1 : 0.07);
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    gl.uniform2f(U.r, w, h);
    gl.uniform1f(U.t, reduce ? 20 : now / 1000);
    gl.uniform1f(U.pg, Math.max(0, Math.min(1, smooth / max)));
    gl.uniform1f(U.y, smooth / Math.max(1, window.innerHeight));
    /* ys: the real scroll, not eased, for anything that sits at a place on the page (it must move exactly with the text) */
    if (U.ys) gl.uniform1f(U.ys, (window.scrollY || 0) / Math.max(1, window.innerHeight));
    if (U.m) {
      var sc = window.scrollY || 0;
      sp = Math.max(sp * 0.955, Math.min(1, Math.abs(sc - lastScroll) / Math.max(1, window.innerHeight) * 6));
      lastScroll = sc;
      mx += (tx - mx) * 0.035; my += (ty - my) * 0.035;
      gl.uniform3f(U.m, mx, my, sp);
    }
    if (U.ft) {
      var foot = document.querySelector(".site-footer"), fr = foot ? foot.getBoundingClientRect() : null;
      var fv = fr ? Math.max(0, Math.min(1, (window.innerHeight - fr.top) / Math.max(1, Math.min(fr.height, window.innerHeight)))) : 0;
      ftv += (fv - ftv) * (reduce ? 1 : 0.06);
      gl.uniform1f(U.ft, ftv);
    }
    if (U.ir || U.il) { il += (loaded - il) * 0.04; if (U.ir) gl.uniform2f(U.ir, imgW, imgH); if (U.il) gl.uniform1f(U.il, il); }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frames++;
    if (now - since > 1000) {
      var fps = frames * 1000 / (now - since);
      since = now; frames = 0;
      slow = fps < 40 ? slow + 1 : 0;
      if (slow >= 2 && scale > .45) { scale *= .75; slow = 0; }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  /* One always-there way to book once the top of the page has gone. */
  var book = document.getElementById("boka-nu");
  if (book) {
    var onScroll = function () {
      var prices = document.getElementById("tjanster"), rr = prices ? prices.getBoundingClientRect() : null;
      var inPrices = rr && rr.top < window.innerHeight * .6 && rr.bottom > window.innerHeight * .3;
      var foot = document.querySelector(".site-footer"), fb = foot ? foot.getBoundingClientRect() : null;
      var atEnd = fb && fb.top < window.innerHeight * .75 && foot.querySelector(".btn-primary");
      book.classList.toggle("syns", (window.scrollY || 0) > window.innerHeight * .7 && !inPrices && !atEnd);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
