"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

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
      <FormField htmlFor="cv-upload" label="Upload Your CV">
        <FileInput
          id="cv-upload"
          accept=".docx"
          disabled={isLoading}
          onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          cvFile={cvFile}
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
