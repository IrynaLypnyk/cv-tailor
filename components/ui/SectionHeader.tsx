type SectionHeaderLevel = "page" | "section";

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** `"page"` — step title (h2); `"section"` — in-step group (h3). */
  level?: SectionHeaderLevel;
  /** Renders beside the title block (e.g. a ghost action button). */
  actions?: React.ReactNode;
  className?: string;
}

const TITLE_CLASSES: Record<SectionHeaderLevel, string> = {
  page: "text-2xl font-bold text-foreground",
  section: "text-base font-semibold text-foreground",
};

const DESCRIPTION_CLASSES: Record<SectionHeaderLevel, string> = {
  page: "text-muted",
  section: "text-sm text-muted",
};

const GAP_CLASSES: Record<SectionHeaderLevel, string> = {
  page: "gap-1",
  section: "gap-0.5",
};

export function SectionHeader({
  title,
  description,
  level = "page",
  actions,
  className = "",
}: SectionHeaderProps) {
  const Heading = level === "page" ? "h2" : "h3";

  const titleBlock = (
    <div className={`flex flex-col ${GAP_CLASSES[level]}`}>
      <Heading className={TITLE_CLASSES[level]}>{title}</Heading>
      {description && (
        <p className={DESCRIPTION_CLASSES[level]}>{description}</p>
      )}
    </div>
  );

  if (actions) {
    return (
      <div
        data-component="SectionHeader"
        className={`flex items-center justify-between gap-4 ${className}`.trim()}
      >
        {titleBlock}
        {actions}
      </div>
    );
  }

  return (
    <div data-component="SectionHeader" className={className}>
      {titleBlock}
    </div>
  );
}

interface SubsectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** Section heading plus content with standard vertical spacing. */
export function Subsection({
  title,
  description,
  children,
  className = "",
}: SubsectionProps) {
  return (
    <div
      data-component="Subsection"
      className={`flex flex-col gap-3 ${className}`.trim()}
    >
      <SectionHeader level="section" title={title} description={description} />
      {children}
    </div>
  );
}
