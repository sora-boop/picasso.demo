/* Династия — interactions
   Motion: entrances, scroll signature, press feedback, sticky plaque
   anime.js: button hover layers (fill / label / arrow), phone ring */
(function () {
  'use strict';

  var M = window.Motion;
  var A = window.anime;
  var root = document.documentElement;

  // FIX: if a library failed to load, content hidden by .js .rise stayed invisible.
  if (!M || !A) { root.classList.remove('js'); root.classList.add('no-js'); }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = [0.22, 1, 0.36, 1];
  var aEase = A ? A.cubicBezier(0.22, 1, 0.36, 1) : null;

  /* ---------- 0. Scheme B layout ----------
     Wide screens: word 2 follows word 1 diagonally; the photo sits on the
     horizontal seam and overlaps ~30% of its width into each word.
     Narrow screens: the photo sits in the vertical gap and overlaps ~30%
     of each word's height. */
  var heroEl = document.querySelector('.hero');
  var bar = document.querySelector('.bar');
  var foot = document.querySelector('.hero__foot');
  var w1 = document.querySelector('.js-word1');
  var w2 = document.querySelector('.js-word2');
  var obj = document.querySelector('.js-object');

  // Places both words and the photo; k scales the photo on narrow screens.
  // Returns the lowest pixel the composition reaches.
  function placeHero(k) {
    var H = heroEl.clientWidth;
    var V = heroEl.clientHeight;
    var pad = parseFloat(getComputedStyle(bar).paddingLeft) || 20;
    var top0 = bar.offsetTop + bar.offsetHeight + Math.min(V * 0.03, 24);
    w1.style.top = top0 + 'px';
    w2.style.right = 'auto';
    var x1 = w1.offsetLeft, y1 = top0, r1 = x1 + w1.offsetWidth, h1 = w1.offsetHeight;
    var h2 = w2.offsetHeight;

    if (H < 760) {
      var W = Math.round(H * 0.42 * k);
      var photoH = Math.round(V * 0.25 * k);
      var top = y1 + h1 * 0.7;
      obj.style.width = W + 'px';
      obj.style.height = photoH + 'px';
      obj.style.left = Math.round(H * 0.3) + 'px';
      obj.style.top = top + 'px';
      var t2 = top + photoH - h2 * 0.3;
      w2.style.left = (H - pad - w2.offsetWidth) + 'px';
      w2.style.top = t2 + 'px';
      return Math.max(t2 + h2, top + photoH);
    }

    obj.style.width = '';
    var Ww = obj.offsetWidth;
    var left2 = r1 + Ww * 0.4;
    if (left2 + w2.offsetWidth > H - pad) left2 = H - pad - w2.offsetWidth;
    var top2 = y1 + h1 * 0.92;
    w2.style.left = left2 + 'px';
    w2.style.top = top2 + 'px';

    var seam = (r1 + left2) / 2;
    var topW = y1 + h1 * 0.3;
    var bottom = top2 + h2 * 0.72;
    var objH = Math.max(bottom - topW, Ww * 1.2);
    obj.style.left = (seam - Ww / 2) + 'px';
    obj.style.top = topW + 'px';
    obj.style.height = objH + 'px';
    return Math.max(top2 + h2, topW + objH);
  }

  // FIX: on short or small screens the words ran into the CTA block
  // (phone landscape, 360x640). Shrink the words until they fit above it.
  function layoutHero() {
    w1.style.fontSize = w2.style.fontSize = '';
    var size = parseFloat(getComputedStyle(w1).fontSize);
    var k = 1;
    for (var i = 0; i < 6; i++) {
      var limit = foot.offsetTop - 16;
      var lowest = placeHero(k);
      if (lowest <= limit) break;
      var top0 = w1.offsetTop;
      var ratio = Math.max(0.5, (limit - top0) / (lowest - top0)) * 0.98;
      size *= ratio; k *= ratio;
      w1.style.fontSize = w2.style.fontSize = size + 'px';
    }
  }
  layoutHero();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutHero);
  window.addEventListener('resize', layoutHero);

  /* ---------- Call sheet ----------
     FIX: «Позвонить» did nothing on desktop (no phone app for tel:) and
     inside sandboxed previews (tel: navigation is blocked). Now a phone
     outside a frame dials directly; everywhere else a sheet opens with the
     number, a tel: link, «Скопировать номер» and WhatsApp. */
  var sheet = document.querySelector('.call-sheet');
  var sheetPanel = sheet.querySelector('.call-sheet__panel');
  var copyBtn = sheet.querySelector('.js-copy');
  var copyLabel = copyBtn.querySelector('.btn__label');
  var lastFocus = null;
  var inFrame = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var touchPhone = window.matchMedia('(pointer: coarse)').matches;
  var NUMBER = '+7 707 784-79-51';

  function openSheet() {
    lastFocus = document.activeElement;
    sheet.hidden = false;
    sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    copyLabel.textContent = 'Скопировать номер';
    if (M && !reduce) {
      M.animate(sheet, { opacity: [0, 1] }, { duration: 0.32, ease: EASE });
      M.animate(sheetPanel, { y: [40, 0], filter: ['blur(10px)', 'blur(0px)'] }, { duration: 0.62, ease: EASE });
    }
    sheet.querySelector('.call-sheet__close').focus();
  }
  function closeSheet() {
    function done() {
      sheet.hidden = true;
      sheet.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    if (M && !reduce) {
      M.animate(sheetPanel, { y: [0, 30] }, { duration: 0.32, ease: EASE });
      M.animate(sheet, { opacity: [1, 0] }, { duration: 0.32, ease: EASE }).then(done);
    } else { done(); }
  }

  document.querySelectorAll('.js-call').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (touchPhone && !inFrame) return; // real phone: let tel: dial
      e.preventDefault();
      openSheet();
    });
  });
  sheet.querySelector('.call-sheet__close').addEventListener('click', closeSheet);
  sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });

  copyBtn.addEventListener('click', function () {
    function ok() { copyLabel.textContent = 'Номер скопирован'; }
    function fail() { copyLabel.textContent = 'Выделите номер выше'; }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(NUMBER).then(ok, fail);
      } else { fail(); }
    } catch (err) { fail(); }
    if (A && !reduce) A.animate(copyBtn, { scale: [1, 1.04, 1], duration: 520, ease: aEase });
  });

  if (!M || !A) return;

  /* ---------- 1. Hero entrance ladder (Motion) ---------- */
  var heroItems = document.querySelectorAll('.hero .rise');
  if (reduce) {
    heroItems.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; el.style.filter = 'none'; });
  } else {
    heroItems.forEach(function (el) {
      var d = (parseInt(el.dataset.d, 10) || 0) / 1000;
      M.animate(el,
        { opacity: [0, 1], y: [28, 0], filter: ['blur(14px)', 'blur(0px)'] },
        { duration: 0.9, delay: d, ease: EASE });
    });
  }

  /* ---------- 2. Section reveals, staggered (Motion) ---------- */
  document.querySelectorAll('section:not(.hero)').forEach(function (section) {
    var items = section.querySelectorAll('.rise-in');
    if (!items.length) return;
    if (reduce) {
      items.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; el.style.filter = 'none'; });
      return;
    }
    M.inView(section, function () {
      M.animate(items,
        { opacity: [0, 1], y: [28, 0], filter: ['blur(14px)', 'blur(0px)'] },
        { duration: 0.9, delay: M.stagger(0.06), ease: EASE });
    }, { amount: 0.15 });
  });

  /* ---------- 3. Signature: words drift apart on scroll (Motion) ---------- */
  if (!reduce) {
    var hero = document.querySelector('.hero');
    M.scroll(M.animate('.js-word1', { x: ['0vw', '-14vw'], y: ['0svh', '-6svh'] }, { ease: EASE }),
      { target: hero, offset: ['start start', 'end start'] });
    M.scroll(M.animate('.js-word2', { x: ['0vw', '14vw'], y: ['0svh', '8svh'] }, { ease: EASE }),
      { target: hero, offset: ['start start', 'end start'] });
    M.scroll(M.animate('.js-object', { y: ['0svh', '-10svh'], scale: [1, 1.06] }, { ease: EASE }),
      { target: hero, offset: ['start start', 'end start'] });
  }

  /* ---------- 4. Button hover layers (anime.js) ---------- */
  document.querySelectorAll('.js-btn').forEach(function (btn) {
    var fill = btn.querySelector('.btn__fill');
    var label = btn.querySelector('.btn__label');
    var arrow = btn.querySelector('.btn__arrow');
    var isLine = btn.classList.contains('btn--line');
    var base = getComputedStyle(btn).color;
    var ink = '#0E0D0C';

    A.utils.set(fill, { scaleX: 0 });

    function enter() {
      fill.style.transformOrigin = 'left center';
      A.animate(fill, { scaleX: 1, duration: reduce ? 0 : 500, ease: aEase });
      if (isLine) A.animate(label, { color: ink, duration: reduce ? 0 : 320, ease: aEase });
      if (arrow) {
        if (isLine) A.animate(arrow, { color: ink, duration: reduce ? 0 : 320, ease: aEase });
        A.animate(arrow, { translateX: 6, duration: reduce ? 0 : 520, ease: aEase });
      }
    }
    function leave() {
      fill.style.transformOrigin = 'right center';
      A.animate(fill, { scaleX: 0, duration: reduce ? 0 : 500, ease: aEase });
      if (isLine) A.animate(label, { color: base, duration: reduce ? 0 : 320, ease: aEase });
      if (arrow) {
        if (isLine) A.animate(arrow, { color: base, duration: reduce ? 0 : 320, ease: aEase });
        A.animate(arrow, { translateX: 0, duration: reduce ? 0 : 520, ease: aEase });
      }
    }

    btn.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') enter(); });
    btn.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') leave(); });
    // FIX: on touch screens a tap focused the button and the fill stayed on.
    // Keyboard focus only.
    btn.addEventListener('focus', function () { if (btn.matches(':focus-visible')) enter(); });
    btn.addEventListener('blur', function () { if (!btn.matches(':hover')) leave(); });
  });

  /* ---------- 5. Press feedback, springy (Motion) ---------- */
  if (!reduce) {
    M.press('.btn, .pill, .plaque__phone', function (el) {
      M.animate(el, { scale: 0.95 }, { type: 'spring', stiffness: 700, damping: 30 });
      return function () {
        M.animate(el, { scale: 1 }, { type: 'spring', stiffness: 500, damping: 18 });
      };
    });
  }

  /* ---------- 6. Phone icon rings every few seconds (anime.js) ---------- */
  if (!reduce) {
    document.querySelectorAll('.js-ring').forEach(function (icon, i) {
      A.animate(icon, {
        rotate: [0, -16, 13, -9, 6, 0],
        duration: 900,
        delay: 2200 + i * 400,
        loop: true,
        loopDelay: 3600,
        ease: 'inOutSine'
      });
    });
  }

  /* ---------- 7. Sticky booking plaque (Motion) ---------- */
  var plaque = document.querySelector('.plaque');
  var heroFoot = document.querySelector('.hero__foot');
  var contacts = document.querySelector('.contacts');
  var heroGone = false, contactsIn = false, shown = false;

  function syncPlaque() {
    var want = heroGone && !contactsIn;
    if (want === shown) return;
    shown = want;
    // FIX: the hidden plaque was still reachable with Tab.
    plaque.inert = !want;
    M.animate(plaque, { y: want ? '0%' : '160%' },
      reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 26 });
  }
  M.inView(heroFoot, function () {
    heroGone = false; syncPlaque();
    return function () { heroGone = true; syncPlaque(); };
  });
  M.inView(contacts, function () {
    contactsIn = true; syncPlaque();
    return function () { contactsIn = false; syncPlaque(); };
  }, { amount: 0.25 });
})();
