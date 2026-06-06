interface StepPanelProps {
  children: React.ReactNode;
  /**
   * When true, hides the panel with CSS while keeping children mounted.
   * Used for the upload step so file/JD state survives tab switches.
   */
  hidden?: boolean;
  className?: string;
}

/** Vertical stack for a single sidebar step's main content. */
export function StepPanel({
  children,
  hidden = false,
  className = "",
}: StepPanelProps) {
  return (
    <div
      data-component="StepPanel"
      className={
        hidden
          ? "hidden"
          : `flex flex-col gap-8 bg-white rounded-2xl shadow-lg p-8 ${className}`.trim()
      }
    >
      {children}
    </div>
  );
}
