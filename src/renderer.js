// Tassel — renderer: rope physics (Verlet) + drawing + interaction.
(function () {
  const { CHARM_CATALOG, LENGTHS } = window.TasselCatalog;
  const { DRAW, drawCustom } = window.TasselCharms;

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  const SEGMENTS = 14;
  const CHARM_SIZE = 54;
  const GRAVITY = 1400;          // px/s²
  const STEP = 1 / 120;          // fixed physics step
  const ITERATIONS = 18;
  const HIT_RADIUS = CHARM_SIZE * 0.75;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = reducedMotionQuery.matches;
  reducedMotionQuery.addEventListener('change', (e) => { reducedMotion = e.matches; });

  let state = { charms: [], custom: [], rope: 'thread', length: 'medium', topInset: 0 };
  let ropes = [];                // [{ id, anchor:{x,y}, pts:[{x,y,px,py}], segLen, weight }]
  let dpr = 1;

  // ---------- setup ----------
  function resize() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    layoutAnchors();
  }

  function anchorFor(i) {
    // Hang from the right part of the top edge, spaced apart.
    return { x: innerWidth - 220 - i * 95, y: state.topInset };
  }

  function makeRope(id, i, old) {
    const length = LENGTHS[state.length] || LENGTHS.medium;
    const segLen = length / SEGMENTS;
    const anchor = anchorFor(i);
    const meta = CHARM_CATALOG.find((c) => c.id === id);
    const weight = meta ? meta.weight : 1;

    // Reuse existing points if the rope survives a settings change (no jump).
    if (old && old.pts.length === SEGMENTS + 1 && Math.abs(old.segLen - segLen) < 0.01) {
      return { ...old, anchor, weight };
    }
    const pts = [];
    // Start with a slight sideways offset so it gently swings in.
    for (let k = 0; k <= SEGMENTS; k++) {
      const x = anchor.x + k * segLen * 0.35;
      const y = anchor.y + k * segLen * 0.94;
      pts.push({ x, y, px: x, py: y });
    }
    return { id, anchor, pts, segLen, weight };
  }

  function rebuild() {
    const prev = new Map(ropes.map((r) => [r.id, r]));
    ropes = state.charms
      .filter((id) => DRAW[id] || state.custom.some((c) => c.id === id))
      .map((id, i) => makeRope(id, i, prev.get(id)));
  }

  function layoutAnchors() {
    ropes.forEach((r, i) => { r.anchor = anchorFor(i); });
  }

  // ---------- physics ----------
  function simulate(dt) {
    const damping = reducedMotion ? 0.94 : 0.996;
    for (const r of ropes) {
      const pts = r.pts;
      // integrate
      for (let k = 1; k < pts.length; k++) {
        const p = pts[k];
        if (p.pinned) continue;
        const vx = (p.x - p.px) * damping;
        const vy = (p.y - p.py) * damping;
        p.px = p.x; p.py = p.y;
        p.x += vx;
        p.y += vy + GRAVITY * dt * dt;
      }
      // anchor
      pts[0].x = pts[0].px = r.anchor.x;
      pts[0].y = pts[0].py = r.anchor.y;

      // constraints — the last point carries the charm's weight
      for (let it = 0; it < ITERATIONS; it++) {
        for (let k = 0; k < pts.length - 1; k++) {
          const a = pts[k], b = pts[k + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const diff = (dist - r.segLen) / dist;
          let wa = k === 0 || a.pinned ? 0 : 1;
          let wb = b.pinned ? 0 : (k + 1 === pts.length - 1 ? 1 / (1 + r.weight * 4) : 1);
          const sum = wa + wb;
          if (!sum) continue;
          wa /= sum; wb /= sum;
          a.x += dx * diff * wa; a.y += dy * diff * wa;
          b.x -= dx * diff * wb; b.y -= dy * diff * wb;
        }
      }
    }
  }

  // ---------- drawing ----------
  function ropePath(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let k = 1; k < pts.length - 1; k++) {
      const mx = (pts[k].x + pts[k + 1].x) / 2;
      const my = (pts[k].y + pts[k + 1].y) / 2;
      ctx.quadraticCurveTo(pts[k].x, pts[k].y, mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  function samplePolyline(pts, spacing) {
    const out = [];
    let carry = 0;
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], b = pts[k + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      let t = carry;
      while (t < len) {
        out.push({ x: a.x + (b.x - a.x) * (t / len), y: a.y + (b.y - a.y) * (t / len), ang });
        t += spacing;
      }
      carry = t - len;
    }
    return out;
  }

  function drawChain(pts, light, dark) {
    const links = samplePolyline(pts, 6);
    ctx.lineWidth = 1.6;
    links.forEach((l, i) => {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.ang);
      ctx.strokeStyle = i % 2 ? dark : light;
      ctx.beginPath();
      if (i % 2) ctx.ellipse(0, 0, 4.2, 1.2, 0, 0, Math.PI * 2);
      else ctx.ellipse(0, 0, 4.2, 2.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawRope(r) {
    const pts = r.pts;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    switch (state.rope) {
      case 'leather':
        ropePath(pts); ctx.strokeStyle = '#4a2c17'; ctx.lineWidth = 4; ctx.stroke();
        ropePath(pts); ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 1.4; ctx.stroke();
        break;
      case 'gold':
        drawChain(pts, '#f5d77a', '#b8891d');
        break;
      case 'silver':
        drawChain(pts, '#eef0f4', '#9aa1ad');
        break;
      case 'neon':
        ctx.shadowColor = '#ff3df0'; ctx.shadowBlur = 14;
        ropePath(pts); ctx.strokeStyle = '#ff7af5'; ctx.lineWidth = 2.6; ctx.stroke();
        ctx.shadowBlur = 0;
        ropePath(pts); ctx.strokeStyle = '#fff0fe'; ctx.lineWidth = 0.9; ctx.stroke();
        break;
      case 'spider':
        ropePath(pts); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.7; ctx.stroke();
        break;
      case 'midnight':
        ctx.shadowColor = 'rgba(90,120,255,0.6)'; ctx.shadowBlur = 6;
        ropePath(pts); ctx.strokeStyle = '#1c2552'; ctx.lineWidth = 3; ctx.stroke();
        break;
      case 'temple':
        ropePath(pts); ctx.strokeStyle = '#c4161c'; ctx.lineWidth = 3; ctx.stroke();
        ctx.setLineDash([4, 4]);
        ropePath(pts); ctx.strokeStyle = '#f7c21b'; ctx.lineWidth = 3; ctx.stroke();
        ctx.setLineDash([]);
        break;
      case 'thread':
      default:
        ropePath(pts); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2.4; ctx.stroke();
        ropePath(pts); ctx.strokeStyle = '#efe7d8'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.restore();
  }

  function charmCenter(r) {
    const n = r.pts.length;
    const end = r.pts[n - 1], prev = r.pts[n - 2];
    const ang = Math.atan2(end.y - prev.y, end.x - prev.x) - Math.PI / 2;
    const off = CHARM_SIZE / 2 + 8;
    return { x: end.x - Math.sin(ang) * off, y: end.y + Math.cos(ang) * off, ang, end };
  }

  function drawCharm(r) {
    const c = charmCenter(r);
    ctx.save();
    ctx.translate(c.end.x, c.end.y);
    ctx.rotate(c.ang);
    ctx.translate(0, CHARM_SIZE / 2 + 8);
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    const custom = state.custom.find((x) => x.id === r.id);
    if (custom) drawCustom(ctx, CHARM_SIZE, custom.dataUrl);
    else DRAW[r.id](ctx, CHARM_SIZE);
    ctx.restore();
  }

  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const r of ropes) { drawRope(r); drawCharm(r); }
  }

  // ---------- interaction ----------
  let mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: performance.now() };
  let dragging = null;
  let clickThrough = true;

  function setClickThrough(on) {
    if (on === clickThrough) return;
    clickThrough = on;
    window.tassel.setClickThrough(on);
  }

  function hitRope(x, y) {
    for (const r of ropes) {
      const c = charmCenter(r);
      if (Math.hypot(c.x - x, c.y - y) < HIT_RADIUS) return r;
    }
    return null;
  }

  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    const dt = Math.max(1, now - mouse.t) / 1000;
    mouse.vx = (e.clientX - mouse.x) / dt;
    mouse.vy = (e.clientY - mouse.y) / dt;
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.t = now;

    if (dragging) return;
    const hit = hitRope(mouse.x, mouse.y);
    setClickThrough(!hit);
    document.body.className = hit ? 'grab' : '';

    // Brushing past a charm gives it a nudge.
    if (hit && Math.abs(mouse.vx) < 5000) {
      const end = hit.pts[hit.pts.length - 1];
      const k = reducedMotion ? 0.0008 : 0.004;
      end.px -= mouse.vx * k;
      end.py -= mouse.vy * k * 0.5;
    }
  });

  window.addEventListener('mousedown', (e) => {
    const hit = hitRope(e.clientX, e.clientY);
    if (!hit) return;
    dragging = hit;
    hit.pts[hit.pts.length - 1].pinned = true;
    document.body.className = 'grabbing';
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    const end = dragging.pts[dragging.pts.length - 1];
    end.pinned = false;
    // keep the throw momentum (velocity per physics step)
    const cap = 40;
    end.px = end.x - Math.max(-cap, Math.min(cap, mouse.vx * STEP));
    end.py = end.y - Math.max(-cap, Math.min(cap, mouse.vy * STEP));
    dragging = null;
    document.body.className = '';
    setClickThrough(!hitRope(mouse.x, mouse.y));
  });

  function applyDrag() {
    if (!dragging) return;
    const r = dragging;
    const end = r.pts[r.pts.length - 1];
    const maxLen = r.segLen * SEGMENTS;
    let dx = mouse.x - r.anchor.x, dy = mouse.y - r.anchor.y;
    const d = Math.hypot(dx, dy);
    if (d > maxLen) { dx *= maxLen / d; dy *= maxLen / d; }
    end.px = end.x; end.py = end.y;
    end.x = r.anchor.x + dx;
    end.y = r.anchor.y + dy;
  }

  // ---------- loop ----------
  let last = performance.now();
  let acc = 0;
  function frame(now) {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= STEP) {
      applyDrag();
      simulate(STEP);
      acc -= STEP;
    }
    render();
    requestAnimationFrame(frame);
  }

  window.tassel.onState((s) => {
    const lengthChanged = s.length !== state.length;
    state = s;
    if (lengthChanged) ropes = [];
    rebuild();
    layoutAnchors();
  });

  window.addEventListener('resize', resize);
  resize();
  window.tassel.ready();
  requestAnimationFrame(frame);
})();
