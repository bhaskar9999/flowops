"use client";

import { useTasksStore } from "@/store/tasks";
import { useAuthStore } from "@/store/auth";
import { TaskCard } from "@/components/task-card";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { supabase, type Task } from "@/lib/supabase";
import { toast } from "sonner";

const columns: { id: Task["status"]; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-slate-500" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { id: "done", label: "Done", color: "bg-emerald-500" },
];

export function TasksKanban() {
  const { tasks, loading, updateTask } = useTasksStore();
  const { user } = useAuthStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Check if dropped on a column
    const overId = over.id as string;
    const targetColumn = columns.find((c) => c.id === overId);

    if (targetColumn && task.status !== targetColumn.id) {
      try {
        await updateTask({ id: taskId, status: targetColumn.id });
      } catch {
        toast.error("Failed to move task");
      }
      return;
    }

    // Dropped on another task - move to that task's column
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && task.status !== overTask.status) {
      try {
        await updateTask({ id: taskId, status: overTask.status });
      } catch {
        toast.error("Failed to move task");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-slate-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          return (
            <div
              key={column.id}
              className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  {column.label}
                </h2>
                <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 rounded-full px-2 py-0.5">
                  {columnTasks.length}
                </span>
              </div>
              <SortableContext
                id={column.id}
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-400">
                      No tasks
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? (
          <Card className="p-4 shadow-lg opacity-90">
            <h3 className="font-medium">{activeTask.title}</h3>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 ${className || ""}`}>{children}</div>;
}
