"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ArenaGame — top-down canvas arena survival
 *
 * Controls:
 *   WASD / Arrows — move
 *   Mouse         — aim
 *   Click / Space — fire plasma
 *   E             — EMP burst (clears drones in radius, on cooldown)
 *   R             — reset / start
 *   P             — pause
 *
 * Enemies: scouts (slow, straight line), chasers (homing, faster),
 * kamikaze (very fast, explodes near player). Waves intensify.
 */

type Vec = { x: number; y: number };
type Bullet = Vec & { vx: number; vy: number; life: number; pwr: number };
type Drone  = Vec & { vx: number; vy: number; hp: number; r: number; kind: "scout" | "chaser" | "kami"; alive: boolean; flash: number };
type Particle = Vec & { vx: number; vy: number; life: number; max: number; color: string; size: number };
type Shockwave = Vec & { r: number; max: number; life: number; tone: "emp" | "kami" };

const W = 1280;
const H = 720;
const PLAYER_R = 14;
const MAX_HP = 100;
const MAX_AMMO = 36;
const RELOAD_TIME = 1.4;       // seconds for a full reload
const FIRE_COOLDOWN = 0.16;
const BULLET_SPEED = 720;
const BULLET_LIFE = 1.0;
const PLAYER_SPEED = 240;
const EMP_RADIUS = 320;
const EMP_MAX = 3;
const EMP_REGEN = 8;           // seconds per charge

export default function ArenaGame() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"menu" | "playing" | "paused" | "dead">("menu");
  const [hud, setHud] = useState({ hp: MAX_HP, ammo: MAX_AMMO, reloadT: 0, emp: EMP_MAX, empT: 0, wave: 1, score: 0, kills: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- Sizing ─ logical W×H, scaled to fit container ─────────────────────────
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    function fit() {
      const r = wrap!.getBoundingClientRect();
      const sw = r.width;
      const sh = sw * (H / W); // keep 16:9
      canvas!.style.width = `${sw}px`;
      canvas!.style.height = `${sh}px`;
      canvas!.width = Math.floor(W * DPR);
      canvas!.height = Math.floor(H * DPR);
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    // --- World state ───────────────────────────────────────────────────────────
    const player: Vec = { x: W / 2, y: H / 2 };
    let aim: Vec = { x: W / 2 + 50, y: H / 2 };
    let bullets: Bullet[] = [];
    let drones: Drone[] = [];
    let particles: Particle[] = [];
    let waves: Shockwave[] = [];
    let hp = MAX_HP;
    let ammo = MAX_AMMO;
    let reloading = false;
    let reloadT = 0;
    let fireCD = 0;
    let emp = EMP_MAX;
    let empT = 0;
    let wave = 1;
    let waveTimer = 0;
    let spawnTimer = 0;
    let toSpawn = 0;
    let score = 0;
    let kills = 0;
    let running = false;
    let paused = false;
    let dead = false;

    const keys = new Set<string>();
    let firing = false;

    const startWave = (n: number) => {
      wave = n;
      const base = 6 + Math.floor(n * 1.8);
      toSpawn = base;
      spawnTimer = 0;
      waveTimer = 0;
    };

    const reset = () => {
      player.x = W / 2; player.y = H / 2;
      bullets = []; drones = []; particles = []; waves = [];
      hp = MAX_HP; ammo = MAX_AMMO; reloading = false; reloadT = 0; fireCD = 0;
      emp = EMP_MAX; empT = 0; score = 0; kills = 0; dead = false; paused = false;
      startWave(1);
      running = true;
      setState("playing");
    };

    const onKey = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      if (down) keys.add(k); else keys.delete(k);
      if (down) {
        if (k === "r") reset();
        if (k === "p" && running) { paused = !paused; setState(paused ? "paused" : "playing"); }
        if (k === " " && running && !paused && !dead) firing = true;
        if (k === "e" && running && !paused && !dead && emp > 0) {
          emp--;
          empT = 0;
          waves.push({ x: player.x, y: player.y, r: 0, max: EMP_RADIUS, life: 0.55, tone: "emp" });
          for (const d of drones) {
            if (!d.alive) continue;
            const dx = d.x - player.x, dy = d.y - player.y;
            if (dx * dx + dy * dy < EMP_RADIUS * EMP_RADIUS) {
              d.hp -= 4;
              if (d.hp <= 0) {
                killDrone(d);
              } else {
                d.flash = 0.6;
              }
            }
          }
        }
      } else {
        if (k === " ") firing = false;
      }
      if (k === " " || k.startsWith("arrow") || k === "w" || k === "a" || k === "s" || k === "d") e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas!.getBoundingClientRect();
      aim = {
        x: ((e.clientX - r.left) / r.width) * W,
        y: ((e.clientY - r.top) / r.height) * H,
      };
    };
    const onMouseDown = (e: MouseEvent) => { if (running && !paused && !dead) firing = true; };
    const onMouseUp = (_: MouseEvent) => { firing = false; };

    window.addEventListener("keydown", (e) => onKey(e, true));
    window.addEventListener("keyup",   (e) => onKey(e, false));
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup",   onMouseUp);

    // --- Spawn / kill helpers ──────────────────────────────────────────────────
    function spawnDrone() {
      // spawn at random edge
      const edge = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      if (edge === 0) { x = -30;       y = Math.random() * H; }
      else if (edge === 1) { x = W + 30; y = Math.random() * H; }
      else if (edge === 2) { x = Math.random() * W; y = -30;     }
      else { x = Math.random() * W; y = H + 30; }
      // kind distribution scales with wave
      const roll = Math.random();
      let kind: Drone["kind"] = "scout";
      if (wave >= 2 && roll > 0.55) kind = "chaser";
      if (wave >= 4 && roll > 0.85) kind = "kami";
      const hpByKind = { scout: 2, chaser: 3, kami: 2 };
      const rByKind  = { scout: 11, chaser: 14, kami: 13 };
      drones.push({
        x, y,
        vx: 0, vy: 0,
        hp: hpByKind[kind] + Math.floor(wave / 3),
        r: rByKind[kind],
        kind, alive: true, flash: 0,
      });
    }

    function killDrone(d: Drone) {
      d.alive = false;
      kills++;
      const reward = d.kind === "scout" ? 50 : d.kind === "chaser" ? 90 : 130;
      score += reward;
      const hue = d.kind === "kami" ? "#ffaa00" : d.kind === "chaser" ? "#ff2dca" : "#00e0ff";
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 60 + Math.random() * 200;
        particles.push({
          x: d.x, y: d.y,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: 0, max: 0.45 + Math.random() * 0.25,
          color: hue, size: 1 + Math.random() * 2.4,
        });
      }
      if (d.kind === "kami") {
        waves.push({ x: d.x, y: d.y, r: 0, max: 80, life: 0.32, tone: "kami" });
      }
    }

    function damagePlayer(amount: number) {
      hp = Math.max(0, hp - amount);
      // hit flash
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 80 + Math.random() * 160;
        particles.push({
          x: player.x, y: player.y,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: 0, max: 0.35,
          color: "#ff3366", size: 1 + Math.random() * 2,
        });
      }
      if (hp <= 0 && !dead) {
        dead = true;
        running = false;
        setState("dead");
      }
    }

    // --- Render helpers ────────────────────────────────────────────────────────
    function drawCity() {
      // background
      const g = ctx!.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#040818");
      g.addColorStop(0.6, "#070b20");
      g.addColorStop(1, "#03050d");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, W, H);

      // halos
      const ha = ctx!.createRadialGradient(W * 0.2, H * 0.15, 0, W * 0.2, H * 0.15, 280);
      ha.addColorStop(0, "rgba(255,45,202,0.22)"); ha.addColorStop(1, "rgba(255,45,202,0)");
      ctx!.fillStyle = ha; ctx!.fillRect(0, 0, W, H);
      const hb = ctx!.createRadialGradient(W * 0.85, H * 0.85, 0, W * 0.85, H * 0.85, 300);
      hb.addColorStop(0, "rgba(0,224,255,0.22)"); hb.addColorStop(1, "rgba(0,224,255,0)");
      ctx!.fillStyle = hb; ctx!.fillRect(0, 0, W, H);

      // grid
      ctx!.strokeStyle = "rgba(0,224,255,0.08)";
      ctx!.lineWidth = 1;
      for (let x = 0; x < W; x += 64) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke();
      }
      for (let y = 0; y < H; y += 64) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke();
      }

      // rooftop edges (a stylized arena border)
      ctx!.strokeStyle = "rgba(0,224,255,0.55)";
      ctx!.lineWidth = 2;
      ctx!.strokeRect(40, 40, W - 80, H - 80);
      // corner brackets
      ctx!.strokeStyle = "rgba(255,45,202,0.7)";
      ctx!.lineWidth = 2.5;
      const brk = 28;
      [[40,40],[W-40-brk,40,1],[40,H-40-brk,2],[W-40-brk,H-40-brk,3]].forEach((c) => {
        const [x, y, dir] = c as [number, number, number?];
        ctx!.beginPath();
        if (dir === undefined) { ctx!.moveTo(x, y + brk); ctx!.lineTo(x, y); ctx!.lineTo(x + brk, y); }
        else if (dir === 1)    { ctx!.moveTo(x, y); ctx!.lineTo(x + brk, y); ctx!.lineTo(x + brk, y + brk); }
        else if (dir === 2)    { ctx!.moveTo(x, y); ctx!.lineTo(x, y + brk); ctx!.lineTo(x + brk, y + brk); }
        else                   { ctx!.moveTo(x, y + brk); ctx!.lineTo(x + brk, y + brk); ctx!.lineTo(x + brk, y); }
        ctx!.stroke();
      });
    }

    function drawPlayer() {
      ctx!.save();
      ctx!.translate(player.x, player.y);
      const ang = Math.atan2(aim.y - player.y, aim.x - player.x);
      ctx!.rotate(ang);
      // body
      ctx!.fillStyle = "rgba(0,224,255,0.18)";
      ctx!.beginPath(); ctx!.arc(0, 0, PLAYER_R + 6, 0, Math.PI * 2); ctx!.fill();
      ctx!.strokeStyle = "#00e0ff";
      ctx!.lineWidth = 1.8;
      ctx!.beginPath(); ctx!.arc(0, 0, PLAYER_R, 0, Math.PI * 2); ctx!.stroke();
      // direction triangle
      ctx!.fillStyle = "#7df0ff";
      ctx!.beginPath();
      ctx!.moveTo(PLAYER_R + 8, 0); ctx!.lineTo(PLAYER_R - 2, -5); ctx!.lineTo(PLAYER_R - 2, 5); ctx!.closePath();
      ctx!.fill();
      // visor
      ctx!.fillStyle = "rgba(255,45,202,0.85)";
      ctx!.fillRect(-3, -PLAYER_R + 2, 8, 3);
      ctx!.restore();

      // aim line (faint)
      ctx!.strokeStyle = "rgba(0,224,255,0.25)";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(player.x, player.y);
      ctx!.lineTo(aim.x, aim.y);
      ctx!.stroke();

      // crosshair at aim point
      const ax = aim.x, ay = aim.y;
      ctx!.strokeStyle = "#ff2dca";
      ctx!.lineWidth = 1.4;
      ctx!.beginPath();
      ctx!.moveTo(ax - 10, ay); ctx!.lineTo(ax - 3, ay);
      ctx!.moveTo(ax + 3, ay); ctx!.lineTo(ax + 10, ay);
      ctx!.moveTo(ax, ay - 10); ctx!.lineTo(ax, ay - 3);
      ctx!.moveTo(ax, ay + 3); ctx!.lineTo(ax, ay + 10);
      ctx!.stroke();
    }

    function drawDrone(d: Drone) {
      const hue = d.kind === "kami" ? "#ffaa00" : d.kind === "chaser" ? "#ff2dca" : "#00e0ff";
      ctx!.save();
      ctx!.translate(d.x, d.y);
      // glow
      ctx!.fillStyle = hue + "30";
      ctx!.beginPath(); ctx!.arc(0, 0, d.r + 6, 0, Math.PI * 2); ctx!.fill();
      // outer ring
      ctx!.strokeStyle = d.flash > 0 ? "#ffffff" : hue;
      ctx!.lineWidth = 1.6;
      ctx!.beginPath(); ctx!.arc(0, 0, d.r, 0, Math.PI * 2); ctx!.stroke();
      // rotor blur
      ctx!.strokeStyle = hue + "aa";
      ctx!.lineWidth = 1;
      const sp = (performance.now() * 0.02 + d.x) % (Math.PI * 2);
      ctx!.beginPath();
      ctx!.moveTo(Math.cos(sp) * d.r * 0.7, Math.sin(sp) * d.r * 0.7);
      ctx!.lineTo(Math.cos(sp + Math.PI) * d.r * 0.7, Math.sin(sp + Math.PI) * d.r * 0.7);
      ctx!.moveTo(Math.cos(sp + Math.PI / 2) * d.r * 0.7, Math.sin(sp + Math.PI / 2) * d.r * 0.7);
      ctx!.lineTo(Math.cos(sp + 3 * Math.PI / 2) * d.r * 0.7, Math.sin(sp + 3 * Math.PI / 2) * d.r * 0.7);
      ctx!.stroke();
      // core
      ctx!.fillStyle = hue;
      ctx!.beginPath(); ctx!.arc(0, 0, 2.4, 0, Math.PI * 2); ctx!.fill();
      ctx!.restore();
    }

    // --- Main loop ─────────────────────────────────────────────────────────────
    let raf = 0;
    let last = performance.now();
    function tick(now: number) {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      drawCity();

      // -- Update world (only when running and not paused) -----------------
      if (running && !paused && !dead) {
        // movement
        let mx = 0, my = 0;
        if (keys.has("w") || keys.has("arrowup"))    my -= 1;
        if (keys.has("s") || keys.has("arrowdown"))  my += 1;
        if (keys.has("a") || keys.has("arrowleft"))  mx -= 1;
        if (keys.has("d") || keys.has("arrowright")) mx += 1;
        const m = Math.hypot(mx, my) || 1;
        player.x += (mx / m) * PLAYER_SPEED * dt;
        player.y += (my / m) * PLAYER_SPEED * dt;
        player.x = Math.max(50, Math.min(W - 50, player.x));
        player.y = Math.max(50, Math.min(H - 50, player.y));

        // firing
        fireCD = Math.max(0, fireCD - dt);
        if (reloading) {
          reloadT += dt;
          if (reloadT >= RELOAD_TIME) {
            ammo = MAX_AMMO;
            reloading = false;
            reloadT = 0;
          }
        }
        if (firing && !reloading && fireCD === 0 && ammo > 0) {
          const ang = Math.atan2(aim.y - player.y, aim.x - player.x);
          bullets.push({
            x: player.x + Math.cos(ang) * (PLAYER_R + 6),
            y: player.y + Math.sin(ang) * (PLAYER_R + 6),
            vx: Math.cos(ang) * BULLET_SPEED,
            vy: Math.sin(ang) * BULLET_SPEED,
            life: 0,
            pwr: 1,
          });
          ammo--;
          fireCD = FIRE_COOLDOWN;
          // muzzle particles
          for (let i = 0; i < 4; i++) {
            const a = ang + (Math.random() - 0.5) * 0.6;
            particles.push({
              x: player.x + Math.cos(ang) * (PLAYER_R + 6),
              y: player.y + Math.sin(ang) * (PLAYER_R + 6),
              vx: Math.cos(a) * 200, vy: Math.sin(a) * 200,
              life: 0, max: 0.18,
              color: "#7df0ff", size: 1.6,
            });
          }
          if (ammo === 0) { reloading = true; reloadT = 0; }
        }

        // emp regen
        if (emp < EMP_MAX) {
          empT += dt;
          if (empT >= EMP_REGEN) { emp++; empT = 0; }
        }

        // wave spawning
        waveTimer += dt;
        spawnTimer += dt;
        const spawnInterval = Math.max(0.35, 1.1 - wave * 0.08);
        while (toSpawn > 0 && spawnTimer >= spawnInterval) {
          spawnDrone();
          toSpawn--;
          spawnTimer -= spawnInterval;
        }
        // next wave when arena clear AND all spawned
        if (toSpawn === 0 && drones.every((d) => !d.alive)) {
          startWave(wave + 1);
        }

        // bullets
        for (const b of bullets) {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.life += dt;
        }
        bullets = bullets.filter((b) => b.life < BULLET_LIFE && b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10);

        // drones AI + collisions
        for (const d of drones) {
          if (!d.alive) continue;
          d.flash = Math.max(0, d.flash - dt);
          const dx = player.x - d.x, dy = player.y - d.y;
          const dist = Math.hypot(dx, dy) || 1;
          const nx = dx / dist, ny = dy / dist;
          if (d.kind === "scout") {
            const sp = 90;
            d.vx += nx * sp * dt;
            d.vy += ny * sp * dt;
            d.vx *= 0.96; d.vy *= 0.96;
          } else if (d.kind === "chaser") {
            const sp = 200;
            d.vx += nx * sp * dt;
            d.vy += ny * sp * dt;
            d.vx *= 0.94; d.vy *= 0.94;
          } else {
            const sp = 360;
            d.vx = nx * sp;
            d.vy = ny * sp;
          }
          d.x += d.vx * dt;
          d.y += d.vy * dt;

          // collide with player
          if (dist < d.r + PLAYER_R) {
            if (d.kind === "kami") {
              damagePlayer(28);
              killDrone(d);
            } else {
              damagePlayer(d.kind === "chaser" ? 12 : 8);
              d.flash = 0.4;
              // bounce away
              d.vx = -nx * 240;
              d.vy = -ny * 240;
            }
          }
          // bullet hit
          for (const b of bullets) {
            const dx2 = b.x - d.x, dy2 = b.y - d.y;
            if (dx2 * dx2 + dy2 * dy2 < (d.r + 2) * (d.r + 2)) {
              d.hp -= b.pwr;
              b.life = 99;
              d.flash = 0.4;
              // sparks
              for (let i = 0; i < 3; i++) {
                const a = Math.random() * Math.PI * 2;
                particles.push({
                  x: b.x, y: b.y,
                  vx: Math.cos(a) * 120, vy: Math.sin(a) * 120,
                  life: 0, max: 0.25,
                  color: "#7df0ff", size: 1.2,
                });
              }
              if (d.hp <= 0) killDrone(d);
              break;
            }
          }
        }
        drones = drones.filter((d) => d.alive);

        // particles
        for (const p of particles) {
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.93; p.vy *= 0.93;
        }
        particles = particles.filter((p) => p.life < p.max);

        // shockwaves
        for (const w of waves) {
          w.life += dt;
          w.r = w.max * Math.min(1, w.life / 0.4);
        }
        waves = waves.filter((w) => w.life < (w.tone === "emp" ? 0.6 : 0.4));
      }

      // -- Render ----------------------------------------------------------
      // particles behind
      for (const p of particles) {
        const a = 1 - p.life / p.max;
        ctx!.fillStyle = p.color.includes("rgba") ? p.color : p.color + Math.floor(a * 200).toString(16).padStart(2, "0");
        ctx!.fillRect(p.x, p.y, p.size, p.size);
      }
      // shockwaves
      for (const w of waves) {
        const a = 1 - w.life / 0.55;
        ctx!.strokeStyle = w.tone === "emp" ? `rgba(0,224,255,${a * 0.9})` : `rgba(255,170,0,${a})`;
        ctx!.lineWidth = w.tone === "emp" ? 2 : 1.5;
        ctx!.beginPath(); ctx!.arc(w.x, w.y, w.r, 0, Math.PI * 2); ctx!.stroke();
        if (w.tone === "emp") {
          ctx!.strokeStyle = `rgba(125,240,255,${a * 0.4})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath(); ctx!.arc(w.x, w.y, w.r * 0.85, 0, Math.PI * 2); ctx!.stroke();
        }
      }
      // drones
      for (const d of drones) drawDrone(d);
      // bullets
      for (const b of bullets) {
        ctx!.fillStyle = "#7df0ff";
        ctx!.fillRect(b.x - 1.5, b.y - 1.5, 3, 3);
        ctx!.strokeStyle = "rgba(125,240,255,0.5)";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(b.x - b.vx * 0.02, b.y - b.vy * 0.02);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }
      // player (only when alive)
      if (!dead) drawPlayer();

      // push HUD state for React render
      setHud({
        hp,
        ammo,
        reloadT,
        emp,
        empT,
        wave,
        score,
        kills,
      });

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    // expose start to React
    (canvas as any).__start = () => reset();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", (e) => onKey(e, true));
      window.removeEventListener("keyup",   (e) => onKey(e, false));
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const start = () => {
    const c = canvasRef.current as any;
    if (c && c.__start) c.__start();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HUD overlay + canvas
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <canvas ref={canvasRef} className="w-full block bg-ink" />

      {/* HUD top */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.22em] uppercase pointer-events-none">
        <div className="flex items-center gap-2 text-cyan">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_2px_rgba(0,224,255,0.7)] animate-pulse-soft" />
          <span>SBP · LIVE OPS · 现役行动</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-magenta">WAVE · 波次 {String(hud.wave).padStart(2, "0")}</span>
          <span className="text-mute">·</span>
          <span className="text-amber">SCORE · 得分 {hud.score.toLocaleString()}</span>
          <span className="text-mute">·</span>
          <span className="text-bone-2">KO · 击毁 {hud.kills}</span>
        </div>
      </div>

      {/* HUD bottom */}
      <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-3 pointer-events-none">
        {/* HP */}
        <div className="flex-1 max-w-md">
          <Bar label="HP" zh="生命" value={hud.hp} max={MAX_HP} color="bg-cyan" />
          <Bar
            label={hud.reloadT > 0 ? "RELOADING" : "AMMO"}
            zh={hud.reloadT > 0 ? "装填中" : "弹药"}
            value={hud.reloadT > 0 ? Math.round((hud.reloadT / RELOAD_TIME) * 100) : hud.ammo}
            max={hud.reloadT > 0 ? 100 : MAX_AMMO}
            color={hud.reloadT > 0 ? "bg-amber" : "bg-magenta"}
          />
        </div>
        {/* EMP */}
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-amber bg-ink/70 border border-amber/40 px-3 py-2">
          <div>EMP · 电磁脉冲</div>
          <div className="mt-1 flex items-center gap-1">
            {Array.from({ length: EMP_MAX }).map((_, i) => (
              <span key={i} className={`w-3 h-3 border border-amber/60 ${i < hud.emp ? "bg-amber" : "bg-amber/10"}`} />
            ))}
            <span className="ml-2 text-bone-2 text-[9px]">{hud.emp < EMP_MAX ? `+1 in ${(EMP_REGEN - hud.empT).toFixed(1)}s` : "FULL"}</span>
          </div>
        </div>
      </div>

      {/* MENU OVERLAY */}
      {state === "menu" && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/82 backdrop-blur-sm">
          <div className="max-w-lg text-center px-8">
            <div className="eyebrow text-cyan mb-4">// LIVE OPS · ARENA</div>
            <h2 className="display text-4xl sm:text-5xl text-bone leading-tight">
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: "linear-gradient(120deg,#7df0ff 0%, #00e0ff 50%, #ff2dca 100%)"
              }}>NANSHAN ROOFTOP</span>
            </h2>
            <p className="zh-display text-2xl mt-2 text-bone-2">南山天际带 · 现场演练</p>
            <p className="mt-5 text-sm text-bone-2 leading-relaxed max-w-md mx-auto">
              Drones inbound from all four edges. Hold the rooftop. Stay mobile, conserve EMP,
              cycle reloads. Each wave brings faster swarms.
            </p>
            <p className="mt-2 zh-display text-xs text-mute leading-loose max-w-md mx-auto">
              无人机从四方逼近。坚守屋顶，保持机动，节制 EMP，循环装填。每一波，敌群更快。
            </p>
            <ControlsLegend />
            <button onClick={start} className="neon-btn mt-8">
              <span>开始行动</span>
              <span className="text-[10px] opacity-80">START MISSION</span>
              <span>›</span>
            </button>
            <p className="mt-4 text-[10px] font-mono text-mute tracking-[0.32em] uppercase">// Fictional concept · 虚构作品 · No realism intended</p>
          </div>
        </div>
      )}

      {/* PAUSE OVERLAY */}
      {state === "paused" && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/70 backdrop-blur-sm">
          <div className="text-center">
            <div className="display text-4xl text-cyan">PAUSED · 已暂停</div>
            <p className="mt-3 text-bone-2 text-sm font-mono tracking-[0.32em] uppercase">press P to resume</p>
          </div>
        </div>
      )}

      {/* DEAD OVERLAY */}
      {state === "dead" && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/85 backdrop-blur-sm">
          <div className="max-w-lg text-center px-8">
            <div className="eyebrow text-red mb-3">// OPERATIVE DOWN · 行动者倒下</div>
            <h2 className="display text-4xl sm:text-5xl text-bone">MISSION OVER</h2>
            <p className="zh-display text-2xl mt-2 text-bone-2">行动终止</p>
            <div className="mt-6 grid grid-cols-3 gap-px bg-line/40 max-w-md mx-auto">
              <Stat k="WAVE"   zh="波次" v={String(hud.wave).padStart(2, "0")} tone="text-magenta" />
              <Stat k="SCORE"  zh="得分" v={hud.score.toLocaleString()} tone="text-amber" />
              <Stat k="KILLS"  zh="击毁" v={String(hud.kills)} tone="text-cyan" />
            </div>
            <button onClick={start} className="neon-btn mt-8">
              <span>再战</span>
              <span className="text-[10px] opacity-80">DEPLOY AGAIN</span>
              <span>›</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Bar({ label, zh, value, max, color }: { label: string; zh: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bg-ink/70 px-3 py-2 border border-line/60 mt-1">
      <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.22em] uppercase">
        <span className="text-bone-2">{label} · <span className="zh-display normal-case tracking-normal text-mute">{zh}</span></span>
        <span className="text-bone">{Math.round(value)}{max !== 100 ? `/${max}` : "%"}</span>
      </div>
      <div className="mt-1 h-1.5 bg-line/50 relative overflow-hidden">
        <span className={`absolute inset-y-0 left-0 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Stat({ k, zh, v, tone }: { k: string; zh: string; v: string; tone: string }) {
  return (
    <div className="bg-ink p-4">
      <div className="text-[9px] tracking-[0.32em] uppercase text-dim">{k} · <span className="zh-display normal-case tracking-normal text-mute">{zh}</span></div>
      <div className={`mt-1 display text-3xl ${tone}`}>{v}</div>
    </div>
  );
}

function ControlsLegend() {
  return (
    <div className="mt-8 grid grid-cols-3 gap-px bg-line/40 max-w-md mx-auto text-left">
      <Ctrl k="WASD"  v="Move · 移动" />
      <Ctrl k="Mouse" v="Aim · 瞄准" />
      <Ctrl k="Click" v="Fire · 射击" />
      <Ctrl k="E"     v="EMP · 脉冲" />
      <Ctrl k="P"     v="Pause · 暂停" />
      <Ctrl k="R"     v="Reset · 重启" />
    </div>
  );
}
function Ctrl({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-ink/80 p-3 text-[10px] font-mono">
      <div className="text-cyan tracking-[0.3em]">{k}</div>
      <div className="mt-1 text-bone-2 normal-case">{v}</div>
    </div>
  );
}
