import { WorldShell } from "@/components/shell/WorldShell";

/**
 * The only thing every world route has in common.
 *
 * It contributes no frame, no bar, no grid and no type — just one small escape
 * control and a keyboard switcher, both of which read the world's own palette
 * so they sit inside the design rather than on top of it.
 */
export default function WorldsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <WorldShell />
    </>
  );
}
