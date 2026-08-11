"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { pad2, WORLDS, worldFromPath } from "@/lib/worlds";
import styles from "./WorldShell.module.css";

/**
 * The escape hatch, and nothing else.
 *
 * A world must be able to end without the visitor reaching for the back button,
 * but the way out must never become a shared chrome that all ten sites wear.
 * So: one small control keyed to the world's own palette, plus ⌘K. No logo, no
 * nav, no frame.
 */
export function WorldShell() {
  const pathname = usePathname();
  const router = useRouter();
  const world = worldFromPath(pathname ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WORLDS;
    return WORLDS.filter((w) =>
      `${w.name} ${w.category} ${w.product} ${w.concept} ${pad2(w.ordinal)}`
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setCursor(0);
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on navigation — the overlay outlives the page it was opened from.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const go = useCallback(
    (route: string) => {
      setOpen(false);
      router.push(route);
    },
    [router],
  );

  const onListKey = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => {
        const next = c + (event.key === "ArrowDown" ? 1 : -1);
        return (next + results.length) % Math.max(results.length, 1);
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[cursor];
      if (target) go(target.route);
    }
  };

  if (!world) return null;

  const vars = {
    "--w-base": world.palette.base,
    "--w-ink": world.palette.ink,
    "--w-dim": world.palette.dim,
    "--w-line": world.palette.line,
    "--w-accent": world.palette.accent,
  } as CSSProperties;

  return (
    <>
      <nav className={styles.exit} style={vars} aria-label="Leave this world">
        <Link href="/" className={styles.back}>
          <span aria-hidden="true">←</span> Multiverse
        </Link>
        <button
          type="button"
          className={styles.switch}
          onClick={() => {
            setOpen(true);
            setQuery("");
            setCursor(0);
          }}
          aria-haspopup="dialog"
        >
          <kbd>⌘K</kbd>
          <span className="sr-only">Open the world switcher</span>
        </button>
      </nav>

      {open && (
        <div
          className={styles.scrim}
          role="dialog"
          aria-modal="true"
          aria-label="Switch world"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className={styles.dialog} onKeyDown={onListKey}>
            <input
              ref={inputRef}
              className={styles.field}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCursor(0);
              }}
              placeholder="Search ten worlds — name, category, number"
              aria-label="Search worlds"
              autoComplete="off"
            />
            <ul className={styles.results}>
              {results.map((w, i) => (
                <li key={w.id}>
                  <button
                    type="button"
                    className={styles.result}
                    data-cursor={i === cursor ? "" : undefined}
                    data-current={w.id === world.id ? "" : undefined}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(w.route)}
                    style={
                      {
                        "--voice": w.voice.var,
                        "--voice-weight": w.voice.weight,
                        "--voice-axes": w.voice.axes ?? "normal",
                        "--voice-scale": w.voice.scale,
                        "--voice-transform": w.voice.transform,
                        "--r-accent": w.palette.accent,
                      } as CSSProperties
                    }
                  >
                    <span className={styles.rOrdinal}>{pad2(w.ordinal)}</span>
                    <span className={styles.rName}>{w.name}</span>
                    <span className={styles.rCategory}>{w.category}</span>
                  </button>
                </li>
              ))}
              {results.length === 0 && <li className={styles.empty}>No world matches that.</li>}
            </ul>
            <p className={styles.footnote}>
              ↑↓ move · Enter opens · Esc closes
            </p>
          </div>
        </div>
      )}
    </>
  );
}
