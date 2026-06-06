interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "subtle" | "icon";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  /** Extra layout classes such as `self-start` or `w-full`. */
  className?: string;
  /** Passed to the native button (e.g. `aria-expanded`, `aria-label`). */
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean | "dialog" | "menu" | "listbox" | "tree" | "grid";
  "aria-label"?: string;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "rounded-md bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40",
  secondary:
    "rounded bg-surface-brand-secondary px-3 py-1.5 font-medium text-brand-secondary transition-colors hover:bg-brand-secondary hover:text-background disabled:cursor-not-allowed disabled:opacity-40",
  ghost:
    "text-muted underline underline-offset-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
  /** Compact control for toolbars and mobile chrome (e.g. “Steps” toggle). */
  subtle:
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
  /** Minimal icon-only control (e.g. drawer close). */
  icon: "rounded-md p-1 text-muted-subtle transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
};

export function Button({
  children,
  variant = "primary",
  type = "button",
  disabled,
  onClick,
  className = "",
  ...aria
}: ButtonProps) {
  return (
    <button
      data-component="Button"
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`cursor-pointer flex items-center whitespace-nowrap gap-2 ${VARIANT_CLASSES[variant]} ${className}`.trim()}
      {...aria}
    >
      {children}
    </button>
  );
}
