interface AppShellProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Two-column page shell.
 *
 * Desktop (md+): fixed-width sidebar on the left, fluid main content on the right.
 * Mobile: single column — header, then sidebar, then main content stacked vertically.
 */
export function AppShell({ header, sidebar, children }: AppShellProps) {
  return (
    <div
      data-component="AppShell"
      className="mx-auto flex w-full max-w-[1200px] flex-col px-4 sm:px-6"
    >
      <div className="py-8">{header}</div>

      <div className="flex flex-col gap-8 md:flex-row md:gap-10 md:pb-12">
        <aside className="w-full shrink-0 md:w-64 lg:w-72">{sidebar}</aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
