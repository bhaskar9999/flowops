"use client";

import { useEffect } from "react";
import { useTasksStore } from "@/store/tasks";
import { TaskCard } from "@/components/task-card";
import { Card } from "@/components/ui/card";

export function TasksList() {
  const { tasks, loading } = useTasksStore();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-slate-500">Loading tasks...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
        <p className="text-slate-500">No tasks yet. Create one to get started!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
