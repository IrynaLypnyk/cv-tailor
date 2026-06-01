export type TagVariant = "green" | "amber" | "red";

const VARIANT_CLASSES: Record<TagVariant, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800",
};

interface TagProps {
  children: React.ReactNode;
  variant: TagVariant;
}

export function Tag({ children, variant }: TagProps) {
  return (
    <span
      data-component="Tag"
      className={`rounded-full border px-3 py-1 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}

interface TagListProps {
  items: string[];
  variant: TagVariant;
}

export function TagList({ items, variant }: TagListProps) {
  return (
    <ul data-component="TagList" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item}>
          <Tag variant={variant}>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
