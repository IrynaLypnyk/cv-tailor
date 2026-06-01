/** Shared padding scale for text inputs, textareas, and selects. */
export type FieldSize = "sm" | "md";

export const FIELD_PADDING: Record<FieldSize, string> = {
  md: "px-4 py-3",
  sm: "px-3 py-2",
};

/** Base classes for bordered form controls (input, textarea, select). */
export const FIELD_BASE =
  "w-full rounded-md border border-border-input bg-background text-sm text-foreground placeholder:text-muted-subtle focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus disabled:cursor-not-allowed disabled:opacity-50";

/** Native file input with styled choose-file button. */
export const FILE_INPUT_CLASSES =
  "block w-full text-sm text-foreground file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-border-input file:bg-surface-muted file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50";

export function fieldClassName(
  fieldSize: FieldSize = "md",
  extra?: string
): string {
  return [FIELD_BASE, FIELD_PADDING[fieldSize], extra].filter(Boolean).join(" ");
}
