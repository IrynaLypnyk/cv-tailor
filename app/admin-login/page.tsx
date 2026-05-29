"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { TextInput } from "@/components/TextInput";
import { FormField } from "@/components/FormField";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Full navigation so the server component (app/page.tsx) re-reads
        // the new adminSession cookie on the next render.
        router.push("/");
        router.refresh();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Login failed. Please try again.");
        setIsLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div
      data-component="AdminLoginPage"
      className="mx-auto flex w-full max-w-sm flex-col gap-8 px-4 py-16 sm:px-6"
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Admin login
        </h1>
        <p className="text-sm text-zinc-500">
          For authorised use only.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField htmlFor="admin-password" label="Password">
          <TextInput
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            disabled={isLoading}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button variant="primary" type="submit" disabled={!password.trim() || isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
