"use client";

import { useEffect, useRef } from "react";

/**
 * SkylineCanvas — full-bleed cinematic Shenzhen Bay night skyline.
 *
 * Three parallax layers of city silhouette + rain + drones + neon
 * billboards rendered to a single Canvas. Deterministic seeded layout
 * so SSR/CSR don't drift and the towers don't reshuffle on resize.
 */

// Tiny seeded PRNG (mulberry32) for stable layouts
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Building = { x: number; w: number; h: number; lights: number[]; hue: number; tag?: string; antenna?: boolean };
type Drone   = { x: number; y: number; vx: number; vy: number; hue: number; size: number; trail: { x: number; y: number }[] };
type Rain    = { x: number; y: number; v: number; len: number };

function makeLayer(width: number, height: number, count: number, seed: number, minH: number, maxH: number) {
  const r = rng(seed);
  const buildings: Building[] = [];
  let x = -20;
  for (let i = 0; i < count; i++) {
    const w = 14 + r() * 56;
    const h = minH + r() * (maxH - minH);
    const lights: number[] = [];
    const rows = Math.floor(h / 9);
    const cols = Math.max(2, Math.floor(w / 6));
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (r() < 0.45) lights.push(row * cols + col);
      }
    }
    const hue = r();
    const antenna = r() < 0.4;
    const tag = r() < 0.18 ? ["龙岗 TECH", "湾区 NET", "前海 AI", "南山 OPS", "保安 DRONE", "数据港", "光启 BIO", "云海 ★", "渡 ZONE"][Math.floor(r() * 9)] : undefined;
    buildings.push({ x, w, h, lights, hue, tag, antenna });
    x += w + 2;
    if (x > width + 40) break;
  }
  return buildings;
}

export default function SkylineCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let layers: { speed: number; offset: number; buildings: Building[]; baseY: number; alpha: number; }[] = [];
    let rain: Rain[] = [];
    let drones: Drone[] = [];

    function setSize() {
      const r = wrap!.getBoundingClientRect();
      W = Math.max(360, Math.floor(r.width));
      H = Math.max(360, Math.floor(r.height));
      canvas!.width = Math.floor(W * DPR);
      canvas!.height = Math.floor(H * DPR);
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);

      // Three skyline depths
      layers = [
        { speed: 0.6,  offset: 0, buildings: makeLayer(W * 2, H, 28, 7301, H * 0.30, H * 0.50), baseY: H * 0.92, alpha: 1.0 },
        { speed: 0.35, offset: 0, buildings: makeLayer(W * 2, H, 22, 5519, H * 0.40, H * 0.65), baseY: H * 0.86, alpha: 0.75 },
        { speed: 0.18, offset: 0, buildings: makeLayer(W * 2, H, 18, 1297, H * 0.50, H * 0.80), baseY: H * 0.80, alpha: 0.45 },
      ];

      // Rain ~250 drops
      rain = Array.from({ length: 250 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        v: 380 + Math.random() * 520,
        len: 8 + Math.random() * 16,
      }));

      // Drones — about a dozen flying neon dots
      drones = Array.from({ length: 14 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H * 0.55,
        vx: 30 + Math.random() * 70,
        vy: (Math.random() - 0.5) * 12,
        hue: Math.random(),
        size: 1.2 + Math.random() * 1.4,
        trail: [],
      }));
    }

    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(wrap);

    let mouseX = 0;
    const onMove = (e: MouseEvent) => {
      const r = wrap!.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width - 0.5;
    };
    window.addEventListener("mousemove", onMove);

    let last = performance.now();
    let raf = 0;
    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // ── Background gradient + low fog ──────────────────────────────
      const g = ctx!.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#040618");
      g.addColorStop(0.45, "#07112a");
      g.addColorStop(0.85, "#0a1530");
      g.addColorStop(1, "#03050d");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, W, H);

      // Distant moon / neon halo
      const halo = ctx!.createRadialGradient(W * 0.28, H * 0.22, 0, W * 0.28, H * 0.22, 220);
      halo.addColorStop(0, "rgba(255, 45, 202, 0.35)");
      halo.addColorStop(1, "rgba(255, 45, 202, 0)");
      ctx!.fillStyle = halo;
      ctx!.fillRect(0, 0, W, H);

      const halo2 = ctx!.createRadialGradient(W * 0.78, H * 0.32, 0, W * 0.78, H * 0.32, 260);
      halo2.addColorStop(0, "rgba(0, 224, 255, 0.30)");
      halo2.addColorStop(1, "rgba(0, 224, 255, 0)");
      ctx!.fillStyle = halo2;
      ctx!.fillRect(0, 0, W, H);

      // Volumetric fog band
      const fog = ctx!.createLinearGradient(0, H * 0.55, 0, H * 0.95);
      fog.addColorStop(0, "rgba(10, 18, 38, 0)");
      fog.addColorStop(0.5, "rgba(8, 14, 30, 0.7)");
      fog.addColorStop(1, "rgba(3, 5, 13, 0.95)");
      ctx!.fillStyle = fog;
      ctx!.fillRect(0, H * 0.55, W, H * 0.45);

      // ── Skyline layers ─────────────────────────────────────────────
      for (let li = layers.length - 1; li >= 0; li--) {
        const L = layers[li];
        L.offset -= L.speed * 14 * dt;
        if (L.offset < -W) L.offset += W;

        // Parallax with mouse
        const parallax = mouseX * (8 + (2 - li) * 14);
        const ox = L.offset - parallax;

        ctx!.save();
        ctx!.globalAlpha = L.alpha;
        // Building silhouettes
        for (const b of L.buildings) {
          const bx = b.x + ox;
          // wrap-around: draw two copies
          for (const xx of [bx, bx + (W * 2)]) {
            if (xx + b.w < 0 || xx > W) continue;
            // body
            ctx!.fillStyle = li === 0 ? "#06091a" : li === 1 ? "#080d22" : "#0a1230";
            ctx!.fillRect(xx, L.baseY - b.h, b.w, b.h);
            // top neon edge
            ctx!.strokeStyle = b.hue > 0.5 ? "rgba(0,224,255,0.35)" : "rgba(255,45,202,0.30)";
            ctx!.lineWidth = 0.8;
            ctx!.beginPath();
            ctx!.moveTo(xx, L.baseY - b.h);
            ctx!.lineTo(xx + b.w, L.baseY - b.h);
            ctx!.stroke();

            // window lights (only for nearer layers)
            if (li <= 1) {
              const cols = Math.max(2, Math.floor(b.w / 6));
              const rows = Math.floor(b.h / 9);
              for (let idx = 0; idx < b.lights.length; idx++) {
                const row = Math.floor(b.lights[idx] / cols);
                const col = b.lights[idx] % cols;
                if (row >= rows) continue;
                // sparkle flicker
                const flick = 0.4 + 0.6 * (Math.sin(now * 0.003 + idx * 1.7 + xx) * 0.5 + 0.5);
                ctx!.fillStyle = b.hue > 0.7
                  ? `rgba(255, 45, 202, ${0.35 * flick})`
                  : b.hue > 0.4
                    ? `rgba(0, 224, 255, ${0.55 * flick})`
                    : `rgba(255, 215, 130, ${0.5 * flick})`;
                ctx!.fillRect(xx + 2 + col * (b.w / cols), L.baseY - b.h + 4 + row * 8, Math.max(1.4, (b.w / cols) - 2), 3);
              }
            }
            // antenna
            if (b.antenna) {
              ctx!.strokeStyle = "rgba(0,224,255,0.7)";
              ctx!.lineWidth = 1;
              ctx!.beginPath();
              ctx!.moveTo(xx + b.w / 2, L.baseY - b.h);
              ctx!.lineTo(xx + b.w / 2, L.baseY - b.h - 14);
              ctx!.stroke();
              // blinking tip
              const blink = (Math.sin(now * 0.006 + xx) * 0.5 + 0.5);
              ctx!.fillStyle = `rgba(255, 45, 202, ${blink})`;
              ctx!.fillRect(xx + b.w / 2 - 1, L.baseY - b.h - 17, 2, 2);
            }
            // billboard tag
            if (b.tag && li === 0 && b.h > H * 0.32) {
              ctx!.save();
              ctx!.translate(xx + b.w / 2, L.baseY - b.h * 0.55);
              ctx!.font = '600 9px "JetBrains Mono", monospace';
              ctx!.fillStyle = "rgba(255, 45, 202, 0.85)";
              ctx!.textAlign = "center";
              ctx!.fillText(b.tag, 0, 0);
              ctx!.restore();
            }
          }
        }
        ctx!.restore();
      }

      // ── Bay water reflection band ───────────────────────────────────
      ctx!.save();
      ctx!.globalAlpha = 0.18;
      const refl = ctx!.createLinearGradient(0, H * 0.92, 0, H);
      refl.addColorStop(0, "rgba(0,224,255,0.4)");
      refl.addColorStop(1, "rgba(0,224,255,0)");
      ctx!.fillStyle = refl;
      ctx!.fillRect(0, H * 0.92, W, H * 0.08);
      ctx!.restore();

      // ── Drones ──────────────────────────────────────────────────────
      for (const d of drones) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.x > W + 30) { d.x = -30; d.y = Math.random() * H * 0.55; d.trail = []; }
        if (d.y < 30 || d.y > H * 0.7) d.vy *= -1;
        d.trail.push({ x: d.x, y: d.y });
        if (d.trail.length > 22) d.trail.shift();

        // trail
        for (let i = 0; i < d.trail.length; i++) {
          const a = i / d.trail.length;
          ctx!.fillStyle = d.hue > 0.5
            ? `rgba(0, 224, 255, ${a * 0.6})`
            : `rgba(255, 45, 202, ${a * 0.6})`;
          ctx!.fillRect(d.trail[i].x, d.trail[i].y, d.size * (0.5 + a * 0.7), d.size * (0.5 + a * 0.7));
        }
        // body
        ctx!.fillStyle = "#ffffff";
        ctx!.fillRect(d.x, d.y, d.size * 1.4, d.size * 1.4);
      }

      // ── Rain ────────────────────────────────────────────────────────
      ctx!.strokeStyle = "rgba(125, 240, 255, 0.18)";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      for (const r of rain) {
        r.y += r.v * dt;
        r.x -= r.v * 0.06 * dt; // slight wind
        if (r.y > H) { r.y = -r.len; r.x = Math.random() * W; }
        if (r.x < 0)  r.x += W;
        ctx!.moveTo(r.x, r.y);
        ctx!.lineTo(r.x - 2, r.y + r.len);
      }
      ctx!.stroke();

      // ── Vignette ────────────────────────────────────────────────────
      const vg = ctx!.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.85);
      vg.addColorStop(0, "rgba(3,5,13,0)");
      vg.addColorStop(1, "rgba(3,5,13,0.7)");
      ctx!.fillStyle = vg;
      ctx!.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  );
}
