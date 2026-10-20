"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMyAccount } from "@/app/account/actions";
import { useAuth } from "@/hooks/useAuth";

const CONFIRM_WORD = "DELETE";

export function DeleteAccountButton() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteMyAccount();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await signOut();
      router.push("/");
      router.refresh();
    });
  };

  if (!isConfirming) {
    return (
      <button type="button" onClick={() => setIsConfirming(true)} className="btn-3d px-4 py-2.5 text-sm text-red-600">
        Delete my account
      </button>
    );
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
      <p className="text-sm text-ink">
        This permanently deletes your account, saved words, favorites, progress and streak. Type{" "}
        <b>{CONFIRM_WORD}</b> to confirm.
      </p>
      <input
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        aria-label={`Type ${CONFIRM_WORD} to confirm`}
        className="mt-3 w-full rounded-xl border border-red-200 bg-surface px-3 py-2 outline-none focus:border-red-500"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={typed !== CONFIRM_WORD || isPending}
          className="btn-3d border-red-700 bg-red-600 px-4 py-2 text-sm text-white shadow-[0_3px_0_0_#b91c1c]"
        >
          {isPending ? "Deleting..." : "Delete forever"}
        </button>
        <button type="button" onClick={() => setIsConfirming(false)} className="btn-3d px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}
