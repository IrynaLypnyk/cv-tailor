import { fieldClassName, type FieldSize } from "@/lib/ui/field-styles";

/**
 * Standardised text input. Accepts all native <input> props except `size`
 * (which is replaced by our `fieldSize` prop to avoid the HTML `size`
 * attribute that controls character width).
 */

type TextInputProps = Omit<React.ComponentPropsWithoutRef<"input">, "size"> & {
  /** `"md"` (default) uses px-4 py-3; `"sm"` uses px-3 py-2 for compact contexts. */
  fieldSize?: FieldSize;
  className?: string;
};

export function TextInput({
  fieldSize = "md",
  className = "",
  ...props
}: TextInputProps) {
  return (
    <input
      data-component="TextInput"
      {...props}
      className={fieldClassName(fieldSize, className)}
    />
  );
}
