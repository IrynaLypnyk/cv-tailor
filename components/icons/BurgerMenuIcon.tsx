import type { IconProps } from "./types";

export function BurgerMenuIcon({ className }: IconProps) {
  return (
    <div
      className={`my-auto flex size-full h-[18px] w-[34px] flex-col items-start justify-between overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {[
        { className: "h-0.5 w-full bg-brand-secondary" },
        { className: "h-0.5 w-6 bg-brand-secondary" },
        { className: "h-0.5 w-6 bg-brand-secondary" },
      ].map(({ className }, i) => (
        <span key={i} className={className} />
      ))}
    </div>
  );
}
