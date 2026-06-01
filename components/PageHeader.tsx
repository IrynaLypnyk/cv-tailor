interface PageHeaderProps {
  title: string;
  description?: string;
  /** Renders in the top-right of the title row (e.g. log out). */
  actions?: React.ReactNode;
  /** Content below the title row, such as alert banners. */
  children?: React.ReactNode;
  className?: string;
}

/** App-level page title block passed into AppShell `header`. */
export function PageHeader({
  title,
  description,
  actions,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      data-component="PageHeader"
      className={`flex flex-col gap-4 ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </header>
  );
}
