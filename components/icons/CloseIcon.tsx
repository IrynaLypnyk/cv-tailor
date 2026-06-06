import type { IconProps } from "./types";

export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
    >
      <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}
