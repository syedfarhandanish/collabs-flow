"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Circle, CircleDot, KanbanSquare, Minus, Plus, Target, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTasks, type Priority, type Task, type TaskStatus } from "@/contexts/TasksContext";
import { celebrate, useTimer } from "@/contexts/TimerContext";
import { tagColor } from "@/lib/content";
import { cn } from "@/lib/utils";

const COLUMNS: Array<{ id: TaskStatus; title: string; icon: typeof Circle; dot: string }> = [
  { id: "todo", title: "To do", icon: Circle, dot: "bg-white/40" },
  { id: "doing", title: "In progress", icon: CircleDot, dot: "bg-c2" },
  { id: "done", title: "Done", icon: Check, dot: "bg-emerald-400" },
];

const PRIORITY: Record<Priority, { label: string; bar: string; text: string }> = {
  high: { label: "High", bar: "bg-rose-400", text: "text-rose-300" },
  med: { label: "Medium", bar: "bg-amber-400", text: "text-amber-300" },
  low: { label: "Low", bar: "bg-sky-400", text: "text-sky-300" },
};

const ORDER: TaskStatus[] = ["todo", "doing", "done"];

function TaskCard({
  task,
  active,
  onDragStart,
  onDropBefore,
}: {
  task: Task;
  active: boolean;
  onDragStart: () => void;
  onDropBefore: (e: React.DragEvent) => void;
}) {
  const { moveTask, removeTask, setActive } = useTasks();
  const timer = useTimer();
  const idx = ORDER.indexOf(task.status);
  const move = (dir: 1 | -1) => {
    const to = ORDER[idx + dir];
    if (!to) return;
    if (to === "done") celebrate("task");
    moveTask(task.id, to);
  };

  return (
    <motion.div
      layout
      layoutId={task.id}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 500, damping: 38 }}
    >
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropBefore}
      className={cn(
        "group relative cursor-grab overflow-hidden rounded-2xl border bg-white/[0.04] p-3 pl-4 transition-colors active:cursor-grabbing",
        active ? "border-transparent ring-2 ring-c2/70" : "border-white/[0.07] hover:border-white/15 hover:bg-white/[0.06]"
      )}
    >
      <span className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", PRIORITY[task.priority].bar, task.status === "done" && "opacity-30")} />
      <div className="flex items-start gap-2">
        <button
          onClick={() => {
            if (task.status !== "done") celebrate("task");
            moveTask(task.id, task.status === "done" ? "todo" : "done");
          }}
          className={cn(
            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition",
            task.status === "done" ? "border-emerald-400 bg-emerald-400 text-black" : "border-white/25 hover:border-white/60"
          )}
          aria-label={task.status === "done" ? "Mark not done" : "Mark done"}
        >
          {task.status === "done" && <Check className="h-3 w-3" strokeWidth={3} />}
        </button>
        <p className={cn("flex-1 text-sm leading-snug text-white/90", task.status === "done" && "text-white/40 line-through")}>{task.title}</p>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-7">
        {task.subject && <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium ring-1", tagColor(task.subject))}>{task.subject}</span>}
        <span className="flex items-center gap-0.5" title={`${task.done} of ${task.est} pomodoros`}>
          {Array.from({ length: Math.max(task.est, task.done) }, (_, i) => (
            <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i < task.done ? "bg-accent-gradient" : "bg-white/15")} />
          ))}
          <span className="ml-1 text-[10px] tabular text-white/40">
            {task.done}/{task.est}
          </span>
        </span>
        {active && (
          <span className="flex items-center gap-1 rounded-full bg-c2/15 px-2 py-0.5 text-[10px] font-semibold text-c2">
            <span className={cn("h-1.5 w-1.5 rounded-full bg-c2", timer.running && "animate-pulse")} /> Focusing
          </span>
        )}
      </div>

      <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-[#14141f]/90 p-0.5 opacity-0 ring-1 ring-white/10 backdrop-blur transition group-hover:opacity-100 max-md:opacity-100 max-md:static max-md:mt-2 max-md:w-fit max-md:bg-transparent max-md:ring-0">
        {task.status !== "done" && !active && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setActive(task.id)} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-c2" aria-label="Focus on this">
                <Target className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Focus on this</TooltipContent>
          </Tooltip>
        )}
        {idx > 0 && (
          <button onClick={() => move(-1)} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Move left">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}
        {idx < 2 && (
          <button onClick={() => move(1)} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Move right">
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
        <button onClick={() => removeTask(task.id)} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-rose-300" aria-label="Delete task">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
    </motion.div>
  );
}

export function TaskBoard() {
  const { tasks, subjects, addTask, moveTask, activeTask, clearDone } = useTasks();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<Priority>("med");
  const [est, setEst] = useState(1);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title: title.trim(), subject: subject.trim(), priority, est });
    setTitle("");
  };

  const drop = (status: TaskStatus, beforeId?: string) => {
    if (!dragId) return;
    const t = tasks.find((x) => x.id === dragId);
    if (t && t.status !== "done" && status === "done") celebrate("task");
    moveTask(dragId, status, beforeId);
    setDragId(null);
    setOver(null);
  };

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="glass h-full p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="section-title">
          <KanbanSquare className="h-4 w-4 text-c3" /> Study Board
        </h2>
        <span className="text-xs text-white/45">
          {doneCount}/{tasks.length} done
        </span>
      </div>

      <form onSubmit={submit} className="mb-5 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task… e.g. Finish physics worksheet" className="field" />
        <div className="flex flex-wrap gap-2">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            list="cf-subjects"
            className="field w-32 flex-1 sm:flex-none"
          />
          <datalist id="cf-subjects">
            {subjects.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <div className="flex h-11 items-center rounded-xl border border-white/10 bg-black/20 p-1">
            {(["low", "med", "high"] as Priority[]).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={cn("flex h-full items-center gap-1 rounded-lg px-2 text-xs transition", priority === p ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80")}
                title={`${PRIORITY[p].label} priority`}
              >
                <span className={cn("h-2 w-2 rounded-full", PRIORITY[p].bar)} />
                <span className="hidden sm:inline">{PRIORITY[p].label}</span>
              </button>
            ))}
          </div>
          <div className="flex h-11 items-center gap-1 rounded-xl border border-white/10 bg-black/20 px-1.5" title="Estimated pomodoros">
            <button type="button" onClick={() => setEst((n) => Math.max(1, n - 1))} className="rounded-md p-1 text-white/50 hover:text-white" aria-label="Fewer pomodoros">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-xs tabular text-white/80">🍅{est}</span>
            <button type="button" onClick={() => setEst((n) => Math.min(12, n + 1))} className="rounded-md p-1 text-white/50 hover:text-white" aria-label="More pomodoros">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button type="submit" className="btn-glow flex h-11 items-center gap-1.5 rounded-xl bg-accent-gradient px-4 text-sm font-semibold text-white transition hover:brightness-110">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(col.id);
              }}
              onDragLeave={() => setOver((o) => (o === col.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                drop(col.id);
              }}
              className={cn(
                "rounded-2xl border border-dashed p-3 transition-colors",
                over === col.id && dragId ? "border-white/30 bg-white/[0.05]" : "border-transparent bg-black/15"
              )}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                  <span className={cn("h-2 w-2 rounded-full", col.dot)} />
                  {col.title}
                  <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[10px] text-white/50">{items.length}</span>
                </div>
                {col.id === "done" && items.length > 0 && (
                  <button onClick={clearDone} className="text-[10px] text-white/35 hover:text-white/70">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex min-h-[120px] flex-col gap-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {items.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      active={activeTask?.id === t.id}
                      onDragStart={() => setDragId(t.id)}
                      onDropBefore={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        drop(col.id, t.id);
                      }}
                    />
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl py-6 text-center text-xs text-white/30">
                    {col.id === "todo" ? "Nothing queued — add a task above" : col.id === "doing" ? "Drag a task here to start" : "Finished tasks land here ✨"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
