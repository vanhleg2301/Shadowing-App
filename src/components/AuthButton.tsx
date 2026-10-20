"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

interface AuthButtonProps {
  variant: "full" | "compact";
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}

export function AuthButton({ variant }: AuthButtonProps) {
  const { user, isLoading, isAvailable, signInWithGoogle, signOut } = useAuth();

  if (!isAvailable) return null;
  if (isLoading) return <div className={variant === "full" ? "h-12 rounded-2xl bg-cream" : "size-10 rounded-full bg-line"} />;

  if (!user) {
    return (
      <button
        type="button"
        onClick={signInWithGoogle}
        aria-label="Sign in with Google"
        className={variant === "full" ? "btn-3d w-full px-4 py-3" : "btn-3d size-10 rounded-full"}
      >
        <GoogleLogo />
        {variant === "full" && "Sign in with Google"}
      </button>
    );
  }

  const name = (user.user_metadata.full_name as string | undefined) ?? user.email ?? "You";
  const avatarUrl = user.user_metadata.avatar_url as string | undefined;
  const avatar = avatarUrl ? (
    <Image src={avatarUrl} alt={name} width={40} height={40} className="size-10 rounded-full" />
  ) : (
    <span className="grid size-10 place-items-center rounded-full bg-brand font-bold text-on-brand">
      {name.charAt(0).toUpperCase()}
    </span>
  );

  if (variant === "compact") {
    return (
      <button type="button" onClick={signOut} title={`Signed in as ${name}. Tap to sign out.`} aria-label="Sign out">
        {avatar}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line p-2">
      {avatar}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        <button type="button" onClick={signOut} className="text-xs font-semibold text-muted hover:text-ink">
          Sign out
        </button>
      </div>
    </div>
  );
}
