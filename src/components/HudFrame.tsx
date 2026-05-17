"use client";

import { ReactNode } from "react";

/**
 * HudFrame — decorative HUD corners + scanline + optional label.
 * Layered on top of any block to make it look like a tactical interface.
 */
export default function HudFrame({
  children,
  label,
  tone = "cyan",
  className = "",
}: {
  children: ReactNode;
  label?: string;
  tone?: "cyan" | "magenta" | "amber" | "red";
  className?: string;
}) {
  const toneClass =
    tone === "magenta" ? "text-magenta border-magenta/40"
    : tone === "amber" ? "text-amber border-amber/40"
    : tone === "red"   ? "text-red border-red/40"
    : "text-cyan border-cyan/35";

  return (
    <div className={`relative ${className}`}>
      {/* Brackets */}
      <div className={`absolute inset-0 pointer-events-none ${toneClass}`}>
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-current" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-current" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-current" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-current" />
        <div className="absolute inset-0 border border-current opacity-30" />
      </div>
      {/* Tiny label */}
      {label && (
        <div className={`absolute -top-2 left-3 px-2 py-[1px] text-[9px] font-mono tracking-[0.32em] uppercase bg-ink ${toneClass}`}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
