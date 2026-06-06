import { fieldClassName, type FieldSize } from "@/lib/ui/field-styles";

/**
 * Standardised textarea. Accepts all native <textarea> props plus a
 * `fieldSize` prop controlling padding.
 */

type TextareaProps = React.ComponentPropsWithoutRef<"textarea"> & {
  /** `"md"` (default) uses px-4 py-3; `"sm"` uses px-3 py-2 for compact contexts. */
  fieldSize?: FieldSize;
  className?: string;
};

export function Textarea({
  fieldSize = "md",
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      data-component="Textarea"
      {...props}
      className={fieldClassName(fieldSize, className)}
    />
  );
}
