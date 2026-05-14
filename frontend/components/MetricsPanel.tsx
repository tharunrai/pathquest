"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Map, Navigation, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import type { PathResult } from "@/app/page";

export default function MetricsPanel({ result }: { result: PathResult }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const algoColour: Record<string, string> = {
    "Dijkstra":          "#3b82f6",
    "A*":                "#a855f7",
    "Prim's (MST Path)": "#f97316",
  };
  const colour = algoColour[result.algorithm] ?? "#3b82f6";

  return (
    <div className="skeuo-card px-6 py-5 transition-all duration-300" style={{ background: "var(--bg-panel)" }}>
      {/* Ribbon Header (Always visible) */}
      <div 
        className="flex items-center justify-between transition-all duration-300" 
        style={{ marginBottom: isMinimized ? "0px" : "20px" }}
      >
        <div className="flex items-center gap-3">
          {/* Mechanical Recessed Box for Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center skeuo-inset border"
            style={{ borderColor: `rgba(0,0,0,0.05)` }}
          >
            <Navigation size={17} style={{ color: colour, filter: `drop-shadow(0 0 6px ${colour})` }} />
          </div>
          <div>
            <p className="font-black text-[var(--text-primary)] text-base tracking-tight uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{result.algorithm}</p>
            <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">INSTRUMENT READOUT</p>
          </div>
        </div>

        {/* Tactical Minimizer Toggle Switch */}
        <motion.button
          whileTap={{ scale: 0.92, translateY: "1.5px" }}
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-7 h-7 rounded-lg flex items-center justify-center shadow-neu-out hover:shadow-neu-out-sm border bg-[var(--bg-panel)] relative overflow-hidden text-[var(--text-primary)] cursor-pointer ml-auto"
          style={{ borderColor: "var(--border-bevel)" }}
          aria-label={isMinimized ? "Expand Metrics" : "Minimize Metrics"}
          title={isMinimized ? "Expand" : "Minimize"}
        >
          <div className="absolute inset-0 bg-[var(--gloss-overlay)] pointer-events-none" />
          {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </motion.button>
      </div>

      {/* Animated Body (Collapses fully) */}
      <motion.div
        initial={false}
        animate={{ 
          height: isMinimized ? 0 : "auto", 
          opacity: isMinimized ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden flex flex-col gap-4"
      >
        {/* Stats Board */}
        <div className="flex gap-6 bg-[var(--bg-base)] px-5 py-2 rounded-xl skeuo-inset border border-black/5">
          <Stat label="Distance" value={`${result.total_cost} km`} icon={<Map size={12} />} colour={colour} />
          <div className="w-[1px] bg-[var(--divider)] self-stretch my-1" />
          <Stat label="Explored" value={String(result.nodes_explored)} icon={<Navigation size={12} />} colour="#a855f7" />
          <div className="w-[1px] bg-[var(--divider)] self-stretch my-1" />
          <Stat label="Latency" value={`${result.time_ms} ms`} icon={<Clock size={12} />} colour="#06b6d4" />
        </div>

        {/* Deeply Recessed Path Track */}
        <div className="flex items-center flex-wrap gap-2 skeuo-inset p-3.5 rounded-xl border" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
          <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mr-1.5 font-mono flex items-center gap-1.5">
            <div className="skeuo-led led-green" /> Route Track:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {result.path.map((city, i) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2"
              >
                <span className="path-node shadow-neu-out-sm">{city}</span>
                {i < result.path.length - 1 && (
                  <ChevronRight size={14} className="text-[var(--text-muted)] opacity-70" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({
  label, value, icon, colour,
}: {
  label: string; value: string; icon: React.ReactNode; colour: string;
}) {
  return (
    <div className="text-right py-1 flex-1">
      <div className="flex items-center justify-end gap-1 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
        <span style={{ color: colour }}>{icon}</span>
        {label}
      </div>
      {/* CRT Digital Glowing Font */}
      <p className="metric-value" style={{ color: colour, fontSize: 17 }}>{value}</p>
    </div>
  );
}




