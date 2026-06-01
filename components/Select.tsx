import {
  fieldClassName,
  type FieldSize,
} from "@/lib/ui/field-styles";

type SelectProps = React.ComponentPropsWithoutRef<"select"> & {
  /** `"md"` (default) uses px-4 py-3; `"sm"` uses px-3 py-2 for compact contexts. */
  fieldSize?: FieldSize;
  className?: string;
};

export function Select({
  fieldSize = "md",
  className = "",
  ...props
}: SelectProps) {
  return (
    <select
      data-component="Select"
      {...props}
      className={fieldClassName(fieldSize, className)}
    />
  );
}
