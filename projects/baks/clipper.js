/* =====================================================================
   БАКС: 3D машинка для стрижки
   Корпус построен лофтом из суперэллипсов, ножевой блок и насадки
   собраны из выдавленных профилей. Внешних моделей нет.
   Положение задаётся в долях экрана: x, y от -0.5 до 0.5,
   scale = 1 — машинка длиной 80% высоты экрана.
   guard: 0 — без насадки, 1..4 — насадки №1..№4 (дробные значения плавно перетекают).
   ===================================================================== */
import * as THREE from 'three';

const LEN = 4.75;                       // полная длина модели
const GUARD_H = [0, 0.2, 0.38, 0.6, 0.8]; // вылет насадки по номеру

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const sgnPow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);

/* ---------- лофт: сечения-суперэллипсы вдоль оси Y ---------- */
function loft({ rings = 120, seg = 72, y0, y1, w, d, n = 2.6, capTop = true, capBottom = true }) {
  const pos = [], uv = [], idx = [];
  const e = 2 / n;
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const y = y0 + (y1 - y0) * t;
    const W = w(t), D = d(t);
    for (let j = 0; j <= seg; j++) {
      const u = j / seg, a = u * Math.PI * 2;
      pos.push(sgnPow(Math.cos(a), e) * W, y, sgnPow(Math.sin(a), e) * D);
      uv.push(u, t);
    }
  }
  const row = seg + 1;
  for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) {
    const a = i * row + j, b = a + row;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const cap = (ring, y, up) => {
    const c = pos.length / 3;
    pos.push(0, y, 0); uv.push(0.5, up ? 1 : 0);
    for (let j = 0; j < seg; j++) {
      const a = ring * row + j;
      if (up) idx.push(c, a, a + 1); else idx.push(c, a + 1, a);
    }
  };
  if (capBottom) cap(0, y0, false);
  if (capTop) cap(rings, y1, true);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ---------- профиль корпуса ---------- */
const BODY_Y0 = -2.35, BODY_Y1 = 1.75;
const tail = (t) => (t < 0.07 ? Math.sqrt(Math.max(0, 1 - Math.pow(1 - t / 0.07, 2))) : 1);
const bodyW = (t) => (0.5 + 0.07 * smooth(0.08, 0.5, t) + 0.13 * smooth(0.72, 1, t)) * (0.35 + 0.65 * tail(t));
const bodyD = (t) => (0.38 + 0.05 * Math.sin(Math.PI * t) - 0.1 * smooth(0.75, 1, t)) * (0.35 + 0.65 * tail(t));
const bodyT = (y) => (y - BODY_Y0) / (BODY_Y1 - BODY_Y0);

/* ---------- текстуры корпуса: надпись и рифление ---------- */
function bodyTextures(word) {
  const W = 1024, H = 2048;
  const map = document.createElement('canvas'); map.width = W; map.height = H;
  const g = map.getContext('2d');
  g.fillStyle = '#141312'; g.fillRect(0, 0, W, H);
  // надпись вдоль корпуса на лицевой стороне (u = 0.25)
  g.save();
  g.translate(W * 0.25, H * (1 - 0.56));
  g.rotate(-Math.PI / 2);
  g.scale(-1, 0.84);   // развёртка зеркальна снаружи
  g.fillStyle = '#d6b066';
  g.font = '500 150px "Wix Madefor Display", system-ui, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(word, 0, 0);
  g.fillRect(-150, 92, 300, 6);
  g.restore();

  const bump = document.createElement('canvas'); bump.width = 512; bump.height = 1024;
  const b = bump.getContext('2d');
  b.fillStyle = '#808080'; b.fillRect(0, 0, 512, 1024);
  // поперечное рифление в зоне хвата
  const v0 = 1024 * (1 - 0.4), v1 = 1024 * (1 - 0.1);
  for (let y = v0; y < v1; y += 7) {
    b.fillStyle = '#d0d0d0'; b.fillRect(0, y, 512, 3);
    b.fillStyle = '#404040'; b.fillRect(0, y + 3, 512, 2);
  }
  const tMap = new THREE.CanvasTexture(map); tMap.colorSpace = THREE.SRGBColorSpace; tMap.anisotropy = 8;
  const tBump = new THREE.CanvasTexture(bump);
  return { tMap, tBump };
}

/* ---------- гребёнка ножа: прямоугольник с зубцами сверху ---------- */
function combShape(width, base, tooth, count, taper = 0.32) {
  const s = new THREE.Shape();
  const hw = width / 2;
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw, base);
  const step = width / count;
  for (let i = count - 1; i >= 0; i--) {
    const x0 = -hw + i * step, x1 = x0 + step;
    const m = (x0 + x1) / 2;
    s.lineTo(x1 - step * 0.06, base);
    s.lineTo(m + step * taper * 0.5, base + tooth);
    s.lineTo(m - step * taper * 0.5, base + tooth);
    s.lineTo(x0 + step * 0.06, base);
  }
  s.lineTo(-hw, base);
  s.closePath();
  return s;
}

/* ---------- ребро насадки: профиль в плоскости (z, y), вылет = 1 ---------- */
function ribShape() {
  const s = new THREE.Shape();
  // x фигуры = z модели (вперёд), y фигуры = y модели
  s.moveTo(-0.12, 2.56);
  s.quadraticCurveTo(0.5, 2.6, 1.0, 2.46);
  s.quadraticCurveTo(1.06, 2.4, 0.98, 2.3);
  s.bezierCurveTo(0.7, 1.85, 0.3, 1.4, 0.0, 1.1);
  s.lineTo(-0.12, 2.56);
  return s;
}

/* ---------- окружение: светлая студия, под светлую страницу ---------- */
function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x3a3734);
  const box = (w, h, intensity, pos, tint = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  box(2.4, 14, 3.4, [-7, 1, 5], 0xfff2e2);
  box(1.0, 14, 2.4, [6.5, 0, 4], 0xffffff);
  box(14, 2.4, 2.2, [0, 8, 1]);
  box(14, 3, 0.9, [0, -8, 3], 0xf0e6d8);
  box(3, 3, 1.4, [2, 2, 10], 0xffe6cc);
  box(1.2, 10, 1.6, [0, 0, -9]);
  return env;
}

function shadowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 127);
  grd.addColorStop(0, 'rgba(20,16,12,0.7)');
  grd.addColorStop(0.65, 'rgba(20,16,12,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function createClipper(canvas, opts = {}) {
  const mobile = !!opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.03).texture;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
  const key = new THREE.DirectionalLight(0xfff1e2, 1.3);
  key.position.set(-3, 4, 6);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(4, -2, 3);
  scene.add(key, fill);

  /* материалы */
  const { tMap, tBump } = bodyTextures(opts.word || 'БАКС');
  const body = new THREE.MeshPhysicalMaterial({
    map: tMap, bumpMap: tBump, bumpScale: 1.2, roughness: 0.42, metalness: 0.05,
    clearcoat: 0.8, clearcoatRoughness: 0.18, envMapIntensity: 1.1,
  });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9b162, metalness: 1, roughness: 0.24, envMapIntensity: 1.4 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xeceae6, metalness: 1, roughness: 0.12, envMapIntensity: 1.6 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xa9a7a2, metalness: 1, roughness: 0.3, envMapIntensity: 1.2 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1b1a19, roughness: 0.75, metalness: 0 });
  const led = new THREE.MeshBasicMaterial({ color: new THREE.Color(opts.accent || '#d4532e') });
  const guardMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(opts.accent || '#d4532e'), roughness: 0.32, metalness: 0,
    clearcoat: 0.6, transparent: true, opacity: 0.92, envMapIntensity: 0.9,
  });

  /* сборка */
  const root = new THREE.Group();
  const tilt = new THREE.Group();
  const clip = new THREE.Group();
  root.add(tilt); tilt.add(clip); scene.add(root);
  clip.position.y = -0.05;   // центр модели примерно в середине длины

  // корпус
  const bodyMesh = new THREE.Mesh(loft({ y0: BODY_Y0, y1: BODY_Y1, w: bodyW, d: bodyD, capTop: true }), body);
  clip.add(bodyMesh);

  // золотая голова: переход от корпуса к ножевому блоку
  const HEAD_Y0 = 1.68, HEAD_Y1 = 2.2;
  const head = new THREE.Mesh(loft({
    rings: 40, y0: HEAD_Y0, y1: HEAD_Y1, n: 4,
    w: (t) => 0.69 + 0.05 * t, d: (t) => 0.3 - 0.13 * t,
  }), gold);
  clip.add(head);

  // кольца-окантовки
  const ringAt = (y, mat, grow = 0.012) => {
    const t = bodyT(y);
    const g = loft({ rings: 2, seg: 72, y0: y - 0.025, y1: y + 0.025, w: () => bodyW(t) + grow, d: () => bodyD(t) + grow, capTop: false, capBottom: false });
    const m = new THREE.Mesh(g, mat); clip.add(m); return m;
  };
  ringAt(1.66, gold, 0.02);
  ringAt(-2.12, gold, 0.006);

  // гнездо зарядки на хвосте
  const port = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 32), steel);
  port.position.y = BODY_Y0 + 0.005;
  clip.add(port);

  // кнопка и светодиод на лицевой стороне
  const swT = bodyT(0.95);
  const swZ = bodyD(swT);
  const sw = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.2, 8, 24), chrome);
  sw.scale.z = 0.45;
  sw.position.set(0, 0.95, swZ + 0.005);
  clip.add(sw);
  const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), led);
  ledMesh.position.set(0, 0.58, bodyD(bodyT(0.58)) + 0.004);
  clip.add(ledMesh);

  // рычаг регулировки ножа сбоку
  const lever = new THREE.Group();
  const lt = bodyT(1.35);
  lever.position.set(bodyW(lt) + 0.02, 1.35, 0.05);
  const leverArm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.16), gold);
  leverArm.position.y = -0.12;
  const leverPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 32), gold);
  leverPivot.rotation.z = Math.PI / 2;
  lever.add(leverArm, leverPivot);
  lever.rotation.x = 0.35;
  clip.add(lever);

  // ножевой блок: неподвижный нож и подвижный над ним
  const blades = new THREE.Group();
  blades.position.set(0, HEAD_Y1 - 0.06, 0.06);
  blades.rotation.x = -0.18;
  clip.add(blades);
  const fixedGeo = new THREE.ExtrudeGeometry(combShape(1.0, 0.16, 0.2, 30, 0.38), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 4 });
  fixedGeo.translate(0, 0, -0.025);
  blades.add(new THREE.Mesh(fixedGeo, chrome));
  const cutterGeo = new THREE.ExtrudeGeometry(combShape(0.84, 0.12, 0.13, 24, 0.42), { depth: 0.035, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 4 });
  cutterGeo.translate(0, 0, -0.0175);
  const cutter = new THREE.Mesh(cutterGeo, steel);
  cutter.position.set(0, 0.02, -0.06);
  blades.add(cutter);
  // винты крепления ножа
  for (const x of [-0.3, 0.3]) {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 20), gold);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, 0.08, 0.04);
    blades.add(screw);
  }

  // насадка: рёбра + планка, вылет масштабируется по z
  const guard = new THREE.Group();
  const guardScale = new THREE.Group();
  guard.add(guardScale);
  clip.add(guard);
  const ribGeo = new THREE.ExtrudeGeometry(ribShape(), { depth: 0.028, bevelEnabled: false, curveSegments: 16 });
  // профиль лежит в XY, переносим: x фигуры -> z модели, глубина выдавливания -> x модели
  ribGeo.rotateY(-Math.PI / 2);
  const RIBS = 15;
  for (let i = 0; i < RIBS; i++) {
    const r = new THREE.Mesh(ribGeo, guardMat);
    r.position.x = -0.44 + (0.88 * i) / (RIBS - 1) + 0.014;
    guardScale.add(r);
  }
  // направляющие по краям и задняя планка, которая ложится на корпус
  // поперечная планка по верху: держит рёбра и садится на нож
  const clipBar = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.07, 0.42), guardMat);
  clipBar.position.set(0, 2.53, -0.12);
  guard.add(clipBar);
  // боковые щёчки, которые охватывают голову машинки
  for (const sx of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.75, 0.42), guardMat);
    cheek.position.set(sx * 0.47, 2.15, -0.12);
    guard.add(cheek);
  }
  guard.position.z = 0.34;

  // тень
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0 }),
  );
  scene.add(shadow);

  /* состояние, которое задаёт страница */
  const state = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1, alpha: 1, shadow: 0, run: 0, guard: 0, spin: 0 };
  const cur = { ...state };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let visible = true, cleared = false, running = true;
  let t0 = performance.now();

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  function viewSize() {
    const h = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return { w: h * camera.aspect, h };
  }

  function guardHeight(g) {
    const i = Math.max(1, Math.min(3, Math.floor(g)));
    if (g <= 1) return GUARD_H[1];
    return GUARD_H[i] + (GUARD_H[i + 1] - GUARD_H[i]) * Math.min(1, g - i);
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    const k = 1 - Math.pow(0.0012, dt);
    for (const key of Object.keys(state)) cur[key] += (state[key] - cur[key]) * k;
    if (!visible && cur.alpha < 0.003) {
      if (!cleared) { renderer.clear(); cleared = true; }
      return;
    }
    cleared = false;
    mouse.x += (mouse.tx - mouse.x) * (1 - Math.pow(0.003, dt));
    mouse.y += (mouse.ty - mouse.y) * (1 - Math.pow(0.003, dt));

    const t = now / 1000;
    const v = viewSize();
    const s = cur.scale * v.h * 0.8 / LEN;
    const buzz = cur.run;
    root.position.set(
      cur.x * v.w + Math.sin(t * 173) * 0.004 * buzz,
      cur.y * v.h + Math.sin(t * 0.9) * 0.04 * cur.scale + Math.cos(t * 151) * 0.004 * buzz,
      cur.z,
    );
    root.rotation.set(cur.rx, cur.ry + cur.spin, cur.rz);
    root.scale.setScalar(s);
    tilt.rotation.set(-mouse.y * 0.14, mouse.x * 0.24, 0);

    // подвижный нож ходит вбок, когда мотор включён
    cutter.position.x = Math.sin(t * 95) * 0.028 * buzz;
    led.color.setRGB(...new THREE.Color(opts.accent || '#d4532e').toArray().map((c) => c * (0.25 + 0.75 * buzz)));

    // насадка: при guard < 1 съезжает вверх и исчезает
    const on = smooth(0, 1, cur.guard);
    guard.visible = on > 0.01;
    guardScale.scale.z = guardHeight(cur.guard);
    guard.position.y = (1 - on) * 0.9;
    guardMat.opacity = 0.92 * on;

    // тень: сплющенный овал ниже, с воздушным зазором
    shadow.position.set(root.position.x, root.position.y - 0.56 * cur.scale * v.h * 0.8 * 0.5 - 0.15, cur.z - 1.4);
    shadow.scale.set(cur.scale * 1.1, cur.scale * 0.16, 1);
    shadow.material.opacity = 0.45 * cur.shadow;

    canvas.style.opacity = cur.alpha.toFixed(3);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    setState: (s) => Object.assign(state, s),
    jump: (s) => { Object.assign(state, s); Object.assign(cur, s); },
    setMouse: (nx, ny) => { mouse.tx = nx; mouse.ty = ny; },
    setVisible: (v) => { visible = v; },
    resize, viewSize,
    snapshot: () => { renderer.render(scene, camera); return canvas.toDataURL('image/png'); },
    destroy: () => { running = false; renderer.dispose(); },
  };
}
