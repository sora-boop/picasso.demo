/* =====================================================================
   ҚАЙРАҚ: 3D опасная бритва
   Вся геометрия строится кодом: лезвие, накладки из рога, медные
   заклёпки, гравировка. Снаружи управляется через setState().
   ===================================================================== */
import * as THREE from 'three';

const TAU = Math.PI * 2;

/* ---------- лезвие: профиль классической бритвы с испанским носиком ---------- */
function bladeShape() {
  const s = new THREE.Shape();
  // хвостовик вокруг оси (0,0)
  s.moveTo(0.0, -0.15);
  s.lineTo(0.4, -0.16);
  // пятка лезвия
  s.quadraticCurveTo(0.54, -0.17, 0.6, -0.26);
  // режущая кромка: длинная плавная дуга
  s.bezierCurveTo(1.25, -0.4, 2.25, -0.45, 2.92, -0.44);
  // испанский носик
  s.quadraticCurveTo(3.08, -0.43, 3.09, -0.3);
  s.lineTo(3.08, 0.05);
  s.quadraticCurveTo(3.06, 0.17, 2.92, 0.17);
  // обух
  s.lineTo(0.62, 0.16);
  s.quadraticCurveTo(0.5, 0.16, 0.44, 0.18);
  s.lineTo(0.18, 0.18);
  s.absarc(0, 0, 0.18, Math.PI / 2, Math.PI * 1.5, false);
  return s;
}

/* ---------- накладка рукояти: вытянутая, с мягким сужением ---------- */
function scaleShape() {
  const s = new THREE.Shape();
  s.moveTo(0.3, 0.0);
  s.quadraticCurveTo(0.3, 0.3, 0.0, 0.31);
  s.bezierCurveTo(-1.1, 0.34, -2.5, 0.31, -3.3, 0.24);
  s.quadraticCurveTo(-3.6, 0.21, -3.6, 0.0);
  s.quadraticCurveTo(-3.6, -0.21, -3.3, -0.24);
  s.bezierCurveTo(-2.5, -0.31, -1.1, -0.34, 0.0, -0.31);
  s.quadraticCurveTo(0.3, -0.3, 0.3, 0.0);
  return s;
}

/* ---------- студийное окружение: софтбоксы дают полосы бликов на стали ---------- */
function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x050505);
  const box = (w, h, intensity, pos, look, tint = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(...look); env.add(m);
  };
  box(14, 2.2, 4.0, [0, 7, 3], [0, 0, 0]);               // верхний стрип
  box(2.0, 12, 2.6, [-8, 0, 4], [0, 0, 0], 0xfff1e2);    // тёплый слева
  box(2.0, 12, 1.8, [8, 1, -2], [0, 0, 0], 0xdfe8ff);    // холодный справа сзади
  box(10, 1.2, 1.2, [0, -6, 6], [0, 0, 0]);              // слабый нижний отражатель
  box(3, 3, 3.0, [3, 3, 9], [0, 0, 0], 0xffd6ad);         // ключевой спереди
  // полосы за камерой: их отражает плоскость лезвия, когда бритва смотрит на зрителя
  const strip = (x, rot, w, intensity) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(x, 0, 11); m.lookAt(x, 0, 0); m.rotateZ(rot); env.add(m);
  };
  strip(-2.5, 0.55, 1.6, 1.6);
  strip(1.2, 0.55, 0.5, 2.4);
  strip(4.0, 0.55, 2.4, 0.7);
  return env;
}

/* ---------- гравировка на лезвии ---------- */
function engravingTexture(text) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 160;
  const g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = '#fff';
  g.font = '400 92px Oswald, "Arial Narrow", sans-serif';
  g.textBaseline = 'middle';
  g.letterSpacing = '6px';
  g.fillText(text, 24, 84);
  g.fillRect(24, 140, 300, 3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------- мягкая контактная тень ---------- */
function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(0,0,0,0.7)');
  r.addColorStop(0.65, 'rgba(0,0,0,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function createRazor(canvas, opts = {}) {
  const mobile = opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  /* свет: тёплый ключевой, холодный контровой и медный, который ходит за курсором */
  const key = new THREE.DirectionalLight(0xffe2c4, 1.2);
  key.position.set(3, 4, 6);
  const rim = new THREE.DirectionalLight(0x9fb6ff, 1.4);
  rim.position.set(-5, -2, -4);
  const glow = new THREE.PointLight(0xd9813f, 5, 10, 1.8);
  glow.position.set(0, 0, 3);
  scene.add(key, rim, glow);

  /* материалы */
  const steel = new THREE.MeshPhysicalMaterial({
    color: 0xe8e9ec, metalness: 1, roughness: 0.1, envMapIntensity: 1.6,
    clearcoat: 0.4, clearcoatRoughness: 0.12,
  });
  const steelEdge = new THREE.MeshPhysicalMaterial({ color: 0xf4f4f6, metalness: 1, roughness: 0.06, envMapIntensity: 1.8 });
  const horn = new THREE.MeshPhysicalMaterial({
    color: 0x120b08, metalness: 0.0, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.05,
    sheen: 0.25, sheenColor: new THREE.Color(0x5a2e14), envMapIntensity: 1.1,
  });
  const copper = new THREE.MeshPhysicalMaterial({ color: 0xd98a4e, metalness: 1, roughness: 0.22, envMapIntensity: 1.4 });

  /* сборка */
  const root = new THREE.Group();      // положение на странице
  const tilt = new THREE.Group();      // реакция на курсор и парение
  const razor = new THREE.Group();     // сама бритва, центр примерно посередине
  root.add(tilt); tilt.add(razor); scene.add(root);

  const BLADE_T = 0.034;
  const SCALE_T = 0.05;
  const GAP = 0.012;

  // лезвие на шарнире
  const pivot = new THREE.Group();
  razor.add(pivot);
  const bladeGeo = new THREE.ExtrudeGeometry(bladeShape(), {
    depth: BLADE_T, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.012, bevelSegments: 3, curveSegments: 48,
  });
  bladeGeo.translate(0, 0, -BLADE_T / 2);
  const blade = new THREE.Mesh(bladeGeo, steel);
  pivot.add(blade);

  // полированная полоса вдоль кромки: даёт характерный блик
  const edgeGeo = new THREE.ExtrudeGeometry((() => {
    const s = new THREE.Shape();
    s.moveTo(0.64, -0.27);
    s.bezierCurveTo(1.27, -0.4, 2.25, -0.45, 2.91, -0.44);
    s.lineTo(2.91, -0.35);
    s.bezierCurveTo(2.25, -0.36, 1.3, -0.31, 0.68, -0.2);
    s.closePath();
    return s;
  })(), { depth: BLADE_T + 0.02, bevelEnabled: false, curveSegments: 48 });
  edgeGeo.translate(0, 0, -(BLADE_T + 0.02) / 2);
  pivot.add(new THREE.Mesh(edgeGeo, steelEdge));

  // гравировка с двух сторон
  const engr = new THREE.MeshStandardMaterial({
    map: engravingTexture(opts.engraving || 'ҚАЙРАҚ'), transparent: true, metalness: 0.7, roughness: 0.45,
    color: 0x9a9a9e, depthWrite: false,
  });
  const engrGeo = new THREE.PlaneGeometry(1.15, 0.18);
  const e1 = new THREE.Mesh(engrGeo, engr);
  e1.position.set(1.45, -0.04, BLADE_T / 2 + 0.011);
  const e2 = e1.clone();
  e2.position.z = -e1.position.z;
  e2.rotation.y = Math.PI;
  e2.scale.x = 1;
  pivot.add(e1, e2);

  // накладки из рога
  const scaleGeo = new THREE.ExtrudeGeometry(scaleShape(), {
    depth: SCALE_T, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.035, bevelSegments: 6, curveSegments: 40,
  });
  const offset = BLADE_T / 2 + GAP + 0.03;
  const scaleA = new THREE.Mesh(scaleGeo, horn);
  scaleA.position.z = offset;
  const scaleB = new THREE.Mesh(scaleGeo, horn);
  scaleB.position.z = -offset - SCALE_T;
  razor.add(scaleA, scaleB);

  // клин в хвосте между накладками
  const wedge = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, offset * 2), horn);
  wedge.position.set(-3.28, 0, 0);
  razor.add(wedge);

  // медные заклёпки с шайбами
  const pinLen = offset * 2 + SCALE_T * 2 + 0.09;
  const pinGeo = new THREE.CylinderGeometry(0.045, 0.045, pinLen, 24);
  pinGeo.rotateX(Math.PI / 2);
  const washerGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.022, 32);
  washerGeo.rotateX(Math.PI / 2);
  const capZ = offset + SCALE_T + 0.04;
  for (const x of [0, -3.28]) {
    const pin = new THREE.Mesh(pinGeo, copper);
    pin.position.x = x;
    razor.add(pin);
    for (const z of [capZ, -capZ]) {
      const w = new THREE.Mesh(washerGeo, copper);
      w.position.set(x, 0, z);
      razor.add(w);
    }
  }

  // центр бритвы: середина между хвостом рукояти и носиком лезвия в открытом виде
  razor.position.x = 0.2;

  // тень
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.55 }),
  );
  scene.add(shadow);

  /* состояние, которое задаёт страница */
  const state = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, open: 0, scale: 1, shadow: 1 };
  const cur = { ...state };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let visible = true;
  let running = true;
  let t0 = performance.now();

  function setState(s) { Object.assign(state, s); }
  function setMouse(nx, ny) { mouse.tx = nx; mouse.ty = ny; }
  function setVisible(v) { visible = v; }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* мировые единицы видимой области при z = 0 */
  function viewSize() {
    const h = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return { w: h * camera.aspect, h };
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    if (!visible) return;

    // плавное следование за состоянием
    const k = 1 - Math.pow(0.0009, dt);
    for (const key of Object.keys(state)) cur[key] += (state[key] - cur[key]) * k;
    mouse.x += (mouse.tx - mouse.x) * (1 - Math.pow(0.002, dt));
    mouse.y += (mouse.ty - mouse.y) * (1 - Math.pow(0.002, dt));

    const t = now / 1000;
    root.position.set(cur.x, cur.y + Math.sin(t * 0.9) * 0.06, cur.z);
    root.rotation.set(cur.rx, cur.ry, cur.rz);
    root.scale.setScalar(cur.scale);
    tilt.rotation.set(-mouse.y * 0.28 + Math.sin(t * 0.6) * 0.03, mouse.x * 0.42, Math.cos(t * 0.5) * 0.02);

    // лезвие: 0 = раскрыта, PI = сложена между накладками
    pivot.rotation.z = cur.open;

    // медный свет идёт за курсором и даёт бегущий блик по стали
    const v = viewSize();
    glow.position.set(mouse.x * v.w * 0.5, mouse.y * v.h * 0.5, 2.6);

    // тень под бритвой
    // тень: сплющенный овал позади и ниже, с воздушным зазором
    shadow.position.set(cur.x, cur.y - 1.1 * cur.scale - 0.25, cur.z - 1.2);
    shadow.scale.set(cur.scale * 1.05, cur.scale * 0.15, 1);
    shadow.material.opacity = 0.5 * cur.shadow;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    setState, setMouse, setVisible, viewSize,
    snapshot: () => { renderer.render(scene, camera); return canvas.toDataURL('image/png'); },
    destroy: () => { running = false; renderer.dispose(); },
  };
}

export const OPEN = 0.12;
export const CLOSED = Math.PI - 0.02;
export { TAU };
