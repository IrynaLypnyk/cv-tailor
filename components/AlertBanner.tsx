interface AlertBannerProps {
  variant: "amber" | "red";
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<AlertBannerProps["variant"], string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800",
};

export function AlertBanner({ variant, children }: AlertBannerProps) {
  return (
    <div
      data-component="AlertBanner"
      className={`rounded-md border px-4 py-3 text-sm ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </div>
  );
}
