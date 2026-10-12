"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { MAX_CV_FILE_SIZE, CV_FILE_SIZE_ERROR } from "@/lib/docx/upload-limits";

interface CVUploadFormProps {
  onSubmit: (cvFile: File, jobDescription: string) => void;
  isLoading: boolean;
}

export function CVUploadForm({ onSubmit, isLoading }: CVUploadFormProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cvFile || !jobDescription.trim()) return;
    onSubmit(cvFile, jobDescription.trim());
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_CV_FILE_SIZE) {
      setFileError(CV_FILE_SIZE_ERROR);
      setCvFile(null);
      e.target.value = ""; // reset the input so the same file can be re-selected
      return;
    }
    setFileError(null);
    setCvFile(file);
  }

  const isDisabled = !cvFile || !jobDescription.trim() || isLoading;

  return (
    <form
      data-component="CVUploadForm"
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <FormField
        htmlFor="cv-upload"
        label="Upload Your CV"
        hint="(.docx, max 4 MB)"
        error={fileError}
      >
        <FileInput
          id="cv-upload"
          accept=".docx"
          disabled={isLoading}
          onChange={handleFileChange}
          cvFile={cvFile}
          aria-invalid={Boolean(fileError)}
          aria-describedby={fileError ? "cv-upload-error" : undefined}
        />
      </FormField>

      <FormField htmlFor="job-description" label="Job description">
        <Textarea
          id="job-description"
          rows={10}
          placeholder="Paste the full job description here..."
          value={jobDescription}
          disabled={isLoading}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </FormField>

      <div className="flex justify-start">
        <Button variant="primary" type="submit" disabled={isDisabled}>
          {isLoading ? "Tailoring..." : "Analyze CV"}
          {isLoading ? null : <ArrowRightIcon className="w-5 h-5" />}
        </Button>
      </div>
    </form>
  );
}
