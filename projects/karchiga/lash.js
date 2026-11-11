/* =====================================================================
   KARCHIGA LASH: 3D ряд ресниц на линии века
   Каждый пучок — веер из изогнутых ресниц. vol: 0 — классика (1 ресница),
   1 — 2D, 2 — 3D, 3 — 5D, 4 — мега-объём (9). Дробные значения перетекают.
   Положение в долях экрана: x, y от -0.5 до 0.5; scale = 1 — ряд шириной
   в 80% высоты экрана.
   ===================================================================== */
import * as THREE from 'three';

const ROW_W = 4.2;                // ширина ряда в мировых единицах
const VOL = [1, 2, 3, 5, 9];      // ресниц в пучке по шагам
const MAXN = 9;
const BUNDLES = 15;

function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0xd8cbc6);
  const box = (w, h, i, pos, tint = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(i), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  box(12, 2.4, 2.6, [0, 7, 3]);
  box(2.4, 12, 2.2, [-7, 0, 5], 0xfff0ea);
  box(1.4, 12, 1.6, [7, 0, 3], 0xffe1ea);
  box(3, 3, 1.4, [2, 2, 9]);
  return env;
}

/* изогнутая ресница: трубка, сужающаяся к кончику */
function lashGeometry(len, curl) {
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    // растёт вверх и загибается вперёд (к зрителю) по дуге
    const a = t * (0.35 + curl * 1.25);
    pts.push(new THREE.Vector3(0, Math.sin(a) / (0.35 + curl * 1.25) * len, (1 - Math.cos(a)) / (0.35 + curl * 1.25) * len));
  }
  const path = new THREE.CatmullRomCurve3(pts);
  const SEG = 28, RAD = 6;
  const g = new THREE.TubeGeometry(path, SEG, 0.016, RAD, false);
  const pos = g.attributes.position;
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG;
    const c = path.getPointAt(t);
    const k = 1 - t * 0.88;
    for (let j = 0; j <= RAD; j++) {
      const idx = i * (RAD + 1) + j;
      pos.setXYZ(idx, c.x + (pos.getX(idx) - c.x) * k, c.y + (pos.getY(idx) - c.y) * k, c.z + (pos.getZ(idx) - c.z) * k);
    }
  }
  g.computeVertexNormals();
  return g;
}

function shadowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 127);
  grd.addColorStop(0, 'rgba(60,30,40,0.55)'); grd.addColorStop(0.65, 'rgba(60,30,40,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function createLash(canvas, opts = {}) {
  const mobile = !!opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.snapshot });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.6 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(studioEnvironment(), 0.03).texture;
  const key = new THREE.DirectionalLight(0xfff2ee, 1.3); key.position.set(-3, 4, 6);
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0x8a6a70, 0.6));

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const root = new THREE.Group(), tilt = new THREE.Group(), row = new THREE.Group();
  root.add(tilt); tilt.add(row); scene.add(root);

  const lashMat = new THREE.MeshPhysicalMaterial({ color: 0x141012, roughness: 0.32, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.2, transparent: true });
  const beadMat = new THREE.MeshPhysicalMaterial({ color: 0x1c1416, roughness: 0.25, clearcoat: 1, transparent: true });
  const lidMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(opts.accent || '#c9567a'), roughness: 0.4, clearcoat: 0.8, transparent: true });

  // линия века: дуга, на ней сидят пучки
  const arc = (u) => { const x = (u - 0.5) * ROW_W; return new THREE.Vector3(x, -0.62 * Math.pow(x / (ROW_W / 2), 2), -0.3 * Math.pow(x / (ROW_W / 2), 2)); };
  const lidCurve = new THREE.CatmullRomCurve3(Array.from({ length: 21 }, (_, i) => arc(-0.04 + 1.08 * i / 20)));
  row.add(new THREE.Mesh(new THREE.TubeGeometry(lidCurve, 120, 0.035, 12, false), lidMat));

  // пучки: в каждом MAXN ресниц, видимость и веер считаются по vol
  const bundles = [];
  for (let b = 0; b < BUNDLES; b++) {
    const u = (b + 0.5) / BUNDLES;
    const edge = Math.abs(u - 0.5) * 2;           // 0 в центре, 1 по краям
    const base = arc(u);
    const g = new THREE.Group();
    g.position.copy(base);
    // ресницы по краям короче и наклонены наружу, как на настоящем глазу
    g.rotation.z = -(u - 0.5) * 1.5;
    g.rotation.x = 0.15;
    row.add(g);
    const strands = [];
    for (let s = 0; s < MAXN; s++) {
      const len = (1.7 - edge * 0.7) * (0.9 + ((s * 37 + b * 13) % 10) / 50);
      const m = new THREE.Mesh(lashGeometry(len, 0.55 + ((s * 7 + b) % 5) / 25), lashMat);
      g.add(m);
      strands.push({ m, ang: 0, tilt: 0, seed: ((s * 53 + b * 29) % 17) / 17 });
    }
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), beadMat);
    g.add(bead);
    bundles.push({ g, strands, bead });
  }

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0 }));
  scene.add(shadow);

  const state = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1, alpha: 1, shadow: 0, vol: 0, curl: 0.5 };
  const cur = { ...state };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let visible = true, cleared = false, running = true, t0 = performance.now();

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);
  const viewSize = () => { const h = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); return { w: h * camera.aspect, h }; };
  const countFor = (v) => { const i = Math.max(0, Math.min(4, v)); const a = Math.floor(i), f = i - a; return VOL[a] + (VOL[Math.min(4, a + 1)] - VOL[a]) * f; };

  function apply(t, dt) {
    const v = viewSize();
    const sc = cur.scale * v.h * 0.8 / ROW_W;
    root.position.set(cur.x * v.w, cur.y * v.h + Math.sin(t * 0.8) * 0.03 * cur.scale, cur.z);
    root.rotation.set(cur.rx, cur.ry, cur.rz);
    root.scale.setScalar(sc);
    tilt.rotation.set(-mouse.y * 0.18 + Math.sin(t * 0.5) * 0.03, mouse.x * 0.3, 0);

    const n = countFor(cur.vol);
    const spread = Math.min(0.85, 0.16 + (n - 1) * 0.1);   // ширина веера, рад
    const k = 1 - Math.pow(0.004, dt);
    const a = cur.alpha;
    for (const b of bundles) {
      b.strands.forEach((s, j) => {
        const on = Math.max(0, Math.min(1, n - j));          // j-я ресница проявляется, когда n > j
        const nn = Math.max(1, Math.ceil(n));
        const target = nn > 1 ? (j / (nn - 1) - 0.5) * spread : 0;
        s.ang += ((j < nn ? target : 0) - s.ang) * k;
        s.tilt += ((s.seed - 0.5) * 0.25 * (nn > 1 ? 1 : 0) - s.tilt) * k;
        s.m.rotation.set(s.tilt, 0, s.ang);
        s.m.scale.setScalar(0.001 + on * 0.999);
        s.m.visible = on > 0.01;
      });
    }
    for (const m of [lashMat, beadMat, lidMat]) { m.opacity = a; m.depthWrite = a > 0.5; }

    shadow.position.set(root.position.x, root.position.y - 0.55 * sc * 2.2, cur.z - 1.4);
    shadow.scale.set(cur.scale * 1.3, cur.scale * 0.16, 1);
    shadow.material.opacity = 0.45 * cur.shadow * a;
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    const k = 1 - Math.pow(0.0012, dt);
    for (const key of Object.keys(state)) cur[key] += (state[key] - cur[key]) * k;
    if (!visible && cur.alpha < 0.003) { if (!cleared) { renderer.clear(); cleared = true; } return; }
    cleared = false;
    mouse.x += (mouse.tx - mouse.x) * (1 - Math.pow(0.003, dt));
    mouse.y += (mouse.ty - mouse.y) * (1 - Math.pow(0.003, dt));
    apply(now / 1000, dt);
    canvas.style.opacity = cur.alpha.toFixed(3);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    setState: (s) => Object.assign(state, s),
    jump: (s) => { Object.assign(state, s); Object.assign(cur, state); },
    setMouse: (x, y) => { mouse.tx = x; mouse.ty = y; },
    setVisible: (v) => { visible = v; },
    resize, viewSize,
    snapshot: () => { apply(performance.now() / 1000, 0.5); renderer.render(scene, camera); return canvas.toDataURL('image/png'); },
    destroy: () => { running = false; renderer.dispose(); },
  };
}
