/* =====================================================================
   TOBYL COFFEE: 3D стаканы
   Горячий: бумажный стакан, крафтовый рукав, чёрная крышка, пар.
   Холодный: прозрачный стакан, внутри собирается айс-латте:
   лёд, молоко, эспрессо облаками сверху, купол-крышка и трубочка.
   Между ними бумага растворяется с тлеющим краем.
   Всё строится кодом, страница управляет сценой через setState().
   ===================================================================== */
import * as THREE from 'three';

/* ---------- размеры ---------- */
// холодный стакан
const CY0 = -1.6, CY1 = 1.35, CR0 = 0.62, CR1 = 0.93, CWALL = 0.014;
const cOut = (y) => CR0 + (CR1 - CR0) * ((y - CY0) / (CY1 - CY0));
const cIn = (y) => cOut(y) - CWALL;
const FLOOR = CY0 + 0.07;
const LIQ_TOP = CY1 - 0.1;
export const levelToY = (l) => FLOOR + (LIQ_TOP - FLOOR) * l;
// бумажный стакан чуть шире, холодный прячется внутри
const PY0 = -1.62, PY1 = 1.36, PR0 = 0.66, PR1 = 0.96;
const pOut = (y) => PR0 + (PR1 - PR0) * ((y - PY0) / (PY1 - PY0));

const rgb = (hex) => new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);
const INK = 0x1d1510, OAT = 0xece4d6;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

const NOISE = /* glsl */`
  float tHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float tNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(tHash(i), tHash(i + vec2(1, 0)), u.x), mix(tHash(i + vec2(0, 1)), tHash(i + vec2(1, 1)), u.x), u.y);
  }
  float tFbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * tNoise(p); p *= 2.03; a *= 0.5; } return v; }
`;

/* ---------- печать на стаканах ---------- */
function printTexture() {
  const W = 2048, Hh = 1200;
  const c = document.createElement('canvas');
  c.width = W; c.height = Hh;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  // фирменная надпись спереди (u = 0.5)
  g.font = '400 168px "Playfair Display", Georgia, serif';
  g.fillText('tobyl', W / 2, Hh * 0.47);
  g.font = '400 30px Manrope, system-ui, sans-serif';
  g.letterSpacing = '9px';
  g.fillText('COFFEE  /  KOSTANAY', W / 2, Hh * 0.47 + 62);
  g.fillRect(W / 2 - 34, Hh * 0.47 + 96, 68, 3);
  // мерные риски сзади (u = 0): уровни льда, молока и эспрессо
  g.textAlign = 'left';
  g.letterSpacing = '4px';
  g.font = '400 26px Manrope, system-ui, sans-serif';
  const v = (y) => Hh * (1 - (y - CY0) / (CY1 - CY0));
  const tick = (level, label) => {
    const y = v(levelToY(level));
    for (const x0 of [0, W]) g.fillRect(x0 - 70, y - 1.5, 140, 3);
    g.fillText(label, 84, y + 9);
  };
  tick(0.34, 'ЛЁД');
  tick(0.62, 'МОЛОКО');
  tick(0.84, 'ЭСПРЕССО');
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  return t;
}

function sleeveTexture() {
  const W = 2048, Hh = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = Hh;
  const g = c.getContext('2d');
  // крафт с гофрой
  g.fillStyle = '#b48a5c';
  g.fillRect(0, 0, W, Hh);
  for (let x = 0; x < W; x += 8) {
    g.fillStyle = `rgba(60,35,15,${0.05 + ((x / 8) % 2) * 0.05})`;
    g.fillRect(x, 0, 4, Hh);
  }
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(${Math.random() > 0.5 ? '255,240,220' : '50,30,10'},${Math.random() * 0.08})`;
    g.fillRect(Math.random() * W, Math.random() * Hh, 2, 2);
  }
  // печать
  g.fillStyle = '#1d1510';
  g.textAlign = 'center';
  g.font = '400 150px "Playfair Display", Georgia, serif';
  g.fillText('tobyl', W / 2, 270);
  g.font = '400 26px Manrope, system-ui, sans-serif';
  g.letterSpacing = '9px';
  g.fillText('COFFEE  /  KOSTANAY', W / 2, 335);
  g.fillRect(W / 2 - 30, 372, 60, 3);
  g.fillRect(0, 26, W, 3);
  g.fillRect(0, Hh - 29, W, 3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------- прозрачный пластик: френель, полосы софтбоксов, печать, капли ---------- */
function plasticMaterial(back, shared, print) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: back ? THREE.BackSide : THREE.FrontSide,
    uniforms: {
      uDark: shared.uDark, uAlpha: shared.uAlpha, uCond: shared.uCond, uFade: shared.uCold,
      uInk: { value: rgb(INK) }, uOat: { value: rgb(OAT) }, uBack: { value: back ? 1 : 0 },
      uPrint: { value: print || null }, uHasPrint: { value: print ? 1 : 0 },
      uY0: { value: CY0 }, uY1: { value: CY1 }, uHasCond: { value: 1 },
    },
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = -mv.xyz; vP = position;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform float uDark, uAlpha, uBack, uCond, uHasPrint, uY0, uY1, uFade, uHasCond;
      uniform vec3 uInk, uOat; uniform sampler2D uPrint;
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      ${NOISE}
      float band(float x, float a, float b, float s) { return smoothstep(a - s, a, x) * (1.0 - smoothstep(b, b + s, x)); }
      void main() {
        vec3 N = normalize(vN); vec3 V = normalize(vV);
        if (!gl_FrontFacing) N = -N;
        float ndv = clamp(abs(dot(N, V)), 0.0, 1.0);
        float fres = pow(1.0 - ndv, 3.0);
        float h = (vP.y - uY0) / (uY1 - uY0);
        float vf = smoothstep(0.03, 0.15, h) * (1.0 - smoothstep(0.9, 1.0, h));
        float hi = (band(N.x, -0.74, -0.6, 0.04) * 0.85 + band(N.x, 0.5, 0.56, 0.03) * 0.7 + band(N.x, 0.82, 0.9, 0.03) * 0.45) * vf;
        float rim = smoothstep(0.985, 1.0, h) + (1.0 - smoothstep(0.0, 0.02, h)) * 0.6;
        vec3 edge = mix(uInk, vec3(1.0), uDark);
        float a = fres * mix(0.42, 0.36, uDark) + 0.012;
        vec3 col = mix(edge, vec3(1.0), clamp(hi * 1.6 + rim, 0.0, 1.0));
        a += hi * 0.8 + rim * 0.55;
        // конденсат: лёгкая матовость и редкие круглые блики капель
        float ang = atan(vP.x, vP.z);
        float zone = step(0.06, h) * (1.0 - step(0.93, h)) * (1.0 - uBack) * uHasCond * uCond;
        float mist = tFbm(vec2(ang * 6.0, vP.y * 8.0));
        vec2 cell = vec2(ang * 0.8 * 11.0, vP.y * 11.0);
        vec2 id = floor(cell);
        vec2 c = vec2(tHash(id + 3.1), tHash(id + 7.7)) * 0.6 + 0.2;
        float rr = mix(0.07, 0.16, tHash(id + 1.3)) * step(0.72, tHash(id));
        float d = length(fract(cell) - c);
        float glint = (1.0 - smoothstep(rr * 0.35, rr, d)) * step(0.001, rr);
        a += (mist * 0.07 + glint * 0.35) * zone;
        col = mix(col, vec3(1.0), glint * zone);
        // печать: тёмная на светлом фоне, светлая на тёмном
        if (uHasPrint > 0.5) {
          float u = ang / 6.2831853 + 0.5;
          float p = texture2D(uPrint, vec2(u, h)).a;
          vec3 pc = mix(uInk, uOat, uDark);
          col = mix(col, pc, p);
          a = mix(a, 0.92, p);
        }
        a *= mix(1.0, 0.5, uBack);
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * uAlpha * uFade);
      }`,
  });
}

function cupProfile(y0, y1, rFn, wall, lip, floorH) {
  const p = [];
  const V = (x, y) => p.push(new THREE.Vector2(Math.max(0.0001, x), y));
  V(0, y0 + 0.02); V(rFn(y0) - 0.06, y0 + 0.02); V(rFn(y0) - 0.03, y0); V(rFn(y0), y0 + 0.03);
  for (let i = 1; i <= 24; i++) { const y = y0 + 0.03 + (y1 - y0 - 0.03) * (i / 24); V(rFn(y), y); }
  V(rFn(y1) + lip, y1 + 0.005); V(rFn(y1) + lip, y1 + 0.03); V(rFn(y1) - wall, y1 + 0.03);
  for (let i = 0; i <= 24; i++) { const y = y1 - (y1 - y0 - floorH) * (i / 24); V(rFn(y) - wall, y); }
  V(0, y0 + floorH);
  return new THREE.LatheGeometry(p, 96);
}

/* ---------- холодный напиток: молоко внизу, эспрессо опускается облаками сверху ---------- */
function liquidUniforms() {
  return {
    uLevel: { value: FLOOR }, uEsp: { value: 0 }, uSwirl: { value: 0 }, uTime: { value: 0 }, uAlpha: { value: 1 }, uStream: { value: 0 },
    cMilk: { value: rgb(0xf1e8da) }, cEsp: { value: rgb(0x2b1408) }, cCaramel: { value: rgb(0xa76a37) },
  };
}

function liquidMaterial(u) {
  return new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = -mv.xyz; vP = position;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform float uLevel, uEsp, uSwirl, uTime, uAlpha;
      uniform vec3 cMilk, cEsp, cCaramel;
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      ${NOISE}
      void main() {
        float ang = atan(vP.x, vP.z);
        float wave = sin(ang * 2.0 + uTime * 1.7) * 0.01 + sin(ang * 5.0 - uTime * 2.6) * 0.008 * uSwirl;
        if (vP.y > uLevel + wave) discard;
        float depth = uLevel - vP.y;
        float thick = uEsp * 0.95;
        float n = tFbm(vec2(ang * 1.4 + uTime * 0.08, vP.y * 2.6 - uTime * 0.18));
        float n2 = tFbm(vec2(ang * 3.0 - uTime * 0.05, vP.y * 5.0 + 4.0));
        // граница эспрессо рваная: облака уходят вниз
        float edge = thick + (n - 0.5) * 0.9 * uEsp + (n2 - 0.5) * 0.25;
        float e = smoothstep(edge + 0.18, edge - 0.22, depth) * step(0.001, uEsp);
        vec3 col = mix(cMilk, cCaramel, smoothstep(edge + 0.55, edge + 0.05, depth) * uEsp * 0.55);
        col = mix(col, cEsp, e);
        col = mix(col, cCaramel, smoothstep(0.6, 0.85, n2) * uSwirl * 0.4 * step(0.001, uEsp));
        vec3 N = normalize(vN); vec3 V = normalize(vV);
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float dif = 0.66 + 0.4 * max(dot(N, normalize(vec3(-0.5, 0.5, 0.7))), 0.0);
        col *= dif * mix(0.7, 1.03, ndv);
        col *= mix(0.86, 1.0, smoothstep(${FLOOR.toFixed(2)}, ${(FLOOR + 1.2).toFixed(2)}, vP.y));
        gl_FragColor = vec4(col, uAlpha);
      }`,
  });
}

function surfaceMaterial(u) {
  return new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uEsp, uTime, uAlpha, uStream;
      uniform vec3 cMilk, cEsp, cCaramel;
      varying vec2 vUv;
      ${NOISE}
      void main() {
        vec2 p = vUv - 0.5;
        float r = length(p) * 2.0;
        float n = tFbm(vUv * 6.0 + uTime * 0.05);
        vec3 col = mix(cMilk * 0.97, cMilk * 1.03, n);
        vec3 esp = mix(cEsp * 1.4, cCaramel, smoothstep(0.35, 0.75, tFbm(vUv * 9.0 - uTime * 0.04)));
        col = mix(col, esp, smoothstep(0.0, 0.35, uEsp));
        col += sin(r * 34.0 - uTime * 11.0) * exp(-r * 5.0) * uStream * 0.06;
        col *= mix(1.0, 0.8, smoothstep(0.8, 1.0, r));
        col += smoothstep(0.2, 0.0, length(p - vec2(-0.16, 0.18))) * 0.1;
        gl_FragColor = vec4(col, uAlpha);
      }`,
  });
}

/* ---------- лёд ---------- */
function roundedBox(size, radius, seg = 3) {
  const g = new THREE.BoxGeometry(1, 1, 1, seg * 2, seg * 2, seg * 2);
  const p = g.attributes.position;
  const v = new THREE.Vector3(), inner = new THREE.Vector3();
  const half = size / 2 - radius;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).multiplyScalar(size);
    inner.set(THREE.MathUtils.clamp(v.x, -half, half), THREE.MathUtils.clamp(v.y, -half, half), THREE.MathUtils.clamp(v.z, -half, half));
    v.sub(inner).normalize().multiplyScalar(radius).add(inner);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}
function iceMaterial(shared) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uDark: shared.uDark, uAlpha: shared.uAlpha, uInk: { value: rgb(INK) } },
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = -mv.xyz; vP = position;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform float uDark, uAlpha; uniform vec3 uInk;
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      ${NOISE}
      void main() {
        vec3 N = normalize(vN); vec3 V = normalize(vV);
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float fres = pow(1.0 - ndv, 2.0);
        float spec = pow(max(dot(reflect(-V, N), normalize(vec3(-0.4, 0.7, 0.6))), 0.0), 24.0);
        float frost = tFbm(vP.xy * 9.0 + vP.z * 5.0);
        vec3 col = mix(mix(uInk, vec3(0.92, 0.95, 1.0), 0.55 + 0.45 * uDark), vec3(1.0), fres * 0.6 + spec);
        float a = 0.16 + fres * 0.55 + spec * 0.9 + frost * 0.12;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * uAlpha);
      }`,
  });
}

/* ---------- струя ---------- */
function streamMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: rgb(0xf1e8da) }, uAlpha: { value: 1 } },
    vertexShader: /* glsl */`
      uniform float uTime; varying vec3 vN;
      void main() {
        vec3 p = position;
        float k = clamp(-p.y, 0.0, 1.0);
        p.x += sin(p.y * 9.0 + uTime * 13.0) * 0.012 * k;
        p.z += cos(p.y * 7.0 + uTime * 11.0) * 0.01 * k;
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uAlpha; varying vec3 vN;
      void main() {
        vec3 N = normalize(vN);
        float l = 0.72 + 0.45 * max(dot(N, normalize(vec3(-0.6, 0.3, 0.75))), 0.0);
        float hi = smoothstep(-0.55, -0.75, N.x) * 0.3;
        gl_FragColor = vec4(uColor * l + hi, uAlpha);
      }`,
  });
}

/* ---------- пар ---------- */
function steamMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uSteam: { value: 0 }, uAlpha: { value: 1 }, uDark: { value: 0 } },
    vertexShader: /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uSteam, uAlpha, uDark; varying vec2 vUv;
      ${NOISE}
      void main() {
        vec2 uv = vUv;
        float sway = sin(uv.y * 4.0 - uTime * 0.9) * 0.08 * uv.y + sin(uv.y * 9.0 + uTime * 0.7) * 0.03 * uv.y;
        float x = uv.x - 0.5 + sway;
        float width = mix(0.07, 0.32, uv.y);
        float shape = smoothstep(width, width * 0.15, abs(x));
        shape *= smoothstep(0.0, 0.2, uv.y) * (1.0 - smoothstep(0.5, 1.0, uv.y));
        float n = tFbm(vec2(x * 3.5, uv.y * 2.2 - uTime * 0.35));
        float wisps = smoothstep(0.4, 0.85, n);
        vec3 col = mix(vec3(0.62, 0.55, 0.48), vec3(1.0), uDark);
        gl_FragColor = vec4(col, shape * wisps * uSteam * mix(0.42, 0.5, uDark) * uAlpha);
      }`,
  });
}

/* ---------- зерно ---------- */
function beanGeometry() {
  const g = new THREE.SphereGeometry(1, 40, 28);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    if (v.z > 0) {
      v.z *= 0.55;
      v.z -= 0.22 * Math.exp(-((v.x + Math.sin(v.y * 2.2) * 0.06) ** 2) / 0.006) * Math.min(1, (1 - Math.abs(v.y)) * 3);
    }
    v.x *= 0.62; v.y *= 0.88; v.z *= 0.5;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x0a0705);
  const box = (w, h, intensity, pos, tint = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  box(10, 2, 3.0, [0, 7, 3]);
  box(2.4, 10, 2.2, [-8, 1, 4], 0xffeedd);
  box(2.4, 10, 1.3, [8, 0, -1], 0xe4ecff);
  box(4, 4, 2.0, [3, 2, 9], 0xffe0bd);
  box(14, 4, 0.5, [0, -6, 2], 0xd8c8b4);
  return env;
}

function blobTexture(color = '0,0,0') {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, `rgba(${color},0.75)`);
  r.addColorStop(0.62, `rgba(${color},0)`);
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/* бумага растворяется сверху вниз, край тлеет */
function dissolvable(mat, uPaper) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uPaper = uPaper;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLocal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocal = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vLocal;\nuniform float uPaper;\n${NOISE}`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        float dz = tFbm(vec2(atan(vLocal.x, vLocal.z) * 2.2, vLocal.y * 2.6)) * 0.5 + (1.0 - (vLocal.y + 1.7) / 3.6);
        float cut = (1.0 - uPaper) * 1.62;
        if (dz < cut) discard;
        float burn = (1.0 - smoothstep(cut, cut + 0.045, dz)) * step(0.0005, 1.0 - uPaper);
        float char = (1.0 - smoothstep(cut, cut + 0.12, dz)) * step(0.0005, 1.0 - uPaper);`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12, 0.07, 0.04), char);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += vec3(1.0, 0.5, 0.16) * burn * 3.0;`);
  };
  return mat;
}

/* =====================================================================
   СЦЕНА
   ===================================================================== */
export function createCup(canvas, opts = {}) {
  const mobile = !!opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.snapshot });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.6 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture;
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x3a2a1c, 0.7));
  const key = new THREE.DirectionalLight(0xffe9d2, 1.7);
  key.position.set(-3, 5, 6);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.5);
  fill.position.set(5, 1, 3);
  scene.add(key, fill);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const root = new THREE.Group();
  const tilt = new THREE.Group();
  const body = new THREE.Group();
  const spin = new THREE.Group();
  scene.add(root); root.add(tilt); tilt.add(body); body.add(spin);

  const shared = { uDark: { value: 0 }, uAlpha: { value: 1 }, uCond: { value: 0 }, uCold: { value: 1 } };
  const uPaper = { value: 1 };

  /* ---- холодный стакан ---- */
  const cold = new THREE.Group();
  spin.add(cold);
  const cGeo = cupProfile(CY0, CY1, cOut, CWALL, 0.018, 0.07);
  const cBack = new THREE.Mesh(cGeo, plasticMaterial(true, shared));
  const cFront = new THREE.Mesh(cGeo, plasticMaterial(false, shared, printTexture()));
  cBack.renderOrder = 1; cFront.renderOrder = 4;
  cold.add(cBack, cFront);

  const lu = liquidUniforms();
  const lp = [new THREE.Vector2(0.0001, FLOOR)];
  for (let i = 0; i <= 48; i++) { const y = FLOOR + (LIQ_TOP + 0.04 - FLOOR) * (i / 48); lp.push(new THREE.Vector2(cIn(y) - 0.008, y)); }
  const liquid = new THREE.Mesh(new THREE.LatheGeometry(lp, 96), liquidMaterial(lu));
  const surfGeo = new THREE.CircleGeometry(1, 96);
  surfGeo.rotateX(-Math.PI / 2);
  const surface = new THREE.Mesh(surfGeo, surfaceMaterial(lu));
  cold.add(liquid, surface);

  // лёд: кубики падают по очереди и укладываются на дно
  const iceGeo = roundedBox(0.4, 0.07, 3);
  const iceMat = iceMaterial(shared);
  const ICE = [
    [-0.17, -1.31, 0.12, 0.3], [0.21, -1.3, -0.1, 1.1], [0.0, -0.9, -0.24, 0.7], [-0.27, -0.86, 0.17, 2.0],
    [0.3, -0.82, 0.16, 1.6], [-0.06, -0.44, 0.08, 0.2], [0.33, -0.36, -0.26, 2.4], [-0.32, -0.16, -0.22, 1.2],
  ].map(([x, y, z, r], i) => {
    const m = new THREE.Mesh(iceGeo, iceMat);
    m.renderOrder = 2;
    m.userData = { x, y, z, r, i };
    cold.add(m);
    return m;
  });

  // купол-крышка с отверстием под трубочку
  const dp = [];
  const dV = (x, y) => dp.push(new THREE.Vector2(x, y));
  dV(CR1 - 0.03, CY1 - 0.04); dV(CR1 + 0.035, CY1 - 0.01); dV(CR1 + 0.04, CY1 + 0.04); dV(CR1 + 0.005, CY1 + 0.07);
  for (let i = 0; i <= 20; i++) { const a = (i / 20) * (Math.PI / 2 - 0.25); dV(0.12 + (CR1 - 0.12) * Math.cos(a), CY1 + 0.07 + 0.62 * Math.sin(a)); }
  dV(0.1, CY1 + 0.62); dV(0.1, CY1 + 0.58);
  const domeGeo = new THREE.LatheGeometry(dp, 96);
  const dome = new THREE.Group();
  const dBack = new THREE.Mesh(domeGeo, plasticMaterial(true, shared));
  const dFront = new THREE.Mesh(domeGeo, plasticMaterial(false, shared));
  dBack.renderOrder = 5; dFront.renderOrder = 6;
  for (const m of [dBack, dFront]) { m.material.uniforms.uY0.value = CY1 - 0.6; m.material.uniforms.uY1.value = CY1 + 0.7; m.material.uniforms.uHasCond.value = 0; }
  dome.add(dBack, dFront);
  cold.add(dome);

  // трубочка
  const strawMat = new THREE.MeshPhysicalMaterial({ color: INK, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.3, 24, 1, false), strawMat);
  const strawPivot = new THREE.Group();
  strawPivot.rotation.z = -0.1;
  strawPivot.add(straw);
  cold.add(strawPivot);

  /* ---- бумажный стакан ---- */
  const paper = new THREE.Group();
  spin.add(paper);
  const paperProfile = [new THREE.Vector2(0.0001, PY0 + 0.06), new THREE.Vector2(PR0 - 0.04, PY0 + 0.06), new THREE.Vector2(PR0 - 0.02, PY0)];
  for (let i = 0; i <= 30; i++) { const y = PY0 + (PY1 - PY0) * (i / 30); paperProfile.push(new THREE.Vector2(pOut(y), y)); }
  const cupMat = dissolvable(new THREE.MeshPhysicalMaterial({ color: 0xf5f1ea, roughness: 0.62, sheen: 0.4, sheenColor: 0xffffff, side: THREE.DoubleSide }), uPaper);
  const paperBody = new THREE.Mesh(new THREE.LatheGeometry(paperProfile, 96), cupMat);
  const rimRing = new THREE.Mesh(new THREE.TorusGeometry(PR1 + 0.005, 0.03, 16, 96), cupMat);
  rimRing.rotation.x = Math.PI / 2;
  rimRing.position.y = PY1;
  // рукав
  const sp = [];
  const SY0 = -0.62, SY1 = 0.5;
  for (let i = 0; i <= 8; i++) { const y = SY0 + (SY1 - SY0) * (i / 8); sp.push(new THREE.Vector2(pOut(y) + 0.016, y)); }
  const sleeveMat = dissolvable(new THREE.MeshPhysicalMaterial({ map: sleeveTexture(), roughness: 0.85, side: THREE.DoubleSide }), uPaper);
  const sleeve = new THREE.Mesh(new THREE.LatheGeometry(sp, 96, Math.PI), sleeveMat);
  // чёрная крышка
  const lp2 = [];
  const L = (x, y) => lp2.push(new THREE.Vector2(x, y));
  L(PR1 - 0.03, PY1 - 0.06); L(PR1 + 0.045, PY1 - 0.04); L(PR1 + 0.055, PY1 + 0.04); L(PR1 + 0.04, PY1 + 0.1);
  L(PR1 - 0.02, PY1 + 0.13); L(PR1 - 0.06, PY1 + 0.2); L(PR1 - 0.12, PY1 + 0.22); L(PR1 - 0.17, PY1 + 0.17);
  L(PR1 - 0.25, PY1 + 0.15); L(0.0001, PY1 + 0.15);
  const lidMat = dissolvable(new THREE.MeshPhysicalMaterial({ color: 0x18120e, roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.35, side: THREE.DoubleSide }), uPaper);
  const lid = new THREE.Mesh(new THREE.LatheGeometry(lp2, 96), lidMat);
  // отверстие для питья спереди
  const sipMat = dissolvable(new THREE.MeshStandardMaterial({ color: 0x050302, roughness: 0.9 }), uPaper);
  const sip = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.16, 6, 12), sipMat);
  sip.rotation.z = Math.PI / 2;
  sip.position.set(0, PY1 + 0.205, PR1 - 0.12);
  sip.scale.set(1, 1, 0.5);
  paper.add(paperBody, rimRing, sleeve, lid, sip);

  /* ---- струя, пар, тень, зёрна ---- */
  const streamGeo = new THREE.CylinderGeometry(0.07, 0.05, 1, 20, 24, true);
  streamGeo.translate(0, -0.5, 0);
  const sMat = streamMaterial();
  const stream = new THREE.Mesh(streamGeo, sMat);
  stream.renderOrder = 3;
  tilt.add(stream);

  const steamMat = steamMaterial();
  const steam = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.2), steamMat);
  steam.renderOrder = 7;
  tilt.add(steam);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, toneMapped: false }));
  const caustic = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTexture('176,110,56'), transparent: true, depthWrite: false, toneMapped: false }));
  scene.add(shadow, caustic);

  const beanMat = new THREE.MeshPhysicalMaterial({ color: 0x3a2214, roughness: 0.38, clearcoat: 0.4, clearcoatRoughness: 0.5, envMapIntensity: 0.9 });
  const beanGeo = beanGeometry();
  const BEANS = (mobile ? [
    [-1.3, 1.9, 0.4, 0.17], [1.25, 1.55, -0.6, 0.15], [-1.15, -1.6, 0.8, 0.16], [1.3, -1.35, 0.2, 0.18], [0.1, 2.5, -1.4, 0.13],
  ] : [
    [-2.0, 0.5, 0.6, 0.2], [2.7, 0.75, -0.4, 0.17], [-0.95, -1.95, 1.2, 0.2], [2.2, -0.95, 0.9, 0.22],
    [0.6, 2.05, -1.8, 0.15], [-3.5, -0.25, -1.6, 0.17], [3.7, 0.35, -2.2, 0.16], [1.3, 2.35, -1.2, 0.12],
  ]).map(([x, y, z, s], i) => {
    const m = new THREE.Mesh(beanGeo, beanMat);
    m.userData = { x, y, z, s, rx: i * 1.7, ry: i * 2.3, sp: 0.25 + (i % 3) * 0.12 };
    scene.add(m);
    return m;
  });

  /* ---- состояние ---- */
  const state = {
    x: 0, y: 0, z: 0, rx: 0, rz: 0, ry: 0, scale: 1,
    paper: 1, ice: 0, level: 0, esp: 0, lid: 0, straw: 0, cond: 0,
    steam: 0, beans: 0, dark: 0, shadow: 1, idle: 0, alpha: 1,
  };
  const cur = { ...state };
  const SLOW = new Set(['level', 'esp']);
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let idleAngle = 0, pour = 0, pourEsp = 0;
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
  const easeBounce = (t) => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  };
  const easeBack = (t) => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  const tmp = new THREE.Vector3();
  function apply(t, dt) {
    // струя течёт, пока уровень догоняет цель
    const dLevel = state.level - cur.level, dEsp = state.esp - cur.esp;
    pour += (Math.min(1, Math.max(dLevel, 0) * 30) - pour) * (1 - Math.pow(0.02, dt));
    if (dEsp > 0.004) pourEsp = 1; else if (dLevel > 0.004 && cur.esp < 0.02) pourEsp = 0;

    root.position.set(cur.x, cur.y + Math.sin(t * 0.8) * 0.04, cur.z);
    root.scale.setScalar(cur.scale);
    tilt.rotation.set(-mouse.y * 0.16, mouse.x * 0.3, 0);
    body.rotation.set(cur.rx, 0, cur.rz);
    spin.rotation.y = cur.ry + idleAngle;

    // смена стаканов
    uPaper.value = cur.paper;
    paper.visible = cur.paper > 0.002;
    cold.visible = cur.paper < 0.998;
    shared.uCold.value = clamp01((1 - cur.paper) * 3);
    shared.uDark.value = cur.dark;
    shared.uAlpha.value = cur.alpha;
    shared.uCond.value = cur.cond;

    // напиток
    const ly = levelToY(cur.level);
    const has = cur.level > 0.004 && cold.visible;
    liquid.visible = surface.visible = has;
    lu.uLevel.value = ly;
    lu.uEsp.value = cur.esp;
    lu.uSwirl.value = pour;
    lu.uStream.value = pour;
    lu.uTime.value = t;
    lu.uAlpha.value = cur.alpha;
    surface.position.y = ly;
    surface.scale.setScalar(cIn(ly) - 0.008);

    // лёд
    for (const m of ICE) {
      const u = m.userData;
      const k = clamp01((cur.ice - (u.i / ICE.length) * 0.72) / 0.28);
      m.visible = k > 0.001 && cold.visible;
      const fall = 1 - easeBounce(k);
      m.position.set(u.x, u.y + fall * 4.6, u.z);
      m.rotation.set(u.r + fall * 3.2, u.r * 1.7 + fall * 2.1, u.r * 0.6);
    }

    // крышка и трубочка садятся сверху
    const lk = clamp01(cur.lid);
    dome.visible = lk > 0.002 && cold.visible;
    dome.position.y = (1 - easeBack(lk)) * 2.6;
    dome.rotation.x = (1 - lk) * 0.35;
    const sk = clamp01(cur.straw);
    strawPivot.visible = sk > 0.002 && cold.visible;
    strawPivot.position.set(0.02, 0.62 + (1 - easeBack(sk)) * 4.2, -0.02);

    // струя: от верха кадра до центра поверхности
    surface.getWorldPosition(tmp);
    tilt.worldToLocal(tmp);
    const top = (viewSize().h / 2 + 0.6 - cur.y) / cur.scale + 0.4;
    stream.position.set(tmp.x, top, tmp.z);
    stream.scale.set(pour, Math.max(0.01, top - tmp.y), pour);
    stream.visible = pour > 0.03 && cold.visible && cur.alpha > 0.05;
    sMat.uniforms.uTime.value = t;
    sMat.uniforms.uColor.value.copy(pourEsp ? rgb(0x2b1408) : rgb(0xf1e8da));
    sMat.uniforms.uAlpha.value = cur.alpha;

    // пар идёт только от горячего
    steam.position.set(0, PY1 + 1.45, 0.25);
    steam.rotation.set(-tilt.rotation.x, -tilt.rotation.y, 0);
    steamMat.uniforms.uTime.value = t;
    steamMat.uniforms.uSteam.value = cur.steam * clamp01(cur.paper * 1.5 - 0.5);
    steamMat.uniforms.uDark.value = cur.dark;
    steamMat.uniforms.uAlpha.value = cur.alpha;
    steam.visible = steamMat.uniforms.uSteam.value > 0.01;

    for (const m of [cupMat, sleeveMat, lidMat, strawMat, sipMat]) { m.transparent = cur.alpha < 0.999; m.opacity = cur.alpha; }

    // тень
    const s = cur.scale;
    const bottom = cur.y - 1.62 * s * Math.cos(cur.rx) - 0.02;
    shadow.position.set(cur.x + 0.12 * s, bottom, cur.z - 0.6);
    shadow.scale.set(s * 2.9, s * 0.42, 1);
    shadow.material.opacity = cur.shadow * (0.55 + 0.35 * cur.dark) * cur.alpha;
    caustic.position.set(cur.x + 0.55 * s, bottom - 0.02 * s, cur.z - 0.55);
    caustic.scale.set(s * 1.6, s * 0.26, 1);
    caustic.material.opacity = cur.shadow * Math.min(1, cur.level * 1.5) * (1 - cur.paper) * (0.5 - 0.15 * cur.dark) * cur.alpha;

    // зёрна
    const b = cur.beans;
    for (const m of BEANS) {
      const u = m.userData;
      const away = 1 - b;
      m.visible = b > 0.01;
      m.position.set(
        u.x * (1 + away * 0.8) + mouse.x * 0.25 * (1 + u.z * 0.3),
        u.y + away * (2.6 + u.y * 0.4) + Math.sin(t * u.sp * 2 + u.rx) * 0.08 + mouse.y * 0.15,
        u.z,
      );
      m.rotation.set(u.rx + t * u.sp, u.ry + t * u.sp * 0.7, u.rx * 0.5);
      m.scale.setScalar(u.s * Math.max(0.001, b));
    }
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    if (!visible) return;
    const k = 1 - Math.pow(0.001, dt);
    const ks = 1 - Math.pow(0.04, dt);
    for (const key of Object.keys(state)) cur[key] += (state[key] - cur[key]) * (SLOW.has(key) ? ks : k);
    idleAngle += dt * 0.35 * cur.idle;
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
    viewSize,
    snapshot: () => { apply(performance.now() / 1000, 0.016); renderer.render(scene, camera); return canvas.toDataURL('image/png'); },
    destroy: () => { running = false; renderer.dispose(); },
  };
}
