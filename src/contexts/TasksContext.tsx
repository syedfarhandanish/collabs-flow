"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { readStorage, usePersistentState } from "@/lib/storage";
import { useStats } from "./StatsContext";

export type TaskStatus = "todo" | "doing" | "done";
export type Priority = "low" | "med" | "high";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  subject: string;
  est: number;
  done: number;
  createdAt: number;
  completedAt?: number;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function initialTasks(): Task[] {
  const legacy = readStorage<Array<{ id: string; title: string; status: string }> | null>("tasks", null);
  if (legacy?.length) {
    const map: Record<string, TaskStatus> = { "Not Started": "todo", "In Progress": "doing", Done: "done" };
    return legacy.map((t) => ({
      id: t.id || uid(),
      title: t.title,
      status: map[t.status] ?? "todo",
      priority: "med",
      subject: "",
      est: 1,
      done: 0,
      createdAt: Date.now(),
    }));
  }
  const now = Date.now();
  return [
    { id: uid(), title: "Revise chapter 4 notes", status: "todo", priority: "high", subject: "Biology", est: 2, done: 0, createdAt: now },
    { id: uid(), title: "Solve 10 practice problems", status: "doing", priority: "med", subject: "Maths", est: 3, done: 1, createdAt: now },
    { id: uid(), title: "Outline the history essay", status: "todo", priority: "low", subject: "History", est: 1, done: 0, createdAt: now },
  ];
}

interface Ctx {
  tasks: Task[];
  activeTask: Task | null;
  subjects: string[];
  addTask: (t: Pick<Task, "title" | "priority" | "subject" | "est">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus, beforeId?: string) => void;
  setActive: (id: string | null) => void;
  creditActiveTask: () => void;
  clearDone: () => void;
}

const TasksContext = createContext<Ctx | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const { recordTask } = useStats();
  const [tasks, setTasks] = usePersistentState<Task[]>("cf:tasks", initialTasks);
  const [activeId, setActiveId] = usePersistentState<string | null>("cf:activeTask", () => null);

  const addTask = useCallback<Ctx["addTask"]>(
    (t) =>
      setTasks((prev) => [
        { ...t, id: uid(), status: "todo", done: 0, createdAt: Date.now() },
        ...prev,
      ]),
    [setTasks]
  );

  const updateTask = useCallback<Ctx["updateTask"]>(
    (id, patch) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    [setTasks]
  );

  const removeTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setActiveId((a) => (a === id ? null : a));
    },
    [setTasks, setActiveId]
  );

  const moveTask = useCallback<Ctx["moveTask"]>(
    (id, status, beforeId) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      if (task.status !== "done" && status === "done") {
        recordTask(1);
        setActiveId((a) => (a === id ? null : a));
      } else if (task.status === "done" && status !== "done") {
        recordTask(-1);
      }
      setTasks((prev) => {
        const rest = prev.filter((t) => t.id !== id);
        const moved: Task = {
          ...task,
          status,
          completedAt: status === "done" ? Date.now() : undefined,
        };
        const idx = beforeId ? rest.findIndex((t) => t.id === beforeId) : -1;
        if (idx >= 0) rest.splice(idx, 0, moved);
        else rest.push(moved);
        return rest;
      });
    },
    [tasks, recordTask, setTasks, setActiveId]
  );

  const setActive = useCallback(
    (id: string | null) => {
      setActiveId(id);
      if (id) setTasks((prev) => prev.map((t) => (t.id === id && t.status === "todo" ? { ...t, status: "doing" } : t)));
    },
    [setActiveId, setTasks]
  );

  const creditActiveTask = useCallback(() => {
    if (!activeId) return;
    setTasks((prev) => prev.map((t) => (t.id === activeId ? { ...t, done: t.done + 1 } : t)));
  }, [activeId, setTasks]);

  const clearDone = useCallback(() => setTasks((prev) => prev.filter((t) => t.status !== "done")), [setTasks]);

  const value = useMemo<Ctx>(() => {
    const subjects = Array.from(new Set(tasks.map((t) => t.subject).filter(Boolean)));
    return {
      tasks,
      activeTask: tasks.find((t) => t.id === activeId && t.status !== "done") ?? null,
      subjects,
      addTask,
      updateTask,
      removeTask,
      moveTask,
      setActive,
      creditActiveTask,
      clearDone,
    };
  }, [tasks, activeId, addTask, updateTask, removeTask, moveTask, setActive, creditActiveTask, clearDone]);

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used inside TasksProvider");
  return ctx;
}
