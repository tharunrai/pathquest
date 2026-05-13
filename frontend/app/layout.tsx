import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "PathQuest AI — Smart Route Planner",
  description:
    "Visualise Dijkstra, A* and Greedy Best-First pathfinding algorithms on a real Indian city graph.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
