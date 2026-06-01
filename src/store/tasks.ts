import { create } from "zustand";
import { supabase, type Task } from "@/lib/supabase";

type TasksStore = {
  tasks: Task[];
  loading: boolean;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  fetchTasks: (userId: string) => Promise<void>;
  addTask: (userId: string, title: string, description?: string) => Promise<Task>;
  updateTask: (task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const useTasksStore = create<TasksStore>((set) => ({
  tasks: [],
  loading: false,

  setTasks: (tasks) => set({ tasks }),
  setLoading: (loading) => set({ loading }),

  fetchTasks: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("order", { ascending: true });

    if (error) throw error;
    set({ tasks: data || [], loading: false });
  },

  addTask: async (userId, title, description = "") => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title,
        description,
        status: "todo",
        priority: "medium",
        order: 0,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (data) {
      set((state) => ({ tasks: [...state.tasks, data] }));
      return data;
    }
    throw new Error("Failed to create task");
  },

  updateTask: async (task) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        ...task,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id);

    if (error) throw error;

    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
    }));
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },
}));
