import type { MetadataRoute } from "next";
import { BRAND_ICON_VERSION } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FamilyCare",
    short_name: "FamilyCare",
    description: "Shared care coordination for families",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#4f46e5",
    icons: [
      {
        src: `/icons/icon-192.png?v=${BRAND_ICON_VERSION}`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `/icons/icon-512.png?v=${BRAND_ICON_VERSION}`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
