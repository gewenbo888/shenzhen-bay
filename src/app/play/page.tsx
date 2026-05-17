import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";

const ArenaGame = dynamic(() => import("@/components/ArenaGame"), { ssr: false });

export const metadata: Metadata = {
  title: "Live Ops · Arena | Shenzhen Bay Protocol",
  description:
    "Top-down arena drone-interception mini for the Shenzhen Bay Protocol concept. WASD + mouse, plasma + EMP, escalating waves.",
};

export default function PlayPage() {
  return (
    <main className="relative min-h-screen pt-20">
      <header className="fixed top-0 inset-x-0 z-30 backdrop-blur-md bg-ink/60 border-b border-line/50">
        <div className="max-w-[1480px] mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-cyan hover:opacity-80 transition">
            <span className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_2px_rgba(0,224,255,0.8)] animate-pulse-soft" />
            <span className="display text-xs sm:text-sm tracking-widest">SBP · 深圳湾行动</span>
          </Link>
          <div className="flex items-center gap-5 font-mono text-[10px] tracking-[0.3em] uppercase">
            <span className="text-magenta">// LIVE OPS · 现场演练</span>
            <Link href="/" className="text-mute hover:text-cyan transition">↩ HOME · 返回</Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 pb-20">
        <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="eyebrow text-cyan">// arena · 演练场</div>
            <h1 className="mt-2 display text-3xl sm:text-5xl">
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: "linear-gradient(120deg,#7df0ff 0%, #00e0ff 50%, #ff2dca 100%)"
              }}>Nanshan Rooftop</span>
            </h1>
            <p className="mt-1 zh-display text-xl text-bone-2">南山天际带 · 现场演练</p>
          </div>
          <p className="text-[11px] font-mono text-mute tracking-[0.28em] uppercase max-w-sm text-right">
            // Fictional cinematic prototype<br />
            // Demonstrates the SBP aesthetic, not a real game build
          </p>
        </div>

        <div className="border border-cyan/30 shadow-[0_0_60px_-20px_rgba(0,224,255,0.5)]">
          <ArenaGame />
        </div>

        <section className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line/40">
          <Brief k="OBJECTIVE" zh="目标"
            v="Survive escalating drone waves on a rooftop. Each wave brings faster and tougher enemies." />
          <Brief k="ENEMIES" zh="敌人"
            v="Scout (slow strafe) · Chaser (homing) · Kamikaze (explodes near you). Mix scales with wave." />
          <Brief k="LOADOUT" zh="装备"
            v="Pulse carbine (36 rounds, 1.4 s reload) + EMP burst (3 charges, 8 s regen)." />
          <Brief k="CONTROLS" zh="操作"
            v="WASD · move · aim mouse · click/space fire · E for EMP · P pause · R reset." />
        </section>
      </div>
    </main>
  );
}

function Brief({ k, zh, v }: { k: string; zh: string; v: string }) {
  return (
    <div className="bg-ink-2/70 p-6">
      <div className="text-[10px] font-mono tracking-[0.32em] text-cyan uppercase">{k} · <span className="zh-display normal-case tracking-normal text-mute">{zh}</span></div>
      <p className="mt-3 text-sm text-bone-2 leading-relaxed">{v}</p>
    </div>
  );
}
