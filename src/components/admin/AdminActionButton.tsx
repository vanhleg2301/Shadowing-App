"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminResult } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface AdminActionButtonProps<T> {
  label: string;
  action: (input: T) => Promise<AdminResult>;
  input: T;
  confirmMessage?: string;
  tone?: "default" | "danger";
}

export function AdminActionButton<T>({ label, action, input, confirmMessage, tone = "default" }: AdminActionButtonProps<T>) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAsking, setIsAsking] = useState(false);

  const run = () => {
    setIsAsking(false);
    setError(null);
    startTransition(async () => {
      const result = await action(input);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  };

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={() => (confirmMessage ? setIsAsking(true) : run())}
        disabled={isPending}
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
          tone === "danger" ? "text-red-600 hover:bg-red-50" : "text-brand hover:bg-brand-soft"
        }`}
      >
        {isPending ? "..." : label}
      </button>
      {error && <span className="px-2.5 text-[11px] text-red-600">{error}</span>}
      {isAsking && confirmMessage && (
        <ConfirmDialog
          title={`${label}?`}
          message={confirmMessage}
          confirmLabel={label}
          tone={tone === "danger" ? "danger" : "default"}
          onConfirm={run}
          onCancel={() => setIsAsking(false)}
        />
      )}
    </span>
  );
}
