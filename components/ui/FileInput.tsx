import { FILE_INPUT_CLASSES } from "@/lib/ui/field-styles";
import { UploadIcon } from "../icons/UploadIcon";

type FileInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "size" | "type"
> & {
  cvFile: File | null;
};

export function FileInput({
  className = "",
  cvFile,
  ...props
}: FileInputProps) {
  return (
    <div className="relative" data-component="FileInput">
      <input
        {...props}
        type="file"
        className={`hidden ${FILE_INPUT_CLASSES} ${className}`.trim()}
        accept=".pdf,.doc,.docx"
        id="cv-upload"
      />
      <label
        htmlFor="cv-upload"
        className="flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-brand-primary hover:bg-surface-brand-primary/20 transition-colors cursor-pointer"
      >
        <UploadIcon className="w-8 h-8 text-slate-400" />{" "}
        <div className="text-center">
          <div>
            <p className="font-medium text-slate-900">
              {cvFile?.name || "Click to upload or drag and drop (.docx only)"}
            </p>
            <p className="text-sm text-slate-500">Click to change file</p>
          </div>
        </div>
      </label>
    </div>
  );
}
