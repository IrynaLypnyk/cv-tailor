import { FILE_INPUT_CLASSES } from "@/lib/ui/field-styles";

type FileInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "size" | "type"
>;

export function FileInput({ className = "", ...props }: FileInputProps) {
  return (
    <input
      data-component="FileInput"
      type="file"
      {...props}
      className={`${FILE_INPUT_CLASSES} ${className}`.trim()}
    />
  );
}
