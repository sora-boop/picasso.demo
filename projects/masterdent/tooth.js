/* =====================================================================
   АҚ ТІС CLINIC: 3D зуб
   Моляр строится кодом: коронка с четырьмя буграми и фиссурами,
   два корня и небный, пульпа и каналы внутри, титановый имплант.
   Шейдер эмали умеет:
     рентген под курсором (круглая линза) и полосой сканера,
     кариес на бугре и вспышку лампы, которая отверждает пломбу,
     растворение корней и блик, который пробегает по эмали.
   ===================================================================== */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const CARIES = new THREE.Vector3(0.36, 1.22, 0.3);

const NOISE = /* glsl */`
  float zHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float zNoise(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(zHash(i), zHash(i + vec3(1,0,0)), f.x), mix(zHash(i + vec3(0,1,0)), zHash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(zHash(i + vec3(0,0,1)), zHash(i + vec3(1,0,1)), f.x), mix(zHash(i + vec3(0,1,1)), zHash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
`;

/* ---------- коронка: профиль вращения + бугры и фиссуры ---------- */
function crownGeometry() {
  const prof = new THREE.SplineCurve([
    [0.001, -0.12], [0.5, -0.12], [0.64, -0.02], [0.78, 0.18], [0.9, 0.42], [0.95, 0.64], [0.92, 0.84], [0.84, 0.99], [0.7, 1.08], [0.46, 1.13], [0.22, 1.08], [0.001, 1.02],
  ].map(([x, y]) => new THREE.Vector2(x, y))).getPoints(60).map((p) => new THREE.Vector2(Math.max(0.001, p.x), p.y));
  const g = new THREE.LatheGeometry(prof, 160);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const top = smooth(0.62, 1.08, v.y);
    const th = Math.atan2(v.z, v.x);
    const r = Math.hypot(v.x, v.z);
    // четыре бугра по диагоналям
    const cusp = Math.pow(0.5 + 0.5 * Math.cos(4 * th - Math.PI), 1.6) * Math.exp(-((r - 0.5) ** 2) / 0.09);
    v.y += 0.16 * cusp * top;
    // фиссуры: борозды крестом между буграми
    const f = Math.min(Math.abs(v.x), Math.abs(v.z));
    v.y -= 0.07 * Math.exp(-((f / 0.07) ** 2)) * top * smooth(0.0, 0.6, 0.75 - r);
    // моляр шире в одну сторону
    v.x *= 1.08; v.z *= 0.96;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/* ---------- корни ---------- */
function rootGeometry(len, r0, bendX, bendZ) {
  const prof = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const r = r0 * (1 - Math.pow(t, 1.4) * 0.86) * (t > 0.92 ? Math.sqrt(1 - (t - 0.92) / 0.08 * 0.9) : 1);
    prof.push(new THREE.Vector2(Math.max(0.001, r), -t * len));
  }
  prof.push(new THREE.Vector2(0.001, -len - 0.02));
  const g = new THREE.LatheGeometry(prof, 48);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const t = clamp01(-y / len);
    p.setX(i, p.getX(i) + bendX * t * t);
    p.setZ(i, p.getZ(i) + bendZ * t * t);
  }
  g.computeVertexNormals();
  return g;
}
function rootsGeometry() {
  const trunkProf = [[0.6, 0.02], [0.62, -0.1], [0.6, -0.25], [0.55, -0.38]].map(([x, y]) => new THREE.Vector2(x, y));
  const trunk = new THREE.LatheGeometry(trunkProf, 96);
  trunk.scale(1.08, 1, 0.96);
  const a = rootGeometry(1.7, 0.34, -0.22, 0.04); a.translate(-0.36, -0.12, 0.08);
  const b = rootGeometry(1.6, 0.32, 0.24, 0.05); b.translate(0.38, -0.12, 0.08);
  const c = rootGeometry(1.35, 0.26, 0.0, -0.2); c.translate(0.0, -0.12, -0.3);
  const merged = mergeGeometries([trunk, a, b, c].map((g) => g.toNonIndexed()));
  merged.computeVertexNormals();
  return merged;
}

/* ---------- пульпа и каналы ---------- */
function pulpGeometry() {
  const prof = [[0.001, 0.05], [0.3, 0.08], [0.36, 0.3], [0.3, 0.55], [0.18, 0.66], [0.001, 0.62]].map(([x, y]) => new THREE.Vector2(x, y));
  const chamber = new THREE.LatheGeometry(prof, 48);
  const p = chamber.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const th = Math.atan2(p.getZ(i), p.getX(i));
    const horn = Math.pow(0.5 + 0.5 * Math.cos(4 * th - Math.PI), 2) * smooth(0.4, 0.66, p.getY(i));
    p.setY(i, p.getY(i) + horn * 0.18);
  }
  chamber.computeVertexNormals();
  const canal = (x0, z0, len, bx, bz) => {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector3(x0 + bx * t * t, 0.08 - t * len, z0 + bz * t * t)); }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.032, 8, false);
  };
  return mergeGeometries([
    chamber.toNonIndexed(),
    canal(-0.3, 0.08, 1.7, -0.22, 0.04).toNonIndexed(),
    canal(0.32, 0.08, 1.6, 0.24, 0.05).toNonIndexed(),
    canal(0.0, -0.24, 1.35, 0.0, -0.2).toNonIndexed(),
  ]);
}

/* ---------- имплант: винт с резьбой и абатмент ---------- */
function implantGroup(mat) {
  const g = new THREE.Group();
  const L = 1.7;
  const rAt = (t) => 0.3 - 0.09 * t;
  const prof = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; prof.push(new THREE.Vector2(rAt(t) * (t > 0.92 ? 1 - (t - 0.92) * 6 : 1), -t * L)); }
  prof.push(new THREE.Vector2(0.001, -L - 0.03));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), mat);
  const pts = [];
  const turns = 9;
  for (let i = 0; i <= turns * 40; i++) {
    const t = i / (turns * 40);
    const a = t * turns * Math.PI * 2;
    const r = rAt(t * 0.94) + 0.035;
    pts.push(new THREE.Vector3(Math.cos(a) * r, -0.08 - t * (L - 0.2), Math.sin(a) * r));
  }
  const thread = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), turns * 60, 0.036, 6, false), mat);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.3, 0.12, 48), mat);
  collar.position.y = 0.04;
  const abut = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.36, 6), mat);
  abut.position.y = 0.26;
  g.add(body, thread, collar, abut);
  return g;
}

/* ---------- шейдер эмали: рентген, кариес, блик ---------- */
function enamelMaterial(U, isRoot) {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xf7f4ee, roughness: 0.22, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.18,
    sheen: 0.4, sheenColor: 0xdfe9ff, transparent: true,
  });
  if (isRoot) { m.color.set(0xefe6d6); m.roughness = 0.4; m.clearcoat = 0.3; }
  // у коронки и корней разный шейдер: без своего ключа three.js отдаст им одну программу
  m.customProgramCacheKey = () => (isRoot ? 'enamel-root' : 'enamel-crown');
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLoc;\nvarying vec3 vWorldP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLoc = position;\nvWorldP = (modelMatrix * vec4(position, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vLoc; varying vec3 vWorldP;
        uniform vec2 uMouse; uniform float uR, uLens, uScanY, uScanOn, uCaries, uCure, uShine, uShineOn, uCut, uAlpha;
        uniform vec3 uCariesP;
        ${NOISE}`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        ${isRoot ? `
        // корни растворяются от кончика вверх
        float rc = zNoise(vLoc * 7.0) * 0.35 + (-vLoc.y / 1.9);
        if (rc > 1.25 - uCut * 1.45) discard;` : ''}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        ${isRoot ? '' : `
        float dc = distance(vLoc, uCariesP);
        float car = (1.0 - smoothstep(0.14, 0.3, dc + (zNoise(vLoc * 22.0) - 0.5) * 0.12)) * uCaries;
        float core = (1.0 - smoothstep(0.04, 0.16, dc)) * uCaries;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.28, 0.16), car * 0.85);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.1, 0.06, 0.04), core);`}`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
        vec3 Nv = normalize(normal);
        float fres = pow(1.0 - abs(dot(Nv, normalize(vViewPosition))), 2.0);
        // блик-полоса и вспышка лампы
        float s = vLoc.x * 0.65 + vLoc.y * 0.75;
        gl_FragColor.rgb += exp(-pow((s - uShine) / 0.1, 2.0)) * uShineOn * 0.3;
        ${isRoot ? '' : 'gl_FragColor.rgb += vec3(0.25, 0.5, 1.0) * uCure * (1.0 - smoothstep(0.0, 0.5, distance(vLoc, uCariesP))) * 1.4;'}
        // рентген: линза под курсором и полоса сканера
        float dl = length(gl_FragCoord.xy - uMouse);
        float lens = (1.0 - smoothstep(uR - 2.0, uR, dl)) * uLens;
        float scan = (1.0 - smoothstep(0.1, 0.32, abs(vWorldP.y - uScanY))) * uScanOn;
        float xr = max(lens, scan);
        vec3 xcol = mix(vec3(0.1, 0.32, 0.85), vec3(0.78, 0.92, 1.0), fres);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, xcol, xr);
        gl_FragColor.rgb += vec3(0.6, 0.85, 1.0) * smoothstep(2.5, 0.0, abs(dl - uR)) * uLens * 0.8;
        gl_FragColor.a = mix(gl_FragColor.a, 0.08 + fres * 0.8, xr) * uAlpha;`);
  };
  return m;
}

function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0xdfe5ec);
  const box = (w, h, intensity, pos, tint = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  box(10, 3, 2.4, [0, 7, 3]);
  box(2.5, 10, 1.6, [-8, 1, 4], 0xeaf1ff);
  box(2.5, 10, 1.2, [8, 0, -1], 0xfff6ea);
  box(4, 4, 1.6, [3, 2, 9]);
  return env;
}

function spriteTex(draw) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  draw(c.getContext('2d'));
  return new THREE.CanvasTexture(c);
}

/* =====================================================================
   СЦЕНА
   ===================================================================== */
export function createTooth(canvas, opts = {}) {
  const mobile = !!opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.snapshot });
  const dpr = Math.min(window.devicePixelRatio, mobile ? 1.6 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.03).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c4d6, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-3, 5, 6);
  const rim = new THREE.DirectionalLight(0xbcd2ff, 1.2);
  rim.position.set(4, 1, -4);
  scene.add(key, rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const root = new THREE.Group();
  const tilt = new THREE.Group();
  const body = new THREE.Group();
  const spin = new THREE.Group();
  scene.add(root); root.add(tilt); tilt.add(body); body.add(spin);
  // центр зуба по высоте
  spin.position.y = 0.3;

  const U = {
    uMouse: { value: new THREE.Vector2(-9999, -9999) }, uR: { value: 120 * dpr }, uLens: { value: 0 },
    uScanY: { value: 99 }, uScanOn: { value: 0 }, uCaries: { value: 0 }, uCure: { value: 0 },
    uShine: { value: -2 }, uShineOn: { value: 0 }, uCut: { value: 0 }, uAlpha: { value: 1 }, uCariesP: { value: CARIES },
  };
  const Uroot = { ...U, uCut: { value: 0 } };

  const crownWrap = new THREE.Group();
  spin.add(crownWrap);
  const crown = new THREE.Mesh(crownGeometry(), enamelMaterial(U, false));
  crown.renderOrder = 3;
  crownWrap.add(crown);
  const roots = new THREE.Mesh(rootsGeometry(), enamelMaterial(Uroot, true));
  roots.renderOrder = 2;
  spin.add(roots);
  // пульпа видна только внутри рентгена
  const pulpMat = new THREE.ShaderMaterial({
    transparent: true, toneMapped: false, depthWrite: false,
    uniforms: U,
    vertexShader: 'varying vec3 vWorldP; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vWorldP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `
      uniform vec2 uMouse; uniform float uR, uLens, uScanY, uScanOn, uAlpha; varying vec3 vWorldP;
      void main() {
        float lens = (1.0 - smoothstep(uR - 2.0, uR, length(gl_FragCoord.xy - uMouse))) * uLens;
        float scan = (1.0 - smoothstep(0.1, 0.32, abs(vWorldP.y - uScanY))) * uScanOn;
        float xr = max(lens, scan);
        if (xr < 0.01) discard;
        gl_FragColor = vec4(1.0, 0.33, 0.45, xr * 0.95 * uAlpha);
      }`,
  });
  const pulp = new THREE.Mesh(pulpGeometry(), pulpMat);
  pulp.renderOrder = 4;
  pulp.scale.set(1.04, 1, 0.98);
  spin.add(pulp);

  const titanium = new THREE.MeshPhysicalMaterial({ color: 0xb4bcc6, metalness: 1, roughness: 0.26, clearcoat: 0.4, transparent: true });
  const implant = implantGroup(titanium);
  spin.add(implant);

  // линия сканера
  const scanMat = new THREE.MeshBasicMaterial({ map: spriteTex((g) => {
    const gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, 'rgba(47,107,255,0)'); gr.addColorStop(0.5, 'rgba(160,205,255,1)'); gr.addColorStop(1, 'rgba(47,107,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  }), transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });
  const scanLine = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.09), scanMat);
  tilt.add(scanLine);

  // искры
  const starTex = spriteTex((g) => {
    g.translate(64, 64);
    const r = g.createRadialGradient(0, 0, 0, 0, 0, 60);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.15, 'rgba(200,225,255,0.8)'); r.addColorStop(1, 'rgba(200,225,255,0)');
    g.fillStyle = r;
    g.beginPath(); g.moveTo(0, -60); g.quadraticCurveTo(6, -6, 60, 0); g.quadraticCurveTo(6, 6, 0, 60); g.quadraticCurveTo(-6, 6, -60, 0); g.quadraticCurveTo(-6, -6, 0, -60); g.fill();
  });
  const sparks = [[-1.15, 1.55, 0.5, 0.42], [1.2, 1.3, 0.3, 0.3], [0.95, 0.15, 0.9, 0.24], [-1.05, 0.35, 0.6, 0.2], [0.2, 1.95, 0.2, 0.26]].map(([x, y, z, s], i) => {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, opacity: 0, toneMapped: false }));
    m.position.set(x, y, z); m.scale.setScalar(s); m.userData = { s, ph: i * 1.9 };
    tilt.add(m);
    return m;
  });

  // тень и голубое свечение
  const blob = (color, a) => spriteTex((g) => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, `rgba(${color},${a})`); r.addColorStop(0.62, `rgba(${color},0)`);
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blob('14,26,43', 0.55), transparent: true, depthWrite: false, toneMapped: false }));
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blob('120,160,255', 0.5), transparent: true, depthWrite: false, toneMapped: false }));
  scene.add(shadow, halo);

  /* ---- состояние ---- */
  const state = { x: 0, y: 0, z: 0, rx: 0.3, ry: 0, rz: 0, scale: 1, lens: 1, scan: 0, caries: 0, cure: 0, implant: 0, shine: 0, idle: 0, shadow: 1, halo: 0, alpha: 1 };
  const cur = { ...state };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, px: -9999, py: -9999, inside: false };
  let idleAngle = 0, visible = true, running = true, cleared = false, t0 = performance.now();

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

  // экранная позиция центра зуба (для автолинзы на телефоне и подписи курсора)
  const tmp = new THREE.Vector3();
  function toothScreen() {
    tmp.set(0, 0.3, 0); spin.localToWorld(tmp); tmp.project(camera);
    return { x: (tmp.x * 0.5 + 0.5) * canvas.clientWidth, y: (0.5 - tmp.y * 0.5) * canvas.clientHeight };
  }

  function apply(t, dt) {
    root.position.set(cur.x, cur.y + Math.sin(t * 0.8) * 0.04, cur.z);
    root.scale.setScalar(cur.scale);
    tilt.rotation.set(-mouse.y * 0.14, mouse.x * 0.26, 0);
    body.rotation.set(cur.rx, 0, cur.rz);
    spin.rotation.y = cur.ry + idleAngle;
    const a = cur.alpha;

    // линза: за курсором, а на телефоне сама ходит по зубу
    let lx = mouse.px, ly = mouse.py;
    if (mobile || opts.autoLens) {
      const c = toothScreen();
      const rr = 60 * cur.scale;
      lx = c.x + Math.sin(t * 0.7) * rr * 1.2;
      ly = c.y + Math.cos(t * 0.9) * rr;
    }
    U.uMouse.value.set(lx * dpr, (canvas.clientHeight - ly) * dpr);
    U.uLens.value = cur.lens * (mobile || opts.autoLens || mouse.inside ? 1 : 0);
    U.uR.value = (mobile ? 70 : 120) * dpr;

    // сканер идёт сверху вниз
    const sc = clamp01(cur.scan);
    const scanOn = smooth(0.0, 0.06, sc) * (1 - smooth(0.94, 1.0, sc));
    spin.updateMatrixWorld(true);
    const topY = new THREE.Vector3(0, 1.3, 0).applyMatrix4(spin.matrixWorld).y;
    const botY = new THREE.Vector3(0, -1.9, 0).applyMatrix4(spin.matrixWorld).y;
    U.uScanY.value = topY + (botY - topY) * sc;
    U.uScanOn.value = scanOn;
    tmp.set(0, U.uScanY.value, 0); tilt.worldToLocal(tmp);
    scanLine.position.set(0, tmp.y, 0.9);
    scanLine.rotation.set(-tilt.rotation.x, -tilt.rotation.y, 0);
    scanMat.opacity = scanOn * a;

    U.uCaries.value = cur.caries;
    U.uCure.value = cur.cure;
    U.uAlpha.value = a;

    // имплант: коронка поднимается, корни тают, винт вкручивается, коронка садится
    const im = cur.implant;
    const pa = clamp01(im / 0.35), pb = clamp01((im - 0.3) / 0.45), pc = clamp01((im - 0.75) / 0.25);
    crownWrap.position.y = 0.95 * ease(pa) * (1 - ease(pc));
    Uroot.uCut.value = pa;
    roots.visible = pa < 0.999;
    implant.visible = pb > 0.001;
    implant.position.y = -3.2 * (1 - ease(pb)) - 0.12;
    implant.rotation.y = (1 - ease(pb)) * Math.PI * 5;
    titanium.opacity = a * clamp01(pb * 3);
    pulp.visible = im < 0.05 && a > 0.05;

    // блик и искры
    const sh = clamp01(cur.shine);
    U.uShine.value = -1.2 + sh * 3.4;
    U.uShineOn.value = smooth(0, 0.1, sh) * (1 - smooth(0.85, 1, sh));
    for (const s of sparks) {
      const tw = 0.5 + 0.5 * Math.sin(t * 3 + s.userData.ph);
      s.material.opacity = smooth(0.2, 0.6, sh) * tw * a;
      s.scale.setScalar(s.userData.s * (0.6 + tw * 0.5));
      s.visible = s.material.opacity > 0.01;
    }

    // тень и свечение
    const S = cur.scale;
    const bottom = cur.y + (0.3 - 2.0) * S * Math.cos(cur.rx) - 0.1;
    shadow.position.set(cur.x, bottom, cur.z - 1);
    shadow.scale.set(S * 3.2, S * 0.5, 1);
    shadow.material.opacity = cur.shadow * a * 0.8;
    halo.position.set(cur.x, cur.y + 0.4 * S, cur.z - 1.5);
    halo.scale.setScalar(S * 6);
    halo.material.opacity = cur.halo * a * 0.7;
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    const k = 1 - Math.pow(0.0015, dt);
    for (const key of Object.keys(state)) cur[key] += (state[key] - cur[key]) * k;
    // сцена скрыта: дорисовываем, пока зуб не растает, потом очищаем холст один раз
    if (!visible && cur.alpha < 0.003) {
      if (!cleared) { renderer.clear(); cleared = true; }
      return;
    }
    cleared = false;
    idleAngle += dt * 0.3 * cur.idle;
    mouse.x += (mouse.tx - mouse.x) * (1 - Math.pow(0.003, dt));
    mouse.y += (mouse.ty - mouse.y) * (1 - Math.pow(0.003, dt));
    apply(now / 1000, dt);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    setState: (s) => Object.assign(state, s),
    jump: (s) => { Object.assign(state, s); Object.assign(cur, state); },
    setMouse: (nx, ny, px, py) => { mouse.tx = nx; mouse.ty = ny; mouse.px = px; mouse.py = py; mouse.inside = true; },
    leave: () => { mouse.inside = false; },
    toothScreen,
    setVisible: (v) => { visible = v; },
    viewSize,
    snapshot: () => { apply(performance.now() / 1000, 0.016); renderer.render(scene, camera); return canvas.toDataURL('image/png'); },
    destroy: () => { running = false; renderer.dispose(); },
  };
}
