type CardPadding = "sm" | "md";

type CardBaseProps = {
  children: React.ReactNode;
  /** `"sm"` — px-4 py-4; `"md"` — px-5 py-5. */
  padding?: CardPadding;
  /** Highlighted border/background for selected selectable rows. */
  selected?: boolean;
  className?: string;
};

const PADDING_CLASSES: Record<CardPadding, string> = {
  sm: "px-4 py-4",
  md: "px-5 py-5",
};

function cardClassName(
  padding: CardPadding,
  selected: boolean,
  className: string
): string {
  const surface = selected
    ? "border-border-strong bg-surface-muted"
    : "border-border bg-background";

  return ["rounded-md border", surface, PADDING_CLASSES[padding], className]
    .filter(Boolean)
    .join(" ");
}

type CardProps = CardBaseProps &
  Omit<React.ComponentPropsWithoutRef<"div">, keyof CardBaseProps> & {
    as?: "div";
  };

type CardLabelProps = CardBaseProps &
  Omit<React.ComponentPropsWithoutRef<"label">, keyof CardBaseProps> & {
    as: "label";
  };

export function Card(props: CardProps | CardLabelProps) {
  const {
    children,
    padding = "sm",
    selected = false,
    className = "",
    as = "div",
    ...rest
  } = props;

  const classes = cardClassName(padding, selected, className);

  if (as === "label") {
    const labelProps = rest as Omit<CardLabelProps, keyof CardBaseProps | "as">;
    return (
      <label data-component="Card" className={classes} {...labelProps}>
        {children}
      </label>
    );
  }

  const divProps = rest as Omit<CardProps, keyof CardBaseProps | "as">;
  return (
    <div data-component="Card" className={classes} {...divProps}>
      {children}
    </div>
  );
}
