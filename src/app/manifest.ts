import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE_NAME} — Pomodoro Study Timer`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "any",
    background_color: "#07070c",
    theme_color: "#07070c",
    categories: ["education", "productivity", "music"],
    lang: "en",
    dir: "ltr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
    screenshots: [
      { src: "/screenshots/wide.png", sizes: "1440x900", type: "image/png", form_factor: "wide", label: "Timer, music and soundscapes" },
      { src: "/screenshots/mobile.png", sizes: "390x844", type: "image/png", form_factor: "narrow", label: "Collabs Flow on mobile" },
    ],
    shortcuts: [
      { name: "Start focusing", url: "/?source=shortcut", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
