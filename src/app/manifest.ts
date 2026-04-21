import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AoE2.ai — AI Tools for Age of Empires II",
    short_name: "AoE2.ai",
    description:
      "Scout opponents, analyze replays, and turn AoE2 knowledge into practical decisions fast.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1628",
    theme_color: "#c8a964",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
