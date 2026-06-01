import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type User = {
  id: string;
  email: string;
};

type AuthStore = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
      });

      if (insertError) throw insertError;

      set({ user: { id: data.user.id, email: data.user.email || "" } });
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

  checkAuth: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      set({ user: { id: data.session.user.id, email: data.session.user.email || "" } });
    }
    set({ loading: false });
  },
}));
