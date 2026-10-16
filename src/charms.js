// Original charm artwork, drawn with canvas paths.
// Each draw function paints a charm of size `s` centred on (0, 0).
// The rope attaches to a small bail ring at (0, -s/2 - 6).
(function () {
  const TAU = Math.PI * 2;

  function metal(ctx, s, light = '#fbe7a1', mid = '#d4a62a', dark = '#8a6412') {
    const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
    g.addColorStop(0, light);
    g.addColorStop(0.5, mid);
    g.addColorStop(1, dark);
    return g;
  }

  function bail(ctx, s, color = '#d4a62a') {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(0, -s / 2 - 4, 4, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function shine(ctx, x, y, r) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.75)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  function circle(ctx, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
  }

  function heartPath(ctx, w) {
    const h = w * 0.9;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45);
    ctx.bezierCurveTo(-w * 0.9, -h * 0.1, -w * 0.45, -h * 0.75, 0, -h * 0.3);
    ctx.bezierCurveTo(w * 0.45, -h * 0.75, w * 0.9, -h * 0.1, 0, h * 0.45);
    ctx.closePath();
  }

  function starPath(ctx, points, outer, inner, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 ? inner : outer;
      const a = rot + (i * Math.PI) / points;
      ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
  }

  function capsule(ctx, x, y, w, h) {
    const r = w / 2;
    ctx.beginPath();
    ctx.moveTo(x - r, y + h - r);
    ctx.lineTo(x - r, y + r);
    ctx.arc(x, y + r, r, Math.PI, 0);
    ctx.lineTo(x + r, y + h - r);
    ctx.arc(x, y + h - r, r, 0, Math.PI);
    ctx.closePath();
  }

  const DRAW = {
    nazar(ctx, s) {
      bail(ctx, s, '#c9d6ea');
      const r = s / 2;
      circle(ctx, r, '#123a8c');
      circle(ctx, r * 0.95, '#1d4fb8');
      circle(ctx, r * 0.68, '#ffffff');
      circle(ctx, r * 0.47, '#7cc4f2');
      circle(ctx, r * 0.25, '#0b0b12');
      shine(ctx, -r * 0.4, -r * 0.45, r * 0.45);
    },

    hamsa(ctx, s) {
      bail(ctx, s);
      const g = metal(ctx, s);
      ctx.fillStyle = g;
      // fingers
      const fw = s * 0.15;
      capsule(ctx, -s * 0.36, -s * 0.12, fw, s * 0.34); ctx.fill();
      capsule(ctx, -s * 0.18, -s * 0.46, fw, s * 0.55); ctx.fill();
      capsule(ctx, 0, -s * 0.5, fw, s * 0.6); ctx.fill();
      capsule(ctx, s * 0.18, -s * 0.46, fw, s * 0.55); ctx.fill();
      capsule(ctx, s * 0.36, -s * 0.12, fw, s * 0.34); ctx.fill();
      // palm
      ctx.beginPath();
      ctx.moveTo(-s * 0.43, s * 0.05);
      ctx.lineTo(s * 0.43, s * 0.05);
      ctx.quadraticCurveTo(s * 0.43, s * 0.5, 0, s * 0.5);
      ctx.quadraticCurveTo(-s * 0.43, s * 0.5, -s * 0.43, s * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-s * 0.3, -s * 0.1, s * 0.6, s * 0.2);
      // eye in the palm
      ctx.save();
      ctx.translate(0, s * 0.18);
      circle(ctx, s * 0.14, '#1d4fb8');
      circle(ctx, s * 0.09, '#ffffff');
      circle(ctx, s * 0.05, '#0b0b12');
      ctx.restore();
      shine(ctx, -s * 0.15, -s * 0.2, s * 0.25);
    },

    clover(ctx, s) {
      bail(ctx, s, '#b9d9a6');
      ctx.save();
      const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
      g.addColorStop(0, '#8fe07a');
      g.addColorStop(1, '#2f8a2a');
      ctx.fillStyle = g;
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 2 + Math.PI / 4);
        ctx.translate(0, -s * 0.22);
        heartPath(ctx, s * 0.36);
        ctx.fill();
        ctx.restore();
      }
      circle(ctx, s * 0.06, '#2a7a25');
      ctx.restore();
      shine(ctx, -s * 0.2, -s * 0.2, s * 0.2);
    },

    horseshoe(ctx, s) {
      bail(ctx, s, '#c0c4cc');
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineWidth = s * 0.2;
      ctx.strokeStyle = metal(ctx, s, '#f2f4f7', '#a9afba', '#5b616c');
      ctx.beginPath();
      // Arch opens downward so the bail sits at the top of the curve.
      const cy = s * 0.08;
      ctx.arc(0, cy, s * 0.36, Math.PI * 0.82, Math.PI * 2.18, false);
      ctx.stroke();
      ctx.fillStyle = '#4b505a';
      for (let i = 0; i < 6; i++) {
        const a = Math.PI * 0.95 + (i / 5) * Math.PI * 1.1;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * s * 0.36, cy + Math.sin(a) * s * 0.36, s * 0.025, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    },

    moon(ctx, s) {
      bail(ctx, s);
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, s / 2, 0, TAU);
      ctx.arc(s * 0.2, -s * 0.08, s * 0.42, 0, TAU, true);
      ctx.fillStyle = metal(ctx, s);
      ctx.fill('evenodd');
      ctx.restore();
      shine(ctx, -s * 0.3, -s * 0.15, s * 0.2);
    },

    star(ctx, s) {
      bail(ctx, s);
      starPath(ctx, 5, s / 2, s * 0.22);
      ctx.fillStyle = metal(ctx, s);
      ctx.fill();
      starPath(ctx, 5, s * 0.3, s * 0.13);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fill();
    },

    sun(ctx, s) {
      bail(ctx, s);
      starPath(ctx, 12, s / 2, s * 0.36);
      ctx.fillStyle = metal(ctx, s, '#ffe08a', '#f2a51a', '#b4620b');
      ctx.fill();
      circle(ctx, s * 0.3, '#ffcc3d');
      circle(ctx, s * 0.24, '#ffd95e');
      shine(ctx, -s * 0.1, -s * 0.12, s * 0.2);
    },

    heart(ctx, s) {
      bail(ctx, s, '#e7a1a8');
      ctx.save();
      ctx.translate(0, s * 0.05);
      heartPath(ctx, s * 0.62);
      const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
      g.addColorStop(0, '#ff8a9a');
      g.addColorStop(0.55, '#e3233f');
      g.addColorStop(1, '#8e0f22');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
      shine(ctx, -s * 0.18, -s * 0.12, s * 0.18);
    },

    lotus(ctx, s) {
      bail(ctx, s, '#f2b6cf');
      ctx.save();
      ctx.translate(0, s * 0.12);
      const petal = (angle, len, w, c1, c2) => {
        ctx.save();
        ctx.rotate(angle);
        const g = ctx.createLinearGradient(0, 0, 0, -len);
        g.addColorStop(0, c2);
        g.addColorStop(1, c1);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-w, -len * 0.5, 0, -len);
        ctx.quadraticCurveTo(w, -len * 0.5, 0, 0);
        ctx.fill();
        ctx.restore();
      };
      [-1.25, 1.25].forEach((a) => petal(a, s * 0.42, s * 0.16, '#f7c6da', '#c2457a'));
      [-0.65, 0.65].forEach((a) => petal(a, s * 0.52, s * 0.18, '#ffd6e6', '#d0538a'));
      petal(0, s * 0.6, s * 0.2, '#ffe4ef', '#e06a9c');
      ctx.fillStyle = '#2e8a6a';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.06, s * 0.36, s * 0.07, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    },

    bell(ctx, s) {
      bail(ctx, s);
      ctx.save();
      ctx.fillStyle = metal(ctx, s);
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.45);
      ctx.quadraticCurveTo(-s * 0.32, -s * 0.4, -s * 0.33, -s * 0.05);
      ctx.quadraticCurveTo(-s * 0.35, s * 0.22, -s * 0.48, s * 0.32);
      ctx.lineTo(s * 0.48, s * 0.32);
      ctx.quadraticCurveTo(s * 0.35, s * 0.22, s * 0.33, -s * 0.05);
      ctx.quadraticCurveTo(s * 0.32, -s * 0.4, s * 0.1, -s * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#8a6412';
      ctx.fillRect(-s * 0.48, s * 0.28, s * 0.96, s * 0.06);
      ctx.beginPath();
      ctx.arc(0, s * 0.42, s * 0.08, 0, TAU);
      ctx.fillStyle = '#b8891d';
      ctx.fill();
      ctx.restore();
      shine(ctx, -s * 0.14, -s * 0.15, s * 0.2);
    },
  };

  // ---------- Cute animals ----------
  function ellipse(ctx, x, y, rx, ry, fill, rot = 0) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
    ctx.fill();
  }

  function eyes(ctx, s, y, gap, r = 0.07) {
    [-gap, gap].forEach((x) => {
      ellipse(ctx, x * s, y * s, r * s, r * 1.15 * s, '#1b1b22');
      ellipse(ctx, x * s - r * 0.35 * s, y * s - r * 0.45 * s, r * 0.38 * s, r * 0.38 * s, '#ffffff');
    });
  }

  function blush(ctx, s, y, gap) {
    [-gap, gap].forEach((x) => ellipse(ctx, x * s, y * s, 0.07 * s, 0.045 * s, 'rgba(255,120,150,0.55)'));
  }

  function smile(ctx, s, y, w = 0.06) {
    ctx.save();
    ctx.strokeStyle = '#1b1b22';
    ctx.lineWidth = Math.max(1.2, s * 0.03);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-w * s / 2, y * s, w * s / 2, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.arc(w * s / 2, y * s, w * s / 2, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  function soft(ctx, s, c1, c2) {
    const g = ctx.createRadialGradient(-s * 0.15, -s * 0.2, s * 0.05, 0, 0, s * 0.6);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    return g;
  }

  Object.assign(DRAW, {
    cat(ctx, s) {
      bail(ctx, s, '#e9c9a4');
      const fur = soft(ctx, s, '#ffd9a8', '#e89b52');
      // ears
      ctx.fillStyle = fur;
      [-1, 1].forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d * s * 0.42, -s * 0.05);
        ctx.lineTo(d * s * 0.36, -s * 0.48);
        ctx.lineTo(d * s * 0.08, -s * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffb3c1';
        ctx.beginPath();
        ctx.moveTo(d * s * 0.34, -s * 0.14);
        ctx.lineTo(d * s * 0.33, -s * 0.38);
        ctx.lineTo(d * s * 0.17, -s * 0.26);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = fur;
      });
      ellipse(ctx, 0, s * 0.05, s * 0.46, s * 0.4, fur);
      // stripes
      ctx.fillStyle = '#d07a33';
      [-0.1, 0, 0.1].forEach((x) => {
        ctx.beginPath();
        ctx.ellipse(x * s, -s * 0.28, s * 0.025, s * 0.08, 0, 0, TAU);
        ctx.fill();
      });
      eyes(ctx, s, 0.02, 0.17);
      blush(ctx, s, 0.15, 0.28);
      ellipse(ctx, 0, s * 0.11, s * 0.04, s * 0.028, '#ff8fa3');
      smile(ctx, s, 0.13);
      // whiskers
      ctx.strokeStyle = 'rgba(60,40,30,0.6)';
      ctx.lineWidth = 1;
      [-1, 1].forEach((d) => [0.1, 0.17].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(d * s * 0.3, y * s);
        ctx.lineTo(d * s * 0.5, (y - 0.03 + (y - 0.13)) * s);
        ctx.stroke();
      }));
    },

    owl(ctx, s) {
      bail(ctx, s, '#c9a882');
      const body = soft(ctx, s, '#b98a5e', '#6e4a2c');
      // ear tufts
      ctx.fillStyle = body;
      [-1, 1].forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d * s * 0.42, -s * 0.18);
        ctx.lineTo(d * s * 0.38, -s * 0.46);
        ctx.lineTo(d * s * 0.16, -s * 0.32);
        ctx.closePath();
        ctx.fill();
      });
      ellipse(ctx, 0, s * 0.04, s * 0.42, s * 0.46, body);
      // belly
      ellipse(ctx, 0, s * 0.24, s * 0.24, s * 0.22, '#f1dcbc');
      ctx.strokeStyle = '#c7a57a';
      ctx.lineWidth = 1.2;
      [[0, 0.18], [-0.1, 0.27], [0.1, 0.27], [0, 0.35]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x * s, y * s, s * 0.04, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      });
      // big eye discs
      [-1, 1].forEach((d) => {
        ellipse(ctx, d * s * 0.17, -s * 0.12, s * 0.16, s * 0.16, '#fff6e6');
        ellipse(ctx, d * s * 0.17, -s * 0.12, s * 0.1, s * 0.1, '#f2b134');
        ellipse(ctx, d * s * 0.17, -s * 0.12, s * 0.065, s * 0.065, '#1b1b22');
        ellipse(ctx, d * s * 0.17 - s * 0.025, -s * 0.15, s * 0.025, s * 0.025, '#fff');
      });
      // beak
      ctx.fillStyle = '#f29a2e';
      ctx.beginPath();
      ctx.moveTo(-s * 0.05, s * 0.0);
      ctx.lineTo(s * 0.05, s * 0.0);
      ctx.lineTo(0, s * 0.09);
      ctx.closePath();
      ctx.fill();
    },

    panda(ctx, s) {
      bail(ctx, s, '#d9d9de');
      // ears
      ellipse(ctx, -s * 0.33, -s * 0.3, s * 0.14, s * 0.14, '#1f1f26');
      ellipse(ctx, s * 0.33, -s * 0.3, s * 0.14, s * 0.14, '#1f1f26');
      ellipse(ctx, 0, s * 0.03, s * 0.46, s * 0.41, soft(ctx, s, '#ffffff', '#dedfe6'));
      // eye patches
      ellipse(ctx, -s * 0.17, -s * 0.0, s * 0.11, s * 0.14, '#1f1f26', -0.5);
      ellipse(ctx, s * 0.17, -s * 0.0, s * 0.11, s * 0.14, '#1f1f26', 0.5);
      [-1, 1].forEach((d) => {
        ellipse(ctx, d * s * 0.16, -s * 0.01, s * 0.045, s * 0.05, '#ffffff');
        ellipse(ctx, d * s * 0.16, -s * 0.0, s * 0.028, s * 0.032, '#1b1b22');
      });
      blush(ctx, s, 0.17, 0.3);
      ellipse(ctx, 0, s * 0.13, s * 0.055, s * 0.035, '#1f1f26');
      smile(ctx, s, 0.16);
    },

    bunny(ctx, s) {
      bail(ctx, s, '#f3d6e0');
      const fur = soft(ctx, s, '#ffffff', '#ecdfe6');
      // long ears (hang from the top)
      [-1, 1].forEach((d) => {
        ellipse(ctx, d * s * 0.15, -s * 0.28, s * 0.1, s * 0.26, fur, d * 0.18);
        ellipse(ctx, d * s * 0.15, -s * 0.27, s * 0.05, s * 0.19, '#ffc2d1', d * 0.18);
      });
      ellipse(ctx, 0, s * 0.18, s * 0.38, s * 0.32, fur);
      eyes(ctx, s, 0.13, 0.15, 0.06);
      blush(ctx, s, 0.25, 0.24);
      ellipse(ctx, 0, s * 0.23, s * 0.035, s * 0.025, '#ff8fa3');
      smile(ctx, s, 0.25, 0.05);
      // teeth
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.rect(-s * 0.03, s * 0.29, s * 0.06, s * 0.05);
      ctx.fill();
      ctx.stroke();
    },

    fox(ctx, s) {
      bail(ctx, s, '#f0b27a');
      const fur = soft(ctx, s, '#ffb15e', '#e0601c');
      ctx.fillStyle = fur;
      [-1, 1].forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d * s * 0.46, -s * 0.06);
        ctx.lineTo(d * s * 0.4, -s * 0.5);
        ctx.lineTo(d * s * 0.1, -s * 0.24);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#3a2418';
        ctx.beginPath();
        ctx.moveTo(d * s * 0.37, -s * 0.36);
        ctx.lineTo(d * s * 0.4, -s * 0.5);
        ctx.lineTo(d * s * 0.29, -s * 0.42);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = fur;
      });
      // head: wide at top, pointed muzzle
      ctx.beginPath();
      ctx.moveTo(-s * 0.48, -s * 0.12);
      ctx.quadraticCurveTo(0, -s * 0.42, s * 0.48, -s * 0.12);
      ctx.quadraticCurveTo(s * 0.4, s * 0.25, 0, s * 0.42);
      ctx.quadraticCurveTo(-s * 0.4, s * 0.25, -s * 0.48, -s * 0.12);
      ctx.fill();
      // white cheeks
      ctx.fillStyle = '#fff4e8';
      ctx.beginPath();
      ctx.moveTo(-s * 0.44, s * 0.02);
      ctx.quadraticCurveTo(-s * 0.15, s * 0.04, 0, s * 0.42);
      ctx.quadraticCurveTo(s * 0.15, s * 0.04, s * 0.44, s * 0.02);
      ctx.quadraticCurveTo(s * 0.3, s * 0.3, 0, s * 0.42);
      ctx.quadraticCurveTo(-s * 0.3, s * 0.3, -s * 0.44, s * 0.02);
      ctx.fill();
      eyes(ctx, s, -0.04, 0.16, 0.06);
      ellipse(ctx, 0, s * 0.33, s * 0.05, s * 0.035, '#1f1f26');
    },

    penguin(ctx, s) {
      bail(ctx, s, '#c9d6ea');
      ellipse(ctx, 0, s * 0.04, s * 0.4, s * 0.46, soft(ctx, s, '#4a5470', '#1c2236'));
      // flippers
      ellipse(ctx, -s * 0.38, s * 0.12, s * 0.08, s * 0.2, '#1c2236', 0.35);
      ellipse(ctx, s * 0.38, s * 0.12, s * 0.08, s * 0.2, '#1c2236', -0.35);
      // white face + belly
      ellipse(ctx, 0, s * 0.14, s * 0.28, s * 0.34, '#fbfbff');
      ellipse(ctx, -s * 0.12, -s * 0.12, s * 0.15, s * 0.14, '#fbfbff');
      ellipse(ctx, s * 0.12, -s * 0.12, s * 0.15, s * 0.14, '#fbfbff');
      eyes(ctx, s, -0.12, 0.12, 0.055);
      blush(ctx, s, -0.01, 0.2);
      // beak
      ctx.fillStyle = '#f7a531';
      ctx.beginPath();
      ctx.moveTo(-s * 0.06, -s * 0.04);
      ctx.lineTo(s * 0.06, -s * 0.04);
      ctx.lineTo(0, s * 0.05);
      ctx.closePath();
      ctx.fill();
      // feet
      ellipse(ctx, -s * 0.12, s * 0.49, s * 0.09, s * 0.04, '#f7a531');
      ellipse(ctx, s * 0.12, s * 0.49, s * 0.09, s * 0.04, '#f7a531');
    },
  });

  const imageCache = new Map();

  function drawCustom(ctx, s, dataUrl) {
    let img = imageCache.get(dataUrl);
    if (!img) {
      img = new Image();
      img.src = dataUrl;
      imageCache.set(dataUrl, img);
    }
    bail(ctx, s, '#d9d9de');
    if (!img.complete || !img.naturalWidth) return;
    const k = (s * 1.25) / Math.max(img.naturalWidth, img.naturalHeight);
    const w = img.naturalWidth * k;
    const h = img.naturalHeight * k;
    // Hang from the top edge of the image.
    ctx.drawImage(img, -w / 2, -s / 2, w, h);
  }

  window.TasselCharms = { DRAW, drawCustom };
})();
