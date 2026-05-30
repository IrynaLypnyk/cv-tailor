interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  /** Extra layout classes such as `self-start` or `w-full`. */
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40",
  secondary:
    "rounded border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40",
  ghost:
    "text-sm text-zinc-500 underline underline-offset-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
};

export function Button({
  children,
  variant = "primary",
  type = "button",
  disabled,
  onClick,
  className = "",
}: ButtonProps) {
  return (
    <button
      data-component="Button"
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${VARIANT_CLASSES[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
