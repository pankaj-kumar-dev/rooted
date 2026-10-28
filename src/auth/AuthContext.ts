import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export interface AuthState {
  /** False when Supabase env vars are absent; sign-in UI should be hidden. */
  configured: boolean;
  user: User | null;
  loading: boolean;
  /** Resolves true when the magic link was requested. Never reveals whether the account exists. */
  signInWithEmail: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>({
  configured: false,
  user: null,
  loading: false,
  signInWithEmail: async () => false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);
