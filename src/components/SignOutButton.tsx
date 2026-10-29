"use client";

import { useState, type ReactNode } from "react";
import { recordSignOut } from "@/app/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";

interface SignOutButtonProps {
  className?: string;
  ariaLabel?: string;
  title?: string;
  children: ReactNode;
}

// Every sign-out entry point asks first, so a stray tap doesn't log the learner out.
export function SignOutButton({ className, ariaLabel, title, children }: SignOutButtonProps) {
  const { signOut } = useAuth();
  const [isAsking, setIsAsking] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsAsking(true)} className={className} aria-label={ariaLabel} title={title}>
        {children}
      </button>
      {isAsking && (
        <ConfirmDialog
          title="Sign out?"
          message="Your progress, saved words and favorites stay in your account. Sign in again any time to continue."
          confirmLabel="Sign out"
          tone="danger"
          onConfirm={async () => {
            setIsAsking(false);
            await recordSignOut().catch(() => undefined);
            await signOut();
          }}
          onCancel={() => setIsAsking(false)}
        />
      )}
    </>
  );
}
