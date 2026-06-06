import { PersonIcon } from "../icons/PersonIcon";

interface AlertBannerProps {
  variant: "amber" | "red" | "info";
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

const BG_COLOR_CLASSES: Record<AlertBannerProps["variant"], string> = {
  amber: "bg-amber-50 border-amber-200",
  red: "bg-red-50 border-red-200",
  info: "bg-blue-50 border-blue-200",
};

const TITLE_COLOR_CLASSES: Record<AlertBannerProps["variant"], string> = {
  amber: "text-amber-900 font-medium",
  red: "text-red-900 font-medium",
  info: "text-blue-900 font-medium",
};

const TEXT_COLOR_CLASSES: Record<AlertBannerProps["variant"], string> = {
  amber: "text-amber-600",
  red: "text-red-600",
  info: "text-blue-600",
};
export function AlertBanner({
  variant,
  title,
  description,
  children,
}: AlertBannerProps) {
  return (
    <div
      data-component="AlertBanner"
      className={`rounded-lg border px-4 py-2 text-sm ${TEXT_COLOR_CLASSES[variant]} ${BG_COLOR_CLASSES[variant]} flex items-center gap-2`}
    >
      <PersonIcon className={`w-5 h-5 ${TEXT_COLOR_CLASSES[variant]}`} />
      <div className="text-left">
        {title && (
          <p className={`text-sm font-medium ${TITLE_COLOR_CLASSES[variant]}`}>
            {title}
          </p>
        )}
        {description && (
          <p className={`text-xs ${TEXT_COLOR_CLASSES[variant]}`}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
