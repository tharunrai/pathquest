"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio } from "lucide-react";
import type { EdgeData } from "@/app/page";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Props = {
  activePath: string[];
  comparePathsForMap: {
    dijkstra: string[];
    astar: string[];
    prims: string[];
  } | null;
  edges: EdgeData[];
  onEdgesUpdated: (edges: EdgeData[]) => void;
  explorationOrder: string[];
  searchedNode?: string | null;
};

const ALGO_COLOURS = {
  dijkstra: "#3b82f6",
  astar:    "#a855f7",
  prims:   "#f97316",
};

export default function MapView({
  activePath, comparePathsForMap, edges, onEdgesUpdated, explorationOrder, searchedNode = null,
}: Props) {
  const mapRef    = useRef<any>(null);
  const layerRef  = useRef<any>(null);
  const initRef   = useRef(false);
  const [nodes, setNodes] = useState<{ id: string; lat: number; lng: number }[]>([]);

  // ── SEARCH ANIMATION ENGINE ──
  const [animExploration, setAnimExploration] = useState<string[]>([]);
  const [animPath, setAnimPath] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // 1. Manage the simulation sequence
  useEffect(() => {
    // If no exploration (e.g. compare mode or initial), skip animation
    if (explorationOrder.length === 0) {
      setAnimExploration([]);
      setAnimPath(activePath);
      setIsAnimating(false);
      return;
    }

    // Reset buffers for a fresh visual run
    setAnimExploration([]);
    setAnimPath([]);
    setIsAnimating(true);

    let currentExplored: string[] = [];
    const timeouts: NodeJS.Timeout[] = [];

    // Propagate exploration nodes with steady industrial delay (120ms)
    explorationOrder.forEach((city, index) => {
      const t = setTimeout(() => {
        currentExplored = [...currentExplored, city];
        setAnimExploration(currentExplored);

        // Once completed exploring, show final golden route line
        if (index === explorationOrder.length - 1) {
          const endT = setTimeout(() => {
            setAnimPath(activePath);
            setIsAnimating(false);
          }, 200);
          timeouts.push(endT);
        }
      }, index * 120); // 120ms ticker per search branch

      timeouts.push(t);
    });

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [explorationOrder, activePath]);

  // 2. Load leaflet
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    Promise.all([
      import("leaflet"),
      fetch(`${API}/nodes`).then((r) => r.json()),
    ]).then(([L, data]) => {
      setNodes(data.nodes);
      onEdgesUpdated(data.edges);

      const map = L.map("map-container", {
        center: [22, 80],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
      const layer = L.layerGroup().addTo(map);
      layerRef.current = layer;

      drawGraph(L, layer, data.nodes, data.edges, [], null, [], null);
    });
  }, []);

  // 3. Force re-renders based on dynamic animated vectors
  useEffect(() => {
    if (!mapRef.current || nodes.length === 0) return;
    import("leaflet").then((L) => {
      if (layerRef.current) layerRef.current.clearLayers();
      const layer = layerRef.current ?? L.layerGroup().addTo(mapRef.current);
      layerRef.current = layer;
      
      // RENDER ANIMATION BUFFERS IN REALTIME
      drawGraph(L, layer, nodes, edges, animPath, comparePathsForMap, animExploration, searchedNode);
    });
  }, [animPath, comparePathsForMap, edges, animExploration, nodes, searchedNode]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div
        id="map-container"
        className="w-full h-full relative overflow-hidden shadow-[inset_6px_6px_15px_rgba(0,0,0,0.15)]"
        style={{ background: "var(--bg-base)" }}
      />

      {/* 📡 Simulation Hardware Telemetry Status Badge */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="absolute top-4 left-1/2 z-[1000] px-5 py-2.5 rounded-xl bg-[var(--bg-panel)] border skeuo-card shadow-neu-out flex items-center gap-3 pointer-events-none"
            style={{ borderColor: "var(--border-bevel)" }}
          >
            {/* Gloss specular flash */}
            <div className="absolute inset-0 bg-[var(--gloss-overlay)] pointer-events-none" />
            
            <div className="skeuo-led led-blue animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest font-mono text-[var(--text-primary)] flex items-center gap-2">
              <Radio size={12} className="animate-bounce" /> Algorithmic Telemetry Live
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function drawGraph(
  L: any,
  layer: any,
  nodes: { id: string; lat: number; lng: number }[],
  edges: EdgeData[],
  activePath: string[],
  comparePaths: { dijkstra: string[]; astar: string[]; prims: string[] } | null,
  explorationOrder: string[],
  searchedNode: string | null,
) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // ── Draw base edges ──
  edges.forEach((e) => {
    const from = nodeMap[e.from];
    const to   = nodeMap[e.to];
    if (!from || !to) return;

    const isHeavy = e.traffic_multiplier > 2;
    const isMedium = e.traffic_multiplier > 1.5;
    const colour = isHeavy ? "#d32f2f" : isMedium ? "#f57c00" : "#94a3b8";
    const weight = isHeavy ? 3 : isMedium ? 2 : 1.5;
    const dash   = isHeavy ? "6 4" : isMedium ? "4 3" : undefined;

    L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
      color: colour,
      weight,
      opacity: 0.55,
      dashArray: dash,
    }).addTo(layer).bindPopup(
      `<b>${e.from} ↔ ${e.to}</b><br/>Base: ${e.base_distance} km<br/>Traffic: ${e.traffic_multiplier}×`
    );
  });

  // ── Draw real-time exploration waves ──
  if (explorationOrder.length > 0) {
    explorationOrder.forEach((city, i) => {
      const n = nodeMap[city];
      if (!n) return;
      
      const isCursor = i === explorationOrder.length - 1; // Frontmost wave node

      L.circleMarker([n.lat, n.lng], {
        radius: isCursor ? 14 : 7,
        color: isCursor ? "#3b82f6" : "transparent",
        weight: isCursor ? 2 : 0,
        opacity: isCursor ? 0.8 : 0,
        fillColor: "#3b82f6",
        fillOpacity: isCursor ? 0.6 : 0.15 + (i / explorationOrder.length) * 0.3,
      }).addTo(layer);
    });
  }

  // ── Draw compare paths ──
  if (comparePaths) {
    (["dijkstra", "astar", "prims"] as const).forEach((algo) => {
      const path = comparePaths[algo];
      if (path.length < 2) return;
      const latlngs = path.map((c) => [nodeMap[c]?.lat, nodeMap[c]?.lng]).filter((p) => p[0]);
      L.polyline(latlngs, {
        color: ALGO_COLOURS[algo],
        weight: 4.5,
        opacity: 0.85,
        dashArray: algo === "prims" ? "6 3" : undefined,
      }).addTo(layer);
    });
  }

  // ── Draw shortest path (once search terminates) ──
  if (activePath.length >= 2 && !comparePaths) {
    const latlngs = activePath.map((c) => [nodeMap[c]?.lat, nodeMap[c]?.lng]).filter((p) => p[0]);
    // Specular outer bloom glow
    L.polyline(latlngs, { color: "#3b82f6", weight: 10, opacity: 0.25 }).addTo(layer);
    // Tactical shortest route line
    L.polyline(latlngs, { color: "#3b82f6", weight: 4.5, opacity: 0.95 }).addTo(layer);
  }

  // ── Draw city terminal markers ──
  nodes.forEach((n) => {
    const isSearched = searchedNode === n.id;
    const isOnPath = activePath.includes(n.id) ||
      (comparePaths && Object.values(comparePaths).some((p) => p.includes(n.id)));
    const isStart  = activePath[0] === n.id || (comparePaths && Object.values(comparePaths).some((p) => p[0] === n.id));
    const isEnd    = activePath.at(-1) === n.id || (comparePaths && Object.values(comparePaths).some((p) => p.at(-1) === n.id));

    const colour =
      isSearched ? "#ec4899" : // Hot pink for searched node
      isStart ? "#10b981" :
      isEnd   ? "#ef4444" :
      isOnPath ? "#3b82f6" : "#64748b";

    L.circleMarker([n.lat, n.lng], {
      radius: isSearched ? 10 : (isStart || isEnd ? 7.5 : 4.5),
      color: isSearched ? "#fce7f3" : "#ffffff",
      weight: isSearched ? 2.5 : 1.5,
      opacity: 0.9,
      fillColor: colour,
      fillOpacity: 1,
    }).addTo(layer).bindTooltip(
      `<div style="font-family:'JetBrains Mono',monospace;font-weight:900;font-size:11px;padding:1px 3px;color:var(--text-primary);">${n.id}</div>`,
      { 
        permanent: isStart || isEnd || isSearched, 
        direction: "top", 
        opacity: 0.9,
        offset: [0, -8],
        className: "skeuo-tooltip"
      }
    );
  });
}

