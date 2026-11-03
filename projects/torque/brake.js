/* =====================================================================
   TORQUE 52: 3D тормозной узел
   Вентилируемый перфорированный диск, ступица со шпильками и гайками,
   жёлтый суппорт, колодки. Всё строится кодом.
   Страница управляет через setState():
     explode 0..1  разбор по винтику вдоль оси колеса
     rust    0..1  ржавый диск → проточенный, блестящий
     wear    0..1  стёртые колодки → новые
     spin          угол колеса от скролла; при быстром вращении диск
                   раскаляется до оранжевого свечения
   anchors() отдаёт экранные точки деталей для подписей с ценами.
   ===================================================================== */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const R_IN = 0.95, R_OUT = 1.6, T = 0.15;       // фрикционное кольцо, полутолщина
const HAT_R = 0.72, HAT_Z = 0.42;               // «шляпа» диска
const STUD_R = 0.42;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);

const NOISE = /* glsl */`
  float bHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float bNoise(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(bHash(i), bHash(i + vec3(1,0,0)), f.x), mix(bHash(i + vec3(0,1,0)), bHash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(bHash(i + vec3(0,0,1)), bHash(i + vec3(1,0,1)), f.x), mix(bHash(i + vec3(0,1,1)), bHash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float bFbm(vec3 p) { return bNoise(p) * 0.55 + bNoise(p * 2.1) * 0.3 + bNoise(p * 4.3) * 0.15; }
`;

function canvasTex(size, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* рабочая поверхность диска: шлифовка по кругу, сверления и прорези */
function faceTexture() {
  return canvasTex(1024, (g, S) => {
    const c = S / 2, k = c / R_OUT;
    g.fillStyle = '#9a9ea3'; g.fillRect(0, 0, S, S);
    for (let r = R_IN * k; r < R_OUT * k; r += 1.3) {
      g.strokeStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '40,40,45'},${Math.random() * 0.12})`;
      g.lineWidth = 1; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
    }
    // изогнутые прорези
    g.strokeStyle = 'rgba(20,20,22,0.85)'; g.lineWidth = 7; g.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      g.beginPath();
      for (let t = 0; t <= 1; t += 0.05) {
        const r = (R_IN + 0.1 + t * 0.48) * k, aa = a + t * 0.45;
        const x = c + Math.cos(aa) * r, y = c + Math.sin(aa) * r;
        t === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
    // сверления в три ряда
    for (let i = 0; i < 18; i++) {
      for (let j = 0; j < 3; j++) {
        const a = (i / 18) * Math.PI * 2 + j * 0.11 + 0.62;
        const r = (R_IN + 0.17 + j * 0.17) * k;
        const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r;
        g.fillStyle = '#121214'; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 10.5, 0, Math.PI * 2); g.stroke();
      }
    }
  });
}
/* торец: рёбра вентиляции */
function edgeTexture() {
  const t = canvasTex(1024, (g, S) => {
    g.fillStyle = '#7c8086'; g.fillRect(0, 0, S, S);
    g.fillStyle = '#18181b';
    for (let i = 0; i < 48; i++) g.fillRect((i / 48) * S + 4, S * 0.3, S / 48 - 10, S * 0.4);
  });
  return t;
}
/* «шляпа»: центральное отверстие и пять отверстий под шпильки */
function hatTexture() {
  return canvasTex(512, (g, S) => {
    const c = S / 2, k = c / HAT_R;
    g.fillStyle = '#8d9196'; g.fillRect(0, 0, S, S);
    for (let r = 2; r < c; r += 2) { g.strokeStyle = `rgba(255,255,255,${Math.random() * 0.08})`; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = '#121214'; g.beginPath(); g.arc(c, c, 0.26 * k, 0, Math.PI * 2); g.fill();
  });
}

/* сектор кольца → экструзия (для суппорта и колодок) */
function sector(r0, r1, a0, a1, depth, bevel) {
  const s = new THREE.Shape();
  const n = 32;
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * (i / n); const x = Math.cos(a) * r1, y = Math.sin(a) * r1; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  for (let i = n; i >= 0; i--) { const a = a0 + (a1 - a0) * (i / n); s.lineTo(Math.cos(a) * r0, Math.sin(a) * r0); }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: !!bevel, bevelThickness: bevel || 0, bevelSize: bevel || 0, bevelSegments: 4, curveSegments: 24 });
  return g;
}

function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x0a0a0b);
  const box = (w, h, intensity, pos, tint = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  box(12, 2, 3.2, [0, 7, 3]);
  box(2.4, 10, 2.2, [-8, 1, 4]);
  box(2.4, 10, 1.4, [8, 0, -1], 0xfff2c8);
  box(4, 4, 1.8, [3, 2, 9]);
  box(1.2, 14, 2.6, [-3, 0, 10]);
  return env;
}

/* шейдер металла диска: ржавчина и нагрев */
function discMaterial(U, map, base = {}) {
  const m = new THREE.MeshStandardMaterial({ map, metalness: 0.72, roughness: 0.36, transparent: true, ...base });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLoc;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLoc = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vLoc;\nuniform float uRust, uHeat;\n${NOISE}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float rn = bFbm(vLoc * 6.0);
        // ржавчина пятнами: сверления и прорези остаются видны
        float rust = uRust * smoothstep(0.38, 0.62, rn + 0.12 * uRust);
        vec3 rc = mix(vec3(0.22, 0.09, 0.04), vec3(0.42, 0.19, 0.08), bFbm(vLoc * 19.0));
        diffuseColor.rgb = mix(diffuseColor.rgb, rc * (0.5 + 0.7 * diffuseColor.r), rust);
        // раскалённое кольцо темнеет по металлу и светится изнутри
        float rr = length(vLoc.xy);
        float hot = smoothstep(${(R_IN - 0.05).toFixed(2)}, ${(R_IN + 0.25).toFixed(2)}, rr) * (1.0 - smoothstep(${(R_OUT - 0.15).toFixed(2)}, ${(R_OUT + 0.02).toFixed(2)}, rr));
        diffuseColor.rgb *= 1.0 - hot * uHeat * 0.75;`)
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor *= 1.0 - max(rust * 0.85, hot * uHeat * 0.7);')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.92, rust);')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += mix(vec3(0.75, 0.05, 0.0), vec3(1.0, 0.3, 0.0), hot * hot) * hot * uHeat * 1.8;`);
  };
  m.customProgramCacheKey = () => 'brake-disc';
  return m;
}

/* =====================================================================
   СЦЕНА
   ===================================================================== */
export function createBrake(canvas, opts = {}) {
  const mobile = !!opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.snapshot });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.6 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-3, 5, 6);
  const warm = new THREE.PointLight(0xffd400, 4, 10, 1.8);
  scene.add(key, warm);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const root = new THREE.Group();
  const tilt = new THREE.Group();
  const body = new THREE.Group();
  scene.add(root); root.add(tilt); tilt.add(body);
  const wheel = new THREE.Group();   // всё, что вращается вместе с колесом
  body.add(wheel);

  const U = { uRust: { value: 0 }, uHeat: { value: 0 } };

  /* ---- диск ---- */
  const disc = new THREE.Group();
  wheel.add(disc);
  const faceMat = discMaterial(U, faceTexture());
  const front = new THREE.Mesh(new THREE.RingGeometry(R_IN, R_OUT, 128, 1), faceMat);
  front.position.z = T;
  const back = front.clone(); back.rotation.y = Math.PI; back.position.z = -T;
  const edgeMap = edgeTexture(); edgeMap.wrapS = THREE.RepeatWrapping; edgeMap.repeat.set(3, 1);
  const edgeMat = discMaterial(U, edgeMap);
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(R_OUT, R_OUT, T * 2, 128, 1, true).rotateX(Math.PI / 2), edgeMat);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(R_IN, R_IN, T * 2, 96, 1, true).rotateX(Math.PI / 2), discMaterial(U, null, { color: 0x6c7076, side: THREE.BackSide }));
  // шляпа
  const hatProf = [[R_IN, T], [0.86, T + 0.05], [HAT_R + 0.02, HAT_Z - 0.04], [HAT_R, HAT_Z]].map(([r, z]) => new THREE.Vector2(r, z));
  const hatSide = new THREE.Mesh(new THREE.LatheGeometry(hatProf, 96).rotateX(Math.PI / 2), discMaterial(U, null, { color: 0x8a8e94 }));
  const hatFace = new THREE.Mesh(new THREE.CircleGeometry(HAT_R, 96), discMaterial(U, hatTexture()));
  hatFace.position.z = HAT_Z;
  disc.add(front, back, outer, inner, hatSide, hatFace);

  /* ---- ступица, шпильки, гайки ---- */
  const steel = new THREE.MeshStandardMaterial({ color: 0x3a3c40, metalness: 0.8, roughness: 0.45, transparent: true });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd9dce0, metalness: 1, roughness: 0.18, transparent: true });
  const hub = new THREE.Group();
  const hubProf = [[0.001, -0.15], [0.7, -0.15], [0.7, -0.24], [0.55, -0.3], [0.5, -0.85], [0.001, -0.85]].map(([r, z]) => new THREE.Vector2(r, z));
  const hubMesh = new THREE.Mesh(new THREE.LatheGeometry(hubProf, 64).rotateX(Math.PI / 2), steel);
  hub.add(hubMesh);
  const studs = [];
  const nuts = [];
  const nutGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.14, 6).rotateX(Math.PI / 2);
  const studGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.75, 16).rotateX(Math.PI / 2);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
    const s = new THREE.Mesh(studGeo, chrome);
    s.position.set(Math.cos(a) * STUD_R, Math.sin(a) * STUD_R, 0.2);
    hub.add(s); studs.push(s);
    const n = new THREE.Mesh(nutGeo, chrome);
    n.userData = { x: Math.cos(a) * STUD_R, y: Math.sin(a) * STUD_R, i };
    wheel.add(n); nuts.push(n);
  }
  wheel.add(hub);

  /* ---- суппорт ---- */
  const A0 = Math.PI / 2 - 0.62, A1 = Math.PI / 2 + 0.62;
  const yellow = new THREE.MeshPhysicalMaterial({ color: 0xffd000, roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12, transparent: true });
  const halfF = sector(1.06, 1.78, A0, A1, 0.3, 0.05); halfF.translate(0, 0, T + 0.12);
  const halfB = sector(1.06, 1.78, A0, A1, 0.3, 0.05); halfB.translate(0, 0, -T - 0.42);
  const bridge = sector(1.68, 1.86, A0 + 0.04, A1 - 0.04, T * 2 + 0.6, 0.04); bridge.translate(0, 0, -T - 0.3);
  const caliper = new THREE.Group();
  caliper.add(new THREE.Mesh(mergeGeometries([halfF, halfB, bridge]), yellow));
  // надпись на суппорте
  const logo = canvasTex(1024, (g, S) => {
    g.clearRect(0, 0, S, S);
    g.fillStyle = '#121314'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '400 150px Oswald, "Arial Narrow", sans-serif';
    g.fillText('TORQUE 52', S / 2, S / 2);
  });
  const logoMat = new THREE.MeshBasicMaterial({ map: logo, transparent: true, toneMapped: false, depthWrite: false });
  const logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), logoMat);
  logoMesh.position.set(0, 1.43, T + 0.12 + 0.3 + 0.052);
  caliper.add(logoMesh);
  body.add(caliper);

  /* ---- колодки ---- */
  const frictionMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2d, roughness: 0.95, metalness: 0.1, transparent: true });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x55585e, roughness: 0.4, metalness: 0.8, transparent: true });
  const pads = [1, -1].map((side) => {
    const g = new THREE.Group();
    const fr = new THREE.Mesh(sector(1.12, 1.56, A0 + 0.08, A1 - 0.08, 0.1, 0.01), frictionMat);
    const pl = new THREE.Mesh(sector(1.08, 1.6, A0 + 0.05, A1 - 0.05, 0.035, 0.005), plateMat);
    pl.position.z = 0.1;
    g.add(fr, pl);
    g.userData = { side, fr };
    if (side < 0) g.rotation.y = Math.PI;
    g.position.z = side * T;
    body.add(g);
    return g;
  });

  // тень
  const blob = canvasTex(256, (g) => {
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, 'rgba(0,0,0,0.75)'); r.addColorStop(0.62, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  }, false);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false, toneMapped: false }));
  scene.add(shadow);

  /* ---- состояние ---- */
  const state = { x: 0, y: 0, z: 0, rx: 0.15, ry: -0.6, rz: 0, scale: 1, explode: 0, rust: 0, wear: 0, spin: 0, idle: 0, shadow: 1, alpha: 1 };
  const cur = { ...state };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let idleAngle = 0, heat = 0, lastSpin = 0, visible = true, running = true, cleared = false, t0 = performance.now();

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

  function apply(t, dt) {
    root.position.set(cur.x, cur.y + Math.sin(t * 0.8) * 0.03, cur.z);
    root.scale.setScalar(cur.scale);
    tilt.rotation.set(-mouse.y * 0.14, mouse.x * 0.24, 0);
    body.rotation.set(cur.rx, cur.ry, cur.rz);
    const a = cur.alpha;

    // колесо крутится; быстрое вращение греет диск
    const angle = -(cur.spin + idleAngle);
    const w = Math.abs(angle - lastSpin) / Math.max(dt, 0.001);
    lastSpin = angle;
    heat += (clamp01((w - 2.5) / 9) - heat) * (1 - Math.pow(0.15, dt));
    U.uHeat.value = heat * a;
    wheel.rotation.z = angle;

    // разбор вдоль оси колеса
    const e = cur.explode;
    const e1 = ease(clamp01(e / 0.6)), e2 = ease(clamp01((e - 0.25) / 0.75));
    caliper.position.set(0, 1.0 * e2, 0.7 * e2);
    pads[0].position.set(0, 0.5 * e1, T + 1.25 * e1);
    pads[1].position.set(0, 0.5 * e1, -T - 1.0 * e1);
    hub.position.z = -1.3 * e2;
    for (const n of nuts) {
      const ne = ease(clamp01((e - n.userData.i * 0.04) / 0.5));
      n.position.set(n.userData.x * (1 + ne * 0.6), n.userData.y * (1 + ne * 0.6), 0.6 + ne * 1.9);
      n.rotation.z = ne * Math.PI * 4;
    }
    // износ колодок и ржавчина
    U.uRust.value = cur.rust;
    const thick = 1 - cur.wear * 0.65;
    for (const p of pads) p.userData.fr.scale.z = thick;
    frictionMat.color.setRGB(0.17 + cur.wear * 0.12, 0.17 + cur.wear * 0.06, 0.18);

    for (const m of [faceMat, edgeMat, steel, chrome, yellow, frictionMat, plateMat, ...disc.children.map((c) => c.material)]) {
      m.opacity = a; m.depthWrite = a > 0.5;
    }
    logoMat.opacity = a;

    const v = viewSize();
    warm.position.set(mouse.x * v.w * 0.5, mouse.y * v.h * 0.5, 3);
    warm.intensity = 4 * a;

    const s = cur.scale;
    shadow.position.set(cur.x, cur.y - 2.0 * s, cur.z - 1);
    shadow.scale.set(s * 4.2, s * 0.6, 1);
    shadow.material.opacity = cur.shadow * a * 0.7;
  }

  /* экранные точки деталей для подписей */
  const tmp = new THREE.Vector3();
  const ANCH = {
    caliper: [caliper, new THREE.Vector3(0.95, 1.7, 0.4)],
    padF: [pads[0], new THREE.Vector3(-0.6, 1.3, 0.1)],
    disc: [disc, new THREE.Vector3(1.15, -1.1, T)],
    hub: [hub, new THREE.Vector3(-0.3, -0.6, -0.8)],
    nut: [nuts[2], new THREE.Vector3(0, 0, 0.07)],
  };
  function anchors() {
    const out = {};
    const W = canvas.clientWidth, H = canvas.clientHeight;
    root.updateMatrixWorld(true);
    for (const [k, [obj, p]] of Object.entries(ANCH)) {
      tmp.copy(p); obj.localToWorld(tmp); tmp.project(camera);
      out[k] = { x: (tmp.x * 0.5 + 0.5) * W, y: (0.5 - tmp.y * 0.5) * H };
    }
    return out;
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    const k = 1 - Math.pow(0.0015, dt);
    for (const key of Object.keys(state)) cur[key] += (state[key] - cur[key]) * (key === 'spin' ? 1 - Math.pow(0.02, dt) : k);
    if (!visible && cur.alpha < 0.003) {
      if (!cleared) { renderer.clear(); cleared = true; }
      return;
    }
    cleared = false;
    idleAngle += dt * 0.6 * cur.idle;
    mouse.x += (mouse.tx - mouse.x) * (1 - Math.pow(0.003, dt));
    mouse.y += (mouse.ty - mouse.y) * (1 - Math.pow(0.003, dt));
    apply(now / 1000, dt);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    setState: (s) => Object.assign(state, s),
    jump: (s) => { Object.assign(state, s); Object.assign(cur, state); lastSpin = -(cur.spin + idleAngle); },
    setMouse: (x, y) => { mouse.tx = x; mouse.ty = y; },
    setVisible: (v) => { visible = v; },
    anchors,
    viewSize,
    snapshot: () => { apply(performance.now() / 1000, 0.016); renderer.render(scene, camera); return canvas.toDataURL('image/png'); },
    destroy: () => { running = false; renderer.dispose(); },
  };
}
