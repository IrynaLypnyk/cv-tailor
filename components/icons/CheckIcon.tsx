import type { IconProps } from "./types";

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
      <path d="m9 11 3 3L22 4"></path>
    </svg>
  );
}
