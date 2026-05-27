"use client";

import { useTailorCV } from "@/hooks/useTailorCV";
import { CVUploadForm } from "./CVUploadForm";
import { TailoredCVResult } from "./TailoredCVResult";
import { StatusMessage } from "./StatusMessage";

export function TailorPage() {
  const { status, result, error, submit, reset } = useTailorCV();

  return (
    <div
      data-component="TailorPage"
      className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-12 sm:px-6"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          CV Tailor
        </h1>
        <p className="text-sm text-zinc-500">
          Upload your CV and paste a job description to receive a tailored version
          aligned to the role.
        </p>
      </header>

      {status !== "success" && (
        <>
          <CVUploadForm onSubmit={submit} isLoading={status === "loading"} />
          <StatusMessage status={status} error={error} />
        </>
      )}

      {status === "success" && result && (
        <TailoredCVResult result={result} onReset={reset} />
      )}
    </div>
  );
}
