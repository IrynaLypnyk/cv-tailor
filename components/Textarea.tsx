/**
 * Standardised textarea. Accepts all native <textarea> props plus a
 * `fieldSize` prop controlling padding.
 */

type TextareaProps = React.ComponentPropsWithoutRef<"textarea"> & {
  /** `"md"` (default) uses px-4 py-3; `"sm"` uses px-3 py-2 for compact contexts. */
  fieldSize?: "sm" | "md";
};

const PADDING: Record<NonNullable<TextareaProps["fieldSize"]>, string> = {
  md: "px-4 py-3",
  sm: "px-3 py-2",
};

const BASE =
  "w-full rounded-md border border-zinc-300 bg-background text-sm text-foreground placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50";

export function Textarea({ fieldSize = "md", ...props }: TextareaProps) {
  return (
    <textarea
      data-component="Textarea"
      {...props}
      className={`${BASE} ${PADDING[fieldSize]}`}
    />
  );
}
