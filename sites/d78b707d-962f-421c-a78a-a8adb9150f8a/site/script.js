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
  gl.attachShader(pr, shader(gl.FRAGMENT_SHADER, "precision highp float; uniform vec2 r; uniform float t; uniform float pg; uniform float y; uniform float ys; uniform float ft;  float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);} float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);} float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(3.1,1.7);a*=.5;}return s;}   vec4 canopy(vec2 q,float sc,float th,float bl,vec3 lit,vec3 shd,float w,float sd){ vec2 p=q*sc+vec2(sd,sd*.7); float sway=(sin(w+p.y*.9+sd)*.10+sin(w*1.73+p.x*1.3)*.04)*(.5+.5*smoothstep(-1.,1.,p.y)); p.x+=sway; float f=fbm(p); float m=smoothstep(th-bl,th+bl,f); float fl=fbm(p+vec2(-.07,.09)); float sh=clamp((fl-f)*7.+.5,0.,1.); float cl=noise(p*4.3+sd); vec3 c=mix(shd,lit,clamp(sh*.85+cl*.25-.05,0.,1.)); return vec4(c,m); }   vec3 lamp(vec3 col,vec2 p,float s,float e,float L,float d){ p/=s; e/=s; float cord=smoothstep(.0024+e,.0024-e,abs(p.x))*step(.02,p.y); col=mix(col,vec3(.05,.05,.05),cord*.9); for(int i=0;i<3;i++){ float fi=float(i); vec2 u=p-vec2(0.,-fi*.05); float wd=.17-fi*.052; float hh=.046-fi*.005; float x=u.x/wd; float ax=step(abs(x),1.); float s1=sqrt(max(1.-x*x,0.)); float k=hh*.42*s1; float top=k+hh*(1.-x*x); float inE=smoothstep(e,-e,abs(u.y)-k)*ax; float body=smoothstep(-e,e,u.y-k)*smoothstep(e,-e,u.y-top)*ax; float vy=clamp((u.y-k)/max(top-k,1e-3),0.,1.);  vec3 bc=mix(vec3(.40,.41,.39),vec3(.80,.79,.74),(.5-.5*x)*(1.-d*.5)); bc*=.82+.25*vy; bc*=mix(1.,.42,d); bc+=vec3(1.,.74,.45)*L*.22*(1.-vy)*(1.-abs(x));  float ry=u.y/max(k,1e-4); vec3 uc=vec3(1.,.83,.58)*L*(.72+.38*(1.-abs(x)))*(1.1-.3*ry); col=mix(col,uc,inE); col=mix(col,bc,body); float rim=smoothstep(e*1.6,0.,abs(u.y-k))*ax*(1.-abs(x)*.6); col=mix(col,vec3(1.,.92,.76)*(.75+.35*L),rim*.55); } float b=exp(-length((p-vec2(0.,-.104))*vec2(1.,1.6))*110.); col+=vec3(1.,.9,.7)*b*L*1.2; return col; }  void main(){ vec2 uv=(gl_FragCoord.xy-.5*r)/r.y; bool narrow=r.x/r.y<1.; float zoom=narrow?.62:1.; float d=clamp(smoothstep(.03,.85,pg)*.78+ft*.5,0.,1.); float tilt=.08*smoothstep(0.,.3,pg)-.08*ft; vec2 q=uv/zoom; vec2 qr=q+vec2(0.,tilt); vec2 qo=q*(1.-.05*pg)+vec2(0.,tilt*.4); float w=t*.5+y*1.4; float e=1.5/(r.y*zoom); float L=.6+.5*d; float dof=smoothstep(.05,.35,pg)*(1.-ft*.5); float dG=smoothstep(0.,.55,d), dN=smoothstep(.45,1.,d); vec3 warm=vec3(1.,.76,.48);   float g=clamp(qo.y*1.2+.45,0.,1.); vec3 col=mix(vec3(.87,.88,.83),vec3(.76,.81,.80),g); col=mix(col,mix(vec3(.93,.70,.50),vec3(.55,.54,.60),g),dG); col=mix(col,mix(vec3(.28,.23,.29),vec3(.05,.07,.14),g),dN);  vec3 lit=mix(vec3(.30,.38,.21),vec3(.34,.29,.17),dG); lit=mix(lit,vec3(.08,.12,.11),dN); vec3 shd=mix(vec3(.08,.12,.07),vec3(.10,.08,.06),dG); shd=mix(shd,vec3(.02,.03,.04),dN);   float side=narrow?smoothstep(.1,-.5,qo.y)*.12:smoothstep(.0,-.6,qo.x)*.14+smoothstep(.0,-.4,qo.y)*.06; float th=.42+qo.y*.24-side; vec4 f1=canopy(qo,1.9,th+.05,.10+dof*.06,mix(lit,col,.38),mix(shd,col,.5),w*.7,3.); col=mix(col,f1.rgb,f1.a); vec4 f2=canopy(qo,1.15,th,.035+dof*.11,lit,shd,w,11.); col=mix(col,f2.rgb,f2.a);  float spm=narrow?smoothstep(.0,.3,qo.y):smoothstep(-.05,.3,qo.x); float sp=smoothstep(.74,.9,noise(qo*13.+vec2(sin(w)*.5,cos(w*.8)*.3)))*f2.a*(1.-dG)*spm; col+=vec3(.30,.30,.14)*sp*.55;   float P=narrow?.5:.52; float px=qr.x+(narrow?.21:.12); float cell=floor(px/P); float xm=px-cell*P-P*.5; float sheen=exp(-pow(xm/P+qr.y*.45-.12,2.)*28.); col+=vec3(.85,.92,1.)*sheen*(.045+.03*dN); vec2 Lp=narrow?vec2(.12,.29):vec2(.42,.25); vec2 Rp=Lp+(narrow?vec2(-.30,-.06):vec2(-.66,-.05)); float refl=exp(-length((qr-Rp)*vec2(1.,1.5))*9.); col+=warm*refl*.30*dN; col+=vec3(1.,.85,.6)*smoothstep(.012,.0,abs(length((qr-Rp)*vec2(1.,3.4))-.055))*.10*dN;   float bw=.016; float mb=smoothstep(bw+e,bw-e,abs(xm)); vec3 mc=mix(vec3(.30,.32,.32),vec3(.07,.08,.085),smoothstep(-bw,bw,xm)); mc=mix(mc,mc*.55+warm*.05,dN); col=mix(col,mc,mb); float ty=narrow?.08:.12; float tb=smoothstep(.009+e,.009-e,abs(qr.y-ty)); vec3 tc=mix(vec3(.08,.085,.09),vec3(.30,.31,.31),smoothstep(-.009,.009,qr.y-ty)); col=mix(col,tc*mix(1.,.6,dN),tb);   float sy=narrow?-.47:-.37; if(qr.y<sy){ float bf=sy-.05; vec3 wood=mix(vec3(.56,.45,.33),vec3(.34,.27,.20),smoothstep(sy,bf,qr.y)); wood*=.88+.12*noise(vec2(qr.x*38.,qr.y*4.)); vec3 c2=wood; if(qr.y<bf){ float z=.12/max(bf-qr.y+.02,.001); vec2 tp=vec2(qr.x*z*3.,z*3.); vec2 tj=abs(fract(tp)-.5); float joint=smoothstep(.47,.5,max(tj.x,tj.y)); c2=vec3(.24,.23,.22)*(.85+.15*smoothstep(bf-.2,bf,qr.y)); c2*=1.-joint*.18; c2*=mix(vec3(1.),vec3(.9,.95,.85),smoothstep(bf,bf-.1,qr.y)); } c2*=mix(1.,.42,dN); c2+=warm*.22*L*d*exp(-abs(qr.x-Lp.x)*3.5)*smoothstep(bf-.2,sy,qr.y); col=c2; } float sill=smoothstep(sy+.012+e,sy+.012-e,qr.y)*step(sy,qr.y); col=mix(col,vec3(.86,.79,.66)*mix(1.,.5,dN)+warm*.1*d,sill);   float cy=(narrow?.42:.38)-.06*qr.x; float cm=smoothstep(cy-e,cy+e,qr.y); vec3 cc=mix(vec3(.14,.14,.135),vec3(.07,.07,.07),clamp((qr.y-cy)*4.,0.,1.)); cc+=vec3(.07,.06,.05)*smoothstep(.025,0.,qr.y-cy); col=mix(col,cc,cm);   vec2 Fp=narrow?vec2(-.20,.36):vec2(-.34,.33); col=lamp(col,qr-Fp,narrow?.42:.52,e*5.,L*.9,d); col=lamp(col,qr-Lp,narrow?.95:1.,e,L,d);   vec2 lc=qr-Lp-vec2(0.,-.1); col+=warm*exp(-length(lc*vec2(.8,1.))*4.2)*L*(.10+.32*d); col+=warm*exp(-length(lc*vec2(1.,1.4))*20.)*L*.38; col+=warm*exp(-length((qr-Fp-vec2(0.,-.05))*vec2(.8,1.))*8.)*L*(.05+.18*d);  vec2 vg=uv*vec2(.8,1.); col*=1.-.18*dot(vg,vg); col+=(hash(gl_FragCoord.xy)-.5)*(1.5/255.); gl_FragColor=vec4(col,1.); }"));
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
