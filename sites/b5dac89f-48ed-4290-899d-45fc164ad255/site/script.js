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
  gl.attachShader(pr, shader(gl.FRAGMENT_SHADER, "precision highp float; uniform vec2 r; uniform float t, pg, y, ys, ft;    float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x*p.y); } float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3. - 2.*f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); } float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 4; i++){ s += a*noise(p); p = p*2.03 + 17.1; a *= .5; } return s; }  const float RH = .075; const float SL = .32;  float bnd(float i, float j){ return i + (hash(vec2(i, j*1.37)) - .5)*.62; }   vec4 stone(vec2 p, float j, out float dx){ float xs = p.x/SL + hash(vec2(j, 3.1))*9.; float k = floor(xs); float c = xs < bnd(k, j) ? k - 1. : k; float a = bnd(c, j), b = bnd(c + 1., j); dx = min(xs - a, b - xs)*SL; float id = hash(vec2(c, j)); float id2 = hash(vec2(j, c + 7.7)); return vec4(id, id2, c, (xs - a)/(b - a)); }  vec3 palette(float h){ vec3 c = vec3(.80, .73, .61); c = mix(c, vec3(.71, .70, .66), step(.30, h)); c = mix(c, vec3(.55, .60, .55), step(.52, h)); c = mix(c, vec3(.84, .76, .64), step(.66, h)); c = mix(c, vec3(.72, .58, .45), step(.82, h)); c = mix(c, vec3(.46, .48, .47), step(.93, h)); return c; }  void main(){ bool narrow = r.x/r.y < 1.; vec2 uv = (gl_FragCoord.xy - .5*r)/r.y;  float read = smoothstep(.02, .22, pg); float endv = smoothstep(.0, 1., ft);   float pitch = mix(.42, .16, read); pitch = mix(pitch, .46, endv); float D = narrow ? 2.7 : 1.55; float f = 1.35; float cy = t*.045 + y*.85;  vec3 rd = normalize(vec3(uv, f)); float cp = cos(pitch), sp = sin(pitch); rd = vec3(rd.x, rd.y*cp + rd.z*sp, -rd.y*sp + rd.z*cp); float tt = D/max(rd.z, .05); vec2 p = vec2(rd.x*tt, cy + rd.y*tt);   float fw = tt/(f*r.y)*1.2/max(rd.z, .2); float focus = D*mix(1.25, 1.05, read); float coc = abs(tt - focus)/tt*.010 + read*(1. - endv)*.0065; float blur = fw + coc;  float j = floor(p.y/RH); float fy = fract(p.y/RH); float dx; vec4 s = stone(p, j, dx); float dxA; vec4 sa = stone(p, j + 1., dxA);   float dy0 = fy*RH, dy1 = (1. - fy)*RH; if (s.x > .55) { float cut = mix(.38, .62, s.y); if (fy < cut) { dy1 = (cut - fy)*RH; s.x = hash(vec2(s.z, j + .5)); s.y = hash(vec2(j - .5, s.z)); } else { dy0 = (fy - cut)*RH; } }  float h = s.x*.016, hA = sa.x*.016; vec3 alb = palette(s.y);  float detail = 1. - smoothstep(.0015, .02, blur); float layer = fbm(vec2(p.x*14. + s.z*3.1, p.y*34.)); float blotch = fbm(p*5.5 + s.y*9.); float grain = noise(p*420.); alb *= mix(1., .80 + .30*layer + .08*(grain - .5), detail); alb *= .86 + .28*blotch; alb *= .82 + s.x*.36; alb = mix(alb, vec3(.72, .68, .60), smoothstep(RH*.25, RH*1.1, blur));   float bw = .007 + blur; vec3 n = vec3(0., 0., -1.); n.y += (1. - smoothstep(0., bw, dy1))*1.1; n.y -= (1. - smoothstep(0., bw, dy0))*1.1; n.x += (s.w < .5 ? -1. : 1.)*(1. - smoothstep(0., bw, dx))*.8; float rel = (noise(p*vec2(30., 160.)) - .5)*detail; n.y += rel*.5; n = normalize(n);  float gapw = .0011; float jointY = smoothstep(gapw, gapw + blur*1.4 + .001, min(dy0, dy1)); float jointX = smoothstep(gapw, gapw + blur*1.4 + .001, dx); float joint = min(jointY, jointX); float jfade = smoothstep(RH*.12, RH*.5, blur); joint = mix(joint, 1., jfade);   float sh = max(hA - h, 0.); float shad = 1. - (1. - smoothstep(0., sh*2.4 + blur + .002, dy1))*smoothstep(.0, .004, sh)*.75; shad = mix(shad, 1., jfade);  vec3 P = vec3(p, -h); vec3 col = vec3(0.);  float LS = narrow ? 2.0 : 1.7; float k0 = floor(p.y/LS); for (int i = -1; i <= 1; i++){ float k = k0 + float(i); float hk = hash(vec2(k, 11.3)); float xr = narrow ? mix(.32, .62, hk) : mix(.35, 1.05, hk); xr = mix(xr, xr + .25, read*(1. - endv)); xr = mix(xr, narrow ? .15 : .45, endv); vec3 L = vec3(xr, k*LS + .55, -.32); vec3 l = L - P; float d = length(l); l /= d; float lam = max(dot(n, l), 0.); vec3 dirS = normalize(vec3(0., -.93, .37)); float cone = smoothstep(.35, .9, dot(-l, dirS)); float pow1 = mix(1.9, 2.6, hk) * (1. + endv*.5); col += vec3(1., .80, .58)*lam*cone*pow1/(1. + d*d*1.8); }  col += vec3(.20, .16, .12)*(.65 + .35*n.y); vec3 c = alb*col; c *= joint*.68 + .32; c *= shad;   float gl = step(.996, hash(floor(p*900.)))*detail*(1. - read*.8); c += vec3(1., .85, .6)*gl*col*.6;   float fog = 1. - exp(-max(tt - D, 0.)*.32); vec3 haze = vec3(.10, .065, .045) + vec3(.16, .09, .045)*smoothstep(-.1, .5, uv.y)*(1. + endv); c = mix(c, haze, fog);   float air = exp(-length(uv - vec2(narrow ? .2 : .55, .55))*2.2)*.06; c += vec3(1., .7, .42)*air*(1. - read*.5 + endv);   c *= 1. - .35*smoothstep(.2, 1.1, length(uv*vec2(.8, 1.))); c *= mix(1., .62, smoothstep(.2, -.7, uv.x)*smoothstep(.15, -.5, uv.y)*(1. - endv*.5));  c = pow(c, vec3(.92)); c += (hash(gl_FragCoord.xy) - .5)*(1.5/255.); gl_FragColor = vec4(c, 1.); }"));
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
