/* Stage II 3D objects.
   One WebGL canvas covers the window; each element mounted with Objects.wheel()
   or Objects.single() gets its own scene, drawn into that element's rectangle.
   To add a new object: write a builder in BUILDERS and point a tab's `object` at its key. */
(function () {
  const T = THREE;
  if (T.ColorManagement) T.ColorManagement.legacyMode = false; // treat hex colours as sRGB so they render true
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const V = (x, y, z) => new T.Vector3(x, y, z);

  /* ---------- materials & helpers ---------- */
  function kit() {
    const cache = {};
    // M(color, { m: metalness, r: roughness, cc: clearcoat })
    const M = (color, o = {}) => {
      const key = color + JSON.stringify(o);
      if (!cache[key]) {
        cache[key] = new T.MeshPhysicalMaterial({
          color, metalness: o.m || 0, roughness: o.r == null ? 0.5 : o.r,
          clearcoat: o.cc || 0, clearcoatRoughness: 0.15, envMapIntensity: o.m ? 1.0 : 0.75,
          side: o.ds ? T.DoubleSide : T.FrontSide,
        });
      }
      return cache[key];
    };
    function place(o, p, r, s) {
      if (p) o.position.set(p[0], p[1], p[2]);
      if (r) o.rotation.set(r[0], r[1], r[2]);
      if (s) o.scale.set(s[0], s[1], s[2]);
      return o;
    }
    const part = (geo, mat, p, r, s) => {
      if (geo.type === 'BoxGeometry') {
        const { width: w, height: h, depth: d } = geo.parameters, mn = Math.min(w, h, d);
        if (mn > 0.03) { geo.dispose(); geo = rbox(w, h, d, Math.min(0.035, mn * 0.18)); }
      }
      const m = new T.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return place(m, p, r, s);
    };
    function segs(arr, color = '#1a1a1a') {
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(arr, 3));
      return new T.LineSegments(geo, new T.LineBasicMaterial({ color }));
    }
    // Rounded box: extruded rounded rectangle, centred.
    function rbox(w, h, d, r) {
      r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
      const s = new T.Shape(), x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
      s.moveTo(x, y - r * 0); s.lineTo(x + W, y); s.lineTo(x + W, y + H); s.lineTo(x, y + H); s.lineTo(x, y);
      const g = new T.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 4, curveSegments: 8 });
      g.translate(0, 0, -(d - 2 * r) / 2);
      return g;
    }
    // A tube along points (smooth curve).
    const tube = (pts, rad, closed = false, seg = 64) => new T.TubeGeometry(new T.CatmullRomCurve3(pts.map((p) => V(...p)), closed), seg, rad, 10, closed);
    // Canvas texture helper: draw(ctx, w, h). colour maps use sRGB.
    function tex(w, h, draw, srgb = true) {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      draw(c.getContext('2d'), w, h);
      const t = new T.CanvasTexture(c);
      if (srgb) t.encoding = T.sRGBEncoding;
      t.anisotropy = 8; t.wrapS = t.wrapT = T.RepeatWrapping;
      return t;
    }
    function noise(w = 256, h = 256, lo = 90, hi = 165) {
      return tex(w, h, (x) => {
        const d = x.createImageData(w, h);
        for (let i = 0; i < d.data.length; i += 4) { const v = lo + Math.random() * (hi - lo); d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
        x.putImageData(d, 0, 0);
      }, false);
    }
    // MT(options): physical material with maps
    const MT = (o) => new T.MeshPhysicalMaterial(Object.assign({ roughness: 0.5, metalness: 0, envMapIntensity: o.metalness ? 1 : 0.75, clearcoatRoughness: 0.15 }, o));
    return { M, MT, part, segs, place, rbox, tube, tex, noise };
  }

  /* ---------- the objects ---------- */
  const BUILDERS = {
    // Racing goggles: low-profile oval mirrored lenses, red/black frame, split strap.
    goggles({ M, MT, part, tube, tex }) {
      const g = new T.Group();
      const mirror = M('#e2552c', { m: 0.45, r: 0.1, cc: 1 }), frame = M('#4a1010', { r: 0.3, cc: 0.8 });
      const black = M('#141414', { r: 0.4 });
      const camo = tex(512, 64, (x, w, h) => {
        x.fillStyle = '#1a0d0d'; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 70; i++) {
          x.fillStyle = ['#8f1b1b', '#c22a24', '#3a0f10', '#e04a2e'][i % 4];
          x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 26, 4 + Math.random() * 12, Math.random() * 3, 0, Math.PI * 2); x.fill();
        }
      });
      camo.repeat.set(3, 1);
      const strapM = MT({ map: camo, roughness: 0.4, clearcoat: 0.5 });
      for (const s of [-1, 1]) {
        const eye = new T.Group();
        eye.position.set(s * 0.5, 0, 0);
        eye.rotation.y = s * 0.28;
        eye.add(part(new T.TorusGeometry(0.3, 0.06, 14, 48), frame, null, null, [1.3, 0.85, 1.4]));
        eye.add(part(new T.SphereGeometry(0.3, 40, 16, 0, Math.PI * 2, 0, 0.75), mirror, [0, 0, -0.04], [Math.PI / 2, 0, 0], [1.28, 0.55, 0.84]));
        eye.add(part(new T.CylinderGeometry(0.33, 0.33, 0.12, 40, 1, true), black, [0, 0, -0.1], [Math.PI / 2, 0, 0], [1.25, 1, 0.8]));
        eye.add(part(new T.TorusGeometry(0.31, 0.035, 10, 48), M('#0d0d0d', { r: 0.7 }), [0, 0, -0.17], null, [1.27, 0.84, 1]));
        eye.add(part(new T.BoxGeometry(0.12, 0.08, 0.05), black, [s * 0.42, 0, -0.08]));
        g.add(eye);
      }
      g.add(part(tube([[-0.14, 0.02, 0.06], [0, 0.07, 0.1], [0.14, 0.02, 0.06]], 0.025), black));
      // split strap looping round the back, with a clasp
      for (const [dy, dz] of [[-0.09, 0], [0.13, 0.02]]) {
        g.add(part(tube([[0.86, dy * 0.3, -0.1], [1.05, dy, -0.5], [0.9, dy, -1.2], [0, dy, -1.45], [-0.9, dy, -1.2], [-1.05, dy, -0.5], [-0.86, dy * 0.3, -0.1]], 0.03, false, 80), strapM, [0, 0, dz]));
      }
      g.add(part(new T.BoxGeometry(0.18, 0.3, 0.06), black, [0, 0.02, -1.46]));
      g.userData.tilt = 0.25;
      return g;
    },

    // Architectural sketch made solid: white cantilevered blocks with pen edges, hatching and construction lines.
    drawing({ M, part, segs }) {
      const g = new T.Group();
      const paperY = 0;
      g.add(part(new T.BoxGeometry(3.4, 0.02, 2.6), M('#fbfaf6', { r: 0.95 }), [0, paperY, 0]));
      const white = M('#ffffff', { r: 0.85 });
      const L = [];
      const jitter = () => (Math.random() - 0.5) * 0.015;
      const line = (a, b, over = 0.07) => {
        const d = b.clone().sub(a).normalize().multiplyScalar(over);
        const A = a.clone().sub(d), B = b.clone().add(d);
        L.push(A.x, A.y, A.z, B.x, B.y, B.z);
        L.push(A.x + jitter(), A.y + jitter(), A.z + jitter(), B.x + jitter(), B.y + jitter(), B.z + jitter());
      };
      const block = (w, h, d, x, y, z, hatchUnder) => {
        g.add(part(new T.BoxGeometry(w, h, d), white, [x, y, z]));
        const c = [];
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) c.push(V(x + sx * w / 2, y + sy * h / 2, z + sz * d / 2));
        const idx = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
        for (const [i, j] of idx) line(c[i], c[j]);
        if (hatchUnder) {
          const yb = y - h / 2 - 0.004;
          for (let t = -w / 2 + 0.04; t < w / 2; t += 0.045) L.push(x + t, yb, z - d / 2, x + t, yb, z + d / 2);
        }
        return c;
      };
      block(2.4, 0.8, 1.3, 0, 0.41, 0, false);
      block(1.1, 0.95, 1.5, -0.6, 1.3, 0.2, true);
      block(1.5, 0.75, 1.1, 0.55, 1.18, -0.15, true);
      // ribbon window on the ground floor and recessed windows above (shaded with vertical hatching)
      const zf = 0.651;
      for (let x = -1.0; x <= 0.2; x += 0.035) L.push(x, 0.2, zf, x, 0.62, zf);
      L.push(-1.0, 0.2, zf, 0.2, 0.2, zf, -1.0, 0.62, zf, 0.2, 0.62, zf);
      for (let x = -0.95; x <= -0.35; x += 0.03) L.push(x, 1.0, 0.951, x, 1.55, 0.951);
      for (let x = 0.75; x <= 1.15; x += 0.03) L.push(x, 0.95, 0.401, x, 1.35, 0.401);
      // door
      L.push(0.55, 0.01, zf, 0.55, 0.5, zf, 0.55, 0.5, zf, 0.8, 0.5, zf, 0.8, 0.5, zf, 0.8, 0.01, zf);
      // construction lines running off to two vanishing points across the paper
      for (const [vx, vz] of [[-1.65, 1.2], [1.65, 1.2]]) {
        for (const [px, pz] of [[0, -0.65], [-1.2, 0.65], [1.2, 0.65], [0.2, 0.2]]) L.push(vx, 0.012, vz, px, 0.012, pz);
      }
      g.add(segs(L, '#222222'));
      // tiny figure for scale
      g.add(part(new T.CylinderGeometry(0.03, 0.035, 0.22, 10), M('#2a2a2a', { r: 0.6 }), [0.15, 0.12, 0.95]));
      g.add(part(new T.SphereGeometry(0.035, 12, 10), M('#2a2a2a', { r: 0.6 }), [0.15, 0.27, 0.95]));
      g.userData.tilt = 0.42;
      return g;
    },

    // Matte black gloves with gold V-line accents and a wrist strap.
    gloves({ M, MT, part, tube, noise, segs }) {
      const g = new T.Group();
      const grain = noise(256, 256, 60, 200); grain.repeat.set(6, 6);
      const matte = MT({ color: '#1b1b1c', roughness: 0.68, clearcoat: 0.12, bumpMap: grain, bumpScale: 0.004 });
      const gloss = MT({ color: '#0e0e0f', roughness: 0.16, clearcoat: 1, bumpMap: grain, bumpScale: 0.001 });
      const gold = M('#c8a252', { m: 1, r: 0.3 });
      const fistC = [0, 0.38, 0], fistR = [0.6, 0.672, 0.57], knC = [0, 0.6, 0.2], knR = [0.518, 0.374, 0.432];
      const surfZ = (x, y) => {
        const e = (c, r) => { const k = 1 - ((x - c[0]) / r[0]) ** 2 - ((y - c[1]) / r[1]) ** 2; return k > 0 ? c[2] + r[2] * Math.sqrt(k) : -9; };
        return Math.max(e(fistC, fistR), e(knC, knR)) + 0.012;
      };
      const vline = (spread, top, bottom) => {
        const pts = [];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20, x = (t * 2 - 1) * spread, y = bottom + Math.abs(t * 2 - 1) * (top - bottom);
          pts.push([x, y, surfZ(x, y)]);
        }
        return tube(pts, 0.012, false, 60);
      };
      const glove = () => {
        const o = new T.Group();
        o.add(part(new T.SphereGeometry(0.6, 48, 32), matte, fistC, null, [1, 1.12, 0.95]));
        o.add(part(new T.SphereGeometry(0.48, 40, 24), matte, knC, null, [1.08, 0.78, 0.9]));
        o.add(part(new T.SphereGeometry(0.2, 24, 16), gloss, [0.55, 0.12, 0.22], [0, 0, -0.45], [1, 1.75, 1]));
        o.add(part(new T.CylinderGeometry(0.47, 0.52, 0.8, 40), matte, [0, -0.46, 0]));
        o.add(part(new T.CylinderGeometry(0.535, 0.535, 0.34, 40), gloss, [0, -0.5, 0]));
        o.add(part(vline(0.36, 0.62, 0.02), gold));
        o.add(part(vline(0.26, 0.58, 0.1), gold));
        // stitching round the cuff and the strap edge
        const st = [];
        for (const [yy, rr] of [[-0.33, 0.541], [-0.67, 0.541], [-0.08, 0.5]]) {
          for (let i = 0; i < 60; i += 2) {
            const a0 = (i / 60) * Math.PI * 2, a1 = ((i + 1) / 60) * Math.PI * 2;
            st.push(Math.cos(a0) * rr, yy, Math.sin(a0) * rr, Math.cos(a1) * rr, yy, Math.sin(a1) * rr);
          }
        }
        o.add(segs(st, '#4a4a4a'));
        o.add(part(new T.BoxGeometry(0.3, 0.26, 0.04), gloss, [0, -0.5, 0.54]));
        return o;
      };
      const a = glove(); a.position.set(-0.62, 0, 0); a.rotation.set(0, 0.35, 0.14); g.add(a);
      const b = glove(); b.position.set(0.62, 0.15, -0.1); b.scale.x = -1; b.rotation.set(0, -0.35, -0.14); g.add(b);
      g.userData.tilt = 0.1;
      return g;
    },

    // Sonny Angel style figure with a pineapple headpiece.
    angel({ M, MT, part, segs, tex }) {
      const g = new T.Group();
      const skin = MT({ color: '#f5c6a5', roughness: 0.38, clearcoat: 0.35, sheen: 0.4, sheenColor: new T.Color('#ffd9c7') });
      const draw = (col) => (x, w, h) => {
        x.fillStyle = col ? '#f0b51d' : '#c8c8c8'; x.fillRect(0, 0, w, h);
        const cols = 16, rows = 9, cw = w / cols, rh = h / rows;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const cx = (c + (r % 2) * 0.5) * cw, cy = (r + 0.5) * rh;
          const gr = x.createRadialGradient(cx, cy, 1, cx, cy, cw * 0.6);
          if (col) { gr.addColorStop(0, '#ffd04a'); gr.addColorStop(0.7, '#e9a816'); gr.addColorStop(1, '#a8700a'); }
          else { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.8, '#8a8a8a'); gr.addColorStop(1, '#222222'); }
          x.fillStyle = gr;
          x.beginPath(); x.moveTo(cx, cy - rh * 0.62); x.lineTo(cx + cw * 0.5, cy); x.lineTo(cx, cy + rh * 0.62); x.lineTo(cx - cw * 0.5, cy); x.closePath(); x.fill();
        }
      };
      const pine = MT({ map: tex(512, 256, draw(true)), bumpMap: tex(512, 256, draw(false), false), bumpScale: 0.02, roughness: 0.42, clearcoat: 0.4 });
      const leaf = M('#3f9a3c', { r: 0.45, cc: 0.3 }), leafDark = M('#2f7a2e', { r: 0.45 });
      const eye = M('#1d2433', { r: 0.1, cc: 1 }), shine = M('#ffffff', { r: 0.2 }), blush = M('#f19a9a', { r: 0.6 });
      g.add(part(new T.SphereGeometry(0.7, 48, 36), skin, [0, 0.55, 0]));
      const hood = new T.Group();
      hood.position.set(0, 0.57, -0.02); hood.rotation.x = -0.5;
      hood.add(part(new T.SphereGeometry(0.75, 48, 24, 0, Math.PI * 2, 0, 1.85), pine));
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2, tall = i % 2 ? 0.5 : 0.65;
        hood.add(part(new T.ConeGeometry(0.09, tall, 6), i % 2 ? leafDark : leaf, [Math.cos(a) * 0.12, 0.72 + tall / 2.4, Math.sin(a) * 0.12], [Math.sin(a) * 0.55, 0, -Math.cos(a) * 0.55], [1, 1, 0.35]));
      }
      hood.add(part(new T.ConeGeometry(0.08, 0.7, 6), leaf, [0, 1.08, 0], null, [1, 1, 0.4]));
      g.add(hood);
      for (const s of [-1, 1]) {
        g.add(part(new T.SphereGeometry(0.1, 20, 16), eye, [s * 0.24, 0.5, 0.62], null, [1, 1.2, 0.5]));
        g.add(part(new T.SphereGeometry(0.03, 10, 8), shine, [s * 0.24 + 0.03, 0.55, 0.67]));
        g.add(part(new T.SphereGeometry(0.075, 16, 12), M('#3e5872', { r: 0.1, cc: 1 }), [s * 0.24, 0.49, 0.645], null, [1, 1.15, 0.3]));
        const lash = [];
        for (let k = 0; k < 4; k++) { const ax = s * (0.17 + k * 0.045), ay = 0.6 + Math.sin((k / 3) * Math.PI) * 0.015; lash.push(ax, ay, 0.645, ax + s * 0.025, ay + 0.045, 0.66); }
        g.add(segs(lash, '#1a1a1a'));
        g.add(part(new T.SphereGeometry(0.08, 12, 10), blush, [s * 0.36, 0.36, 0.56], null, [1, 0.6, 0.4]));
        g.add(part(new T.SphereGeometry(0.13, 18, 14), skin, [s * 0.55, -0.32, 0.05], [0, 0, s * 1.0], [1, 2.2, 1]));
        g.add(part(new T.SphereGeometry(0.17, 18, 14), skin, [s * 0.19, -1.0, 0.04], null, [1, 1.5, 1.1]));
        g.add(part(new T.SphereGeometry(0.15, 16, 12), skin, [s * 0.19, -1.22, 0.1], null, [1, 0.5, 1.4]));
        g.add(part(new T.SphereGeometry(0.16, 16, 12), M('#ffffff', { r: 0.3, cc: 0.5 }), [s * 0.16, -0.25, -0.42], [0, s * 0.6, -s * 0.4], [1, 1.4, 0.18]));
      }
      g.add(part(new T.SphereGeometry(0.46, 36, 28), skin, [0, -0.45, 0.02], null, [1, 1.2, 0.95]));
      g.add(part(new T.SphereGeometry(0.025, 10, 8), M('#d79a7f', { r: 0.6 }), [0, -0.5, 0.455]));
      const smile = [];
      for (let i = 0; i < 8; i++) {
        const a0 = Math.PI * 1.25 + (i / 8) * Math.PI * 0.5, a1 = Math.PI * 1.25 + ((i + 1) / 8) * Math.PI * 0.5;
        smile.push(Math.cos(a0) * 0.1, 0.36 + Math.sin(a0) * 0.05, 0.69, Math.cos(a1) * 0.1, 0.36 + Math.sin(a1) * 0.05, 0.69);
      }
      g.add(segs(smile, '#a8574a'));
      g.userData.tilt = 0.06;
      return g;
    },

    // Modern 5.7 V8: silver aluminium, big ribbed charcoal engine cover, black front accessory drive.
    hemi({ M, MT, part, rbox, tube, tex, noise }) {
      const g = new T.Group();
      const cast = noise(256, 256, 120, 200); cast.repeat.set(4, 4);
      const alu = MT({ color: '#b9bcc0', metalness: 0.75, roughness: 0.48, roughnessMap: cast, bumpMap: cast, bumpScale: 0.003 });
      const cover = MT({ color: '#3b3e42', roughness: 0.42, clearcoat: 0.5, bumpMap: noise(128, 128, 110, 150), bumpScale: 0.0015 });
      const panel = M('#8e9297', { m: 0.5, r: 0.35, cc: 0.6 }), black = M('#141414', { r: 0.5 });
      const chrome = M('#e0e2e5', { m: 1, r: 0.15 }), iron = M('#6a6560', { m: 0.6, r: 0.6 }), cap = M('#e0b62c', { r: 0.4 });
      g.add(part(new T.BoxGeometry(1.3, 0.85, 2.0), alu, [0, -0.3, 0]));
      g.add(part(new T.BoxGeometry(1.0, 0.28, 1.8), alu, [0, -0.86, -0.05]));
      const q = Math.PI / 4;
      for (const s of [-1, 1]) {
        g.add(part(new T.BoxGeometry(0.62, 0.32, 1.9), alu, [s * 0.62, 0.22, 0], [0, 0, -s * q]));
        g.add(part(new T.CylinderGeometry(0.08, 0.08, 1.7, 16), iron, [s * 0.82, -0.35, 0], [Math.PI / 2, 0, 0]));
        for (let i = 0; i < 4; i++) g.add(part(new T.CylinderGeometry(0.05, 0.05, 0.25, 10), iron, [s * 0.74, -0.2, -0.66 + i * 0.44], [0, 0, Math.PI / 2 + s * 0.6]));
      }
      // the big engine cover with side ribs and a lighter centre panel
      g.add(part(rbox(1.75, 0.45, 1.85, 0.18), cover, [0, 0.62, -0.05]));
      g.add(part(rbox(0.95, 0.06, 1.2, 0.03), panel, [0, 0.86, -0.15]));
      // "5.7 LITER V8" on the centre panel, HEMI in chrome letters on the right of the cover
      const label = tex(512, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#1e2023'; x.font = 'italic 800 78px Arial, Helvetica, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('5.7 LITER V8', w / 2, h / 2); });
      const lab = new T.Mesh(new T.PlaneGeometry(0.85, 0.21), MT({ map: label, transparent: true, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2 }));
      lab.setRotationFromMatrix(new T.Matrix4().makeBasis(V(1, 0, 0), V(0, 0, -1), V(0, 1, 0))); lab.position.set(0, 0.894, -0.15); g.add(lab);
      const hemiTex = tex(512, 160, (x, w, h) => {
        x.clearRect(0, 0, w, h); x.font = 'italic 900 150px Arial Black, Arial, Helvetica, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillStyle = '#ffffff'; x.fillText('HEMI', w / 2, h / 2 + 6);
      });
      const hm = new T.Mesh(new T.PlaneGeometry(0.75, 0.24), MT({ color: '#e6e8eb', alphaMap: hemiTex, transparent: true, metalness: 0.35, roughness: 0.25, clearcoat: 1, emissive: new T.Color('#2a2c30'), polygonOffset: true, polygonOffsetFactor: -3 }));
      // sloped side plate of the cover carries the badge
      const sl = 0.5, nrm = V(Math.cos(sl), Math.sin(sl), 0), up = V(-Math.sin(sl), Math.cos(sl), 0);
      g.add(part(rbox(0.06, 0.4, 1.5, 0.025), cover, [0.95, 0.64, -0.05], [0, 0, sl]));
      hm.setRotationFromMatrix(new T.Matrix4().makeBasis(V(0, 0, -1), up, nrm));
      hm.position.copy(V(0.95, 0.64, 0.05).add(nrm.clone().multiplyScalar(0.032)));
      g.add(hm);
      for (let i = 0; i < 5; i++) g.add(part(new T.BoxGeometry(0.04, 0.12, 1.4), cover, [-(0.62 + i * 0.05), 0.82 - i * 0.05, -0.1]));
      g.add(part(new T.CylinderGeometry(0.2, 0.2, 0.28, 32), chrome, [0, 0.55, 0.98], [Math.PI / 2, 0, 0]));
      g.add(part(new T.CylinderGeometry(0.07, 0.07, 0.06, 20), cap, [0.55, 0.88, 0.55]));
      // front accessory drive
      g.add(part(new T.BoxGeometry(1.15, 1.0, 0.1), alu, [0, -0.15, 1.05]));
      // alternator behind its pulley
      g.add(part(new T.CylinderGeometry(0.21, 0.21, 0.3, 32), alu, [0.48, 0.25, 0.95], [Math.PI / 2, 0, 0]));
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.add(part(new T.BoxGeometry(0.02, 0.06, 0.26), M('#2a2a2a'), [0.48 + Math.cos(a) * 0.2, 0.25 + Math.sin(a) * 0.2, 0.95], [0, 0, a])); }
      const pulleys = [[0, -0.6, 0.3], [0, 0.0, 0.2], [0.48, 0.25, 0.18], [-0.45, 0.2, 0.16], [0.42, -0.25, 0.12], [-0.4, -0.3, 0.13]];
      for (const [x, y, r] of pulleys) {
        g.add(part(new T.CylinderGeometry(r, r, 0.1, 40), black, [x, y, 1.17], [Math.PI / 2, 0, 0]));
        g.add(part(new T.CylinderGeometry(r * 0.35, r * 0.35, 0.12, 20), chrome, [x, y, 1.18], [Math.PI / 2, 0, 0]));
        for (const dz of [-0.03, 0, 0.03]) g.add(part(new T.TorusGeometry(r, 0.008, 6, 40), M('#222', { r: 0.4 }), [x, y, 1.17 + dz]));
      }
      g.add(part(tube([[0, -0.92, 1.18], [0.37, -0.68, 1.18], [0.55, -0.25, 1.18], [0.68, 0.25, 1.18], [0.48, 0.45, 1.18], [0.2, 0.08, 1.18], [-0.2, 0.08, 1.18], [-0.47, 0.38, 1.18], [-0.6, 0.15, 1.18], [-0.54, -0.3, 1.18], [-0.32, -0.75, 1.18]], 0.018, true, 120), black));
      g.rotation.y = -0.6;
      g.userData.tilt = 0.28;
      return g;
    },

    // Glossy black aluminium tank with a chrome valve and black knob.
    tank({ M, MT, part, tex }) {
      const g = new T.Group();
      const black = M('#0c0c0d', { r: 0.12, cc: 1 }), chrome = M('#dcdee1', { m: 1, r: 0.14 }), knob = M('#161616', { r: 0.5 });
      const prof = [];
      prof.push(new T.Vector2(0, -1.4), new T.Vector2(0.36, -1.4));
      for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); prof.push(new T.Vector2(0.36 + Math.cos(a) * 0.06, -1.34 + Math.sin(a) * 0.06)); }
      prof.push(new T.Vector2(0.42, 0.75));
      for (let i = 1; i <= 14; i++) { const a = (i / 14) * (Math.PI / 2); prof.push(new T.Vector2(0.12 + Math.cos(a) * 0.3, 0.75 + Math.sin(a) * 0.48)); }
      prof.push(new T.Vector2(0.1, 1.23), new T.Vector2(0.1, 1.33), new T.Vector2(0, 1.33));
      g.add(part(new T.LatheGeometry(prof, 64), black));
      g.add(part(new T.CylinderGeometry(0.09, 0.1, 0.16, 20), chrome, [0, 1.4, 0]));
      g.add(part(new T.BoxGeometry(0.2, 0.2, 0.2), chrome, [0, 1.56, 0]));
      g.add(part(new T.CylinderGeometry(0.06, 0.06, 0.2, 16), chrome, [0.18, 1.56, 0], [0, 0, Math.PI / 2]));
      g.add(part(new T.CylinderGeometry(0.06, 0.06, 0.2, 16), chrome, [0, 1.56, 0.16], [Math.PI / 2, 0, 0]));
      g.add(part(new T.CylinderGeometry(0.14, 0.14, 0.12, 24), knob, [-0.19, 1.58, 0], [0, 0, Math.PI / 2]));
      g.add(part(new T.CylinderGeometry(0.05, 0.05, 0.14, 12), knob, [0, 1.72, 0]));
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; g.add(part(new T.BoxGeometry(0.12, 0.025, 0.025), knob, [-0.19, 1.58 + Math.cos(a) * 0.14, Math.sin(a) * 0.14])); }
      g.add(part(new T.TorusGeometry(0.1, 0.012, 8, 24), chrome, [0, 1.33, 0], [Math.PI / 2, 0, 0]));
      const sticker = tex(128, 256, (x, w, h) => {
        x.fillStyle = '#f2f2ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#333';
        x.font = '700 18px Arial'; x.fillText('CYLINDER', 10, 30); x.font = '14px Arial';
        ['11.1 L', '207 bar', 'AL 6061', 'TEST 11/26', 'NITROX OK'].forEach((t, i) => x.fillText(t, 10, 60 + i * 26));
        x.fillRect(10, 200, 108, 3); x.fillRect(10, 210, 70, 3);
      });
      const st = new T.Mesh(new T.CylinderGeometry(0.4225, 0.4225, 0.55, 24, 1, true, -0.25, 0.5), MT({ map: sticker, roughness: 0.6 }));
      st.position.set(0, -0.7, 0); st.rotation.y = Math.PI / 2 - 0.9;
      g.add(st);
      g.userData.tilt = 0.12;
      return g;
    },

    // Small folding camera drone: light grey shell, dark grey props with orange tips.
    drone({ M, part, rbox }) {
      const g = new T.Group();
      const shell = M('#e3e4e2', { r: 0.4, cc: 0.4 }), grey = M('#9a9c9e', { r: 0.4 });
      const prop = M('#3a3b3d', { r: 0.35 }), tip = M('#e8843c', { r: 0.4 }), black = M('#141414', { r: 0.3, cc: 0.6 });
      g.add(part(rbox(0.55, 0.3, 1.2, 0.12), shell, [0, 0, 0]));
      g.add(part(new T.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), shell, [0, 0.1, 0.05], null, [0.85, 0.45, 1.6]));
      const props = [];
      const arms = [[-1, 1, 0.06], [1, 1, 0.06], [-1, -1, -0.06], [1, -1, -0.06]];
      for (const [sx, sz, y] of arms) {
        const mx = sx * 0.85, mz = sz * 0.75, ax = sx * 0.25, az = sz * 0.4;
        const len = Math.hypot(mx - ax, mz - az);
        g.add(part(rbox(len, 0.07, 0.1, 0.03), shell, [(mx + ax) / 2, y, (mz + az) / 2], [0, -Math.atan2(mz - az, mx - ax), 0]));
        g.add(part(new T.CylinderGeometry(0.075, 0.075, 0.12, 20), grey, [mx, y + 0.04, mz]));
        if (sz > 0) g.add(part(rbox(0.07, 0.24, 0.07, 0.03), shell, [mx, y - 0.14, mz]));
        const p = new T.Group();
        p.position.set(mx, y + 0.12, mz);
        for (const d of [-1, 1]) {
          p.add(part(rbox(0.5, 0.015, 0.075, 0.006), prop, [d * 0.26, 0, 0]));
          p.add(part(new T.BoxGeometry(0.06, 0.016, 0.075), tip, [d * 0.5, 0, 0]));
        }
        p.add(part(new T.CylinderGeometry(0.035, 0.035, 0.04, 12), black));
        g.add(p);
        props.push(p);
      }
      // gimbal camera on the nose
      g.add(part(rbox(0.2, 0.16, 0.14, 0.04), black, [0, -0.04, 0.66]));
      g.add(part(new T.CylinderGeometry(0.05, 0.05, 0.03, 20), M('#0b1a2c', { m: 0.6, r: 0.05, cc: 1 }), [0, -0.04, 0.74], [Math.PI / 2, 0, 0]));
      g.add(part(new T.SphereGeometry(0.05, 14, 10), black, [0, 0.18, 0.45]));
      for (const s of [-1, 1]) g.add(part(new T.CylinderGeometry(0.03, 0.03, 0.02, 16), black, [s * 0.1, 0.03, 0.605], [Math.PI / 2, 0, 0]));
      for (let i = 0; i < 5; i++) g.add(part(new T.BoxGeometry(0.012, 0.02, 0.18), M('#b8b9b7'), [-0.08 + i * 0.04, 0.17, -0.25]));
      g.add(part(new T.BoxGeometry(0.03, 0.12, 0.08), black, [0.11, -0.04, 0.6]));
      g.add(part(new T.BoxGeometry(0.03, 0.12, 0.08), black, [-0.11, -0.04, 0.6]));
      g.add(part(new T.BoxGeometry(0.4, 0.01, 0.5), M('#cfd0ce', { r: 0.5 }), [0, -0.152, -0.25]));
      g.userData.tilt = 0.3;
      g.userData.tick = (t) => { props.forEach((p, i) => { p.rotation.y = t * (i % 2 ? -22 : 22); }); };
      return g;
    },

    // Glossy black board with blue rails, dark grey lace-up boots.
    wakeboard({ M, MT, part, segs, rbox, tex, tube }) {
      const g = new T.Group();
      const Lh = 1.3, W = 0.4;
      const boardGeo = (len, wid, depth) => {
        const shape = new T.Shape();
        shape.moveTo(-len + wid, -wid);
        shape.lineTo(len - wid, -wid);
        shape.absarc(len - wid, 0, wid, -Math.PI / 2, Math.PI / 2, false);
        shape.lineTo(-len + wid, wid);
        shape.absarc(-len + wid, 0, wid, Math.PI / 2, Math.PI * 1.5, false);
        const geo = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 3, curveSegments: 32 });
        geo.rotateX(-Math.PI / 2);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) pos.setY(i, pos.getY(i) + 0.14 * Math.pow(pos.getX(i) / Lh, 2));
        geo.computeVertexNormals();
        return geo;
      };
      const deck = tex(1024, 320, (x, w, h) => {
        x.fillStyle = '#0d0e10'; x.fillRect(0, 0, w, h);
        for (let i = 0; i < w; i += 8) for (let j = 0; j < h; j += 8) { x.fillStyle = (i + j) % 16 ? '#121316' : '#16181b'; x.fillRect(i, j, 8, 8); }
        x.fillStyle = '#1d9cc6'; x.fillRect(w * 0.06, h * 0.12, 6, h * 0.76); x.fillRect(w * 0.94 - 6, h * 0.12, 6, h * 0.76);
        x.strokeStyle = '#1d9cc6'; x.lineWidth = 3; x.beginPath(); x.moveTo(w * 0.42, h * 0.1); x.lineTo(w * 0.58, h * 0.9); x.stroke();
        x.fillStyle = '#e8e8e8'; for (const px of [0.33, 0.67]) for (const py of [0.3, 0.5, 0.7]) { x.beginPath(); x.arc(w * px, h * py, 4, 0, 7); x.fill(); }
      });
      deck.wrapS = deck.wrapT = T.ClampToEdgeWrapping;
      deck.repeat.set(1 / (2 * Lh), 1 / (2 * W)); deck.offset.set(0.5, 0.5);
      g.add(part(boardGeo(Lh, W, 0.03), MT({ map: deck, roughness: 0.12, clearcoat: 1 }), [0, 0.03, 0]));
      g.add(part(boardGeo(Lh + 0.02, W + 0.02, 0.03), M('#1d9cc6', { r: 0.3, cc: 0.8 }), [0, -0.005, 0]));
      const boot = M('#3a3c40', { r: 0.7 }), base = M('#151515', { r: 0.5 }), sole = M('#222', { r: 0.6 });
      for (const s of [-1, 1]) {
        const b = new T.Group();
        b.position.set(s * 0.45, 0.1, 0);
        b.rotation.y = Math.PI / 2 + s * 0.25;
        b.add(part(new T.BoxGeometry(0.28, 0.05, 0.6), base));
        b.add(part(rbox(0.26, 0.08, 0.54, 0.03), sole, [0, 0.06, 0.02]));
        b.add(part(rbox(0.25, 0.2, 0.5, 0.09), boot, [0, 0.17, 0.03]));
        b.add(part(rbox(0.25, 0.5, 0.3, 0.1), boot, [0, 0.36, -0.1]));
        b.add(part(rbox(0.16, 0.36, 0.08, 0.04), base, [0, 0.4, 0.06], [-0.25, 0, 0]));
        const lace = [];
        for (let i = 0; i < 6; i++) { const y = 0.22 + i * 0.07, z = 0.14 - i * 0.035; lace.push(-0.09, y, z, 0.09, y + 0.05, z, 0.09, y, z, -0.09, y + 0.05, z); }
        const lm = M('#e9e9e9', { r: 0.6 });
        for (let i = 0; i < 6; i++) { const y = 0.24 + i * 0.07, z = 0.15 - i * 0.03; b.add(part(tube([[-0.085, y, z], [0, y + 0.03, z + 0.015], [0.085, y + 0.05, z]], 0.008, false, 12), lm)); }
        b.add(part(new T.TorusGeometry(0.05, 0.012, 8, 20, Math.PI), M('#1d9cc6', { r: 0.4 }), [0, 0.62, -0.24]));
        b.add(part(rbox(0.27, 0.05, 0.32, 0.02), M('#1d1d1d', { r: 0.4 }), [0, 0.3, -0.1]));
        g.add(b);
        g.add(part(new T.BoxGeometry(0.14, 0.07, 0.02), base, [s * 1.12, -0.04, 0]));
      }
      g.userData.tilt = 0.4;
      return g;
    },

    // Vintage movie camera: black crinkle body, twin chrome reels on top, lens with hood, side crank, eyepiece, pistol grip.
    camera({ M, MT, part, rbox, tex, noise, tube }) {
      const g = new T.Group();
      const chrome = M('#dcdde0', { m: 1, r: 0.16 }), satin = M('#b4b6ba', { m: 1, r: 0.35 });
      const black = M('#111', { r: 0.35, cc: 0.4 }), rubber = M('#0b0b0b', { r: 0.8 });
      const crinkle = MT({ color: '#161616', roughness: 0.7, bumpMap: noise(256, 256, 40, 220), bumpScale: 0.01 });
      const ALONG_Z = [Math.PI / 2, 0, 0], ALONG_X = [0, 0, Math.PI / 2];
      // body (lens points +z)
      g.add(part(rbox(0.5, 0.62, 1.0, 0.06), crinkle, [0, 0, 0]));
      g.add(part(rbox(0.52, 0.06, 1.02, 0.02), satin, [0, 0.31, 0]));
      g.add(part(rbox(0.04, 0.42, 0.7, 0.02), satin, [0.265, 0, 0])); // film door plate
      for (const z of [-0.25, 0.25]) g.add(part(new T.CylinderGeometry(0.03, 0.03, 0.02, 16), chrome, [0.29, 0.13, z], ALONG_X));
      // twin reels on top, each a chrome disc with three cut-outs, on its own spindle
      const reels = [];
      const reelShape = () => {
        const s = new T.Shape(); s.absarc(0, 0, 0.36, 0, Math.PI * 2, false);
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2, h = new T.Path();
          h.absarc(Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0.1, 0, Math.PI * 2, true); s.holes.push(h);
        }
        const hub = new T.Path(); hub.absarc(0, 0, 0.03, 0, Math.PI * 2, true); s.holes.push(hub);
        const geo = new T.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 48 });
        geo.translate(0, 0, -0.0125); geo.rotateY(Math.PI / 2);
        return geo;
      };
      for (const z of [0.24, -0.3]) {
        const r = new T.Group(); r.position.set(0, 0.74, z);
        for (const x of [-0.07, 0.07]) r.add(part(reelShape(), chrome, [x, 0, 0]));
        r.add(part(new T.CylinderGeometry(0.33, 0.33, 0.12, 48), MT({ color: '#2a1f17', roughness: 0.45, clearcoat: 0.6 }), [0, 0, 0], ALONG_X)); // wound film
        r.add(part(new T.CylinderGeometry(0.06, 0.06, 0.2, 20), black, [0, 0, 0], ALONG_X));
        g.add(r); reels.push(r);
        g.add(part(rbox(0.1, 0.4, 0.12, 0.03), black, [0, 0.5, z])); // reel arm
      }
      // film strip running from the reels into the body
      const film = M('#1c140e', { r: 0.4, cc: 0.5, ds: 1 });
      g.add(part(new T.BoxGeometry(0.1, 0.006, 0.5), film, [0, 0.43, 0.08], [0.9, 0, 0]));
      g.add(part(new T.BoxGeometry(0.1, 0.006, 0.45), film, [0, 0.45, -0.12], [-0.95, 0, 0]));
      // lens: mount, barrel with focus ring, coated glass, square hood
      const lz = 0.5;
      g.add(part(new T.CylinderGeometry(0.17, 0.17, 0.05, 48), chrome, [0, -0.02, lz + 0.025], ALONG_Z));
      g.add(part(new T.CylinderGeometry(0.14, 0.15, 0.22, 48), black, [0, -0.02, lz + 0.15], ALONG_Z));
      const knurl = tex(512, 16, (x, w, h) => { for (let i = 0; i < w; i += 8) { x.fillStyle = '#fff'; x.fillRect(i, 0, 4, h); x.fillStyle = '#000'; x.fillRect(i + 4, 0, 4, h); } }, false);
      g.add(part(new T.CylinderGeometry(0.16, 0.16, 0.08, 72), MT({ color: '#c9cacc', metalness: 1, roughness: 0.3, bumpMap: knurl, bumpScale: 0.015 }), [0, -0.02, lz + 0.16], ALONG_Z));
      const hood = new T.CylinderGeometry(0.2, 0.15, 0.14, 4, 1, true); hood.rotateY(Math.PI / 4);
      g.add(part(hood, M('#121212', { r: 0.5, ds: 1 }), [0, -0.02, lz + 0.33], ALONG_Z));
      const glass = MT({ color: '#5a4a86', metalness: 0.85, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.8 });
      const lens = new T.Mesh(new T.SphereGeometry(0.16, 40, 20, 0, Math.PI * 2, 0, 0.9), glass);
      lens.rotation.x = Math.PI / 2; lens.position.set(0, -0.02, lz + 0.21); lens.scale.set(1, 0.5, 1); g.add(lens);
      // viewfinder tube along the left side with rubber eyecup at the back
      g.add(part(new T.CylinderGeometry(0.06, 0.06, 0.9, 32), satin, [-0.31, 0.16, -0.05], ALONG_Z));
      g.add(part(new T.CylinderGeometry(0.075, 0.075, 0.06, 32), chrome, [-0.31, 0.16, 0.42], ALONG_Z));
      g.add(part(new T.CylinderGeometry(0.11, 0.08, 0.12, 32, 1, true), M('#0b0b0b', { r: 0.8, ds: 1 }), [-0.31, 0.16, -0.56], ALONG_Z));
      for (const z of [-0.3, 0.25]) g.add(part(new T.BoxGeometry(0.08, 0.05, 0.05), satin, [-0.27, 0.16, z]));
      // hand crank on the right side
      const crank = new T.Group(); crank.position.set(0.3, -0.08, -0.15);
      crank.add(part(new T.CylinderGeometry(0.06, 0.06, 0.04, 24), chrome, [0.02, 0, 0], ALONG_X));
      crank.add(part(new T.BoxGeometry(0.025, 0.03, 0.24), chrome, [0.05, 0, -0.1]));
      crank.add(part(new T.CylinderGeometry(0.025, 0.025, 0.1, 16), black, [0.1, 0, -0.21], ALONG_X));
      g.add(crank);
      // footage counter and speed dial on the left wall
      const dial = tex(128, 128, (x, w, h) => {
        x.fillStyle = '#e8e6df'; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.fillStyle = '#111'; x.font = '600 14px Arial'; x.textAlign = 'center';
        ['8', '16', '24', '32', '48', '64'].forEach((s, i) => { const a = -2.2 + i * 0.88; x.fillText(s, 64 + Math.sin(a) * 44, 70 - Math.cos(a) * 44); });
        x.strokeStyle = '#b01e1e'; x.lineWidth = 3; x.beginPath(); x.moveTo(64, 64); x.lineTo(90, 36); x.stroke();
      });
      g.add(part(new T.CylinderGeometry(0.11, 0.11, 0.02, 40), [chrome, MT({ map: dial, roughness: 0.3, clearcoat: 1 }), chrome], [-0.26, -0.12, 0.15], [0, 0, -Math.PI / 2]));
      // pistol grip and trigger underneath
      g.add(part(rbox(0.16, 0.42, 0.18, 0.06), rubber, [0, -0.48, 0.1], [0.25, 0, 0]));
      for (let i = 0; i < 4; i++) g.add(part(new T.BoxGeometry(0.17, 0.012, 0.03), black, [0, -0.36 - i * 0.08, 0.2 - i * 0.02], [0.25, 0, 0]));
      g.add(part(new T.BoxGeometry(0.04, 0.08, 0.03), chrome, [0, -0.34, 0.24], [0.25, 0, 0]));
      g.add(part(new T.CylinderGeometry(0.035, 0.035, 0.01, 20), satin, [0, -0.312, -0.3]));
      g.userData.tilt = 0.12;
      g.userData.tick = (t) => { reels.forEach((r) => { r.rotation.x = -t * 1.6; }); crank.rotation.x = -t * 1.6; };
      return g;
    },

    // Starry Nights flask: glossy black fading to magenta-pink at the base, gold ornament, black/gold name label, gold spray pump.
    perfume({ M, MT, part, tex }) {
      const g = new T.Group();
      const H = 1.16, C = 2 * Math.PI * 0.2, ax = C / H; // texture is stretched by ax around the bottle
      const skin = tex(1024, 1024, (x, w, h) => {
        const gr = x.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, '#0a090c'); gr.addColorStop(0.42, '#0d0a10'); gr.addColorStop(0.6, '#3a1238');
        gr.addColorStop(0.78, '#a3245f'); gr.addColorStop(1, '#ef4f97');
        x.fillStyle = gr; x.fillRect(0, 0, w, h);
        const gold = '#d9b45a';
        // gold ornament on the upper front: an octagon framing a square with crossed lines
        for (const cx of [0, w]) { x.save(); x.translate(cx, h * 0.3); x.scale(1 / ax, 1);
        x.strokeStyle = gold; x.lineWidth = 6;
        const oct = (r) => { x.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + (i / 8) * Math.PI * 2; x[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.stroke(); };
        x.scale(0.8, 0.8); oct(86); x.lineWidth = 3; oct(70);
        x.lineWidth = 5; x.strokeRect(-34, -34, 68, 68);
        x.beginPath(); x.moveTo(-34, -34); x.lineTo(34, 34); x.moveTo(34, -34); x.lineTo(-34, 34); x.stroke();
        x.beginPath(); x.arc(0, 0, 12, 0, 7); x.stroke();
        x.restore(); }
        // name label near the base
        for (const cx of [0, w]) { x.save(); x.translate(cx, h * 0.86); x.scale(1 / ax, 1);
        x.fillStyle = '#0b0b0d'; x.fillRect(-170, -42, 340, 84);
        x.strokeStyle = gold; x.lineWidth = 3; x.strokeRect(-162, -34, 324, 68);
        x.fillStyle = gold; x.textAlign = 'center'; x.font = '600 34px Georgia'; x.fillText('STARRY NIGHTS', 0, 4);
        x.font = '18px Georgia'; x.fillText('EAU DE PARFUM', 0, 26);
        x.restore(); }
      });
      const glass = MT({ map: skin, metalness: 0.15, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.1 });
      const gold = M('#d6b25e', { m: 1, r: 0.22 }), goldDark = M('#a8833a', { m: 1, r: 0.35 });
      // bottle: lathe profile, then remap v to height so the gradient and decals sit right
      const prof = [[0, 0], [0.18, 0], [0.2, 0.02], [0.2, 0.95], [0.196, 0.995], [0.18, 1.04], [0.145, 1.085], [0.1, 1.12], [0.082, 1.14], [0.08, H]]
        .map(([r, y]) => new T.Vector2(r, y));
      const geo = new T.LatheGeometry(prof, 120);
      const pos = geo.attributes.position, uv = geo.attributes.uv;
      for (let i = 0; i < pos.count; i++) uv.setY(i, pos.getY(i) / H);
      g.add(part(geo, glass, [0, -0.7, 0]));
      // gold spray pump: ribbed collar, neck ring, actuator with nozzle
      const ribs = tex(256, 16, (x, w, h) => { for (let i = 0; i < w; i += 8) { x.fillStyle = '#fff'; x.fillRect(i, 0, 4, h); x.fillStyle = '#000'; x.fillRect(i + 4, 0, 4, h); } }, false);
      const top = -0.7 + H;
      g.add(part(new T.CylinderGeometry(0.11, 0.115, 0.13, 64), [MT({ color: '#d6b25e', metalness: 1, roughness: 0.3, bumpMap: ribs, bumpScale: 0.01 }), gold, gold], [0, top + 0.06, 0]));
      g.add(part(new T.TorusGeometry(0.112, 0.01, 10, 48), gold, [0, top + 0.125, 0], [Math.PI / 2, 0, 0]));
      g.add(part(new T.CylinderGeometry(0.03, 0.03, 0.05, 20), goldDark, [0, top + 0.15, 0]));
      g.add(part(new T.CylinderGeometry(0.065, 0.065, 0.1, 48), gold, [0, top + 0.22, 0]));
      g.add(part(new T.SphereGeometry(0.065, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), gold, [0, top + 0.27, 0], null, [1, 0.35, 1]));
      g.add(part(new T.CylinderGeometry(0.012, 0.012, 0.01, 12), M('#111'), [0, top + 0.23, 0.064], [Math.PI / 2, 0, 0]));
      g.userData.tilt = 0.1;
      return g;
    },
  };

  /* ---------- shared renderer ---------- */
  let renderer = null, canvas = null, envTex = null;
  const views = new Set();

  // Studio reflections: a port of three.js RoomEnvironment (from model-viewer), softboxes in a grey room.
  function makeEnv() {
    const env = new T.Scene();
    const geo = new T.BoxGeometry(); geo.deleteAttribute('uv');
    const roomMat = new T.MeshStandardMaterial({ side: T.BackSide }), boxMat = new T.MeshStandardMaterial();
    const light = new T.PointLight(0xffffff, 5.0, 28, 2); light.position.set(0.418, 16.199, 0.3); env.add(light);
    const add = (mat, p, s, ry = 0) => { const m = new T.Mesh(geo, mat); m.position.set(...p); m.scale.set(...s); m.rotation.y = ry; env.add(m); };
    add(roomMat, [-0.757, 13.219, 0.717], [31.713, 28.305, 28.591]);
    add(boxMat, [-10.906, 2.009, 1.846], [2.328, 7.905, 4.651], -0.195);
    add(boxMat, [-5.607, -0.754, -0.758], [1.97, 1.534, 3.955], 0.994);
    add(boxMat, [6.167, 0.857, 7.803], [3.927, 6.285, 3.687], 0.561);
    add(boxMat, [-2.017, 0.018, 6.124], [2.002, 4.566, 2.064], 0.333);
    add(boxMat, [2.291, -0.756, -2.621], [1.546, 1.552, 1.496], -0.286);
    add(boxMat, [-2.193, -0.369, -5.547], [3.875, 3.487, 2.986], 0.516);
    const area = (k) => { const m = new T.MeshBasicMaterial(); m.color.setScalar(k); return m; };
    add(area(50), [-16.116, 14.37, 8.208], [0.1, 2.428, 2.739]);
    add(area(50), [-16.109, 18.021, -8.207], [0.1, 2.425, 2.751]);
    add(area(17), [14.904, 12.198, -1.832], [0.15, 4.265, 6.331]);
    add(area(43), [-0.462, 8.89, 14.52], [4.38, 5.441, 0.088]);
    add(area(20), [3.235, 11.486, -12.541], [2.5, 2.0, 0.1]);
    add(area(100), [0, 20, 0], [1.0, 0.1, 1.0]);
    const tex = new T.PMREMGenerator(renderer).fromScene(env, 0.035).texture;
    env.traverse((n) => { if (n.geometry) n.geometry.dispose(); if (n.material) n.material.dispose(); });
    return tex;
  }

  function init() {
    canvas = document.createElement('canvas');
    canvas.className = 'gl-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
    catch (e) { document.documentElement.classList.add('no-webgl'); return; }
    renderer.setPixelRatio(Math.min(2, Math.max(1.5, window.devicePixelRatio || 1)));
    renderer.setClearColor(0xffffff, 0);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    envTex = makeEnv();
    requestAnimationFrame(loop);
  }

  // ground: a floor under a single object, or a back wall behind the wheel
  function baseScene(mode) {
    const scene = new T.Scene();
    scene.environment = envTex;

    const sun = new T.DirectionalLight(0xffffff, 2.2);
    sun.position.set(3, 8, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.radius = 4;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    const c = sun.shadow.camera; c.left = -7; c.right = 7; c.top = 7; c.bottom = -7; c.near = 1; c.far = 30;
    scene.add(sun);
    const fill = new T.DirectionalLight(0xfff4e8, 0.6); fill.position.set(-6, 3, 4); scene.add(fill);
    const rimL = new T.DirectionalLight(0xe8f0ff, 1.2); rimL.position.set(0, 4, -8); scene.add(rimL);
    if (mode !== 'wall') {
      const ground = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShadowMaterial({ opacity: 0.1 }));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -1.2; ground.receiveShadow = true;
      scene.add(ground);
    }
    return scene;
  }

  // Builds an object, normalised to `size`, wrapped as tilt > spin > object.
  function item(key, size) {
    const obj = (BUILDERS[key] || BUILDERS.goggles)(kit());
    const box = new T.Box3().setFromObject(obj), sz = new T.Vector3(), ctr = new T.Vector3();
    box.getSize(sz); box.getCenter(ctr);
    const norm = new T.Group();
    obj.position.sub(ctr);
    norm.add(obj);
    norm.scale.setScalar(size / Math.max(sz.x, sz.y, sz.z));
    const spin = new T.Group(); spin.add(norm);
    const tilt = new T.Group(); tilt.add(spin); tilt.rotation.x = obj.userData.tilt || 0;
    return { tilt, spin, obj };
  }

  function pointerNdc(el, e) {
    const r = el.getBoundingClientRect();
    return new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  /* Home: a wheel facing the viewer. Grab and spin it (it keeps momentum); click an object to open it. */
  const R = 3.1;
  function wheel(el, tabs, { onPick, onHover } = {}) {
    if (!renderer) return null;
    const scene = baseScene('wall');
    const rim = new T.Group(); scene.add(rim);
    // tabs marked `center: true` sit in the middle of the wheel (they spin but don't ride the rim)
    const onRim = tabs.filter((t) => !t.center), n = onRim.length;
    const items = tabs.map((t, i) => {
      const it = item(t.object, t.center ? 2.5 : 1.8);
      const holder = new T.Group();
      if (t.center) scene.add(holder);
      else {
        const a = (onRim.indexOf(t) / n) * Math.PI * 2;
        holder.position.set(Math.sin(a) * R, Math.cos(a) * R, 0);
        rim.add(holder);
      }
      holder.add(it.tilt);
      holder.userData.tab = t;
      it.spin.rotation.y = i * 0.9;
      return { ...it, holder, tab: t, center: !!t.center, hover: 0 };
    });
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 80);
    const v = { el, scene, camera, kind: 'wheel', items, rim, angle: 0, vel: 0.1, hovered: null, drag: null };
    const ray = new T.Raycaster();
    const pick = (e) => {
      ray.setFromCamera(pointerNdc(el, e), camera);
      const hit = ray.intersectObjects(items.map((x) => x.holder), true)[0];
      let o = hit && hit.object;
      while (o && !o.userData.tab) o = o.parent;
      return o ? items.find((x) => x.holder === o) : null;
    };
    const angleAt = (e) => {
      const r = el.getBoundingClientRect();
      return Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2)));
    };
    el.addEventListener('pointerdown', (e) => {
      v.drag = { a: angleAt(e), t: performance.now(), x: e.clientX, y: e.clientY, moved: false };
      v.vel = 0;
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    el.addEventListener('pointermove', (e) => {
      if (v.drag) {
        if (Math.hypot(e.clientX - v.drag.x, e.clientY - v.drag.y) > 6) v.drag.moved = true;
        if (v.drag.moved) {
          const a = angleAt(e), now = performance.now();
          let d = a - v.drag.a;
          if (d > Math.PI) d -= Math.PI * 2;
          if (d < -Math.PI) d += Math.PI * 2;
          v.angle -= d;
          const dt = Math.max((now - v.drag.t) / 1000, 0.001);
          v.vel = v.vel * 0.6 + (-d / dt) * 0.4;
          v.drag.a = a; v.drag.t = now;
        }
      }
      const h = v.drag && v.drag.moved ? null : pick(e);
      if (h !== v.hovered) { v.hovered = h; el.style.cursor = h ? 'pointer' : 'grab'; if (onHover) onHover(h ? h.tab : null); }
    });
    const end = (e) => {
      const d = v.drag; v.drag = null;
      if (!d) return;
      if (d.moved) { if (performance.now() - d.t > 120) v.vel = 0; return; }
      v.vel = 0.1;
      const h = pick(e);
      if (h && onPick) onPick(h.tab);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', () => { v.drag = null; });
    el.addEventListener('pointerleave', () => { if (!v.drag) { v.hovered = null; if (onHover) onHover(null); } });
    views.add(v);
    return () => { views.delete(v); dispose(scene); };
  }

  /* Tab page: one object turning on its own; drag to turn it. */
  function single(el, key) {
    if (!renderer) return null;
    const scene = baseScene('floor');
    const it = item(key, 2.3);
    scene.add(it.tilt);
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 1.8, 6.4); camera.lookAt(0, -0.1, 0);
    const v = { el, scene, camera, kind: 'single', it, drag: null, angle: 0 };
    el.addEventListener('pointerdown', (e) => { v.drag = { x: e.clientX, a: v.angle }; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', (e) => { if (v.drag) v.angle = v.drag.a + (e.clientX - v.drag.x) * 0.01; });
    el.addEventListener('pointerup', () => (v.drag = null));
    el.addEventListener('pointercancel', () => (v.drag = null));
    views.add(v);
    return () => { views.delete(v); dispose(scene); };
  }

  function dispose(o) { o.traverse((n) => { if (n.geometry) n.geometry.dispose(); if (n.material) [].concat(n.material).forEach((m) => m.dispose()); }); }

  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const t = now / 1000;
    const w = canvas.clientWidth, hgt = canvas.clientHeight, pr = renderer.getPixelRatio();
    if (canvas.width !== Math.floor(w * pr) || canvas.height !== Math.floor(hgt * pr)) renderer.setSize(w, hgt, false);
    renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
    const slow = reduceMotion ? 0.25 : 1;
    for (const v of views) {
      const r = v.el.getBoundingClientRect();
      if (r.width < 2 || r.bottom < 0 || r.top > hgt) continue;
      const aspect = r.width / r.height;
      v.camera.aspect = aspect;
      if (v.kind === 'wheel') {
        if (!v.drag) {
          // momentum with friction, settling back to a slow idle turn
          const idle = (v.hovered ? 0.02 : 0.1) * slow;
          v.vel += (idle - v.vel) * Math.min(1, dt * 0.9);
          v.angle += v.vel * dt;
        }
        v.rim.rotation.z = -v.angle;
        for (const it of v.items) {
          if (!it.center) it.holder.rotation.z = v.angle; // keep every object upright as the wheel turns
          it.spin.rotation.y += dt * 0.6 * slow;
          it.hover += ((v.hovered === it ? 1 : 0) - it.hover) * Math.min(1, dt * 8);
          it.holder.scale.setScalar(1 + it.hover * 0.15);
          if (it.obj.userData.tick) it.obj.userData.tick(t);
        }
        const vf = T.MathUtils.degToRad(v.camera.fov);
        const hf = 2 * Math.atan(Math.tan(vf / 2) * aspect);
        const E = R + 1.1;
        const d = E / Math.tan(Math.min(vf, hf) / 2) + 0.6;
        v.camera.position.set(0, 0, d);
        v.camera.lookAt(0, 0, 0);
      } else {
        if (!v.drag) v.angle += dt * 0.5 * slow;
        v.it.spin.rotation.y = v.angle;
        if (v.it.obj.userData.tick) v.it.obj.userData.tick(t);
      }
      v.camera.updateProjectionMatrix();
      const bottom = hgt - r.bottom;
      renderer.setViewport(r.left, bottom, r.width, r.height);
      renderer.setScissor(r.left, bottom, r.width, r.height);
      renderer.render(v.scene, v.camera);
    }
  }

  window.Objects = { init, wheel, single, builders: BUILDERS };
})();
