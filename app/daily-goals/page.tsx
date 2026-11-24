"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trash2,
  Play,
  Save,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchDailyGoal, saveDailyGoalApi, fetchRoadmaps } from "@/services/api";
import { IDailyGoal, IDailyGoalTask } from "@/types/lms";
import { IRoadmap } from "@/types";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DailyGoalsPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [goal, setGoal] = useState<IDailyGoal | null>(null);
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New task form state
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const [newTaskRoadmapId, setNewTaskRoadmapId] = useState("");

  const loadData = async (dateStr: string) => {
    setIsLoading(true);
    try {
      const [goalData, roadmapsData] = await Promise.all([
        fetchDailyGoal(dateStr),
        fetchRoadmaps(),
      ]);
      setGoal(goalData);
      setRoadmaps(roadmapsData);
    } catch {
      toast.error("Failed to load daily goal");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const handleUpdateTargetMinutes = async (newTarget: number) => {
    if (!goal) return;
    try {
      const updated = await saveDailyGoalApi({
        date: selectedDate,
        targetMinutes: newTarget,
        tasks: goal.tasks,
      });
      setGoal(updated);
      toast.success(`Target updated to ${newTarget} minutes`);
    } catch {
      toast.error("Failed to update daily target");
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!goal) return;
    const updatedTasks = goal.tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedMinutes: nextCompleted ? Math.max(t.completedMinutes, t.targetMinutes) : 0,
        };
      }
      return t;
    });

    try {
      const updated = await saveDailyGoalApi({
        date: selectedDate,
        targetMinutes: goal.targetMinutes,
        tasks: updatedTasks,
      });
      setGoal(updated);
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleAddMinutesToTask = async (taskId: string, mins: number) => {
    if (!goal) return;
    const updatedTasks = goal.tasks.map((t) => {
      if (t.id === taskId) {
        const nextMins = (t.completedMinutes || 0) + mins;
        return {
          ...t,
          completedMinutes: nextMins,
          completed: nextMins >= t.targetMinutes ? true : t.completed,
        };
      }
      return t;
    });

    try {
      const updated = await saveDailyGoalApi({
        date: selectedDate,
        targetMinutes: goal.targetMinutes,
        tasks: updatedTasks,
      });
      setGoal(updated);
      toast.success(`Added +${mins}m to task`);
    } catch {
      toast.error("Failed to update task minutes");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!goal) return;
    const updatedTasks = goal.tasks.filter((t) => t.id !== taskId);
    try {
      const updated = await saveDailyGoalApi({
        date: selectedDate,
        targetMinutes: goal.targetMinutes,
        tasks: updatedTasks,
      });
      setGoal(updated);
      toast.success("Task removed");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !goal) return;

    const matchedRoadmap = roadmaps.find((r) => r._id === newTaskRoadmapId);

    const newTask: IDailyGoalTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      targetMinutes: Number(newTaskMinutes) || 30,
      completedMinutes: 0,
      completed: false,
      roadmapId: matchedRoadmap?._id,
      roadmapTitle: matchedRoadmap?.title,
    };

    setIsSaving(true);
    try {
      const updated = await saveDailyGoalApi({
        date: selectedDate,
        targetMinutes: goal.targetMinutes,
        tasks: [...goal.tasks, newTask],
      });
      setGoal(updated);
      setNewTaskTitle("");
      setNewTaskMinutes(30);
      setNewTaskRoadmapId("");
      setShowAddTask(false);
      toast.success("New daily task added!");
    } catch {
      toast.error("Failed to add task");
    } finally {
      setIsSaving(false);
    }
  };

  const totalTasks = goal?.tasks?.length || 0;
  const completedTasks = goal?.tasks?.filter((t) => t.completed).length || 0;
  const targetMinutes = goal?.targetMinutes || 120;
  const completedMinutes = goal?.completedMinutes || 0;
  const percentComplete = Math.min(100, Math.round((completedMinutes / targetMinutes) * 100));

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
            <Target className="h-3.5 w-3.5 text-[#D7FF00]" />
            <span>DAILY STUDY GOALS &amp; HABIT CADENCE</span>
          </div>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
            Daily Learning Goals
          </h1>
          <p className="mt-1 text-xs text-[#B8B9AA] md:text-sm">
            Set daily study targets, track time allocation per roadmap, and build consistent habits.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-[#62695D] bg-[#252D26] p-1">
            <button
              onClick={handlePrevDay}
              className="rounded-lg p-1 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="px-3 font-mono text-xs font-semibold text-[#F3F0E6]">
              {isToday ? "Today" : selectedDate}
            </div>
            <button
              onClick={handleNextDay}
              className="rounded-lg p-1 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {!isToday && (
            <Button variant="outline" size="sm" onClick={handleToday} className="font-mono text-xs">
              Go to Today
            </Button>
          )}
          <Link href="/study-session">
            <Button
              variant="primary"
              size="sm"
              className="flex items-center gap-1.5 font-mono font-bold uppercase shadow-lg shadow-[#D7FF00]/15"
            >
              <Play className="h-3.5 w-3.5 fill-[#1B211C]" />
              Start Study Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Target Progress Bar & Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Progress Card (Spans 2) */}
        <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-5 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D7FF00]">
                Daily Study Target
              </span>
              <div className="mt-1 font-mono text-2xl font-bold text-[#F3F0E6]">
                {completedMinutes}{" "}
                <span className="text-sm font-normal text-[#B8B9AA]">
                  / {targetMinutes} mins ({percentComplete}%)
                </span>
              </div>
            </div>

            {/* Target Preset Selector */}
            <div className="flex items-center gap-1 rounded-lg border border-[#62695D] bg-[#202720] p-1">
              {[30, 60, 90, 120, 180].map((m) => (
                <button
                  key={m}
                  onClick={() => handleUpdateTargetMinutes(m)}
                  className={cn(
                    "rounded px-2 py-1 font-mono text-[10px] transition-colors",
                    targetMinutes === m
                      ? "bg-[#D7FF00] font-bold text-[#1B211C]"
                      : "text-[#B8B9AA] hover:text-[#EDE8D8]"
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 w-full overflow-hidden rounded-full border border-[#62695D] bg-[#202720]">
            <div
              className="h-full rounded-full bg-[#D7FF00] transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          <div className="flex items-center justify-between font-mono text-xs text-[#B8B9AA]">
            <span>
              {completedMinutes >= targetMinutes ? (
                <span className="flex items-center gap-1 font-bold text-[#D7FF00]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Target Achieved! Keep going!
                </span>
              ) : (
                `${targetMinutes - completedMinutes} minutes remaining to reach daily goal`
              )}
            </span>
            <span>{Math.round((completedMinutes / 60) * 10) / 10} hrs logged</span>
          </div>
        </div>

        {/* Task Completion KPI */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#62695D] bg-[#252D26] p-5">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#B8B9AA]">
            Tasks Completed
          </span>
          <div className="my-2 font-mono text-3xl font-bold text-[#F3F0E6]">
            {completedTasks}{" "}
            <span className="text-base font-normal text-[#B8B9AA]">/ {totalTasks}</span>
          </div>
          <div className="font-mono text-xs text-[#B8B9AA]">
            {totalTasks > 0
              ? `${Math.round((completedTasks / totalTasks) * 100)}% of checklist finished`
              : "No tasks added yet"}
          </div>
        </div>

        {/* Focus Efficiency KPI */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#62695D] bg-[#252D26] p-5">
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#D7FF00]">
            <Flame className="h-3.5 w-3.5 fill-[#D7FF00]" /> Focus Streak
          </span>
          <div className="my-2 font-mono text-3xl font-bold text-[#EDE8D8]">
            {percentComplete >= 100 ? "Active 🔥" : "In Progress"}
          </div>
          <div className="text-xs text-[#B8B9AA]">
            Consistency is the single biggest predictor of mastery.
          </div>
        </div>
      </div>

      {/* Task Checklist Section */}
      <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#D7FF00]" />
            <h2 className="font-mono text-base font-bold uppercase tracking-wide text-[#F3F0E6]">
              Daily Tasks Breakdown
            </h2>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddTask(!showAddTask)}
            className="flex items-center gap-1 font-mono text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>

        {/* Add Task Inline Form */}
        {showAddTask && (
          <form
            onSubmit={handleCreateTask}
            className="space-y-3 rounded-xl border border-[#62695D] bg-[#202720] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-[#D7FF00]">
                New Learning Task
              </span>
              <button
                type="button"
                onClick={() => setShowAddTask(false)}
                className="font-mono text-xs text-[#B8B9AA] hover:text-[#EDE8D8]"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title (e.g. Master React 19 useActionState hook)"
                  className="w-full rounded-lg border border-[#62695D] bg-[#1B211C] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={newTaskMinutes}
                  onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                  className="w-full cursor-pointer rounded-lg border border-[#62695D] bg-[#1B211C] px-2 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                  <option value={120}>120 Minutes</option>
                </select>
              </div>
            </div>

            {roadmaps.length > 0 && (
              <div>
                <select
                  value={newTaskRoadmapId}
                  onChange={(e) => setNewTaskRoadmapId(e.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-[#62695D] bg-[#1B211C] px-2 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
                >
                  <option value="">General Task (Not tied to a specific roadmap)</option>
                  {roadmaps.map((r) => (
                    <option key={r._id} value={r._id}>
                      Link to: {r.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                className="font-mono text-xs font-bold uppercase"
              >
                Save Task
              </Button>
            </div>
          </form>
        )}

        {/* Tasks List */}
        {goal?.tasks && goal.tasks.length > 0 ? (
          <div className="space-y-2">
            {goal.tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border border-[#62695D] bg-[#202720] p-3.5 transition-colors hover:border-[#D7FF00]",
                  task.completed && "border-[#62695D]/40 bg-[#252D26]/60 opacity-80"
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="text-[#B8B9AA] transition-colors hover:text-[#D7FF00]"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-[#D7FF00]" />
                    ) : (
                      <Circle className="h-5 w-5 text-[#B8B9AA]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate font-mono text-xs font-semibold text-[#F3F0E6]",
                          task.completed && "text-[#B8B9AA] line-through"
                        )}
                      >
                        {task.title}
                      </span>
                      {task.roadmapTitle && (
                        <Badge variant="outline" className="py-0 font-mono text-[10px]">
                          {task.roadmapTitle}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-[#B8B9AA]">
                      {task.completedMinutes || 0} / {task.targetMinutes} mins completed
                    </div>
                  </div>
                </div>

                {/* Task Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAddMinutesToTask(task.id, 15)}
                    className="rounded border border-[#62695D] bg-[#252D26] px-2 py-1 font-mono text-[10px] text-[#D7FF00] transition-colors hover:border-[#D7FF00] hover:bg-[#2C352D]"
                    title="Add 15 minutes to this task"
                  >
                    +15m
                  </button>
                  <button
                    onClick={() => handleAddMinutesToTask(task.id, 30)}
                    className="rounded border border-[#62695D] bg-[#252D26] px-2 py-1 font-mono text-[10px] text-[#D7FF00] transition-colors hover:border-[#D7FF00] hover:bg-[#2C352D]"
                    title="Add 30 minutes to this task"
                  >
                    +30m
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="ml-1 rounded p-1 text-[#B8B9AA] transition-colors hover:text-red-400"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#62695D] bg-[#202720]/50 py-8 text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-[#B8B9AA]" />
            <p className="font-mono text-xs text-[#B8B9AA]">No tasks planned for this day yet.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddTask(true)}
              className="mt-3 font-mono text-xs"
            >
              Add First Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
