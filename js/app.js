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
      return { tab: t, n: i + 1, src: /^(https?:)?\//.test(file) ? file : `photos/${t.id}/${file}`, video: VIDEO.test(file) };
    });
  }

  /* ---------- gallery frames ---------- */
  function frame(m, set) {
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
      f.addEventListener('pointerenter', () => media.play().catch(() => {}));
      f.addEventListener('pointerleave', () => media.pause());
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
  function buildHero() {
    const hero = $('#hero'), v = $('#hero-video');
    if (!S.hero) { hero.hidden = true; return; }
    v.addEventListener('loadeddata', () => { hero.classList.add('loaded'); v.play().catch(() => {}); }, { once: true });
    if (S.heroPoster) v.poster = S.heroPoster;
    v.src = S.hero;
    // the video fades out (and drifts back slightly) as you scroll, revealing the objects underneath
    let ticking = false;
    const update = () => {
      ticking = false;
      const k = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.75)));
      hero.style.opacity = String(1 - k);
      hero.style.setProperty('--zoom', String(1 + k * 0.08));
      const gone = k >= 1;
      hero.classList.toggle('gone', gone);
      document.body.classList.toggle('over-video', !hero.hidden && !$('#view-home').hidden && k < 0.55);
      if (gone) v.pause(); else if (v.paused && hero.classList.contains('loaded')) v.play().catch(() => {});
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('hashchange', () => requestAnimationFrame(update));
    update();
  }

  function buildHome() {
    const caption = $('#hover-name');
    window.Objects.wheel($('#ring'), tabs, {
      onPick: (t) => { location.hash = t.id; },
      onHover: (t) => { caption.textContent = t ? t.name : ' '; },
    });
  }

  let unmount = null;
  function showTab(t) {
    $('#tab-name').textContent = t.name;
    const media = mediaOf(t), gal = $('#gallery');
    gal.innerHTML = '';
    media.forEach((m) => gal.append(frame(m, media)));
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
    else { if (unmount) { unmount(); unmount = null; } document.title = S.title; }
    menu.querySelectorAll('a').forEach((a) => a.toggleAttribute('aria-current', a.dataset.id === (t ? t.id : 'home')));
    window.scrollTo(0, 0);
  }

  // photos/manifest.json (written on deploy) lists what's actually uploaded; it wins over config.js
  function applyManifest(man) {
    for (const t of tabs) if (Array.isArray(man[t.id]) && man[t.id].length) t.media = man[t.id];
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
