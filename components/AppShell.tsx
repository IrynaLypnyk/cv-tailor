"use client";

import { useEffect, useState } from "react";

interface AppShellProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Two-column page shell.
 *
 * Desktop (md+): fixed-width sidebar on the left, fluid main content on the right.
 * Mobile: sticky top bar with a "Steps" button that opens a left-side drawer.
 *
 * Drawer animation uses a two-phase state pattern:
 *   drawerMounted  — controls whether the drawer is in the DOM
 *   drawerVisible  — controls the CSS transition target classes
 * This lets CSS transitions run on enter (mount → visible) and exit (visible → unmount).
 */
export function AppShell({ header, sidebar, children }: AppShellProps) {
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  function openDrawer() {
    setDrawerMounted(true);
  }

  function closeDrawer() {
    setDrawerVisible(false);
  }

  // Enter: once mounted, trigger the CSS transition on the next paint.
  useEffect(() => {
    if (drawerMounted) {
      const id = requestAnimationFrame(() => setDrawerVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [drawerMounted]);

  // Exit: once the transition classes are removed, wait for the transition to
  // finish before unmounting the drawer from the DOM.
  useEffect(() => {
    if (drawerMounted && !drawerVisible) {
      const id = setTimeout(() => setDrawerMounted(false), 300);
      return () => clearTimeout(id);
    }
  }, [drawerMounted, drawerVisible]);

  return (
    <div data-component="AppShell" className="relative">
      {/* ── Mobile sticky top bar ───────────────────────────────────────── */}
      <div className="sticky top-0 z-30 flex items-center justify-end border-b border-zinc-100 bg-white/95 px-4 py-2 backdrop-blur-sm sm:px-6 md:hidden">
        <button
          type="button"
          onClick={openDrawer}
          aria-expanded={drawerVisible}
          aria-haspopup="dialog"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-foreground"
        >
          <span aria-hidden="true" className="text-base leading-none">☰</span>
          Steps
        </button>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      {drawerMounted && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation steps"
          className="fixed inset-0 z-40 md:hidden"
        >
          {/* Backdrop — fades in/out */}
          <div
            aria-hidden="true"
            onClick={closeDrawer}
            className={[
              "absolute inset-0 bg-black/40 transition-opacity duration-300",
              drawerVisible ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />

          {/* Drawer panel — slides in/out from the left */}
          <div
            className={[
              "absolute bottom-0 left-0 top-0 w-72 overflow-y-auto bg-white shadow-xl",
              "transition-transform duration-300 ease-out",
              drawerVisible ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <span className="text-sm font-semibold text-foreground">Steps</span>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close steps"
                className="rounded-md p-1 text-zinc-400 hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-5">{sidebar}</div>
          </div>
        </div>
      )}

      {/* ── Page content ────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="py-8">{header}</div>

        <div className="flex flex-col gap-8 pb-12 md:flex-row md:gap-10">
          {/* Desktop sidebar — hidden on mobile (drawer is used instead) */}
          <aside className="hidden w-64 shrink-0 md:block lg:w-72">{sidebar}</aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
