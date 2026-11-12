/* =====================================================================
   PULSE ARENA: 3D гиря и облако пульса
   Гиря из чугуна с порошковой краской строится кодом. Вокруг облако
   частиц: каждый удар сердца проходит по нему волной от центра наружу.
   Страница задаёт пульс (bpm), энергию облака, амплитуду маха гирей.
   getBeat() отдаёт фазу удара для ЭКГ и счётчика пульса на странице.
   ===================================================================== */
import * as THREE from 'three';

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const LIME = 0xd4416a;   // малиновый акцент студии

// форма удара сердца: «тук-тук» и пауза
export function beatShape(f) {
  return Math.exp(-Math.pow(f / 0.035, 2)) + 0.55 * Math.exp(-Math.pow((f - 0.16) / 0.045, 2));
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* порошковая краска с чугунной зернистостью и цифрами веса спереди (u = 0.5) */
function bellTexture() {
  return canvasTex(2048, 1024, (g, W, H) => {
    g.fillStyle = '#1b1c1b'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 26000; i++) {
      g.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.07})`;
      g.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }
    // полоса по экватору
    g.fillStyle = '#d4ff3a'; g.fillRect(0, H * 0.585, W, 10);
    // вес
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#d4ff3a';
    g.font = '500 300px "Wix Madefor Display", "Arial Black", sans-serif';
    g.fillText('24', W / 2, H * 0.38);
    g.font = '500 70px "Wix Madefor Display", "Arial Black", sans-serif';
    g.fillText('KG', W / 2, H * 0.5);
    g.fillStyle = 'rgba(212,255,58,0.6)';
    g.font = '500 44px "Wix Madefor Display", sans-serif';
    g.fillText('PULSE ARENA', 0.0 * W + W * 0.0 + W, H * 0.38);
    g.fillText('PULSE ARENA', 0, H * 0.38);
  });
}

function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0xd9d0ca);
  const box = (w, h, intensity, pos, tint = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  box(12, 2, 2.6, [0, 7, 3]);
  box(2, 10, 2.0, [-8, 1, 4]);
  box(2, 10, 1.6, [8, 0, -1], 0xffd6e0);
  box(1, 14, 2.4, [-3, 0, 10]);
  return env;
}

/* =====================================================================
   СЦЕНА
   ===================================================================== */
export function createBell(canvas, opts = {}) {
  const mobile = !!opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.snapshot });
  const dpr = Math.min(window.devicePixelRatio, mobile ? 1.6 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(-3, 5, 6);
  const lime = new THREE.PointLight(LIME, 6, 9, 1.8);
  const rimL = new THREE.DirectionalLight(LIME, 2.2);
  rimL.position.set(5, 2, -4);
  const rimW = new THREE.DirectionalLight(0xffffff, 1.6);
  rimW.position.set(-5, 3, -3);
  scene.add(key, lime, rimL, rimW);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const root = new THREE.Group();
  const tilt = new THREE.Group();
  const body = new THREE.Group();
  scene.add(root); root.add(tilt); tilt.add(body);

  /* ---- гиря: подвешена за ручку, чтобы качаться как маятник ---- */
  const pivot = new THREE.Group();
  pivot.position.y = 1.45;
  body.add(pivot);
  const bell = new THREE.Group();
  bell.position.y = -1.45;
  pivot.add(bell);
  // фитбол: глянцевый мяч, прыгает в такт пульсу (как на джампинге)
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xe0587c, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: new THREE.Color(0xffc2d1), transparent: true });
  const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), paint);
  bell.add(ballMesh);
  // тонкий шов по экватору и клапан, чтобы мяч читался как фитбол
  const handleMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.35, clearcoat: 0.6, transparent: true });
  const seam = new THREE.Mesh(new THREE.TorusGeometry(1.002, 0.012, 8, 160), handleMat);
  seam.rotation.x = Math.PI / 2;
  bell.add(seam);
  const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.04, 24), handleMat);
  valve.position.set(0, 0.6, 0.8); valve.lookAt(0, 1.2, 1.6);
  bell.add(valve);

  /* ---- облако пульса ---- */
  const N = mobile ? 1600 : 3200;
  const dir = new Float32Array(N * 3), rad = new Float32Array(N), rnd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const ring = i < N * 0.3;
    let x, y, z;
    if (ring) {
      // кольцо по экватору
      const a = Math.random() * Math.PI * 2;
      x = Math.cos(a); y = (Math.random() - 0.5) * 0.12; z = Math.sin(a);
      rad[i] = 2.0 + Math.random() * 0.5;
    } else {
      // сферическая оболочка
      const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      x = s * Math.cos(a); y = u; z = s * Math.sin(a);
      rad[i] = 1.7 + Math.pow(Math.random(), 1.6) * 1.8;
    }
    const l = Math.hypot(x, y, z);
    dir[i * 3] = x / l; dir[i * 3 + 1] = y / l; dir[i * 3 + 2] = z / l;
    rnd[i] = Math.random();
  }
  const cg = new THREE.BufferGeometry();
  cg.setAttribute('position', new THREE.BufferAttribute(dir, 3));
  cg.setAttribute('aRad', new THREE.BufferAttribute(rad, 1));
  cg.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
  const cloudMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    uniforms: { uBeat: { value: 0 }, uEnergy: { value: 0.5 }, uTime: { value: 0 }, uAlpha: { value: 1 }, uPx: { value: dpr * (mobile ? 0.6 : 1) }, uColor: { value: new THREE.Color(LIME) } },
    vertexShader: /* glsl */`
      attribute float aRad; attribute float aRnd;
      uniform float uBeat, uEnergy, uTime, uPx;
      varying float vP; varying float vR;
      float beat(float f) { return exp(-pow(f / 0.035, 2.0)) + 0.55 * exp(-pow((f - 0.16) / 0.045, 2.0)); }
      void main() {
        // волна удара идёт от центра наружу
        float delay = (aRad - 1.6) * 0.09;
        float p = beat(fract(uBeat - delay));
        vP = p; vR = aRnd;
        float r = aRad + p * (0.18 + 0.45 * uEnergy) * (0.6 + aRnd * 0.8);
        // облако медленно вращается, быстрее при высокой энергии
        float a = uTime * (0.05 + 0.35 * uEnergy) * (0.5 + aRnd);
        vec3 d = position;
        d.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * d.xz;
        d.y += sin(uTime * 0.7 + aRnd * 30.0) * 0.03;
        vec4 mv = modelViewMatrix * vec4(d * r, 1.0);
        gl_PointSize = (2.4 + aRnd * 3.4 + p * 5.0) * uPx * (9.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform float uAlpha, uEnergy; uniform vec3 uColor;
      varying float vP; varying float vR;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        vec3 col = mix(uColor, uColor * 0.62, vP * 0.7);
        gl_FragColor = vec4(col, a * (0.45 + 0.8 * vP + 0.25 * uEnergy) * (0.45 + vR * 0.55) * uAlpha);
      }`,
  });
  const cloud = new THREE.Points(cg, cloudMat);
  body.add(cloud);

  // тень на полу
  const blob = canvasTex(256, 256, (g) => {
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, 'rgba(0,0,0,0.85)'); r.addColorStop(0.62, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  });
  blob.colorSpace = THREE.NoColorSpace;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false, toneMapped: false }));
  scene.add(shadow);

  /* ---- состояние ---- */
  const state = { x: 0, y: 0, z: 0, rx: 0.12, ry: 0, rz: 0, scale: 1, bpm: 72, energy: 0.4, swing: 0, cloud: 1, idle: 1, shadow: 1, alpha: 1 };
  const cur = { ...state };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let beat = 0, swingT = 0, idleAngle = 0, visible = true, running = true, cleared = false, t0 = performance.now();

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
    beat = (beat + dt * cur.bpm / 60) % 1;
    const p = beatShape(beat);
    root.position.set(cur.x, cur.y, cur.z);
    root.scale.setScalar(cur.scale);
    tilt.rotation.set(-mouse.y * 0.14, mouse.x * 0.26, 0);
    body.rotation.set(cur.rx, cur.ry + idleAngle, cur.rz);
    const a = cur.alpha;

    // мах гирей в темпе пульса (полный мах на два удара)
    swingT += dt * (cur.bpm / 60) * Math.PI;
    // прыжок: вверх по модулю синуса, у пола мяч сплющивается
    const hop = Math.abs(Math.sin(swingT));
    bell.position.y = -1.45 + hop * 0.75 * cur.swing;
    const squash = (1 - Math.min(1, hop * 6)) * 0.12 * cur.swing;
    bell.scale.set(1 + squash + p * 0.012, 1 - squash + p * 0.012, 1 + squash + p * 0.012);

    cloudMat.uniforms.uBeat.value = beat;
    cloudMat.uniforms.uEnergy.value = cur.energy;
    cloudMat.uniforms.uTime.value = t;
    cloudMat.uniforms.uAlpha.value = cur.cloud * a;
    cloud.visible = cur.cloud * a > 0.01;

    for (const m of [paint, handleMat]) { m.opacity = a; m.depthWrite = a > 0.5; }
    const v = viewSize();
    lime.position.set(mouse.x * v.w * 0.5, mouse.y * v.h * 0.5, 3);
    lime.intensity = (4 + p * 6) * a;

    const s = cur.scale;
    shadow.position.set(cur.x, cur.y - 1.15 * s, cur.z - 0.8);
    shadow.scale.set(s * 2.8, s * 0.42, 1);
    shadow.material.opacity = cur.shadow * a * (0.45 - 0.25 * Math.abs(Math.sin(swingT)) * cur.swing);
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    const k = 1 - Math.pow(0.0015, dt);
    for (const key of Object.keys(state)) cur[key] += (state[key] - cur[key]) * (key === 'bpm' ? 1 - Math.pow(0.2, dt) : k);
    if (!visible && cur.alpha < 0.003) {
      if (!cleared) { renderer.clear(); cleared = true; }
      // пульс тикает, даже когда сцены не видно: им живёт ЭКГ на странице
      beat = (beat + dt * cur.bpm / 60) % 1;
      return;
    }
    cleared = false;
    idleAngle += dt * 0.25 * cur.idle;
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
    getBeat: () => ({ phase: beat, bpm: cur.bpm }),
    viewSize,
    snapshot: () => { apply(performance.now() / 1000, 0.016); renderer.render(scene, camera); return canvas.toDataURL('image/png'); },
    destroy: () => { running = false; renderer.dispose(); },
  };
}
