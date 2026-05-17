import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Cyberpunk neon palette — dual cyan/magenta + amber alerts
        ink:       "#03050d",
        "ink-2":   "#06091a",
        steel:     "#0b1024",
        "steel-2": "#121833",
        line:      "#1c2247",
        "line-2":  "#2a3170",
        edge:      "#3b4280",
        bone:      "#e8f0ff",
        "bone-2":  "#c2caf0",
        mute:      "#6c75a3",
        dim:       "#3f456b",
        // neon tiers
        cyan:      "#00e0ff",
        "cyan-2":  "#7df0ff",
        magenta:   "#ff2dca",
        "magenta-2":"#ff86e8",
        amber:     "#ffaa00",
        "amber-2": "#ffd860",
        lime:      "#a3ff5b",
        red:       "#ff3366",
      },
      fontFamily: {
        // Distinctive cyberpunk feel — Orbitron + Rajdhani + ZH
        display: ['"Orbitron"', "system-ui", "sans-serif"],
        body:    ['"Rajdhani"', "system-ui", "sans-serif"],
        mono:    ['"JetBrains Mono"', '"SF Mono"', "Menlo", "monospace"],
        zh:      ['"ZCOOL XiaoWei"', '"Noto Serif SC"', "Georgia", "serif"],
        zhSans:  ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.32em",
        widestX: "0.5em",
      },
      animation: {
        "pulse-soft": "pulseSoft 3.4s ease-in-out infinite",
        "scan":       "scan 5s linear infinite",
        "scan-slow":  "scan 12s linear infinite",
        "rain":       "rain 0.9s linear infinite",
        "tower-spin": "spin 90s linear infinite",
        "ticker":     "ticker 60s linear infinite",
        "glitch":     "glitch 2.4s steps(8, end) infinite",
      },
      keyframes: {
        pulseSoft: { "0%, 100%": { opacity: ".35" }, "50%": { opacity: "1" } },
        scan:      { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(120%)" } },
        rain:      { "0%": { transform: "translateY(-30%)" }, "100%": { transform: "translateY(130%)" } },
        ticker:    { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        glitch: {
          "0%, 100%": { textShadow: "0.5px 0 rgba(255,45,202,0.7), -0.5px 0 rgba(0,224,255,0.7)" },
          "20%":  { textShadow: "1.5px 0 rgba(255,45,202,0.7), -1.5px 0 rgba(0,224,255,0.7)" },
          "40%":  { textShadow: "-2px 0 rgba(255,45,202,0.7), 2px 0 rgba(0,224,255,0.7)" },
          "60%":  { textShadow: "1px 0 rgba(255,45,202,0.7), -1px 0 rgba(0,224,255,0.7)" },
          "80%":  { textShadow: "0.5px 0 rgba(255,45,202,0.7), -0.5px 0 rgba(0,224,255,0.7)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
