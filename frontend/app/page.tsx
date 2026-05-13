"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MetricsPanel from "@/components/MetricsPanel";
import ComparePanel from "@/components/ComparePanel";
import Header from "@/components/Header";

// Leaflet cannot run server-side
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export type PathResult = {
  algorithm: string;
  path: string[];
  total_cost: number;
  nodes_explored: number;
  exploration_order: string[];
  time_ms: number;
};

export type CompareResult = {
  dijkstra: PathResult | null;
  astar: PathResult | null;
  greedy: PathResult | null;
};

export type NodeData = { id: string; lat: number; lng: number };
export type EdgeData = {
  from: string;
  to: string;
  base_distance: number;
  traffic_multiplier: number;
  effective_weight: number;
};

export type AppMode = "single" | "compare";

export default function Home() {
  const [mode, setMode] = useState<AppMode>("single");
  const [result, setResult] = useState<PathResult | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [activeAlgo, setActiveAlgo] = useState<"dijkstra" | "astar" | "greedy">("dijkstra");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Side effect for Dark Mode trigger
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleEdgesUpdated = useCallback((updated: EdgeData[]) => {
    setEdges(updated);
  }, []);

  const handleResult = useCallback((r: PathResult | null) => {
    setResult(r);
    setCompareResult(null);
    setMode("single");
  }, []);

  const handleCompareResult = useCallback((r: CompareResult) => {
    setCompareResult(r);
    setResult(null);
    setMode("compare");
  }, []);

  // Which path to highlight on map
  const activePath =
    mode === "compare"
      ? compareResult?.dijkstra?.path ?? []
      : result?.path ?? [];

  const comparePathsForMap =
    mode === "compare"
      ? {
          dijkstra: compareResult?.dijkstra?.path ?? [],
          astar: compareResult?.astar?.path ?? [],
          greedy: compareResult?.greedy?.path ?? [],
        }
      : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        mode={mode}
        onModeChange={setMode}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((p) => !p)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <Sidebar
          loading={loading}
          setLoading={setLoading}
          onResult={handleResult}
          onCompareResult={handleCompareResult}
          onEdgesUpdated={handleEdgesUpdated}
          activeAlgo={activeAlgo}
          setActiveAlgo={setActiveAlgo}
          mode={mode}
          setMode={setMode}
        />

        {/* ── Map + Metrics ── */}
        <div className="flex-1 relative overflow-hidden">
          <MapView
            activePath={activePath}
            comparePathsForMap={comparePathsForMap}
            edges={edges}
            onEdgesUpdated={handleEdgesUpdated}
            explorationOrder={
              mode === "single" ? result?.exploration_order ?? [] : []
            }
          />

          {/* Metrics overlay */}
          <AnimatePresence>
            {mode === "single" && result && (
              <motion.div
                key="metrics"
                initial={{ opacity: 0, x: "-50%", y: 20 }}
                animate={{ opacity: 1, x: "-50%", y: 0 }}
                exit={{ opacity: 0, x: "-50%", y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-6 left-1/2 z-[1000] w-full max-w-2xl px-4"
              >
                <MetricsPanel result={result} />
              </motion.div>
            )}

            {mode === "compare" && compareResult && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, x: "-50%", y: 20 }}
                animate={{ opacity: 1, x: "-50%", y: 0 }}
                exit={{ opacity: 0, x: "-50%", y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-6 left-1/2 z-[1000] w-full max-w-4xl px-4"
              >
                <ComparePanel compareResult={compareResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

