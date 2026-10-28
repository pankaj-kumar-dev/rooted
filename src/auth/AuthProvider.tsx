import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { authConfigured, supabase } from "../lib/supabase";
import { AuthContext, type AuthState } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(authConfigured);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    // Also consumes the magic-link token from the URL and clears it.
    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) return false;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return !error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const value = useMemo<AuthState>(
    () => ({ configured: authConfigured, user, loading, signInWithEmail, signOut }),
    [user, loading, signInWithEmail, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
