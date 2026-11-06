(function () {
  const S = window.STAGE;
  const tabs = S.tabs;
  const byId = Object.fromEntries(tabs.map((t) => [t.id, t]));
  const $ = (s) => document.querySelector(s);
  const pad = (n) => String(n).padStart(2, '0');
  const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

  function mediaOf(t) {
    const list = typeof t.media === 'number' ? Array.from({ length: t.media }, (_, i) => `${pad(i + 1)}.jpg`) : (t.media || []);
    return list.map((f, i) => {
      const file = typeof f === 'string' ? f : f.file;
      return { tab: t, n: i + 1, file, src: srcOf(t, file), video: VIDEO.test(file) };
    });
  }

  const srcOf = (t, file) => (/^(https?:)?\//.test(file) ? file : `photos/${t.id}/${file}`);

  // videos in the list play (muted) while they're on screen
  const inView = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
    for (const e of es) { const v = e.target; if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }
  }, { threshold: 0.35 }) : null;

  /* ---------- entries: each photo/video after main, with room for text ---------- */
  function entry(m, set) {
    const a = document.createElement('article');
    a.className = 'entry';
    const f = frame(m, set, true);
    const txt = document.createElement('div');
    txt.className = 'entry-text';
    const words = m.tab.text && m.tab.text[m.file];
    if (words) {
      // a first line of coordinates (e.g. "27.42° N, 33.66° E · June 2025") is set apart above the words
      const m = words.match(/^(~?\d+(?:\.\d+)?° [NS], \d+(?:\.\d+)?° [EW][^\n]*)\n+/);
      if (m) txt.append(Object.assign(document.createElement('span'), { className: 'coords', textContent: m[1] }));
      txt.append(document.createTextNode(m ? words.slice(m[0].length) : words));
    }
    else for (let i = 0; i < 3; i++) txt.append(Object.assign(document.createElement('span'), { className: 'ph' }));
    a.append(f, txt);
    return a;
  }

  /* ---------- gallery frames ---------- */
  function frame(m, set, natural) {
    const f = document.createElement('figure');
    f.className = 'frame';
    const slot = document.createElement('span');
    slot.className = 'slot';
    slot.textContent = m.src;
    f.append(slot);
    const ready = () => { f.classList.add('loaded'); m.ok = true; };
    let media;
    if (m.video) {
      media = document.createElement('video');
      media.muted = true; media.loop = true; media.playsInline = true; media.preload = 'metadata';
      media.addEventListener('loadeddata', ready, { once: true });
      if (natural && inView) inView.observe(media);
      else {
        f.addEventListener('pointerenter', () => media.play().catch(() => {}));
        f.addEventListener('pointerleave', () => media.pause());
      }
      f.classList.add('is-video');
    } else {
      media = new Image();
      media.alt = `${m.tab.name} ${m.n}`;
      media.loading = 'lazy'; media.decoding = 'async';
      media.addEventListener('load', ready, { once: true });
    }
    media.addEventListener('error', () => media.remove(), { once: true });
    media.src = m.src;
    f.append(media);
    f.tabIndex = 0;
    const open = () => { if (m.ok) openLightbox(m, set); };
    f.addEventListener('click', open);
    f.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
    return f;
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox');
  let lbSet = [], lbIdx = 0;
  function openLightbox(m, set) {
    lbSet = set.filter((x) => x.ok);
    lbIdx = Math.max(0, lbSet.indexOf(m));
    showLightbox();
    lb.hidden = false;
    $('#lb-close').focus();
  }
  function showLightbox() {
    const m = lbSet[lbIdx], box = $('#lb-media');
    box.innerHTML = '';
    if (m.video) {
      const v = document.createElement('video');
      v.src = m.src; v.controls = true; v.autoplay = true; v.loop = true; v.playsInline = true;
      box.append(v);
    } else {
      const i = new Image(); i.src = m.src; i.alt = `${m.tab.name} ${m.n}`; box.append(i);
    }
  }
  function step(d) { if (lbSet.length < 2) return; lbIdx = (lbIdx + d + lbSet.length) % lbSet.length; showLightbox(); }
  const closeLb = () => { lb.hidden = true; $('#lb-media').innerHTML = ''; };
  $('#lb-close').addEventListener('click', closeLb);
  $('#lb-prev').addEventListener('click', () => step(-1));
  $('#lb-next').addEventListener('click', () => step(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });

  /* ---------- dropdown menu ---------- */
  const menuBtn = $('#menu-btn'), menu = $('#menu');
  function buildMenu() {
    const add = (id, label) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${id}`; a.textContent = label; a.dataset.id = id;
      li.append(a); menu.append(li);
    };
    add('home', 'All');
    let lastGroup = null;
    for (const t of tabs) {
      if (lastGroup && t.group !== lastGroup) menu.append(Object.assign(document.createElement('li'), { className: 'sep', role: 'separator' }));
      lastGroup = t.group;
      add(t.id, t.name);
    }
  }
  const setMenu = (open) => { menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); };
  menuBtn.addEventListener('click', (e) => { e.stopPropagation(); setMenu(menu.hidden); });
  menu.addEventListener('click', () => setMenu(false));
  document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('.menu-wrap')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { setMenu(false); if (!lb.hidden) closeLb(); }
    if (!lb.hidden && e.key === 'ArrowLeft') step(-1);
    if (!lb.hidden && e.key === 'ArrowRight') step(1);
  });

  /* ---------- views ---------- */
  // the name and menu button turn white while a full-screen video/photo is behind them
  const over = { hero: false, main: false };
  let heroUpdate = () => {};
  const paintHeader = () => document.body.classList.toggle('over-video', over.hero || over.main);

  function buildHero() {
    const hero = $('#hero'), v = $('#hero-video');
    const list = S.heroes || (S.hero ? [{ video: S.hero, poster: S.heroPoster }] : []);
    if (!list.length) { hero.hidden = true; return; }
    // everyone sees the same intro video, and it changes every heroHours hours
    const pick = list[Math.floor(Date.now() / ((S.heroHours || 8) * 3600e3)) % list.length];
    v.addEventListener('loadeddata', () => { hero.classList.add('loaded'); v.play().catch(() => {}); }, { once: true });
    if (pick.poster) v.poster = pick.poster;
    v.src = pick.video;
    // the video fades out (and drifts back slightly) as you scroll, revealing the objects underneath
    let ticking = false;
    const update = () => {
      ticking = false;
      const k = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.75)));
      hero.style.opacity = String(1 - k);
      hero.style.setProperty('--zoom', String(1 + k * 0.08));
      const gone = k >= 1;
      hero.classList.toggle('gone', gone);
      over.hero = !hero.hidden && !$('#view-home').hidden && k < 0.55; paintHeader();
      if (gone) v.pause(); else if (v.paused && hero.classList.contains('loaded')) v.play().catch(() => {});
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('hashchange', () => requestAnimationFrame(update));
    heroUpdate = update;
    update();
  }

  function buildHome() {
    const caption = $('#hover-name');
    window.Objects.wheel($('#ring'), tabs, {
      onPick: (t) => { location.hash = t.id; },
      onHover: (t) => { caption.textContent = t ? t.name : ' '; },
    });
  }

  /* main: fades in over the page, holds while you scroll, then slides up into the list */
  const block = $('#main-block'), layer = $('#main-layer');
  let mainMedia = null;
  function fitMain() {
    if (!mainMedia) return;
    const w = mainMedia.videoWidth || mainMedia.naturalWidth, h = mainMedia.videoHeight || mainMedia.naturalHeight;
    if (!w || !h) return;
    const r = (w / h) / (window.innerWidth / window.innerHeight);
    layer.classList.toggle('fit', r < 0.62 || r > 1.6); // very different shape from the screen: show it whole
  }
  function setMain(t) {
    layer.innerHTML = ''; mainMedia = null;
    block.hidden = !t || !t.main;
    if (block.hidden) { updateMain(); return; }
    const src = srcOf(t, t.main);
    if (VIDEO.test(t.main)) {
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = false; v.preload = 'metadata';
      v.addEventListener('loadedmetadata', fitMain);
      v.src = src; mainMedia = v;
    } else {
      const i = new Image(); i.alt = ''; i.decoding = 'async';
      i.addEventListener('load', fitMain);
      i.src = src; mainMedia = i;
    }
    layer.append(mainMedia);
    updateMain();
  }
  function updateMain() {
    if (block.hidden || $('#view-tab').hidden) { layer.classList.remove('on'); over.main = false; paintHeader(); if (mainMedia && mainMedia.pause) mainMedia.pause(); return; }
    const r = block.getBoundingClientRect(), vh = window.innerHeight;
    // fade starts once you begin scrolling (or once the block nears the screen) and is complete when it reaches the top
    const top = r.top + window.scrollY, s0 = Math.max(0, top - vh) + 24;
    const op = Math.min(1, Math.max(0, (window.scrollY - s0) / Math.max(1, top - s0)));
    const ty = Math.min(0, r.bottom - vh);
    const on = op > 0 && r.bottom > 0;
    layer.classList.toggle('on', on);
    layer.style.opacity = String(op);
    layer.style.transform = `translate3d(0, ${ty}px, 0)`;
    over.main = op > 0.55 && r.bottom > 70; paintHeader();
    if (mainMedia && mainMedia.play) { if (on && mainMedia.paused) mainMedia.play().catch(() => {}); else if (!on && !mainMedia.paused) mainMedia.pause(); }
  }
  let mTick = false;
  window.addEventListener('scroll', () => { if (!mTick) { mTick = true; requestAnimationFrame(() => { mTick = false; updateMain(); }); } }, { passive: true });
  window.addEventListener('resize', () => { fitMain(); updateMain(); });

  let unmount = null;
  function showTab(t) {
    $('#tab-name').textContent = t.name;
    const media = mediaOf(t), gal = $('#gallery');
    gal.innerHTML = '';
    media.forEach((m) => gal.append(entry(m, media)));
    setMain(t);
    if (unmount) unmount();
    $('#tab-stage').classList.toggle('duo', !!t.actor);
    unmount = window.Objects.single($('#tab-stage'), t.object, t.actor);
    document.title = `${t.name} · ${S.title}`;
  }

  function route() {
    const t = byId[location.hash.slice(1)];
    $('#view-home').hidden = !!t;
    $('#view-tab').hidden = !t;
    if (t) showTab(t);
    else { if (unmount) { unmount(); unmount = null; } document.title = S.title; setMain(null); }
    menu.querySelectorAll('a').forEach((a) => a.toggleAttribute('aria-current', a.dataset.id === (t ? t.id : 'home')));
    window.scrollTo(0, 0);
    heroUpdate();
    updateMain();
  }

  // photos/manifest.json (written on deploy) lists what's actually uploaded; it wins over config.js
  function applyManifest(man) {
    for (const t of tabs) {
      const m = man[t.id];
      if (Array.isArray(m)) { if (m.length) t.media = m; continue; }
      if (!m) continue;
      if (m.main) t.main = m.main;
      if (m.media && (m.media.length || m.main)) t.media = m.media;
    }
  }

  window.Objects.init();
  buildMenu();
  buildHero();
  buildHome();
  window.addEventListener('hashchange', route);
  fetch('photos/manifest.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : null))
    .then((man) => { if (man) applyManifest(man); })
    .catch(() => {})
    .finally(route);
})();
