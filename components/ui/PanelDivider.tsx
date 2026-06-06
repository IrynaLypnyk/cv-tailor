interface PanelDividerProps {
  children: React.ReactNode;
  className?: string;
}

/** Separates a step panel's primary content from a trailing action (e.g. Continue). */
export function PanelDivider({ children, className = "" }: PanelDividerProps) {
  return (
    <div
      data-component="PanelDivider"
      className={`border-t border-border-subtle pt-6 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
