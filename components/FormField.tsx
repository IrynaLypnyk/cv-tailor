interface FormFieldProps {
  htmlFor: string;
  label: string;
  /** Short muted suffix rendered inline after the label, e.g. "(optional)" or "(.docx only)". */
  hint?: string;
  /** Optional helper sentence rendered below the label and above the control. */
  description?: string;
  children: React.ReactNode;
}

export function FormField({
  htmlFor,
  label,
  hint,
  description,
  children,
}: FormFieldProps) {
  return (
    <div data-component="FormField" className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {hint && (
          <span className="font-normal text-zinc-500"> {hint}</span>
        )}
      </label>
      {description && (
        <p className="text-xs text-zinc-500">{description}</p>
      )}
      {children}
    </div>
  );
}
