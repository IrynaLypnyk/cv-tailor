"use client";

import { useState, useRef } from "react";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { FormField } from "./FormField";

interface CVUploadFormProps {
  onSubmit: (cvFile: File, jobDescription: string) => void;
  isLoading: boolean;
}

export function CVUploadForm({ onSubmit, isLoading }: CVUploadFormProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        <input
          id="cv-upload"
          ref={fileInputRef}
          type="file"
          accept=".docx"
          disabled={isLoading}
          onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-foreground file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-zinc-300 file:bg-zinc-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
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
