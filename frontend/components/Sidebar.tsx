"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Zap, BarChart2, AlertCircle, Search,
  Navigation, GitCompare, Loader2, Radio,
} from "lucide-react";
import type { PathResult, CompareResult, EdgeData, AppMode } from "@/app/page";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CITIES = [
  "Agra","Ahmedabad","Bangalore","Bhopal","Chennai",
  "Delhi","Hyderabad","Indore","Jaipur","Kolkata",
  "Lucknow","Mumbai","Nagpur","Pune","Varanasi",
];

const ALGORITHMS = [
  { value: "dijkstra", label: "Dijkstra's",       badge: "badge-blue",   desc: "Optimal, explores more nodes", color: "#3b82f6" },
  { value: "astar",    label: "A* Search",         badge: "badge-purple", desc: "Informed, faster than Dijkstra", color: "#a855f7" },
  { value: "greedy",   label: "Greedy Best-First", badge: "badge-amber",  desc: "Fastest, not always optimal", color: "#f97316" },
];

// ── traffic colour helper
function trafficColour(m: number) {
  if (m <= 1.5) return "var(--traffic-low)";
  if (m <= 2.5) return "var(--traffic-medium)";
  return "var(--traffic-high)";
}

type Props = {
  loading: boolean;
  setLoading: (v: boolean) => void;
  onResult: (r: PathResult | null) => void;
  onCompareResult: (r: CompareResult) => void;
  onEdgesUpdated: (edges: EdgeData[]) => void;
  activeAlgo: "dijkstra" | "astar" | "greedy";
  setActiveAlgo: (v: "dijkstra" | "astar" | "greedy") => void;
  mode: AppMode;
  setMode: (m: AppMode) => void;
};

export default function Sidebar({
  loading, setLoading, onResult, onCompareResult,
  onEdgesUpdated, activeAlgo, setActiveAlgo, mode, setMode,
}: Props) {
  const [start, setStart] = useState("Delhi");
  const [end, setEnd]     = useState("Mumbai");
  const [error, setError] = useState("");
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{ found: boolean; node: string | null; index: number; sorted_list: string[] } | null>(null);

  // Selected edge for traffic control
  const [selectedEdge, setSelectedEdge] = useState<string>("");
  const [trafficVal, setTrafficVal] = useState(1.0);

  useEffect(() => {
    fetch(`${API}/nodes`)
      .then((r) => r.json())
      .then((data) => {
        setEdges(data.edges);
        onEdgesUpdated(data.edges);
        if (data.edges.length > 0) {
          const e = data.edges[0];
          setSelectedEdge(`${e.from}|${e.to}`);
        }
      })
      .catch(() => setError("Cannot connect to backend. Is it running?"));
  }, [onEdgesUpdated]);

  async function findPath() {
    if (start === end) { setError("Start and end must differ"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/find-path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end, algorithm: activeAlgo }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail); }
      const data: PathResult = await res.json();
      onResult(data);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function compareAll() {
    if (start === end) { setError("Start and end must differ"); return; }
    setLoading(true); setError(""); setMode("compare");
    try {
      const res = await fetch(`${API}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail); }
      const data: CompareResult = await res.json();
      onCompareResult(data);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function applyTraffic() {
    if (!selectedEdge) return;
    const [from, to] = selectedEdge.split("|");
    try {
      await fetch(`${API}/set-traffic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_city: from, to_city: to, multiplier: trafficVal }),
      });
      // refresh edges
      const r = await fetch(`${API}/nodes`);
      const data = await r.json();
      setEdges(data.edges);
      onEdgesUpdated(data.edges);
    } catch {
      setError("Failed to update traffic");
    }
  }

  async function doSearch() {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`${API}/search-node`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResult(data);
    } catch {
      setError("Search failed");
    }
  }

  const selectedEdgeData = edges.find(
    (e) => `${e.from}|${e.to}` === selectedEdge || `${e.to}|${e.from}` === selectedEdge
  );

  return (
    <aside
      className="w-80 flex flex-col gap-0 overflow-y-auto flex-shrink-0 bg-[var(--bg-panel)] border-r transition-all duration-300"
      style={{
        borderColor: "var(--border-bevel)",
        boxShadow: "inset -1px 0 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* ── City Selection ── */}
      <Section title="Route Selection" icon={<MapPin size={14} />} iconColor="#1976d2">
        <label className="text-xs font-bold text-[var(--text-secondary)] mb-1.5 block">Start City</label>
        <select className="custom-select mb-4" value={start} onChange={(e) => setStart(e.target.value)}>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        <label className="text-xs font-bold text-[var(--text-secondary)] mb-1.5 block">End City</label>
        <select className="custom-select" value={end} onChange={(e) => setEnd(e.target.value)}>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Section>

      {/* ── Algorithm ── */}
      <Section title="Algorithm" icon={<Zap size={14} />} iconColor="#7b1fa2">
        <div className="flex flex-col gap-3.5">
          {ALGORITHMS.map((a) => {
            const isActive = activeAlgo === a.value;
            return (
              <motion.button
                key={a.value}
                whileTap={{ scale: 0.97, translateY: isActive ? "0px" : "1px" }}
                onClick={() => setActiveAlgo(a.value as any)}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-150 text-left relative overflow-hidden border ${
                  isActive 
                    ? "skeuo-inset bg-[var(--bg-base)] shadow-neu-in" 
                    : "bg-[var(--bg-panel)] shadow-neu-out hover:shadow-neu-out-sm"
                }`}
                style={{
                  borderColor: "var(--border-bevel)",
                }}
              >
                {/* Glossy light sheen on non-active button faces */}
                {!isActive && (
                  <div className="absolute inset-0 bg-[var(--gloss-overlay)] pointer-events-none" />
                )}
                
                {/* Physical, functional Status LED Indicator */}
                <div
                  className="skeuo-led flex-shrink-0"
                  style={{
                    background: isActive ? a.color : "#64748b",
                    boxShadow: isActive 
                      ? `0 0 9px ${a.color}, inset 0 0 2px rgba(0,0,0,0.2)` 
                      : "inset 0 1px 3px rgba(0,0,0,0.4)"
                  }}
                />
                
                <div className="flex-1">
                  <p className="text-sm font-black text-[var(--text-primary)] tracking-tight leading-tight">{a.label}</p>
                  <p className="text-[11px] font-extrabold text-[var(--text-muted)] mt-0.5 leading-tight">{a.desc}</p>
                </div>
                {isActive && (
                  <span className={`badge ${a.badge} ml-2 shrink-0`}>ON</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="px-4 py-4 flex flex-col gap-3">
        {error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-sm dark:bg-red-950/50 dark:text-red-300 dark:border-red-800"
          >
            <AlertCircle size={15} /> {error}
          </motion.div>
        )}

        <button className="btn-primary w-full flex items-center justify-center gap-2 py-3" onClick={findPath} disabled={loading}>
          {loading && mode === "single" ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
          Find Path
        </button>

        <button className="btn-compare w-full flex items-center justify-center gap-2 py-3" onClick={compareAll} disabled={loading}>
          {loading && mode === "compare" ? <Loader2 size={16} className="animate-spin" /> : <GitCompare size={16} />}
          Compare All
        </button>
      </div>

      {/* ── Traffic Control ── */}
      <Section title="Traffic Simulation" icon={<Radio size={14} />} iconColor="#f57c00">
        <label className="text-xs font-bold text-[var(--text-secondary)] mb-1.5 block">Select Road</label>
        <select
          className="custom-select mb-4"
          value={selectedEdge}
          onChange={(e) => {
            setSelectedEdge(e.target.value);
            const ed = edges.find(
              (x) => `${x.from}|${x.to}` === e.target.value || `${x.to}|${x.from}` === e.target.value
            );
            if (ed) setTrafficVal(ed.traffic_multiplier);
          }}
        >
          {edges.map((e) => (
            <option key={`${e.from}|${e.to}`} value={`${e.from}|${e.to}`}>
              {e.from} ↔ {e.to} ({e.base_distance} km)
            </option>
          ))}
        </select>

        {/* Current traffic indicator */}
        {selectedEdgeData && (
          <div className="flex items-center justify-between mb-4 text-xs font-bold">
            <span className="text-[var(--text-muted)]">Current multiplier</span>
            <span className="font-mono font-extrabold px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 shadow-inner transition-colors" style={{ color: trafficColour(selectedEdgeData.traffic_multiplier) }}>
              {selectedEdgeData.traffic_multiplier.toFixed(1)}×
            </span>
          </div>
        )}

        <label className="text-xs font-bold text-[var(--text-secondary)] mb-2 block flex items-center justify-between">
          <span>Traffic Multiplier</span>
          <span className="font-mono text-amber-600 dark:text-amber-400 font-extrabold text-sm">{trafficVal.toFixed(1)}×</span>
        </label>
        <input
          type="range" min="0.5" max="5" step="0.1"
          value={trafficVal}
          className="custom-range mb-3"
          onChange={(e) => setTrafficVal(parseFloat(e.target.value))}
        />
        <div className="flex justify-between text-[10px] font-extrabold text-[var(--text-muted)] mb-4 px-1">
          <span>FAST</span><span>NORMAL</span><span>JAM</span>
        </div>

        <button className="btn-secondary w-full text-xs font-bold uppercase py-3 shadow-neu-out" onClick={applyTraffic}>
          Apply Traffic
        </button>
      </Section>

      {/* ── Binary Search ── */}
      <Section title="Node Search (Binary)" icon={<Search size={14} />} iconColor="#0097a7">
        <div className="flex gap-3">
          <input
            className="custom-input text-sm"
            placeholder="e.g. Mumbai"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
          />
          <button className="btn-primary px-5 text-sm flex-shrink-0 shadow-neu-out" onClick={doSearch}>Go</button>
        </div>

        {searchResult && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl text-xs neu-inset border"
            style={{
              borderColor: "var(--border-subtle)",
            }}
          >
            {searchResult.found ? (
              <>
                <p className="text-green-600 dark:text-green-400 font-extrabold">✓ Found: {searchResult.node}</p>
                <p className="text-[var(--text-secondary)] font-bold mt-1">Index {searchResult.index} in sorted list</p>
                <p className="text-[var(--text-muted)] mt-2 font-mono leading-relaxed font-semibold max-h-24 overflow-y-auto bg-black/5 dark:bg-black/20 p-2 rounded border border-black/5 dark:border-white/5">
                  [{searchResult.sorted_list.join(", ")}]
                </p>
              </>
            ) : (
              <p className="text-red-600 dark:text-red-400 font-bold">✗ "{searchQuery}" not in graph</p>
            )}
          </motion.div>
        )}
      </Section>

      {/* ── Legend ── */}
      <Section title="Map Legend" icon={<BarChart2 size={14} />} iconColor="#388e3c">
        <div className="flex flex-col gap-2.5 text-xs font-bold">
          {[
            { color: "#1976d2", label: "Dijkstra path" },
            { color: "#7b1fa2", label: "A* path" },
            { color: "#f57c00", label: "Greedy path" },
            { color: "#388e3c", label: "Graph edges" },
            { color: "#d32f2f", label: "Heavy traffic" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-5 h-1.5 rounded-full shadow-sm" style={{ background: color }} />
              <span className="text-[var(--text-secondary)]">{label}</span>
            </div>
          ))}
        </div>
      </Section>
    </aside>
  );
}

function Section({
  title, icon, iconColor, children,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div 
      className="px-4 py-5 border-b transition-all duration-300 relative" 
      style={{ borderBottom: "var(--border-bevel)" }}
    >
      {/* Realistic physical grooved highlighting line underneath the dark bevel border */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/60 dark:bg-white/5 pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4">
        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]" style={{ color: iconColor }}>{icon}</span>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}


