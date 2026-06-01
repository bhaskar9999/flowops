"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useTasksStore } from "@/store/tasks";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { TasksList } from "@/components/tasks-list";
import { TasksKanban } from "@/components/tasks-kanban";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { fetchTasks } = useTasksStore();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTasks(user.id);
    }
  }, [user, fetchTasks]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Tasks
            </h1>
            <div className="flex gap-2">
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("list")}
              >
                List
              </Button>
              <Button
                variant={view === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("kanban")}
              >
                Kanban
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
            <div className="text-sm text-slate-600 dark:text-slate-400 px-3 py-2">
              {user?.email}
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "list" ? <TasksList /> : <TasksKanban />}
      </main>

      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
