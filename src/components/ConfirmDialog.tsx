"use client";

import { BottomSheet } from "@/components/BottomSheet";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  // "danger" for actions that lose data or can't be undone.
  tone?: "default" | "danger";
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Asks before an action the learner might trigger by mistake (sign out, delete). Uses the app's
// bottom sheet instead of window.confirm so it looks the same on every device.
export function ConfirmDialog({ title, message, confirmLabel, tone = "default", isPending = false, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <BottomSheet title={title} onClose={onCancel}>
      <p className="text-muted">{message}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={onCancel} className="btn-3d py-3">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          autoFocus
          className={`btn-3d py-3 ${tone === "danger" ? "border-red-700 bg-red-600 text-white shadow-[0_3px_0_0_#b91c1c]" : "btn-brand"}`}
        >
          {isPending ? "..." : confirmLabel}
        </button>
      </div>
    </BottomSheet>
  );
}
