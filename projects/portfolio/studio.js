/* =====================================================================
   ИЛЬЯ, портфолио: 3D «разобранная страница»
   Окно браузера и слои макета (шапка, первый экран, фото, кнопка,
   карточки) строятся кодом. Страница проходит путь сайта:
     wire    каркас: белые контуры слоёв
     fill    дизайн: слои заполняются цветом и картинками
     code    код: поток строк, слои складываются
     screen  запуск: экран светится и показывает работы
   setWork(i) меняет работу на экране шторкой с оранжевой кромкой.
   ===================================================================== */
import * as THREE from 'three';

const W = 4.8, H = 3.0, R = 0.12;        // окно браузера
const BAR = 0.24;                        // высота панели браузера
const INK = '#f2f0ec', BG = '#0b0b0b', ACC = '#ff4f1a';
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
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
const FONT = (size, display) => `${display ? 500 : 400} ${size}px ${display ? '"Wix Madefor Display"' : '"Wix Madefor Text"'}, system-ui, sans-serif`;

/* ---------- текстуры слоёв: маленький сайт внутри сайта ---------- */
const LAYERS = [
  { key: 'nav', x: 0, y: 1.0, w: 4.5, h: 0.2, r: 0.1, draw: (g, w, h) => {
    g.fillStyle = '#161616'; g.fillRect(0, 0, w, h);
    g.fillStyle = INK; g.font = FONT(h * 0.5, true); g.textBaseline = 'middle';
    g.fillText('Илья', h * 0.6, h / 2);
    g.globalAlpha = 0.6; g.font = FONT(h * 0.36);
    ['Работы', 'Услуги', 'Цены', 'Контакты'].forEach((t, i) => g.fillText(t, w * 0.48 + i * w * 0.1, h / 2));
    g.globalAlpha = 1; g.fillStyle = ACC;
    g.beginPath(); g.roundRect(w - h * 3.4, h * 0.2, h * 2.9, h * 0.6, h * 0.3); g.fill();
  } },
  { key: 'title', x: -0.98, y: 0.36, w: 2.5, h: 1.08, r: 0.06, draw: (g, w, h) => {
    g.fillStyle = '#121212'; g.fillRect(0, 0, w, h);
    g.fillStyle = INK; g.font = FONT(h * 0.22, true); g.textBaseline = 'alphabetic';
    g.fillText('Сайты, которые', w * 0.06, h * 0.36);
    g.fillText('приводят клиентов', w * 0.06, h * 0.64);
    g.globalAlpha = 0.5; g.font = FONT(h * 0.07);
    g.fillText('Дизайн, код и запуск под ключ', w * 0.06, h * 0.84);
  } },
  { key: 'photo', x: 1.32, y: 0.3, w: 1.8, h: 1.25, r: 0.06, img: true },
  { key: 'button', x: -1.48, y: -0.38, w: 1.32, h: 0.24, r: 0.12, draw: (g, w, h) => {
    g.fillStyle = ACC; g.fillRect(0, 0, w, h);
    g.fillStyle = BG; g.font = FONT(h * 0.38); g.textBaseline = 'middle';
    g.fillText('Обсудить проект', w * 0.12, h / 2);
  } },
  ...[0, 1, 2].map((i) => ({ key: 'card' + i, x: -1.48 + i * 1.48, y: -1.0, w: 1.36, h: 0.66, r: 0.05, draw: (g, w, h) => {
    g.fillStyle = i === 1 ? '#1d1d1d' : '#161616'; g.fillRect(0, 0, w, h);
    g.fillStyle = i === 1 ? ACC : INK; g.font = FONT(h * 0.13); g.globalAlpha = 0.9;
    g.fillText('0' + (i + 1), w * 0.08, h * 0.24);
    g.fillStyle = INK; g.globalAlpha = 1; g.font = FONT(h * 0.17, true);
    g.fillText(['Лендинг', 'Сайт с 3D', 'Запись онлайн'][i], w * 0.08, h * 0.58);
    g.globalAlpha = 0.4;
    g.fillRect(w * 0.08, h * 0.72, w * 0.62, h * 0.04);
    g.fillRect(w * 0.08, h * 0.82, w * 0.44, h * 0.04);
  } })),
];

function chromeTexture() {
  return canvasTex(1440, 900, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const bar = (BAR / H) * h;
    g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, bar);
    ['#ff4f1a', '#f2f0ec', '#5a5a5a'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(30 + i * 26, bar / 2, 7, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#262626'; g.beginPath(); g.roundRect(w * 0.32, bar * 0.22, w * 0.36, bar * 0.56, bar * 0.28); g.fill();
    g.fillStyle = 'rgba(242,240,236,0.6)'; g.font = FONT(bar * 0.3); g.textBaseline = 'middle'; g.textAlign = 'center';
    g.fillText('ilya.kz', w / 2, bar / 2);
  });
}

function codeTexture() {
  const lines = [
    ['const', ' site = ', 'build', '({ niche: ', "'кофейня'", ' });'],
    ['import', ' * as THREE ', 'from', " 'three'", ';'],
    ['gsap', '.to(cup, { level: ', '0.84', ', ease: ', "'expo.out'", ' });'],
    ['.hero', ' { height: ', '100svh', '; }'],
    ['form', '.addEventListener(', "'submit'", ', send);'],
    ['window', '.open(', '`https://wa.me/${phone}`', ');'],
    ['h1', ' { letter-spacing: ', '-0.04em', '; text-wrap: balance; }'],
    ['const', ' yurt = ', 'createYurt', '(canvas, { mobile });'],
    ['ScrollTrigger', '.create({ pin: ', 'true', ', scrub: ', '1', ' });'],
    ['<button', ' class="btn">', 'Записаться', '</button>'],
    ['@media', ' (max-width: ', '760px', ') { ... }'],
    ['renderer', '.setPixelRatio(', 'Math.min(dpr, 1.75)', ');'],
  ];
  return canvasTex(1024, 1024, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.font = '400 26px ui-monospace, "SFMono-Regular", Menlo, monospace';
    g.textBaseline = 'middle';
    for (let r = 0; r < 26; r++) {
      const ln = lines[r % lines.length];
      let x = 40 + ((r * 37) % 3) * 32;
      const y = 26 + r * 38.5;
      g.fillStyle = 'rgba(242,240,236,0.3)'; g.fillText(String(r + 1).padStart(2, '0'), 4, y);
      ln.forEach((part, j) => {
        g.fillStyle = j % 2 === 0 ? (j === 0 ? '#ff4f1a' : '#f2f0ec') : 'rgba(242,240,236,0.62)';
        g.fillText(part, x, y);
        x += g.measureText(part).width;
      });
    }
  });
}

/* экран: две картинки и шторка с оранжевой кромкой */
function screenMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, toneMapped: false,
    uniforms: { uA: { value: null }, uB: { value: null }, uMix: { value: 1 }, uOpacity: { value: 0 }, uTime: { value: 0 }, uAcc: { value: new THREE.Color(ACC) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: /* glsl */`
      uniform sampler2D uA, uB; uniform float uMix, uOpacity, uTime; uniform vec3 uAcc; varying vec2 vUv;
      void main() {
        float edge = vUv.x * 0.85 + (1.0 - vUv.y) * 0.15;
        float m = uMix * 1.3 - 0.15;
        float k = smoothstep(m - 0.002, m + 0.002, edge);
        vec3 a = texture2D(uA, vUv).rgb, b = texture2D(uB, vUv).rgb;
        vec3 col = mix(b, a, k);
        float line = smoothstep(0.012, 0.0, abs(edge - m)) * step(0.001, uMix) * step(uMix, 0.999);
        col = mix(col, uAcc, line);
        // лёгкий блеск стекла по диагонали
        col += smoothstep(0.08, 0.0, abs(vUv.x - vUv.y * 0.4 - 0.75)) * 0.05;
        gl_FragColor = vec4(col, uOpacity);
      }`,
  });
}

function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x050505);
  const box = (w, h, intensity, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  box(10, 2, 2.6, [0, 7, 3]);
  box(2, 10, 1.8, [-8, 1, 4]);
  box(2, 10, 1.0, [8, 0, -1]);
  box(4, 4, 1.4, [3, 2, 9]);
  return env;
}

/* =====================================================================
   СЦЕНА
   ===================================================================== */
export function createStudio(canvas, opts = {}) {
  const mobile = !!opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.snapshot });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.6 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(-3, 5, 6);
  const accLight = new THREE.PointLight(0xff4f1a, 6, 9, 1.8);
  scene.add(key, accLight);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const root = new THREE.Group();
  const tilt = new THREE.Group();
  const body = new THREE.Group();
  scene.add(root); root.add(tilt); tilt.add(body);

  /* ---- окно браузера ---- */
  const baseGeo = new THREE.ExtrudeGeometry(roundedRect(W, H, R), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 10 });
  baseGeo.translate(0, 0, -0.1);
  const baseMat = new THREE.MeshPhysicalMaterial({ color: 0x101010, roughness: 0.3, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.15, transparent: true });
  const base = new THREE.Mesh(baseGeo, baseMat);
  body.add(base);
  const chrome = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.06, H - 0.06), new THREE.MeshBasicMaterial({ map: chromeTexture(), transparent: true, toneMapped: false }));
  chrome.position.z = 0.002;
  body.add(chrome);
  const baseEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ShapeGeometry(roundedRect(W, H, R), 10)), new THREE.LineBasicMaterial({ color: 0xf2f0ec, transparent: true, opacity: 0 }));
  baseEdges.position.z = 0.004;
  body.add(baseEdges);

  // экран с работами
  const SH = H - BAR - 0.05, SW = W - 0.06;
  const screenMat = screenMaterial();
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), screenMat);
  screen.position.set(0, -BAR / 2 + 0.005, 0.006);
  screen.renderOrder = 5;
  body.add(screen);

  // код
  const codeTex = codeTexture();
  codeTex.wrapT = THREE.RepeatWrapping;
  codeTex.repeat.set(1, 0.62);
  const codeMat = new THREE.MeshBasicMaterial({ map: codeTex, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const code = new THREE.Mesh(new THREE.PlaneGeometry(SW - 0.2, SH - 0.1), codeMat);
  code.position.set(0, -BAR / 2, 0.02);
  code.renderOrder = 4;
  body.add(code);

  /* ---- слои макета ---- */
  const loader = new THREE.TextureLoader();
  const layers = LAYERS.map((L, i) => {
    const shape = roundedRect(L.w, L.h, L.r);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: false, curveSegments: 8 });
    // UV передней грани: 0..1 по прямоугольнику
    const uv = geo.attributes.uv, pos = geo.attributes.position;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, (pos.getX(k) + L.w / 2) / L.w, (pos.getY(k) + L.h / 2) / L.h);
    const map = L.img
      ? loader.load(opts.layerImage || '', (t) => { t.colorSpace = THREE.SRGBColorSpace; })
      : canvasTex(Math.round(L.w * 300), Math.round(L.h * 300), L.draw);
    if (L.img) map.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshStandardMaterial({ map, roughness: 0.5, metalness: 0.05, transparent: true, opacity: 0, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.35 });
    const mesh = new THREE.Mesh(geo, mat);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ShapeGeometry(shape, 8)), new THREE.LineBasicMaterial({ color: L.key === 'button' ? 0xff4f1a : 0xf2f0ec, transparent: true, opacity: 0 }));
    edges.position.z = 0.03;
    const g = new THREE.Group();
    g.add(mesh, edges);
    g.position.set(L.x, L.y, 0);
    g.userData = { L, i, phase: i * 1.37 };
    body.add(g);
    return { g, mesh, edges, mat };
  });

  /* ---- пол из сетки и пыль ---- */
  const gridMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uAmt: { value: 0 }, uTime: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: /* glsl */`
      uniform float uAmt, uTime; varying vec3 vP;
      void main() {
        vec2 p = vP.xy + vec2(0.0, uTime * 0.15);
        vec2 g = abs(fract(p * 1.25) - 0.5);
        float line = 1.0 - smoothstep(0.0, 0.03, min(g.x, g.y));
        float fade = 1.0 - smoothstep(2.0, 11.0, length(vP.xy));
        gl_FragColor = vec4(vec3(0.95), line * fade * 0.16 * uAmt);
      }`,
  });
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), gridMat);
  grid.rotation.x = -Math.PI / 2;
  grid.position.set(0, -2.45, -3);
  scene.add(grid);

  const dustN = mobile ? 90 : 180;
  const dp = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) { dp[i * 3] = (Math.random() - 0.5) * 16; dp[i * 3 + 1] = (Math.random() - 0.5) * 9; dp[i * 3 + 2] = -6 + Math.random() * 7; }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0xf2f0ec, size: 0.025, transparent: true, opacity: 0.5, depthWrite: false });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* ---- работы на экране ---- */
  const workTex = (opts.works || []).map((url) => { const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace; return t; });
  let curWork = -1, mix = 1, prevTex = null;
  function setWork(i) {
    if (i === curWork || !workTex[i]) return;
    prevTex = curWork >= 0 ? workTex[curWork] : workTex[i];
    curWork = i;
    screenMat.uniforms.uA.value = prevTex;
    screenMat.uniforms.uB.value = workTex[i];
    mix = curWork === i && prevTex === workTex[i] ? 1 : 0;
  }
  if (workTex.length) setWork(0);

  /* ---- состояние ---- */
  const state = { x: 0, y: 0, z: 0, rx: 0.3, ry: -0.5, rz: 0, scale: 1, explode: 1, wire: 1, fill: 0, accent: 1, code: 0, screen: 0, grid: 1, idle: 1, alpha: 1 };
  const cur = { ...state };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let visible = true, running = true, t0 = performance.now();

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
    root.position.set(cur.x, cur.y + Math.sin(t * 0.7) * 0.05 * cur.idle, cur.z);
    root.scale.setScalar(cur.scale);
    tilt.rotation.set(-mouse.y * 0.18, mouse.x * 0.3, 0);
    body.rotation.set(cur.rx, cur.ry, cur.rz);
    const a = cur.alpha;

    // окно
    // в режиме каркаса окно полупрозрачное, чтобы не закрывать текст
    baseMat.opacity = a * (0.3 + 0.7 * clamp01(Math.max(cur.fill, cur.screen)));
    baseMat.depthWrite = baseMat.opacity > 0.9;
    chrome.material.opacity = a * clamp01(cur.fill * 1.4 + cur.screen);
    baseEdges.material.opacity = a * cur.wire * 0.7;

    // слои: разлетаются вперёд, каркас и заливка по очереди
    const n = layers.length;
    const fadeOut = 1 - clamp01(cur.screen * 1.6);
    for (const L of layers) {
      const { i, phase } = L.g.userData;
      const ex = cur.explode;
      L.g.position.z = 0.01 * (i + 1) + ex * (0.42 + i * 0.3) + Math.sin(t * 0.9 + phase) * 0.04 * ex * cur.idle;
      L.g.position.x = L.g.userData.L.x * (1 + ex * 0.06);
      L.g.position.y = L.g.userData.L.y * (1 + ex * 0.08);
      L.g.rotation.z = Math.sin(t * 0.5 + phase) * 0.012 * ex;
      const kw = clamp01((cur.wire - (i / n) * 0.5) / 0.5);
      const kf = clamp01((cur.fill - (i / n) * 0.55) / 0.45);
      const isBtn = L.g.userData.L.key === 'button';
      L.edges.material.opacity = a * fadeOut * Math.max(kw * (1 - kf * 0.75), isBtn ? cur.accent * (1 - kf) : 0);
      L.mat.opacity = a * fadeOut * Math.max(ease(kf), isBtn ? cur.accent * 0.9 : 0);
      L.mat.depthWrite = L.mat.opacity > 0.9;
      L.g.visible = (L.mat.opacity + L.edges.material.opacity) > 0.004;
    }

    // код бежит вверх
    codeTex.offset.y = (t * 0.06) % 1;
    codeMat.opacity = a * cur.code * 0.95;
    code.visible = codeMat.opacity > 0.004;

    // экран
    mix = Math.min(1, mix + dt * 1.2);
    screenMat.uniforms.uMix.value = ease(mix);
    screenMat.uniforms.uOpacity.value = a * clamp01(cur.screen);
    screenMat.uniforms.uTime.value = t;
    screen.visible = cur.screen > 0.004;

    // оранжевый свет идёт за курсором
    const v = viewSize();
    accLight.position.set(mouse.x * v.w * 0.5, mouse.y * v.h * 0.5, 3);
    accLight.intensity = 6 * a;

    gridMat.uniforms.uAmt.value = cur.grid * a;
    gridMat.uniforms.uTime.value = t;
    dust.rotation.y = t * 0.01;
    dust.position.set(-mouse.x * 0.25, -mouse.y * 0.15, 0);
    dustMat.opacity = 0.45 * Math.max(a, 0.4);
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    if (!visible) return;
    const k = 1 - Math.pow(0.0015, dt);
    for (const key of Object.keys(state)) cur[key] += (state[key] - cur[key]) * k;
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
    setWork,
    viewSize,
    snapshot: () => { apply(performance.now() / 1000, 0.016); renderer.render(scene, camera); return canvas.toDataURL('image/png'); },
    destroy: () => { running = false; renderer.dispose(); },
  };
}
