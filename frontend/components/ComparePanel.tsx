"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Map, Navigation, ChevronRight, Award, ChevronDown, ChevronUp } from "lucide-react";
import type { CompareResult, PathResult } from "@/app/page";

const ALGOS = [
  { key: "dijkstra", label: "Dijkstra's", colour: "#3b82f6", badge: "badge-blue" },
  { key: "astar", label: "A* Search", colour: "#a855f7", badge: "badge-purple" },
  { key: "prims", label: "Prim's (MST Path)", colour: "#f97316", badge: "badge-amber" },
] as const;

export default function ComparePanel({ compareResult }: { compareResult: CompareResult }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const results = ALGOS.map((a) => ({ ...a, data: compareResult[a.key] }));

  // Best performers
  const minCost = Math.min(...results.filter((r) => r.data).map((r) => r.data!.total_cost));
  const minNodes = Math.min(...results.filter((r) => r.data).map((r) => r.data!.nodes_explored));
  const minTime = Math.min(...results.filter((r) => r.data).map((r) => r.data!.time_ms));

  return (
    <div className="skeuo-card px-4 py-3.5 transition-all duration-300" style={{ background: "var(--bg-panel)" }}>
      {/* Header Bar */}
      <div 
        className="flex items-center gap-2.5 border-b pb-3 transition-all duration-300" 
        style={{ 
          borderColor: "var(--border-bevel)",
          marginBottom: isMinimized ? "0px" : "12px"
        }}
      >
        <div className="skeuo-led led-blue animate-pulse" />
        <h3 className="font-black text-[var(--text-primary)] text-sm tracking-tight uppercase font-mono">Analytical Benchmarks</h3>
        
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-black tracking-widest text-[var(--text-muted)] uppercase px-3 py-1 bg-[var(--bg-base)] rounded-lg skeuo-inset border border-black/5">System Telemetry</span>
          
          {/* Mechanical Minimize Switch */}
          <motion.button
            whileTap={{ scale: 0.92, translateY: "1.5px" }}
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-neu-out hover:shadow-neu-out-sm border bg-[var(--bg-panel)] relative overflow-hidden text-[var(--text-primary)] cursor-pointer"
            style={{ borderColor: "var(--border-bevel)" }}
            aria-label={isMinimized ? "Expand Analytics" : "Minimize Analytics"}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <div className="absolute inset-0 bg-[var(--gloss-overlay)] pointer-events-none" />
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </motion.button>
        </div>
      </div>

      {/* Collapsible Telemetry Content */}
      <motion.div
        initial={false}
        animate={{ 
          height: isMinimized ? 0 : "auto", 
          opacity: isMinimized ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-3 gap-3 pb-1">
          {results.map(({ key, label, colour, badge, data }) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-3 bg-[var(--bg-panel)] border shadow-neu-out hover:shadow-neu-out-sm transition-all duration-150 relative overflow-hidden"
              style={{ borderColor: "var(--border-bevel)" }}
            >
              {/* Specular reflective shine on button faces */}
              <div className="absolute inset-0 bg-[var(--gloss-overlay)] pointer-events-none" />

              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className={`badge ${badge} font-black shadow-sm`}>{label}</span>
              </div>

              {data ? (
                <div className="flex flex-col gap-1 relative z-10">
                  <CompareRow
                    label="Distance"
                    value={`${data.total_cost} km`}
                    best={data.total_cost === minCost}
                    colour={colour}
                  />
                  <CompareRow
                    label="Nodes"
                    value={String(data.nodes_explored)}
                    best={data.nodes_explored === minNodes}
                    colour={colour}
                  />
                  <CompareRow
                    label="Latency"
                    value={`${data.time_ms} ms`}
                    best={data.time_ms === minTime}
                    colour={colour}
                  />

                  {/* Deep stamp path lists */}
                  <div className="mt-2.5 pt-2 border-t skeuo-inset p-2 bg-[var(--bg-base)] border border-black/5" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 font-mono flex items-center gap-1">
                      <div className="skeuo-led led-green" /> Path Track
                    </p>
                    <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 max-h-20 overflow-y-auto pr-1 font-mono text-[11px]">
                      {data.path.map((c, i) => (
                        <span key={i} className="font-black leading-relaxed" style={{ color: colour }}>
                          {c}{i < data.path.length - 1 ? " →" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-black text-red-600 dark:text-red-400 text-center py-6 uppercase font-mono relative z-10">Readout Failure</p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function CompareRow({
  label, value, best, colour,
}: {
  label: string; value: string; best: boolean; colour: string;
}) {
  return (
    <div className="flex items-center justify-between py-1 border-b" style={{ borderColor: "var(--divider)" }}>
      <span className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        {best && (
          <div className="skeuo-led led-green flex-shrink-0 drop-shadow-[0_0_4px_#10b981]" title="Optimal Metric" />
        )}
        <span
          className="text-sm font-mono font-black tracking-tight"
          style={{ 
            color: best ? (colour === "#f97316" ? "#ea580c" : colour) : colour,
            textShadow: best ? `0 0 8px ${colour}` : "none" 
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}




