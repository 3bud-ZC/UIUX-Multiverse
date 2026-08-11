"use client";

import { useEffect } from "react";
import type { World } from "@/lib/worlds";

/**
 * Paints the document element in the world's ground and sets `color-scheme`.
 *
 * Without this, an overscroll bounce, a rubber-band on iOS or the space beneath
 * a short page shows the lobby's near-black through a light world — which is
 * exactly the kind of leak that would betray a shared shell. Nothing else about
 * the world is written to the document.
 */
export function useWorldGround(world: World): void {
  useEffect(() => {
    const root = document.documentElement;
    const previousBackground = root.style.background;
    const previousScheme = root.style.colorScheme;

    root.style.background = world.palette.base;
    root.style.colorScheme = world.luminance;
    root.dataset.world = world.id;

    const theme = document.querySelector('meta[name="theme-color"]');
    const previousTheme = theme?.getAttribute("content") ?? null;
    theme?.setAttribute("content", world.palette.base);

    return () => {
      root.style.background = previousBackground;
      root.style.colorScheme = previousScheme;
      delete root.dataset.world;
      if (previousTheme !== null) theme?.setAttribute("content", previousTheme);
    };
  }, [world]);
}
