/* =====================================================================
   ШАҢЫРАҚ: 3D юрта
   Всё строится кодом: шаңырақ с перекрещенными күлдіреуіш, уықтар,
   решётка кереге, дверь, войлок с орнаментом, звёздное небо.
   Страница управляет сборкой через setState():
     uyk     0..1  уықтар прилетают и встают в обод
     kerege  0..1  решётка разворачивается от двери по кругу
     felt    0..1  войлок опускается сверху
     glow    0..1  внутри зажигается свет
     outer   0..1  всё, кроме шаңырақа (для вида снизу в меню)
     disc    0..1  сквозь шаңырақ видно блюдо из меню
   ===================================================================== */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const TAU = Math.PI * 2;
const R_IN = 0.8, R_OUT = 1.0;          // обод шаңырақа
const RK = 2.8, YK = -1.45, YB = -3.05; // кереге: радиус, верх, низ
const N_UYK = 56;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeBack = (t) => { const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

const NOISE = /* glsl */`
  float yHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float yNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(yHash(i), yHash(i + vec2(1, 0)), u.x), mix(yHash(i + vec2(0, 1)), yHash(i + vec2(1, 1)), u.x), u.y);
  }
  float yFbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * yNoise(p); p *= 2.07; a *= 0.5; } return v; }
`;

/* ---------- текстуры ---------- */
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// дерево: волокна вдоль u
function woodTexture(base, dark) {
  return canvasTex(1024, 128, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      const y = Math.random() * h;
      g.strokeStyle = `rgba(${dark},${0.08 + Math.random() * 0.18})`;
      g.lineWidth = 0.6 + Math.random() * 2.2;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 3);
      g.stroke();
    }
  });
}

// қошқар мүйіз: парные завитки бараньего рога
function ramHorn(g, cx, cy, s, color, width) {
  g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round';
  for (const dir of [-1, 1]) {
    g.beginPath();
    g.moveTo(cx, cy + s * 0.55);
    g.bezierCurveTo(cx, cy, cx + dir * s * 0.1, cy - s * 0.45, cx + dir * s * 0.55, cy - s * 0.45);
    g.bezierCurveTo(cx + dir * s * 0.95, cy - s * 0.45, cx + dir * s * 0.95, cy + s * 0.1, cx + dir * s * 0.62, cy + s * 0.12);
    g.bezierCurveTo(cx + dir * s * 0.4, cy + s * 0.14, cx + dir * s * 0.4, cy - s * 0.18, cx + dir * s * 0.6, cy - s * 0.15);
    g.stroke();
  }
}

function ornamentBand(w, h, bg, fg, step) {
  return canvasTex(w, h, (g) => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    g.fillStyle = fg; g.fillRect(0, 2, w, 3); g.fillRect(0, h - 5, w, 3);
    for (let x = step / 2; x < w; x += step) ramHorn(g, x, h * 0.52, h * 0.62, fg, Math.max(2, h * 0.06));
  });
}

// войлок: кремовый, с синими лентами с золотым орнаментом на стене
const FELT_V = { wallTop: 0.5, bandTop: 0.5, bandBot: 0.62, botBand: 0.93 };
function feltTexture() {
  return canvasTex(4096, 1024, (g, w, h) => {
    g.fillStyle = '#e8dcc4'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = `rgba(${Math.random() > 0.5 ? '255,250,240' : '120,100,70'},${Math.random() * 0.06})`;
      g.fillRect(Math.random() * w, Math.random() * h, 3, 3);
    }
    // швы купола: тонкие линии к шаңыраку
    g.strokeStyle = 'rgba(90,70,45,0.18)'; g.lineWidth = 3;
    for (let x = 0; x < w; x += w / 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h * FELT_V.wallTop); g.stroke(); }
    // верёвки по куполу
    g.strokeStyle = 'rgba(60,40,25,0.55)'; g.lineWidth = 6;
    for (const v of [0.22, 0.42]) { g.beginPath(); g.moveTo(0, h * v); g.lineTo(w, h * v); g.stroke(); }
    // лента басқұр: синяя с золотом
    const y0 = h * FELT_V.bandTop, y1 = h * FELT_V.bandBot;
    g.fillStyle = '#16264a'; g.fillRect(0, y0, w, y1 - y0);
    g.fillStyle = '#c9a45c'; g.fillRect(0, y0 + 6, w, 4); g.fillRect(0, y1 - 10, w, 4);
    for (let x = 64; x < w; x += 128) ramHorn(g, x, (y0 + y1) / 2 + 4, (y1 - y0) * 0.55, '#c9a45c', 6);
    // нижняя лента
    const b0 = h * FELT_V.botBand;
    g.fillStyle = '#16264a'; g.fillRect(0, b0, w, h - b0);
    g.fillStyle = '#c9a45c'; g.fillRect(0, b0 + 6, w, 3);
    // верёвки по стене
    g.strokeStyle = 'rgba(60,40,25,0.5)'; g.lineWidth = 5;
    for (const v of [0.72, 0.84]) { g.beginPath(); g.moveTo(0, h * v); g.lineTo(w, h * v); g.stroke(); }
  });
}

function doorTexture() {
  return canvasTex(512, 860, (g, w, h) => {
    g.fillStyle = '#16264a'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c9a45c'; g.lineWidth = 8;
    g.strokeRect(24, 24, w - 48, h - 48);
    g.lineWidth = 3; g.strokeRect(44, 44, w - 88, h - 88);
    g.beginPath(); g.moveTo(w / 2, 44); g.lineTo(w / 2, h - 44); g.stroke();
    for (const [cx, cy] of [[w / 4, h * 0.27], [w * 0.75, h * 0.27], [w / 4, h * 0.73], [w * 0.75, h * 0.73]]) ramHorn(g, cx, cy, 70, '#c9a45c', 6);
  });
}

function blobTexture(color, a = 0.75) {
  return canvasTex(256, 256, (g) => {
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, `rgba(${color},${a})`);
    r.addColorStop(0.62, `rgba(${color},0)`);
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  }, false);
}

function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x05080f);
  const box = (w, h, intensity, pos, tint) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  box(10, 2, 2.2, [0, 7, 3], 0xbcd0ff);
  box(3, 10, 1.8, [-8, 1, 4], 0xffd9a8);
  box(3, 10, 1.0, [8, 0, -1], 0x9fb4ff);
  box(4, 4, 1.6, [3, 2, 9], 0xffe2bd);
  return env;
}

/* ---------- геометрия ---------- */
function tube(points, radius, seg = 24, radial = 8) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), seg, radius, radial, false);
}

// профиль уыка в плоскости (r, y): прямой сверху, изгибается к низу
const UYK_PROFILE = [[R_OUT - 0.04, 0.0], [1.6, -0.46], [2.2, -0.9], [2.56, -1.18], [RK - 0.02, YK + 0.02]];

/* =====================================================================
   СЦЕНА
   ===================================================================== */
export function createYurt(canvas, opts = {}) {
  const mobile = !!opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.snapshot });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.6 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.03).texture;
  scene.add(new THREE.HemisphereLight(0xb8c8ff, 0x1a1208, 0.55));
  const moon = new THREE.DirectionalLight(0xcfdcff, 1.4);
  moon.position.set(-4, 6, 5);
  const fire = new THREE.DirectionalLight(0xffc68a, 1.1);
  fire.position.set(4, 1, 6);
  scene.add(moon, fire);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const root = new THREE.Group();
  const tilt = new THREE.Group();
  const body = new THREE.Group();
  const spin = new THREE.Group();
  scene.add(root); root.add(tilt); tilt.add(body); body.add(spin);

  const uOuter = { value: 1 };
  const outerMats = [];
  const fadeable = (m) => { outerMats.push(m); return m; };

  /* ---- шаңырақ ---- */
  const woodMap = woodTexture('#8a5a2e', '45,25,10');
  const wood = new THREE.MeshStandardMaterial({ map: woodMap, roughness: 0.55, metalness: 0, envMapIntensity: 0.8 });
  const rimProfile = [
    [R_IN, -0.07], [R_OUT - 0.02, -0.08], [R_OUT, -0.06], [R_OUT, 0.06], [R_OUT - 0.02, 0.08], [R_IN, 0.07], [R_IN - 0.01, 0.0], [R_IN, -0.07],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const rim = new THREE.Mesh(new THREE.LatheGeometry(rimProfile, 128), wood);
  spin.add(rim);
  // золотая лента орнамента по наружной стороне обода
  const gold = new THREE.MeshStandardMaterial({ color: 0xd8b26a, metalness: 1, roughness: 0.32, alphaMap: ornamentBand(2048, 128, null, '#fff', 128), transparent: true, alphaTest: 0.4 });
  gold.alphaMap.colorSpace = THREE.NoColorSpace;
  gold.alphaMap.wrapS = THREE.RepeatWrapping;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R_OUT + 0.004, R_OUT + 0.004, 0.11, 128, 1, true), gold);
  spin.add(band);
  // күлдіреуіш: по три выгнутые планки в двух направлениях
  const arches = [];
  for (const dir of [0, 1]) {
    for (const off of [-0.33, 0, 0.33]) {
      const L = Math.sqrt(R_IN * R_IN - off * off) + 0.02;
      const hgt = 0.44 - Math.abs(off) * 0.25;
      const pts = [];
      for (let i = 0; i <= 14; i++) {
        const z = -L + (2 * L * i) / 14;
        const y = 0.02 + hgt * (1 - (z / L) ** 2);
        pts.push(dir ? new THREE.Vector3(z, y, off) : new THREE.Vector3(off, y, z));
      }
      arches.push(tube(pts, 0.032, 40, 10));
    }
  }
  const archMesh = new THREE.Mesh(mergeGeometries(arches), wood);
  spin.add(archMesh);

  /* ---- уықтар ---- */
  const uykMat = fadeable(new THREE.MeshStandardMaterial({ map: woodTexture('#8e3d22', '50,15,5'), roughness: 0.6 }));
  const uykGeo = tube(UYK_PROFILE.map(([r, y]) => new THREE.Vector3(r, y, 0)), 0.024, 24, 8);
  const uyks = [];
  for (let i = 0; i < N_UYK; i++) {
    const a = (i / N_UYK) * TAU + Math.PI / 2;
    const pivot = new THREE.Group();
    pivot.rotation.y = -a;
    const m = new THREE.Mesh(uykGeo, uykMat);
    pivot.add(m);
    spin.add(pivot);
    uyks.push({ pivot, m, i });
  }

  /* ---- кереге: ромбическая решётка, разворачивается от двери ---- */
  const kGeos = [];
  const M = 64, DELTA = (TAU / M) * 3.2;
  for (const dir of [1, -1]) {
    for (let i = 0; i < M; i++) {
      const a0 = (i / M) * TAU;
      const pts = [];
      for (let j = 0; j <= 6; j++) {
        const t = j / 6;
        const a = a0 + dir * DELTA * t;
        pts.push(new THREE.Vector3(Math.sin(a) * (RK + dir * 0.008), YB + (YK - YB) * t, Math.cos(a) * (RK + dir * 0.008)));
      }
      kGeos.push(tube(pts, 0.016, 12, 5));
    }
  }
  // верхний и нижний обруч
  for (const y of [YK, YB + 0.02]) kGeos.push(new THREE.TorusGeometry(RK, 0.02, 6, 160).rotateX(Math.PI / 2).translate(0, y, 0));
  const keregeMat = fadeable(new THREE.MeshStandardMaterial({ map: woodTexture('#9a6a3a', '45,25,10'), roughness: 0.6 }));
  const uKerege = { value: 0 };
  keregeMat.onBeforeCompile = (sh) => {
    sh.uniforms.uKerege = uKerege;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLoc = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc;\nuniform float uKerege;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (abs(atan(vLoc.x, vLoc.z)) > uKerege * 3.1416 + 0.001) discard;');
  };
  const kerege = new THREE.Mesh(mergeGeometries(kGeos), keregeMat);
  spin.add(kerege);

  // дверь
  const DOOR_W = 0.9, DOOR_H = 1.3;
  const doorGroup = new THREE.Group();
  const doorMat = fadeable(new THREE.MeshStandardMaterial({ map: doorTexture(), roughness: 0.45, metalness: 0.2, emissive: 0xffa040, emissiveIntensity: 0 }));
  const door = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W, DOOR_H, 0.05), doorMat);
  door.position.set(0, YB + DOOR_H / 2, RK + 0.06);
  const frameMat = fadeable(new THREE.MeshStandardMaterial({ map: woodMap, roughness: 0.55 }));
  const postGeo = new THREE.BoxGeometry(0.09, DOOR_H + 0.12, 0.12);
  const postL = new THREE.Mesh(postGeo, frameMat); postL.position.set(-DOOR_W / 2 - 0.045, YB + (DOOR_H + 0.12) / 2, RK + 0.06);
  const postR = postL.clone(); postR.position.x *= -1;
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + 0.18, 0.1, 0.13), frameMat);
  lintel.position.set(0, YB + DOOR_H + 0.1, RK + 0.06);
  // полоска тёплого света по краю двери
  const slitMat = new THREE.MeshBasicMaterial({ color: 0xffb35c, transparent: true, opacity: 0, toneMapped: false });
  const slit = new THREE.Mesh(new THREE.PlaneGeometry(0.035, DOOR_H - 0.06), slitMat);
  slit.position.set(DOOR_W / 2 - 0.03, YB + DOOR_H / 2, RK + 0.09);
  doorGroup.add(door, postL, postR, lintel, slit);
  spin.add(doorGroup);

  /* ---- войлок: опускается сверху, с проёмом под дверь ---- */
  const fp = [];
  const domeN = 24;
  for (let i = 0; i <= domeN; i++) {
    const t = i / domeN;
    // вдоль профиля уыка, чуть выше него
    const c = new THREE.CatmullRomCurve3(UYK_PROFILE.map(([r, y]) => new THREE.Vector3(r, y, 0)));
    const p = c.getPoint(t);
    fp.push(new THREE.Vector2(p.x + 0.035 + t * 0.03, p.y + 0.05));
  }
  for (let i = 1; i <= 16; i++) { const t = i / 16; fp.push(new THREE.Vector2(RK + 0.07, YK - 0.02 + (YB - YK + 0.02) * t)); }
  const feltGeo = new THREE.LatheGeometry(fp, 160, Math.PI);
  // v вдоль профиля: купол 0..0.5, стена 0.5..1 (по числу точек)
  const uv = feltGeo.attributes.uv;
  const total = fp.length - 1;
  for (let i = 0; i < uv.count; i++) {
    const idx = Math.round(uv.getY(i) * total);
    uv.setY(i, idx <= domeN ? (idx / domeN) * FELT_V.wallTop : FELT_V.wallTop + ((idx - domeN) / (total - domeN)) * (1 - FELT_V.wallTop));
  }
  const feltMap = feltTexture();
  feltMap.flipY = false;
  const feltMat = fadeable(new THREE.MeshStandardMaterial({ map: feltMap, color: 0xd8cbb2, roughness: 0.95, side: THREE.DoubleSide }));
  const uFelt = { value: 0 };
  feltMat.onBeforeCompile = (sh) => {
    sh.uniforms.uFelt = uFelt;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc;\nvarying vec2 vFUv;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLoc = position;\nvFUv = uv;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vLoc;\nvarying vec2 vFUv;\nuniform float uFelt;\n${NOISE}`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        float edge = uFelt * 1.12 - 0.06 + (yFbm(vec2(atan(vLoc.x, vLoc.z) * 3.0, vFUv.y * 4.0)) - 0.5) * 0.08;
        if (vFUv.y > edge) discard;
        // проём двери
        if (vLoc.z > 0.0 && abs(vLoc.x) < ${(DOOR_W / 2 + 0.1).toFixed(3)} && vLoc.y < ${(YB + DOOR_H + 0.16).toFixed(3)}) discard;`);
  };
  const felt = new THREE.Mesh(feltGeo, feltMat);
  spin.add(felt);

  /* ---- свет изнутри, дым, тень, звёзды ---- */
  const glowMat = new THREE.MeshBasicMaterial({ map: blobTexture('255,180,90', 0.9), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 });
  const topGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), glowMat);
  tilt.add(topGlow);
  const doorGlowMat = glowMat.clone();
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), doorGlowMat);
  tilt.add(doorGlow);

  const smokeMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uAmt: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: /* glsl */`
      uniform float uTime, uAmt; varying vec2 vUv;
      ${NOISE}
      void main() {
        vec2 uv = vUv;
        float x = uv.x - 0.5 + sin(uv.y * 3.0 - uTime * 0.6) * 0.1 * uv.y;
        float w = mix(0.08, 0.36, uv.y);
        float shape = smoothstep(w, w * 0.1, abs(x)) * smoothstep(0.0, 0.15, uv.y) * (1.0 - smoothstep(0.45, 1.0, uv.y));
        float n = smoothstep(0.38, 0.85, yFbm(vec2(x * 3.0, uv.y * 2.0 - uTime * 0.25)));
        gl_FragColor = vec4(vec3(0.72, 0.76, 0.86), shape * n * uAmt * 0.38);
      }`,
  });
  const smoke = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 4), smokeMat);
  tilt.add(smoke);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTexture('0,0,0', 0.8), transparent: true, depthWrite: false, toneMapped: false }));
  const warm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTexture('255,170,80', 0.6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  scene.add(shadow, warm);

  const starCount = mobile ? 260 : 520;
  const sp = new Float32Array(starCount * 3), sa = new Float32Array(starCount * 2);
  for (let i = 0; i < starCount; i++) {
    sp[i * 3] = (Math.random() - 0.5) * 26;
    sp[i * 3 + 1] = (Math.random() - 0.5) * 15;
    sp[i * 3 + 2] = -4 - Math.random() * 8;
    sa[i * 2] = 0.6 + Math.random() * 1.8;
    sa[i * 2 + 1] = Math.random() * TAU;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  starGeo.setAttribute('aData', new THREE.BufferAttribute(sa, 2));
  const starMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uAmt: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: /* glsl */`
      attribute vec2 aData; uniform float uTime, uPx; varying float vA;
      void main() {
        vA = 0.55 + 0.45 * sin(uTime * (0.6 + aData.x * 0.5) + aData.y);
        gl_PointSize = aData.x * uPx * 1.4;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform float uAmt; varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        gl_FragColor = vec4(vec3(1.0, 0.95, 0.85), smoothstep(0.5, 0.0, d) * vA * uAmt);
      }`,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ---- блюдо сквозь шаңырақ ---- */
  const loader = new THREE.TextureLoader();
  const dishTex = (opts.dishes || []).map((url) => {
    const t = loader.load(url, (tx) => {
      const a = tx.image.width / tx.image.height;
      if (a > 1) { tx.repeat.set(1 / a, 1); tx.offset.set((1 - 1 / a) / 2, 0); } else { tx.repeat.set(1, a); tx.offset.set(0, (1 - a) / 2); }
    });
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
  const discGeo = new THREE.CircleGeometry(R_IN + 0.06, 96);
  discGeo.rotateX(-Math.PI / 2);
  const discs = [0, 1].map(() => {
    const m = new THREE.Mesh(discGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, toneMapped: false, depthWrite: false }));
    m.position.y = 0.5;
    m.renderOrder = -1;
    spin.add(m);
    return m;
  });
  let front = 0, dishBlend = 1, curDish = -1;
  function setDish(i) {
    if (i === curDish || !dishTex[i]) return;
    curDish = i;
    front = 1 - front;
    discs[front].material.map = dishTex[i];
    discs[front].material.needsUpdate = true;
    dishBlend = 0;
  }
  if (dishTex.length) setDish(0);

  /* ---- состояние ---- */
  const state = { x: 0, y: 0, z: 0, rx: 0.5, ry: 0, rz: 0, scale: 1, uyk: 0, kerege: 0, felt: 0, glow: 0, outer: 1, disc: 0, stars: 1, shadow: 0, idle: 0, alpha: 1 };
  const cur = { ...state };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let idleAngle = 0, visible = true, running = true, t0 = performance.now();

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);
  const viewSize = () => {
    const h = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return { w: h * camera.aspect, h };
  };

  const tmp = new THREE.Vector3();
  function apply(t, dt) {
    root.position.set(cur.x, cur.y + Math.sin(t * 0.7) * 0.03, cur.z);
    root.scale.setScalar(cur.scale);
    tilt.rotation.set(-mouse.y * 0.14, mouse.x * 0.24, 0);
    body.rotation.set(cur.rx, 0, cur.rz);
    spin.rotation.y = cur.ry + idleAngle;

    const outer = clamp01(cur.outer) * cur.alpha;
    uOuter.value = outer;
    for (const m of outerMats) { m.transparent = outer < 0.999; m.opacity = outer; m.depthWrite = outer > 0.5; }
    for (const m of [wood, gold]) { m.transparent = cur.alpha < 0.999 || m === gold; m.opacity = cur.alpha; }

    // уықтар: по кругу, каждый прилетает сверху-снаружи и встаёт в обод
    for (const u of uyks) {
      const k = clamp01((cur.uyk - (u.i / N_UYK) * 0.7) / 0.3);
      u.pivot.visible = k > 0.001 && outer > 0.01;
      const e = easeBack(k);
      u.m.position.set((1 - e) * 2.4, (1 - e) * 3.2, 0);
      u.m.rotation.set((1 - e) * 1.2, 0, (1 - e) * 0.9);
    }
    uKerege.value = cur.kerege;
    kerege.visible = cur.kerege > 0.002 && outer > 0.01;
    const dk = clamp01(cur.kerege * 6);
    doorGroup.visible = dk > 0.01 && outer > 0.01;
    doorGroup.scale.set(1, easeOut(dk), 1);
    doorGroup.position.y = (1 - easeOut(dk)) * (YB * -0.0);
    uFelt.value = cur.felt;
    felt.visible = cur.felt > 0.002 && outer > 0.01;

    // свет изнутри
    const glow = cur.glow * outer;
    doorMat.emissiveIntensity = glow * 0.12;
    slitMat.opacity = glow;
    spin.updateMatrixWorld(true);
    tmp.set(0, 0.3, 0); spin.localToWorld(tmp); tilt.worldToLocal(tmp);
    topGlow.position.copy(tmp);
    topGlow.rotation.set(-tilt.rotation.x, -tilt.rotation.y, 0);
    glowMat.opacity = glow * 0.9;
    smoke.position.set(tmp.x, tmp.y + 1.9, tmp.z);
    smoke.rotation.copy(topGlow.rotation);
    smokeMat.uniforms.uTime.value = t;
    smokeMat.uniforms.uAmt.value = glow;
    tmp.set(0, YB + 0.55, RK + 0.4); spin.localToWorld(tmp); tilt.worldToLocal(tmp);
    doorGlow.position.copy(tmp);
    doorGlow.rotation.copy(topGlow.rotation);
    // дверь светится, только когда смотрит на нас
    const facing = Math.max(0, Math.cos(spin.rotation.y));
    doorGlowMat.opacity = glow * 0.55 * facing;

    // тень и тёплое пятно на земле
    const s = cur.scale;
    const groundY = cur.y + YB * s * Math.cos(cur.rx) - 0.05;
    shadow.position.set(cur.x, groundY, cur.z - 1);
    shadow.scale.set(s * 7.5, s * 1.1, 1);
    shadow.material.opacity = cur.shadow * outer * 0.7;
    warm.position.set(cur.x, groundY + 0.02, cur.z - 0.9);
    warm.scale.set(s * 7, s * 1.2, 1);
    warm.material.opacity = glow * 0.35;

    // блюдо
    dishBlend = Math.min(1, dishBlend + dt * 2.2);
    const d = cur.disc * cur.alpha;
    discs[front].material.opacity = d * dishBlend;
    discs[1 - front].material.opacity = d * (1 - dishBlend);
    for (const m of discs) m.visible = m.material.opacity > 0.003;

    // звёзды
    starMat.uniforms.uTime.value = t;
    starMat.uniforms.uAmt.value = cur.stars;
    stars.position.set(-mouse.x * 0.3, -mouse.y * 0.2, 0);
    stars.visible = cur.stars > 0.01;
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    if (!visible) return;
    const k = 1 - Math.pow(0.001, dt);
    for (const key of Object.keys(state)) cur[key] += (state[key] - cur[key]) * k;
    idleAngle += dt * 0.18 * cur.idle;
    mouse.x += (mouse.tx - mouse.x) * (1 - Math.pow(0.003, dt));
    mouse.y += (mouse.ty - mouse.y) * (1 - Math.pow(0.003, dt));
    apply(now / 1000, dt);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    setState: (s) => Object.assign(state, s),
    jump: (s) => { Object.assign(state, s); Object.assign(cur, state); },
    setMouse: (x, y) => { mouse.tx = x; mouse.ty = y; },
    setVisible: (v) => { visible = v; },
    setDish,
    viewSize,
    snapshot: () => { apply(performance.now() / 1000, 0.016); renderer.render(scene, camera); return canvas.toDataURL('image/png'); },
    destroy: () => { running = false; renderer.dispose(); },
  };
}
