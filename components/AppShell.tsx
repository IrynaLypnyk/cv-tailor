"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";

interface AppShellProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Fixed app-shell layout.
 *
 * Desktop (md+): sidebar is position:fixed, 280px wide, full viewport height.
 *   Main content is offset with ml-[280px] and scrolls independently.
 * Mobile: no fixed sidebar. Sticky top bar with an animated slide-in drawer.
 *
 * Drawer animation uses a two-phase state pattern:
 *   drawerMounted  — controls whether the drawer is in the DOM
 *   drawerVisible  — controls the CSS transition target classes
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

  // Enter: trigger CSS transition one paint after mount.
  useEffect(() => {
    if (drawerMounted) {
      const id = requestAnimationFrame(() => setDrawerVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [drawerMounted]);

  // Exit: unmount after transition completes.
  useEffect(() => {
    if (drawerMounted && !drawerVisible) {
      const id = setTimeout(() => setDrawerMounted(false), 300);
      return () => clearTimeout(id);
    }
  }, [drawerMounted, drawerVisible]);

  return (
    <div data-component="AppShell">
      {/* ── Mobile sticky top bar ───────────────────────────────────────── */}
      <div className="sticky top-0 z-30 flex items-center justify-end border-b border-zinc-100 bg-white/95 px-4 py-2 backdrop-blur-sm sm:px-6 md:hidden">
        <Button
          variant="subtle"
          onClick={openDrawer}
          aria-expanded={drawerVisible}
          aria-haspopup="dialog"
        >
          <span aria-hidden="true" className="text-base leading-none">☰</span>
          Steps
        </Button>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      {drawerMounted && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation steps"
          className="fixed inset-0 z-40 md:hidden"
        >
          {/* Backdrop */}
          <div
            aria-hidden="true"
            onClick={closeDrawer}
            className={[
              "absolute inset-0 bg-black/40 transition-opacity duration-300",
              drawerVisible ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />

          {/* Drawer panel */}
          <div
            className={[
              "absolute bottom-0 left-0 top-0 w-[280px] overflow-y-auto bg-white shadow-xl",
              "transition-transform duration-300 ease-out",
              drawerVisible ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <span className="text-sm font-semibold text-foreground">Steps</span>
              <Button
                variant="icon"
                onClick={closeDrawer}
                aria-label="Close steps"
              >
                ✕
              </Button>
            </div>
            <div className="p-5">{sidebar}</div>
          </div>
        </div>
      )}

      {/* ── Desktop fixed sidebar ────────────────────────────────────────── */}
      <div className="fixed inset-y-0 left-0 z-20 hidden w-[280px] flex-col border-r border-zinc-100 bg-white md:flex">
        <div className="flex-1 overflow-y-auto p-6">{sidebar}</div>
      </div>

      {/* ── Main content — offset by sidebar width on desktop ───────────── */}
      <div className="md:ml-[280px]">
        <div className="mx-auto max-w-[860px] px-4 sm:px-8">
          <div className="py-8">{header}</div>
          <main className="pb-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
