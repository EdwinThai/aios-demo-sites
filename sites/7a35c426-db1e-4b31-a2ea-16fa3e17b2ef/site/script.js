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
  gl.attachShader(pr, shader(gl.FRAGMENT_SHADER, "precision highp float; uniform vec2 r; uniform float t, pg, y, ys, ft;  const float DZ = 9.; const vec3 AMB = vec3(1., .58, .2);  float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y)*p3.z); } float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3. - 2.*f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); } float box(vec2 q, vec4 b, float s){ vec2 a = smoothstep(b.xy - s, b.xy + s, q)*(1. - smoothstep(b.zw - s, b.zw + s, q)); return a.x*a.y; } vec3 sky(float ev, float h){ vec3 lo = mix(vec3(.16, .2, .32), vec3(.035, .05, .1), ev); vec3 hi = mix(vec3(.07, .1, .2), vec3(.015, .02, .05), ev); return mix(lo, hi, clamp(h, 0., 1.)); }   vec3 facade(vec2 q, float b, float ev){ vec3 sk = sky(ev, .2);  vec2 tq = q*vec2(.95, 1.1); vec2 tid = floor(tq), tf = fract(tq); float th = hash(tid); float fog = smoothstep(0., .025 + b*.6, min(min(tf.x, 1. - tf.x), min(tf.y, 1. - tf.y))); vec3 wall = vec3(.34, .33, .3)*(.82 + .3*th); float up = exp(-max(q.y - 3.2, 0.)*.55)*box(q, vec4(-6.5, 3., 6.5, 30.), 2.2); vec3 lit = sk*.42 + AMB*up*.2*(1. + .4*ev); vec3 c = wall*lit*(.5 + .5*fog);   for(int k = 0; k < 2; k++){ float y0 = 5.3 + float(k)*2.3; float wx = mod(q.x + 1.1, 2.2) - 1.1; float cid = floor((q.x + 1.1)/2.2) + float(k)*7.; float m = box(vec2(wx, q.y), vec4(-.82, y0, .82, y0 + 1.35), .02 + b); float on = step(.45, hash(vec2(cid, 2.))); vec3 gl = sk*.5 + vec3(.05, .04, .03) + AMB*.05*on; vec2 d1 = vec2(abs(wx) - .38, q.y - (y0 + 1.15)); float spot = exp(-dot(d1, d1)/(.0015 + b*b*.5)); gl += vec3(1., .82, .55)*spot*(.6 + 1.2*on); gl *= .8 + .2*smoothstep(y0, y0 + 1.35, q.y); c = mix(c, gl, m); float frame = m*(1. - box(vec2(wx, q.y), vec4(-.76, y0 + .06, .76, y0 + 1.29), .01 + b)); c = mix(c, vec3(.12, .12, .13)*sk*2., frame*.8); }   float gf = box(q, vec4(-60., -1., 60., 3.05), .01 + b); vec3 gran = vec3(.02, .021, .025) + sk*.06; c = mix(c, gran, gf);   float dm = box(q, vec4(-5.75, .02, -4.62, 2.75), .015 + b); vec3 door = AMB*(.12 + .1*smoothstep(.2, 2.6, q.y))*vec3(1., .85, .75); door *= .7 + .3*box(q, vec4(-5.6, .2, -4.78, 2.6), .03 + b); c = mix(c, door, dm);   float wm = box(q, vec4(-4.25, .6, 4.25, 3.), .012 + b); vec3 win = AMB*(1.5 + .9*smoothstep(.6, 3., q.y))*(.92 + .08*sin(q.x*.9)); win *= mix(vec3(1.), vec3(1., .72, .55), box(q, vec4(-4.25, .6, -1.5, 3.), .2 + b)); win *= 1. - .45*box(q, vec4(-1.1, 1.15, 1.1, 2.45), .06 + b); win *= 1. - .6*box(q, vec4(-3.15, .95, -2.38, 2.55), .02 + b); win = mix(win, vec3(.025, .02, .02), box(q, vec4(-.95, .6, .85, .98), .015 + b)); for(int k = 0; k < 4; k++){ float px = 2.2 + float(k)*.45; float ph = .25 + .2*hash(vec2(float(k), 5.)); win = mix(win, vec3(1., .93, .8)*2.6, box(q, vec4(px, .98, px + .16, .98 + ph), .012 + b)*.8); } float sx = mod(q.x + 3.8, 1.05) - .525; vec2 sd = vec2(sx, q.y - 2.8); win += vec3(1., .9, .72)*(5.*smoothstep(.07 + b, .045, length(sd)) + 1.2*exp(-dot(sd, sd)*18.)); float mul = (1. - smoothstep(.03, .05 + b, abs(abs(q.x) - 1.43))); win = mix(win, vec3(.03, .025, .02), mul); c = mix(c, win*(1. + .25*ev), wm);   float aw = box(q, vec4(-4.55, 3.05, 4.55, 3.27), .01 + b); vec3 awc = vec3(.08, .09, .12)*(.85 + .15*step(.5, fract(q.x*2.2))) + AMB*.5*smoothstep(3.16, 3.05, q.y); c = mix(c, awc, aw);   float sg = box(q, vec4(-2.95, 3.72, 2.95, 4.58), .008 + b); c *= 1. - .5*box(q, vec4(-3.05, 3.55, 3.05, 3.75), .12 + b); vec3 sgc = vec3(.012, .012, .014) + vec3(.5, .52, .56)*.25*smoothstep(4.5, 4.58, q.y) + AMB*.04*smoothstep(4., 3.72, q.y); sgc += vec3(.6, .62, .66)*.03*smoothstep(-3., 3., q.x); c = mix(c, sgc, sg);   c = mix(c, sky(ev, (q.y - 9.8)*.12), smoothstep(9.75 - b, 9.85 + b, q.y)); return c; }  float irr(vec2 xz){ float dz = max(DZ - xz.y, .05); float hx = (atan((4.25 - xz.x)/dz) + atan((4.25 + xz.x)/dz))/3.14159; float vf = atan(3./dz) - atan(.6/dz); return hx*vf*1.8; }  void main(){ bool narrow = r.x/r.y < 1.; vec2 uv = (gl_FragCoord.xy - .5*r)/r.y; float a = r.x/r.y; float f = 1.3;  float sy0 = narrow ? .25 : .2375; float cz0 = narrow ? -10. : -2.; float cx0 = narrow ? 0. : -max(.5*a - .45, .05)*11.14/f; float th = atan(2.7/(DZ - cz0)); float s2 = smoothstep(.75, 1.7, ys); float pit = th - atan((sy0 + min(ys, .75))/f) - .2*s2;  float m = smoothstep(.1, .85, pg); float e = smoothstep(0., 1., ft); vec3 ro = vec3(mix(cx0, narrow ? 0. : -.6, m), 1.45, mix(cz0, narrow ? -3.5 : 2.4, m)); ro = mix(ro, vec3(narrow ? 0. : -.5, 1.5, narrow ? -12. : -4.5), e); pit = mix(pit, narrow ? .02 : .05, e); float ev = max(smoothstep(.25, .95, pg), e);  vec3 F = vec3(0., sin(pit), cos(pit)); vec3 U = vec3(0., cos(pit), -sin(pit)); vec3 rd = normalize(uv.x*vec3(1, 0, 0) + uv.y*U + f*F);  float tt = t*.8 + y*1.6; float fb = .01 + .05*s2*(1. - e); vec3 c = sky(ev, rd.y*2.);  float tf = rd.z > 0. ? (DZ - ro.z)/rd.z : 1e5; float tg = rd.y < 0. ? -ro.y/rd.y : 1e5;  if(tg < tf){ vec3 p = ro + rd*tg; vec2 xz = p.xz;  vec2 s = vec2(xz.x/.34, xz.y/.24); float row = floor(s.y); s.x += mod(row, 2.)*.5 + .2*hash(vec2(row, 3.)); vec2 id = floor(s), fr = fract(s); float edge = min(min(fr.x, 1. - fr.x)*.34, min(fr.y, 1. - fr.y)*.24); float near = smoothstep(2.4, .7, tg); float aa = .004 + tg*.0018 + near*.03; float fog = smoothstep(0., .012 + aa, edge); float hs = hash(id); vec3 stone = vec3(.4, .39, .37)*(.65 + .5*hs)*mix(vec3(1.), vec3(.95, .97, 1.04), hash(id + 7.)); float wet = smoothstep(.42, .78, noise(xz*.42) + .25*noise(xz*1.6)); wet = max(wet, (1. - fog)*.55);  vec3 n = normalize(vec3((fr.x - .5)*.18, 1., (fr.y - .5)*.26)*vec3(fog, 1., fog));  vec2 rc = floor(xz*2.2); vec2 rl = fract(xz*2.2) - .5 - (vec2(hash(rc), hash(rc + 3.1)) - .5)*.5; float ph = fract(tt*.55 + hash(rc + 9.)*5.); float ring = exp(-pow((length(rl) - ph*.45)*26., 2.))*(1. - ph)*wet*(1. - near); n = normalize(n + vec3(normalize(rl + 1e-4)*ring*.35, 0.).xzy);  float ir = irr(xz); vec3 sk = sky(ev, .3); vec3 dif = stone*(AMB*ir*(.7 + .3*n.y) + sk*.32)*(.45 + .55*fog)*(1. - .45*wet);  vec3 rr = reflect(rd, n); vec3 refl = sky(ev, rr.y); if(rr.z > 0.){ float tr = (DZ - p.z)/rr.z; vec3 h = p + rr*tr; float bl = mix(.9, .05, wet) + tr*.015 + near*.3; refl = facade(h.xy, bl, ev); } float fres = .03 + .97*pow(1. - max(dot(-rd, n), 0.), 5.); c = dif + refl*fres*mix(.25, 1., wet); } else if(tf < 1e4){ vec3 p = ro + rd*tf; c = facade(p.xy, fb + tf*.0008, ev); }   if(rd.z > 0.){ vec3 h = ro + rd*((DZ - ro.z)/rd.z); float ha = box(h.xy, vec4(-4.25, .6, 4.25, 3.), 1.6); c += AMB*ha*.07*(1. + .5*ev); }  c *= 1. - .25*dot(uv*vec2(.8, 1.), uv*vec2(.8, 1.)); c = 1. - exp(-c*1.25); c = pow(c, vec3(.4545)); c += (hash(gl_FragCoord.xy) - .5)*(1.5/255.); gl_FragColor = vec4(c, 1.); }"));
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
  var smooth = window.scrollY || 0, scale = 0.85, slow = 0, frames = 0, since = 0;
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
