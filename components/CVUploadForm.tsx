"use client";

import { useState } from "react";
import { Button } from "./Button";
import { FileInput } from "./FileInput";
import { Textarea } from "./Textarea";
import { FormField } from "./FormField";

interface CVUploadFormProps {
  onSubmit: (cvFile: File, jobDescription: string) => void;
  isLoading: boolean;
}

export function CVUploadForm({ onSubmit, isLoading }: CVUploadFormProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cvFile || !jobDescription.trim()) return;
    onSubmit(cvFile, jobDescription.trim());
  }

  const isDisabled = !cvFile || !jobDescription.trim() || isLoading;

  return (
    <form
      data-component="CVUploadForm"
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <FormField htmlFor="cv-upload" label="CV file" hint="(.docx only)">
        <FileInput
          id="cv-upload"
          accept=".docx"
          disabled={isLoading}
          onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
        />
        {cvFile && (
          <p className="text-xs text-zinc-500">Selected: {cvFile.name}</p>
        )}
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

      <Button variant="primary" type="submit" disabled={isDisabled} className="self-start">
        {isLoading ? "Tailoring..." : "Tailor CV"}
      </Button>
    </form>
  );
}
