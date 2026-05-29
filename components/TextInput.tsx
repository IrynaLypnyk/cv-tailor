/**
 * Standardised text input. Accepts all native <input> props except `size`
 * (which is replaced by our `fieldSize` prop to avoid the HTML `size`
 * attribute that controls character width).
 */

type TextInputProps = Omit<React.ComponentPropsWithoutRef<"input">, "size"> & {
  /** `"md"` (default) uses px-4 py-3; `"sm"` uses px-3 py-2 for compact contexts. */
  fieldSize?: "sm" | "md";
};

const PADDING: Record<NonNullable<TextInputProps["fieldSize"]>, string> = {
  md: "px-4 py-3",
  sm: "px-3 py-2",
};

const BASE =
  "w-full rounded-md border border-zinc-300 bg-background text-sm text-foreground placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50";

export function TextInput({ fieldSize = "md", ...props }: TextInputProps) {
  return (
    <input
      data-component="TextInput"
      {...props}
      className={`${BASE} ${PADDING[fieldSize]}`}
    />
  );
}
