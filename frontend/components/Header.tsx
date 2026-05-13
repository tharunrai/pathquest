"use client";

import { motion } from "framer-motion";
import { Navigation, GitCompare, Sun, Moon } from "lucide-react";
import type { AppMode } from "@/app/page";

type Props = {
  mode: AppMode;
  onModeChange: (m: AppMode) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
};

export default function Header({
  mode,
  onModeChange,
  isDarkMode,
  onToggleDarkMode,
}: Props) {
  return (
    <header
      className="flex items-center justify-between px-6 py-3 z-50 flex-shrink-0 bg-[var(--bg-panel)] border-b transition-all duration-300"
      style={{
        borderColor: "var(--border-bevel)",
        boxShadow: isDarkMode
          ? "0 4px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 4px 25px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-neu-out overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #1e293b, #0f172a)",
            borderColor: "rgba(255,255,255,0.05)"
          }}
        >
          {/* Specular flash */}
          <div className="absolute inset-0 bg-[var(--gloss-overlay)] pointer-events-none" />
          <Navigation size={22} color="#3b82f6" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        </div>
        <div>
          <span className="font-black text-2xl tracking-tight text-[var(--text-primary)]" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.05em" }}>PathQuest</span>
          <span className="text-[var(--text-secondary)] font-black text-2xl tracking-tight ml-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", opacity: 0.7 }}>.AI</span>
        </div>
        <span className="badge badge-blue ml-4">V2.0 INSTRUMENT</span>
      </div>

      {/* Mechanical Mode Switcher */}
      <div className="flex gap-2 p-2 skeuo-inset">
        {(["single", "compare"] as AppMode[]).map((m) => {
          const active = mode === m;

          // Dynamic specular styles
          const lightBg = "linear-gradient(to bottom, #ffffff 0%, #e2e8f0 100%)";
          const darkBg = "linear-gradient(to bottom, #334155 0%, #1e293b 100%)";
          const activeBg = isDarkMode ? darkBg : lightBg;

          const lightBorder = "1px solid #cbd5e1";
          const darkBorder = "1px solid #0f172a";
          const activeBorder = isDarkMode ? darkBorder : lightBorder;

          return (
            <motion.button
              key={m}
              onClick={() => onModeChange(m)}
              whileTap={{ scale: 0.96, translateY: "1px" }}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-150 flex items-center gap-3 relative overflow-hidden border ${active ? "shadow-neu-out-sm" : "border-transparent shadow-none"
                }`}
              style={{
                background: active ? activeBg : "transparent",
                borderColor: active ? "var(--border-bevel)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              {active && (
                <div className="absolute inset-0 bg-[var(--gloss-overlay)] pointer-events-none rounded-xl" />
              )}

              {/* Functional Physical LED Indicator */}
              <div className={`skeuo-led ${active ? (m === "single" ? "led-blue" : "led-green") : "led-off"}`} />

              {m === "compare" && <GitCompare size={14} className={active ? "opacity-100" : "opacity-50"} />}
              {m === "single" ? "Single Route" : "Comparison"}
            </motion.button>
          );
        })}
      </div>

      {/* Controls and System Status */}
      <div className="flex items-center gap-5">
        {/* Info badges */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-base)] px-3.5 py-2 rounded-lg skeuo-inset border border-black/5">
            <div className="skeuo-led led-green" />
            <span className="text-[10px] font-black tracking-widest uppercase font-mono text-[var(--text-secondary)]">API OK</span>
          </div>
        </div>

        {/* 3D Tactile Push Button Switch */}
        <motion.button
          whileTap={{ scale: 0.92, translateY: "2px" }}
          onClick={onToggleDarkMode}
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-neu-out border hover:shadow-neu-out-sm transition-all duration-150 relative overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--border-bevel)"
          }}
          aria-label="Toggle theme"
        >
          {/* Specular reflective overlay */}
          <div className="absolute inset-0 bg-[var(--gloss-overlay)] pointer-events-none" />
          {isDarkMode ? (
            <Sun size={18} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          ) : (
            <Moon size={18} className="text-slate-700 drop-shadow-[0_0_6px_rgba(0,0,0,0.2)]" />
          )}
        </motion.button>
      </div>
    </header>
  );
}



