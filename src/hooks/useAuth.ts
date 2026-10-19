"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";

const isAvailable = getSupabaseConfig() !== null;
let browserClient: SupabaseClient | null = null;

// Created on first use in the browser only, so server and client render the same initial markup.
function getClient(): SupabaseClient | null {
  browserClient ??= createClient();
  return browserClient;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isAvailable);

  useEffect(() => {
    const supabase = getClient();
    if (!supabase) return;
    // onAuthStateChange fires INITIAL_SESSION right away, so it also covers the first load.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const next = window.location.pathname + window.location.search;
    await getClient()?.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  };

  const signOut = async () => {
    await getClient()?.auth.signOut();
  };

  return { user, isLoading, isAvailable, signInWithGoogle, signOut };
}
