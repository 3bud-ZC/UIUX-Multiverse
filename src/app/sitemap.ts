import type { MetadataRoute } from "next";
import { WORLDS } from "@/lib/worlds";

const ORIGIN = "https://uiux.abud.fun";

/** Required by `output: "export"` — the file is written once, at build time. */
export const dynamic = "force-static";

/**
 * The route set is exactly the lobby plus the ten worlds, so it is derived from
 * the world index rather than restated — a new world in `worlds.ts` is a new
 * entry here without anyone remembering to add one.
 *
 * No `lastModified`: it would change on every build and say nothing true.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${ORIGIN}/`, priority: 1 },
    ...WORLDS.map((world) => ({ url: `${ORIGIN}${world.route}`, priority: 0.8 })),
  ];
}
