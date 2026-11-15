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
  gl.attachShader(pr, shader(gl.FRAGMENT_SHADER, "precision highp float; uniform vec2 r; uniform float t, pg, y, ys, ft;  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); } float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3. - 2.*f); return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }   float swell(vec2 p){ float s = sin(p.x*.55 + sin(p.y*.21)*1.6 + t*.12)*.5 + sin(p.y*.33 + p.x*.18 + 1.3 - t*.08)*.5 + (noise(p*.35) - .5)*.8; return s; }  float B, LX; float border(float z){ return B + .9*sin(z*.31) + .35*sin(z*.83 + 1.7); }   vec3 env(vec3 d){ float up = d.y; vec3 low  = vec3(.10, .055, .05); vec3 hz   = vec3(.42, .27, .25); vec3 high = vec3(.16, .09, .085); vec3 c = mix(low, hz, smoothstep(-.35, .02, up)); c = mix(c, high, smoothstep(.04, .55, up));  vec2 q = vec2(d.x/d.z - LX, d.y/d.z - .30); float box = smoothstep(.30, .16, abs(q.x)) * smoothstep(.10, .04, abs(q.y)); float halo = exp(-dot(q*vec2(1.6, 3.), q*vec2(1.6, 3.)) * 2.5); c += vec3(1., .86, .78) * box * 1.1 * step(0., d.z); c += vec3(.55, .36, .32) * halo * .35 * step(0., d.z); return c; }  void main(){ bool narrow = r.x/r.y < 1.; vec2 uv = (gl_FragCoord.xy - .5*r) / r.y; B = narrow ? 1.3 : .95; LX = narrow ? .55 : .62;  float read = smoothstep(.04, .28, pg); float endv = max(ft, smoothstep(.88, 1., pg)); float pitch = mix(-.24, -.62, read); pitch = mix(pitch, -.2, endv); float hgt = mix(1.0, .78, read); hgt = mix(hgt, 1.15, endv); float f = narrow ? 1.15 : 1.55;  float zc = t*.32 + y*2.4; vec3 ro = vec3(narrow ? .15 : 0., hgt, zc); vec3 rd = normalize(vec3(uv.x, uv.y, f)); float cp = cos(pitch), sp = sin(pitch); rd = vec3(rd.x, rd.y*cp + rd.z*sp, -rd.y*sp + rd.z*cp);   vec3 col; vec3 haze = vec3(.40, .255, .235) * mix(1., 1.12, endv);  if (rd.y < -.002){ float tt = -ro.y/rd.y; vec3 p = ro + rd*tt; float fp = tt/(r.y*f) * 1.2 / max(abs(rd.y)*3., .35);  float soft = smoothstep(3., 12., tt)*.12 + smoothstep(.9, .3, tt)*.05 + read*smoothstep(1.6, 5., tt)*.10; fp += soft;  float e = .06; float amp = .075 / (1. + tt*.12) * (1. - smoothstep(4., 14., tt)*.7); float h0 = swell(p.xz); float hx = swell(p.xz + vec2(e, 0.)); float hz = swell(p.xz + vec2(0., e)); vec3 n = normalize(vec3(-(hx - h0)/e*amp, 1., -(hz - h0)/e*amp));  float xb = border(p.z); float d = p.x - xb;  vec3 mocha = vec3(.25, .12, .095); vec3 nude  = vec3(.90, .66, .60); float ow = .05 + fp; vec3 base = mix(mocha, nude, smoothstep(-ow, ow + .12, d));  base *= mix(.8, 1., smoothstep(-1.4, 0., d));  vec3 L = normalize(vec3(-.25, .65, 1.)); float dif = max(dot(n, L), 0.)*.55 + .45; vec3 V = -rd; float F = .04 + .96*pow(1. - max(dot(V, n), 0.), 5.); vec3 R = reflect(rd, n); col = base*dif*(1. - F) + env(R)*F*1.1;   vec2 cell = floor(p.xz/.7); float hb = hash(cell); if (d > .35 && hb < .16){ vec2 cc = (cell + .5 + (vec2(hash(cell + 3.1), hash(cell + 7.7)) - .5)*.5)*.7; vec2 o = p.xz - cc; float br = .028; float bd = length(o); float bm = smoothstep(br + fp, br - fp, bd); vec3 bn = normalize(vec3(o/br*.9, sqrt(max(1. - dot(o/br, o/br)*.81, .02)))); bn = vec3(bn.x, bn.z, bn.y); vec3 gold = vec3(.93, .72, .40); vec3 bc = env(reflect(rd, bn))*gold*1.6 + gold*.12; col *= 1. - smoothstep(br*2.4, br, length(o - vec2(.012, -.01)))*(1. - bm)*.3; col = mix(col, bc, bm*.95); }   float gd = d - .07 - .05*sin(p.z*2.1 + 1.); float rw = .03; float s = clamp(gd/rw, -1., 1.); vec3 tn = normalize(vec3(s, sqrt(max(1. - s*s, 0.)), 0.) + n*.3); vec3 gold = vec3(.95, .74, .42); vec3 gc = env(reflect(rd, tn))*gold*1.7 + gold*.1; float cov = smoothstep(rw + fp, rw - fp*.5, abs(gd));  col *= 1. - smoothstep(rw*3.5 + fp, rw, abs(gd - .015))*.3; col = mix(col, gc, cov);   float fog = 1. - exp(-tt*.075); col = mix(col, haze, fog); } else { col = mix(haze, vec3(.14, .08, .075), smoothstep(0., .45, rd.y)); vec2 q = vec2(rd.x/rd.z - LX, rd.y/rd.z - .30); col += vec3(.5, .33, .3) * exp(-dot(q*vec2(1.6, 3.), q*vec2(1.6, 3.))*2.5) * .22; }   vec2 vq = gl_FragCoord.xy/r - .5; col *= 1. - dot(vq, vq)*.55;  col = pow(max(col, 0.), vec3(.95)); col += (hash(gl_FragCoord.xy) - .5)*(1.5/255.); gl_FragColor = vec4(col, 1.); }"));
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
