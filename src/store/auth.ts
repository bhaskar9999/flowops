import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type User = {
  id: string;
  email: string;
};

type AuthStore = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // The user record will be created by a database trigger or we can create it here
      // For now, we'll try to insert but ignore errors if it already exists
      await supabase.from("users").upsert({
        id: data.user.id,
        email: data.user.email || email,
      }, { onConflict: 'id' });

      set({ user: { id: data.user.id, email: data.user.email || email } });
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      set({ user: { id: data.user.id, email: data.user.email || "" } });
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },

  initialize: async () => {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      set({
        user: { id: session.user.id, email: session.user.email || "" },
        loading: false,
        initialized: true,
      });
    } else {
      set({ loading: false, initialized: true });
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: { id: session.user.id, email: session.user.email || "" } });
      } else {
        set({ user: null });
      }
    });
  },
}));
