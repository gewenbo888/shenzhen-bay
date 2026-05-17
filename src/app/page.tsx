import dynamic from "next/dynamic";
import { Reveal } from "@/components/Reveal";
import HudFrame from "@/components/HudFrame";
import { DISTRICTS, OPERATIVES, ARSENAL, MISSIONS, HUD_TICKER } from "@/data/game";

const SkylineCanvas = dynamic(() => import("@/components/SkylineCanvas"), { ssr: false });
const HoloTower     = dynamic(() => import("@/components/HoloTower"),     { ssr: false });

// ─────────────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <main className="relative">
      <TopBar />
      <Hero />
      <TickerStrip />
      <Briefing />
      <DistrictsMap />
      <Operatives />
      <Arsenal />
      <MissionBoard />
      <HudShowcase />
      <Lobby />
      <FinalCTA />
      <Footer />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP BAR
// ─────────────────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <header className="fixed top-0 inset-x-0 z-30">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-cyan">
          <div className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_2px_rgba(0,224,255,0.8)] animate-pulse-soft" />
          <span className="display text-xs sm:text-sm tracking-widest">SBP · 深圳湾行动</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 font-mono text-[10px] tracking-[0.32em] uppercase text-mute">
          <a href="#brief"      className="hover:text-cyan transition">Briefing</a>
          <a href="#map"        className="hover:text-cyan transition">The Bay</a>
          <a href="#operatives" className="hover:text-cyan transition">Operatives</a>
          <a href="#arsenal"    className="hover:text-cyan transition">Arsenal</a>
          <a href="#missions"   className="hover:text-cyan transition">Missions</a>
        </nav>
        <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.32em] text-mute">
          <span className="hidden sm:inline">EN</span>
          <span className="text-dim">·</span>
          <span className="zh-display text-bone-2">深圳湾</span>
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center">
      <SkylineCanvas />
      {/* Vignette to keep text readable */}
      <div className="absolute inset-0 -z-[0] pointer-events-none"
           style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(3,5,13,0.0) 0%, rgba(3,5,13,0.65) 75%)" }} />

      <div className="relative max-w-[1480px] mx-auto px-6 sm:px-10 pt-32 pb-24 w-full">
        <Reveal>
          <div className="flex items-center gap-3 mb-8">
            <span className="sticker text-cyan">// TRAILER v3.42 · 2026.05</span>
            <span className="sticker text-magenta hidden sm:inline-flex">// FICTIONAL CONCEPT</span>
          </div>
        </Reveal>

        <h1 className="relative">
          <Reveal>
            <div className="display text-[clamp(2.6rem,7.5vw,7rem)] leading-[0.95] tracking-wide">
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: "linear-gradient(120deg, #7df0ff 0%, #00e0ff 40%, #ff2dca 100%)",
                filter: "drop-shadow(0 0 32px rgba(0,224,255,0.35)) drop-shadow(0 0 50px rgba(255,45,202,0.25))"
              }}>
                SHENZHEN BAY
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="display text-[clamp(2.6rem,7.5vw,7rem)] leading-[0.95] tracking-wide mt-1 text-bone glitch">
              PROTOCOL
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="zh-display text-[clamp(2rem,5vw,4.6rem)] mt-4 text-magenta-2">
              深圳湾行动
            </div>
          </Reveal>
        </h1>

        <Reveal delay={0.18}>
          <p className="mt-12 max-w-2xl text-bone-2 text-lg leading-relaxed">
            High-tech operations in a future megacity. Six operatives. Twelve kilometers of bridge.
            One night to keep the bay from going dark.
          </p>
          <p className="mt-3 max-w-2xl zh-display text-mute text-lg">
            未来城市中的高科技行动。六名行动者，十二公里跨海大桥，一夜守住整个海湾。
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-14 flex flex-wrap items-center gap-5">
            <a href="/play" className="neon-btn">
              <span>开始行动</span>
              <span className="text-[10px] opacity-80">START MISSION</span>
              <span>›</span>
            </a>
            <a href="#operatives" className="neon-btn neon-btn-secondary">
              <span>查看行动者</span>
              <span className="text-[10px] opacity-80">VIEW OPERATIVES</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px max-w-3xl">
            <HeroStat label="Operatives" zh="行动者" value="06" />
            <HeroStat label="Districts"  zh="区域"   value="06" />
            <HeroStat label="Missions"   zh="任务"   value="06+" />
            <HeroStat label="Weather"    zh="天气"   value="RAIN 22°" tone="magenta" />
          </div>
        </Reveal>

        {/* Floating HUD elements over the hero */}
        <div className="hidden xl:block absolute right-12 top-32 w-72">
          <Reveal delay={0.3}>
            <HudFrame label="DRONE FEED · 03" tone="magenta" className="p-5 bg-ink/40 backdrop-blur-sm">
              <div className="text-[10px] font-mono text-mute leading-relaxed">
                <div>21:42:08 · BAY-BRIDGE SPAN</div>
                <div className="mt-1 text-bone-2">PATTERN: HOSTILE SWARM</div>
                <div className="mt-1 text-magenta">VECTORS: 14 · CLOSING</div>
                <div className="mt-4 h-px bg-magenta/30" />
                <div className="mt-3 text-mute">// 自动追踪 14 个目标</div>
              </div>
            </HudFrame>
          </Reveal>
        </div>

        <div className="hidden xl:block absolute right-12 bottom-32 w-80">
          <Reveal delay={0.35}>
            <HudFrame label="ATMOS · 大气" tone="cyan" className="p-5 bg-ink/40 backdrop-blur-sm">
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                <Tile k="TEMP" v="22°C" />
                <Tile k="RAIN" v="HEAVY" />
                <Tile k="WIND" v="14 m/s" />
                <Tile k="VISIB" v="0.6 km" />
                <Tile k="EMP"  v="STABLE" />
                <Tile k="SAT"  v="LINKED" />
              </div>
            </HudFrame>
          </Reveal>
        </div>

        <Reveal delay={0.5}>
          <div className="mt-16 flex items-center gap-3 text-[10px] font-mono tracking-[0.32em] uppercase text-mute">
            <span className="block w-px h-10 bg-gradient-to-b from-transparent via-cyan to-transparent animate-pulse-soft" />
            scroll · descend the bay · 向下进入海湾
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HeroStat({ label, zh, value, tone = "cyan" }: { label: string; zh: string; value: string; tone?: "cyan" | "magenta" }) {
  return (
    <div className={`px-4 py-3 bg-ink-2/70 border-l border-line ${tone === "magenta" ? "" : ""}`}>
      <div className="text-[9px] tracking-[0.32em] uppercase text-dim">{label} · <span className="zh-display normal-case tracking-normal text-mute">{zh}</span></div>
      <div className={`mt-1 display text-xl ${tone === "magenta" ? "text-magenta" : "text-cyan"}`}>{value}</div>
    </div>
  );
}

function Tile({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-dim">{k}</div>
      <div className="text-bone-2">{v}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TICKER
// ─────────────────────────────────────────────────────────────────────────────

function TickerStrip() {
  return (
    <div className="relative border-y border-line/60 bg-ink/80 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 -z-0 pointer-events-none scanlines" />
      <div className="marquee text-[11px] font-mono tracking-[0.28em] uppercase py-3">
        <div className="marquee-track">
          {[...HUD_TICKER, ...HUD_TICKER].map((t, i) => (
            <span key={i} className={`px-8 ${i % 3 === 0 ? "text-cyan" : i % 3 === 1 ? "text-magenta" : "text-amber"}`}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BRIEFING
// ─────────────────────────────────────────────────────────────────────────────

function Briefing() {
  return (
    <section id="brief" className="relative py-32 sm:py-44">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10">
        <SectionHead n="01" eyebrow="// Briefing · 任务简报" en="High-Tech Operations in a Future Megacity" zh="未来城市中的高科技行动" />

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start mt-16">
          <Reveal>
            <p className="display text-[clamp(1.8rem,3.6vw,3rem)] leading-tight max-w-[24ch]">
              In 2049 Shenzhen Bay <span className="text-cyan">does not sleep.</span>{" "}
              <span className="text-magenta">It listens.</span>
            </p>
            <p className="mt-4 zh-display text-xl text-bone-2">
              2049 年，深圳湾不再入眠。它在<span className="text-magenta-2">倾听</span>。
            </p>
            <p className="mt-8 text-bone-2 text-lg leading-relaxed max-w-xl">
              Six operatives. One window per night. The bay's smart-city stack — drone canopy,
              maglev underline, AI ports, EMP-locked civic core — is yours to break, hack, or
              ride. Pick a role, pull a loadout, work the streets above and below.
            </p>
            <p className="mt-5 zh-display text-base leading-loose text-mute max-w-xl">
              六名行动者，每夜一次窗口。湾区智慧城市的栈：无人机穹顶、磁悬深线、AI 港口、EMP 锁定的市政核心——
              都是你可以击破、入侵或骑乘的工具。挑角色，配装备，在街道之上与街道之下作战。
            </p>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-px max-w-xl bg-line/40">
              <BriefStat k="Ops Tempo" zh="行动节奏" v="High"     tone="cyan" />
              <BriefStat k="Lethality" zh="杀伤等级" v="Lethal"   tone="magenta" />
              <BriefStat k="Realism"   zh="拟真度"   v="Stylized" tone="amber" />
              <BriefStat k="Players"   zh="参与人数" v="1 – 6"    tone="cyan" />
              <BriefStat k="Map size"  zh="地图规模" v="12.4 km²" tone="magenta" />
              <BriefStat k="Weather"   zh="天气"     v="Dynamic"  tone="amber" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <HudFrame label="LIVE HOLO · 实时全息" tone="cyan" className="aspect-[4/5] relative bg-ink/40">
              <div className="absolute inset-0 scanlines" />
              <HoloTower />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-mute">
                <span>SCAN · 0.92 fidelity</span>
                <span className="text-cyan">SUBJECT: NS-04 / 南山</span>
              </div>
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-mute">
                <span className="text-magenta">LOCK · 锁定</span>
                <span>RANGE 1.42 km</span>
              </div>
            </HudFrame>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BriefStat({ k, zh, v, tone }: { k: string; zh: string; v: string; tone: "cyan" | "magenta" | "amber" }) {
  const t = tone === "magenta" ? "text-magenta" : tone === "amber" ? "text-amber" : "text-cyan";
  return (
    <div className="bg-ink/70 p-4">
      <div className="text-[9px] tracking-[0.3em] uppercase text-dim">{k} · <span className="zh-display normal-case tracking-normal text-mute">{zh}</span></div>
      <div className={`mt-1 display text-base ${t}`}>{v}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DISTRICTS / MAP
// ─────────────────────────────────────────────────────────────────────────────

function DistrictsMap() {
  return (
    <section id="map" className="relative py-32 sm:py-44 border-t border-line/40">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10">
        <SectionHead n="02" eyebrow="// The Bay · 湾区六区" en="Six Districts. One Bay." zh="六大区域 · 一片海湾" />

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 mt-14">
          <Reveal>
            {/* Stylized tactical map */}
            <HudFrame label="TAC-MAP · 2049 v3" tone="cyan" className="relative aspect-[4/3] bg-ink/50">
              <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="bay" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(0,224,255,0.18)"/>
                    <stop offset="100%" stopColor="rgba(255,45,202,0.10)"/>
                  </linearGradient>
                </defs>
                {/* land contours */}
                <path d="M 0 380 Q 120 320 240 340 Q 360 380 500 320 Q 620 280 800 320 L 800 0 L 0 0 Z" fill="rgba(8,12,30,0.6)" stroke="rgba(0,224,255,0.25)" strokeWidth="0.7"/>
                {/* bay (water) */}
                <path d="M 0 380 Q 120 320 240 340 Q 360 380 500 320 Q 620 280 800 320 L 800 600 L 0 600 Z" fill="url(#bay)" stroke="rgba(255,45,202,0.18)" strokeWidth="0.7"/>
                {/* bridge */}
                <path d="M 90 480 Q 400 410 720 470" stroke="rgba(0,224,255,0.85)" strokeWidth="1.6" fill="none" strokeDasharray="2 4"/>
                {/* underground line */}
                <path d="M 80 540 L 760 540" stroke="rgba(255,170,0,0.4)" strokeWidth="1" fill="none" strokeDasharray="6 6"/>
                {/* grid */}
                {Array.from({ length: 11 }).map((_, i) => (
                  <line key={`v${i}`} x1={i*80} y1="0" x2={i*80} y2="600" stroke="rgba(0,224,255,0.06)" strokeWidth="0.5"/>
                ))}
                {Array.from({ length: 9 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i*75} x2="800" y2={i*75} stroke="rgba(0,224,255,0.06)" strokeWidth="0.5"/>
                ))}
                {/* district markers */}
                {DISTRICTS.map((d, i) => {
                  const pts = [
                    { x: 120, y: 470, label: "D-01" },
                    { x: 300, y: 230, label: "D-02" },
                    { x: 660, y: 470, label: "D-03" },
                    { x: 460, y: 190, label: "D-04" },
                    { x: 540, y: 260, label: "D-05" },
                    { x: 380, y: 545, label: "D-06" },
                  ][i];
                  const color = d.color === "magenta" ? "#ff2dca" : d.color === "amber" ? "#ffaa00" : "#00e0ff";
                  return (
                    <g key={d.code}>
                      <circle cx={pts.x} cy={pts.y} r="6" fill={color} opacity="0.85"/>
                      <circle cx={pts.x} cy={pts.y} r="14" fill="none" stroke={color} strokeOpacity="0.5">
                        <animate attributeName="r" values="6;22;6" dur="3s" repeatCount="indefinite"/>
                        <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite"/>
                      </circle>
                      <text x={pts.x + 14} y={pts.y - 6} fontFamily="JetBrains Mono, monospace" fontSize="10" fill={color} letterSpacing="2">{d.code}</text>
                      <text x={pts.x + 14} y={pts.y + 8} fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(232,240,255,0.7)">{d.en}</text>
                    </g>
                  );
                })}
                {/* compass */}
                <g transform="translate(740 50)">
                  <circle r="22" fill="none" stroke="rgba(0,224,255,0.3)"/>
                  <text y="-26" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(0,224,255,0.7)" textAnchor="middle">N · 北</text>
                  <path d="M 0 -16 L 4 0 L 0 14 L -4 0 Z" fill="#00e0ff"/>
                </g>
                {/* legend */}
                <g transform="translate(40 50)">
                  <text fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="3" fill="rgba(108,117,163,0.8)">// MAP KEY · 图例</text>
                  <g transform="translate(0 18)">
                    <rect width="14" height="2" fill="rgba(0,224,255,0.7)"/>
                    <text x="20" y="3" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(232,240,255,0.75)">BAY BRIDGE · 大桥</text>
                  </g>
                  <g transform="translate(0 34)">
                    <rect width="14" height="2" fill="rgba(255,170,0,0.55)"/>
                    <text x="20" y="3" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(232,240,255,0.75)">UNDERLINE · 深线</text>
                  </g>
                </g>
              </svg>
            </HudFrame>
          </Reveal>

          {/* District list */}
          <div className="space-y-px bg-line/30">
            {DISTRICTS.map((d, i) => (
              <Reveal key={d.code} delay={i * 0.04}>
                <DistrictRow d={d} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DistrictRow({ d }: { d: typeof DISTRICTS[number] }) {
  const tone = d.color === "magenta" ? { text: "text-magenta", bd: "border-magenta/40", bg: "bg-magenta/8" }
            : d.color === "amber"    ? { text: "text-amber",   bd: "border-amber/40",   bg: "bg-amber/8"   }
            :                          { text: "text-cyan",    bd: "border-cyan/40",    bg: "bg-cyan/8"    };
  return (
    <div className={`bg-ink/70 p-5 border-l-2 ${tone.bd} grid grid-cols-[80px_1fr] gap-5`}>
      <div className="flex flex-col gap-1">
        <span className={`font-mono text-[10px] tracking-[0.3em] ${tone.text}`}>{d.code}</span>
        <span className="font-mono text-[9px] text-dim uppercase tracking-[0.22em]">{d.tag}</span>
      </div>
      <div>
        <div className="display text-lg sm:text-xl text-bone leading-tight">
          {d.en} <span className="zh-display text-bone-2 ml-2">· {d.zh}</span>
        </div>
        <p className="mt-2 text-sm text-bone-2 leading-relaxed">{d.body}</p>
        <p className="mt-1 zh-display text-xs leading-loose text-mute">{d.bodyZh}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERATIVES
// ─────────────────────────────────────────────────────────────────────────────

function Operatives() {
  return (
    <section id="operatives" className="relative py-32 sm:py-44 border-t border-line/40">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10">
        <SectionHead n="03" eyebrow="// Operatives · 行动者档案" en="Six Profiles. Six Roles." zh="六名行动者 · 六种角色" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line/30 mt-14">
          {OPERATIVES.map((o, i) => (
            <Reveal key={o.id} delay={i * 0.05}>
              <OperativeCard o={o} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OperativeCard({ o }: { o: typeof OPERATIVES[number] }) {
  const tone = o.tone === "magenta" ? { text: "text-magenta", bd: "border-magenta/40", glow: "shadow-[0_0_30px_-10px_rgba(255,45,202,0.6)]" }
            : o.tone === "amber"    ? { text: "text-amber",   bd: "border-amber/40",   glow: "shadow-[0_0_30px_-10px_rgba(255,170,0,0.55)]" }
            :                          { text: "text-cyan",    bd: "border-cyan/40",    glow: "shadow-[0_0_30px_-10px_rgba(0,224,255,0.6)]" };
  return (
    <div className={`relative bg-ink-2/80 p-8 border-l-2 ${tone.bd} ${tone.glow} hover:bg-steel-2 transition`}>
      <div className="absolute top-4 right-4 text-[10px] font-mono tracking-[0.32em] text-dim">OP-{o.id}</div>
      <div className="flex items-end gap-3">
        <span className={`display text-3xl ${tone.text}`}>{o.name}</span>
      </div>
      <div className="mt-1 zh-display text-xl text-bone-2">{o.cn}</div>
      <div className="mt-3 sticker bg-transparent border-line text-mute">{o.role}</div>

      {/* Stylized portrait silhouette */}
      <div className="mt-5 relative h-32 overflow-hidden">
        <svg viewBox="0 0 200 160" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id={`g-${o.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={o.tone === "magenta" ? "#ff2dca" : o.tone === "amber" ? "#ffaa00" : "#00e0ff"} stopOpacity="0.0"/>
              <stop offset="100%" stopColor={o.tone === "magenta" ? "#ff2dca" : o.tone === "amber" ? "#ffaa00" : "#00e0ff"} stopOpacity="0.55"/>
            </linearGradient>
          </defs>
          {/* tactical grid */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={i * 25} y1="0" x2={i * 25} y2="160" stroke="rgba(0,224,255,0.08)" strokeWidth="0.5"/>
          ))}
          {/* helmeted silhouette */}
          <path d="M 100 30 C 78 30 64 46 64 70 L 64 90 C 64 96 68 100 74 100 L 74 124 C 74 138 84 148 100 148 C 116 148 126 138 126 124 L 126 100 C 132 100 136 96 136 90 L 136 70 C 136 46 122 30 100 30 Z"
                fill={`url(#g-${o.id})`} stroke={o.tone === "magenta" ? "#ff2dca" : o.tone === "amber" ? "#ffaa00" : "#00e0ff"} strokeWidth="1"/>
          {/* visor */}
          <rect x="74" y="62" width="52" height="14" fill={o.tone === "magenta" ? "#ff2dca" : o.tone === "amber" ? "#ffaa00" : "#00e0ff"} fillOpacity="0.55"/>
          <line x1="74" y1="69" x2="126" y2="69" stroke="#03050d" strokeWidth="1"/>
          {/* shoulder pauldron edge */}
          <path d="M 50 144 L 150 144" stroke={o.tone === "magenta" ? "#ff2dca" : o.tone === "amber" ? "#ffaa00" : "#00e0ff"} strokeOpacity="0.6" strokeWidth="1"/>
          {/* HUD ticks */}
          <text x="6" y="14" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(108,117,163,0.8)">// OP-{o.id} · LOCK</text>
          <text x="6" y="156" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(108,117,163,0.7)">PROFILE 0.92</text>
          <text x="194" y="156" fontFamily="JetBrains Mono, monospace" fontSize="8" fill={o.tone === "magenta" ? "#ff2dca" : o.tone === "amber" ? "#ffaa00" : "#00e0ff"} textAnchor="end">{o.cn}</text>
        </svg>
      </div>

      <p className="mt-5 text-sm text-bone-2 leading-relaxed">{o.blurb}</p>
      <p className="mt-2 zh-display text-xs leading-loose text-mute">{o.blurbZh}</p>

      <div className="mt-5 hairline" />
      <div className="mt-4 text-[10px] font-mono tracking-[0.28em] text-dim uppercase">// Loadout · 装备</div>
      <ul className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
        {o.kit.map((k) => (
          <li key={k} className={`px-2 py-1 border border-line ${tone.text} bg-ink`}>{k}</li>
        ))}
      </ul>

      <div className="mt-5 text-[10px] font-mono tracking-[0.28em] text-dim uppercase">// Upgrade · 改造</div>
      <p className="mt-1 text-xs text-bone-2 leading-relaxed">{o.upgrade}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARSENAL
// ─────────────────────────────────────────────────────────────────────────────

function Arsenal() {
  return (
    <section id="arsenal" className="relative py-32 sm:py-44 border-t border-line/40">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10">
        <SectionHead n="04" eyebrow="// Arsenal · 装备库" en="Fictional Energy Loadout" zh="虚构能量化装备" />

        <Reveal>
          <p className="mt-6 max-w-2xl text-bone-2 text-base leading-relaxed">
            Every weapon is a stylized energy system — plasma, coil-rail, EMP. No real-world counterparts. Tune three sliders per shot: range, damage, recoil.
          </p>
          <p className="mt-2 zh-display text-sm text-mute max-w-2xl">
            所有武器都是程式化的能量系统：等离子、线圈轨道、EMP。无现实对应。每发可调整三项：射程、伤害、后坐。
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-px bg-line/30 mt-12">
          {ARSENAL.map((w, i) => (
            <Reveal key={w.name} delay={i * 0.03}>
              <WeaponCard w={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WeaponCard({ w }: { w: typeof ARSENAL[number] }) {
  const tone = w.tone === "magenta" ? "text-magenta"
            : w.tone === "amber"    ? "text-amber"
            : "text-cyan";
  const bar = w.tone === "magenta" ? "bg-magenta" : w.tone === "amber" ? "bg-amber" : "bg-cyan";
  return (
    <div className="bg-ink-2/80 p-7 grid grid-cols-[1fr_auto] gap-6 hover:bg-steel-2 transition">
      <div>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-[10px] tracking-[0.32em] ${tone}`}>{w.tier}</span>
          <span className="display text-xl text-bone">{w.name}</span>
          <span className="zh-display text-bone-2">· {w.zh}</span>
        </div>
        <p className="mt-3 text-sm text-bone-2 leading-relaxed font-mono">{w.bullet}</p>

        <div className="mt-5 space-y-2 max-w-xs">
          <StatBar label="Range"  zh="射程" value={w.stats.range}  bar={bar}/>
          <StatBar label="DPS"    zh="伤害" value={w.stats.dps}    bar={bar}/>
          <StatBar label="Recoil" zh="后坐" value={w.stats.recoil} bar={bar}/>
        </div>
      </div>

      {/* abstract weapon glyph */}
      <div className="hidden sm:block w-28">
        <svg viewBox="0 0 120 80" className="w-full">
          <line x1="0" y1="40" x2="120" y2="40" stroke="rgba(0,224,255,0.12)" strokeWidth="0.5"/>
          <path d="M 10 40 L 38 40 L 44 30 L 64 30 L 70 40 L 96 40" stroke={w.tone === "magenta" ? "#ff2dca" : w.tone === "amber" ? "#ffaa00" : "#00e0ff"} strokeWidth="1.4" fill="none"/>
          <rect x="44" y="44" width="20" height="3" fill={w.tone === "magenta" ? "#ff2dca" : w.tone === "amber" ? "#ffaa00" : "#00e0ff"} opacity="0.6"/>
          <circle cx="100" cy="40" r="2" fill={w.tone === "magenta" ? "#ff2dca" : w.tone === "amber" ? "#ffaa00" : "#00e0ff"}/>
        </svg>
      </div>
    </div>
  );
}

function StatBar({ label, zh, value, bar }: { label: string; zh: string; value: number; bar: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3 text-[10px] font-mono">
      <span className="w-14 text-dim uppercase tracking-[0.2em]">{label}</span>
      <span className="w-8 zh-display text-mute">{zh}</span>
      <span className="flex-1 h-1.5 bg-line relative overflow-hidden">
        <span className={`absolute inset-y-0 left-0 ${bar}`} style={{ width: `${v}%` }} />
      </span>
      <span className="w-8 text-right text-bone-2">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MISSIONS
// ─────────────────────────────────────────────────────────────────────────────

function MissionBoard() {
  return (
    <section id="missions" className="relative py-32 sm:py-44 border-t border-line/40">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10">
        <SectionHead n="05" eyebrow="// Mission Board · 任务列表" en="Tonight's Operations Queue" zh="今夜任务队列" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line/30 mt-12">
          {MISSIONS.map((m, i) => (
            <Reveal key={m.code} delay={i * 0.04}>
              <MissionCard m={m} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MissionCard({ m }: { m: typeof MISSIONS[number] }) {
  const tone = m.tone === "magenta" ? { text: "text-magenta", border: "border-magenta/40", bg: "bg-magenta/8" }
            : m.tone === "amber"    ? { text: "text-amber",   border: "border-amber/40",   bg: "bg-amber/8"   }
            :                          { text: "text-cyan",    border: "border-cyan/40",    bg: "bg-cyan/8"    };
  return (
    <div className={`bg-ink-2/80 p-7 border-l-2 ${tone.border} hover:bg-steel-2 transition`}>
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[10px] tracking-[0.32em] ${tone.text}`}>{m.code}</span>
        <span className={`px-2 py-0.5 text-[9px] tracking-[0.32em] font-mono uppercase border ${tone.border} ${tone.text} ${tone.bg}`}>{m.pri}</span>
      </div>
      <div className="mt-4 display text-2xl text-bone leading-tight">{m.en}</div>
      <div className="mt-1 zh-display text-lg text-bone-2">{m.zh}</div>

      <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-mute">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse-soft" />
        <span>WINDOW · {m.time}</span>
        <span className="text-dim">·</span>
        <span className="zh-display normal-case text-mute">行动窗口</span>
      </div>

      <p className="mt-5 text-sm text-bone-2 leading-relaxed">{m.body}</p>
      <p className="mt-2 zh-display text-xs leading-loose text-mute">{m.bodyZh}</p>

      <div className="mt-6 hairline" />
      <div className={`mt-4 inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] ${tone.text} uppercase`}>
        ›  Deploy <span className="zh-display normal-case tracking-normal">部署</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HUD SHOWCASE
// ─────────────────────────────────────────────────────────────────────────────

function HudShowcase() {
  return (
    <section className="relative py-32 sm:py-44 border-t border-line/40 overflow-hidden">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10">
        <SectionHead n="06" eyebrow="// Tactical UI · 战术界面" en="Hologram First. Everything Else Second." zh="全息优先 · 其他次之" />

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 mt-14 items-start">
          <Reveal>
            <p className="display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight max-w-[22ch]">
              Glassmorphic HUD, neon corner brackets, <span className="text-magenta">real-time drone scans</span>, slow-motion overlays.
            </p>
            <p className="mt-4 zh-display text-lg text-bone-2 max-w-[28ch]">
              玻璃质感 HUD，霓虹边角，<span className="text-magenta-2">实时无人机扫描</span>，慢动作叠加。
            </p>

            <ul className="mt-10 space-y-3 text-sm font-mono">
              <Bullet k="MINIMAP"   v="Dynamic, drone-fed, occlusion-aware" />
              <Bullet k="WEAPON HUD" v="Tier / range / DPS / recoil at glance" />
              <Bullet k="COMMS"     v="Bilingual tactical radio overlays" />
              <Bullet k="SCANNER"   v="EMP wash, drone-scan, thermal toggles" />
              <Bullet k="MISSION"   v="Live objective beacon · floor / sky layers" />
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <HudFrame label="HUD · TAC v3.42" tone="magenta" className="relative aspect-[4/3] bg-ink/60">
              <div className="absolute inset-0 scanlines" />
              {/* mock minimap */}
              <svg viewBox="0 0 600 450" className="absolute inset-0 w-full h-full">
                {/* radar circles */}
                {[60, 110, 160, 210].map((r) => (
                  <circle key={r} cx="300" cy="225" r={r} fill="none" stroke="rgba(0,224,255,0.25)" strokeWidth="0.5"/>
                ))}
                <line x1="300" y1="15" x2="300" y2="435" stroke="rgba(0,224,255,0.18)" strokeWidth="0.5"/>
                <line x1="90" y1="225" x2="510" y2="225" stroke="rgba(0,224,255,0.18)" strokeWidth="0.5"/>

                {/* swept beam */}
                <g style={{ transformOrigin: "300px 225px", animation: "rotateBeam 4s linear infinite" }}>
                  <path d="M 300 225 L 510 225 A 210 210 0 0 0 472 102 Z" fill="rgba(0,224,255,0.10)"/>
                </g>

                {/* friendlies */}
                {[[260,180],[345,260],[210,290],[400,170]].map(([x,y],i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r="5" fill="#00e0ff"/>
                    <text x={x+9} y={y+3} fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(0,224,255,0.8)">OP-0{i+1}</text>
                  </g>
                ))}
                {/* hostiles */}
                {[[150,360],[470,360],[150,90],[490,90]].map(([x,y],i) => (
                  <g key={i}>
                    <rect x={x-4} y={y-4} width="8" height="8" fill="#ff2dca"/>
                    <text x={x+9} y={y+3} fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(255,45,202,0.8)">X-0{i+1}</text>
                  </g>
                ))}
                {/* objective */}
                <g transform="translate(440 240)">
                  <polygon points="0,-10 10,0 0,10 -10,0" fill="none" stroke="#ffaa00" strokeWidth="1.5"/>
                  <text x="14" y="3" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#ffaa00">OBJ · M-03</text>
                </g>
                <style>{`@keyframes rotateBeam { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

                {/* HUD lines */}
                <text x="20" y="22"  fontFamily="JetBrains Mono, monospace" fontSize="10" fill="rgba(108,117,163,0.9)" letterSpacing="2">// MINIMAP · 实时</text>
                <text x="20" y="38"  fontFamily="JetBrains Mono, monospace" fontSize="9"  fill="rgba(232,240,255,0.7)">ZOOM 2.0× · LOCK SHEKOU</text>
                <text x="580" y="22" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#ff2dca" textAnchor="end">HOSTILES · 04</text>
                <text x="580" y="38" fontFamily="JetBrains Mono, monospace" fontSize="9"  fill="rgba(232,240,255,0.6)" textAnchor="end">ALLIES · 04</text>
                <text x="20" y="430" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(0,224,255,0.65)">SIGNAL · STABLE</text>
                <text x="580" y="430" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(255,170,0,0.7)" textAnchor="end">EMP · 38%</text>
              </svg>
            </HudFrame>

            {/* secondary slim HUD strip */}
            <div className="mt-6 grid grid-cols-4 gap-px bg-line/40 text-[10px] font-mono">
              {[
                { k: "HP",   v: "92",  tone: "text-cyan"    },
                { k: "ARM",  v: "68",  tone: "text-cyan"    },
                { k: "AMMO", v: "27",  tone: "text-amber"   },
                { k: "EMP",  v: "38",  tone: "text-magenta" },
              ].map((s) => (
                <div key={s.k} className="bg-ink/80 p-3">
                  <div className="text-[9px] tracking-[0.32em] text-dim uppercase">{s.k}</div>
                  <div className={`display text-2xl ${s.tone}`}>{s.v}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Bullet({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-start gap-4">
      <span className="w-24 text-cyan tracking-[0.22em] uppercase">{k}</span>
      <span className="text-bone-2 flex-1">{v}</span>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOBBY / LEADERBOARD
// ─────────────────────────────────────────────────────────────────────────────

const LEADERS = [
  { rank: "01", op: "K. Chen · 陈凯",      district: "Qianhai",  squad: "GHOST-01", score: 184_320, tone: "cyan"    },
  { rank: "02", op: "Y. Liang · 梁宇",      district: "Nanshan",  squad: "VESPER-09", score: 172_911, tone: "magenta" },
  { rank: "03", op: "S. Park · 朴秀彬",     district: "Shekou",   squad: "MAGLEV-3",  score: 168_404, tone: "amber"   },
  { rank: "04", op: "A. Ravi · 拉维",       district: "Longgang", squad: "MIRROR-7",  score: 159_287, tone: "cyan"    },
  { rank: "05", op: "M. Okafor · 奥卡福尔", district: "Futian",   squad: "RAINSIDE",  score: 152_104, tone: "magenta" },
  { rank: "06", op: "T. Hu · 胡铁城",       district: "Bay Bridge",squad: "OCHRE-02",  score: 148_998, tone: "amber"   },
];

function Lobby() {
  return (
    <section className="relative py-32 sm:py-44 border-t border-line/40">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10">
        <SectionHead n="07" eyebrow="// Lobby · 战队大厅" en="Squad Up. Read the Global Board." zh="组队 · 阅读全球榜单" />

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 mt-14 items-start">
          {/* Leaderboard */}
          <Reveal>
            <HudFrame label="GLOBAL · 全球排行" tone="cyan" className="bg-ink/70">
              <div className="grid grid-cols-[60px_1fr_120px_120px_120px] gap-4 px-5 py-3 border-b border-line text-[10px] font-mono tracking-[0.28em] text-mute uppercase">
                <span>Rank</span><span>Operative · 行动者</span><span>District</span><span>Squad</span><span className="text-right">SCORE</span>
              </div>
              {LEADERS.map((L) => (
                <div key={L.rank} className="grid grid-cols-[60px_1fr_120px_120px_120px] gap-4 px-5 py-3 border-b border-line/40 text-sm hover:bg-steel-2/40">
                  <span className={`font-mono ${L.tone === "magenta" ? "text-magenta" : L.tone === "amber" ? "text-amber" : "text-cyan"}`}>{L.rank}</span>
                  <span className="text-bone">{L.op}</span>
                  <span className="font-mono text-mute text-xs">{L.district}</span>
                  <span className="font-mono text-bone-2 text-xs">{L.squad}</span>
                  <span className="font-mono text-bone text-right">{L.score.toLocaleString()}</span>
                </div>
              ))}
              <div className="px-5 py-3 text-[10px] font-mono tracking-[0.28em] text-dim uppercase flex items-center justify-between">
                <span>// SHARDS: 12 · TOTAL OPS: 41.2k</span>
                <span>SEASON 03 · 第三赛季</span>
              </div>
            </HudFrame>
          </Reveal>

          {/* Lobby card */}
          <Reveal delay={0.1}>
            <HudFrame label="MATCHMAKING · 匹配中" tone="magenta" className="bg-ink/70 p-7">
              <div className="display text-2xl text-bone">Find a squad in 14s.</div>
              <div className="mt-1 zh-display text-lg text-bone-2">14 秒内为你匹配队友。</div>

              <div className="mt-6 space-y-3 font-mono text-xs text-bone-2">
                {[
                  { k: "PING",     v: "18 ms · CN-SOUTH-1" },
                  { k: "REGION",   v: "Asia · Bay area" },
                  { k: "ROLE",     v: "Cyber · Sniper · Heavy" },
                  { k: "DIFFICULTY", v: "GAMMA · cinematic" },
                ].map((s) => (
                  <div key={s.k} className="flex items-center justify-between border-b border-line/40 pb-2">
                    <span className="text-dim tracking-[0.28em] uppercase">{s.k}</span>
                    <span className="text-bone">{s.v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 h-2 bg-line relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-cyan via-magenta to-amber animate-pulse-soft" />
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button className="neon-btn">
                  <span>加入队伍</span>
                  <span className="text-[10px] opacity-80">JOIN SQUAD</span>
                </button>
                <span className="font-mono text-[10px] text-mute">// 03 SLOTS OPEN · 三个席位</span>
              </div>
            </HudFrame>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL CTA
// ─────────────────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="relative py-40 sm:py-56 overflow-hidden">
      <div className="absolute inset-0 -z-[1] pointer-events-none"
           style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,224,255,0.18), transparent 60%), radial-gradient(ellipse 50% 50% at 50% 5%, rgba(255,45,202,0.18), transparent 60%)" }} />
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 text-center">
        <Reveal>
          <div className="eyebrow text-cyan mb-10">// PRE-BOOT · 准备启动</div>
          <h2 className="display text-[clamp(2.4rem,6.5vw,5.5rem)] leading-[1.02] text-bone">
            The bay <span className="text-cyan">is waiting</span>.
          </h2>
          <p className="zh-display text-2xl sm:text-3xl mt-4 text-magenta-2">海湾，已就位。</p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-10 max-w-2xl mx-auto text-bone-2 text-lg leading-relaxed">
            This is a fictional landing concept — not a real game. But if it were real, the queue
            would already be twelve seconds long.
          </p>
          <p className="mt-3 max-w-2xl mx-auto zh-display text-base text-mute">
            这是一个虚构的游戏概念页 —— 并非真实产品。但如果是真的，匹配队列已经只剩十二秒。
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-14 flex flex-wrap justify-center items-center gap-5">
            <a href="/play" className="neon-btn">
              <span>开始行动</span>
              <span className="text-[10px] opacity-80">START MISSION</span>
              <span>›</span>
            </a>
            <a href="#operatives" className="neon-btn neon-btn-secondary">
              <span>查看队伍</span>
              <span className="text-[10px] opacity-80">VIEW SQUAD</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <p className="mt-20 font-mono text-[10px] tracking-[0.34em] uppercase text-mute">
            // PROTOCOL ENGAGED · 协议已启动
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PIECES
// ─────────────────────────────────────────────────────────────────────────────

function SectionHead({ n, eyebrow, en, zh }: { n: string; eyebrow: string; en: string; zh: string }) {
  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-10 items-end">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="section-tab">{n}</span>
          <div className="w-12 h-px bg-cyan/40" />
        </div>
        <div className="mt-3 eyebrow">{eyebrow}</div>
      </div>
      <div>
        <h2 className="display text-[clamp(2rem,5vw,4rem)] leading-[0.98] text-bone">{en}</h2>
        <div className="mt-3 zh-display text-2xl sm:text-3xl text-bone-2">{zh}</div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-line/60">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 py-14 grid sm:grid-cols-[1fr_auto] gap-6 items-end">
        <div>
          <div className="eyebrow text-cyan">// CLOSE · 信号</div>
          <div className="mt-3 display text-2xl text-bone">Shenzhen Bay Protocol</div>
          <div className="zh-display text-lg text-bone-2">深圳湾行动 · 虚构作品</div>
          <p className="mt-3 text-xs font-mono text-mute max-w-md leading-relaxed">
            Fictional cinematic concept. Not a real product, not affiliated with any real entity,
            and not intended as military simulation or training material.
          </p>
        </div>
        <div className="text-right font-mono text-xs text-mute tracking-[0.18em] uppercase">
          A field instrument by <a className="text-cyan hover:underline" href="https://psyverse.fun">Psyverse</a><br/>
          by Gewenbo · MMXXVI
        </div>
      </div>
    </footer>
  );
}
