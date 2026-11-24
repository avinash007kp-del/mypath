"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AddMilestoneModal } from "@/components/lms/AddMilestoneModal";
import { fetchMilestones, updateMilestoneApi } from "@/services/api";
import { IMilestone } from "@/types/lms";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [milestones, setMilestones] = useState<IMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayMilestones, setSelectedDayMilestones] = useState<{
    dateStr: string;
    items: IMilestone[];
  } | null>(null);

  const loadMilestones = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMilestones();
      setMilestones(data);
    } catch {
      toast.error("Failed to load calendar deadlines");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMilestones();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      day: number;
      isCurrentMonth: boolean;
      dateStr: string;
      isToday: boolean;
    }[] = [];

    const todayStr = new Date().toISOString().split("T")[0];

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        isCurrentMonth: false,
        dateStr,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        day: i,
        isCurrentMonth: true,
        dateStr,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to fill a 35 or 42 grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        day: i,
        isCurrentMonth: false,
        dateStr,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [year, month]);

  // Map milestones by YYYY-MM-DD
  const milestonesByDate = useMemo(() => {
    const map = new Map<string, IMilestone[]>();
    milestones.forEach((m) => {
      if (!m.targetDate) return;
      const dateStr = m.targetDate.substring(0, 10);
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(m);
    });
    return map;
  }, [milestones]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return milestones
      .filter((m) => m.status !== "Completed" && new Date(m.targetDate) >= now)
      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
      .slice(0, 5);
  }, [milestones]);

  const overdueDeadlines = useMemo(() => {
    return milestones
      .filter((m) => m.status === "Overdue")
      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
  }, [milestones]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
            <CalendarIcon className="h-3.5 w-3.5 text-[#D7FF00]" />
            <span>SCHEDULE &amp; DELIVERABLES TIMELINE</span>
          </div>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
            Deadlines Calendar
          </h1>
          <p className="mt-1 text-xs text-[#B8B9AA] md:text-sm">
            Visual milestone schedule, upcoming target dates, and overdue alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/milestones">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 font-mono text-xs"
            >
              <Trophy className="h-4 w-4" />
              List View
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 font-mono font-bold uppercase shadow-lg shadow-[#D7FF00]/15"
          >
            <Plus className="h-4 w-4" />
            Add Milestone
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Calendar View (3 Cols) */}
        <div className="space-y-4 lg:col-span-3">
          {/* Calendar Month Navigation */}
          <div className="flex items-center justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-4">
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-[#F3F0E6]">
                {monthNames[month]} {year}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className="font-mono text-xs text-[#D7FF00]"
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="rounded-lg border border-[#62695D] bg-[#202720] p-1.5 text-[#B8B9AA] transition-colors hover:border-[#D7FF00] hover:text-[#EDE8D8]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="rounded-lg border border-[#62695D] bg-[#202720] p-1.5 text-[#B8B9AA] transition-colors hover:border-[#D7FF00] hover:text-[#EDE8D8]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto rounded-xl border border-[#62695D] bg-[#252D26] p-4">
            {/* Weekdays */}
            <div className="mb-2 grid grid-cols-7 gap-1 text-center font-mono text-xs font-bold uppercase text-[#D7FF00]">
              <div className="py-1">Sun</div>
              <div className="py-1">Mon</div>
              <div className="py-1">Tue</div>
              <div className="py-1">Wed</div>
              <div className="py-1">Thu</div>
              <div className="py-1">Fri</div>
              <div className="py-1">Sat</div>
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cd, idx) => {
                const dayMilestones = milestonesByDate.get(cd.dateStr) || [];
                const hasOverdue = dayMilestones.some((m) => m.status === "Overdue");
                const hasCompleted = dayMilestones.some((m) => m.status === "Completed");

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (dayMilestones.length > 0) {
                        setSelectedDayMilestones({
                          dateStr: cd.dateStr,
                          items: dayMilestones,
                        });
                      }
                    }}
                    className={cn(
                      "flex min-h-[90px] cursor-pointer flex-col justify-between rounded-lg border p-1.5 transition-all md:min-h-[105px]",
                      cd.isCurrentMonth
                        ? "border-[#62695D]/60 bg-[#202720] hover:border-[#D7FF00] hover:bg-[#2C352D]"
                        : "border-[#62695D]/30 bg-[#1B211C]/60 text-[#B8B9AA]/40",
                      cd.isToday && "border-[#D7FF00] bg-[#2C352D] ring-1 ring-[#D7FF00]"
                    )}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full font-bold",
                          cd.isToday
                            ? "bg-[#D7FF00] text-[#1B211C]"
                            : cd.isCurrentMonth
                              ? "text-[#F3F0E6]"
                              : "text-[#B8B9AA]/40"
                        )}
                      >
                        {cd.day}
                      </span>

                      {dayMilestones.length > 0 && (
                        <span className="font-mono text-[10px] text-[#B8B9AA]">
                          {dayMilestones.length}
                        </span>
                      )}
                    </div>

                    {/* Milestones list in day cell */}
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {dayMilestones.slice(0, 2).map((m) => (
                        <div
                          key={m._id}
                          className={cn(
                            "truncate rounded px-1.5 py-0.5 font-mono text-[10px] font-medium",
                            m.status === "Completed"
                              ? "border border-[#62695D] bg-[#252D26] text-[#D7FF00]"
                              : m.status === "Overdue"
                                ? "border border-red-700/50 bg-red-950/80 text-red-300"
                                : "border border-[#62695D] bg-[#252D26] text-[#EDE8D8]"
                          )}
                          title={m.title}
                        >
                          {m.title}
                        </div>
                      ))}
                      {dayMilestones.length > 2 && (
                        <div className="px-1 font-mono text-[9px] text-[#B8B9AA]">
                          +{dayMilestones.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: Upcoming & Overdue (1 Col) */}
        <div className="space-y-4">
          {/* Overdue Alert Section */}
          {overdueDeadlines.length > 0 && (
            <div className="space-y-3 rounded-xl border border-red-800/40 bg-red-950/20 p-4">
              <h3 className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Overdue Deadlines ({overdueDeadlines.length})
              </h3>
              <div className="space-y-2">
                {overdueDeadlines.map((m) => (
                  <div
                    key={m._id}
                    className="rounded-lg border border-red-900/50 bg-[#252D26] p-2.5 text-xs"
                  >
                    <div className="truncate font-semibold text-white">{m.title}</div>
                    <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-red-400">
                      <span>Due: {m.targetDate.substring(0, 10)}</span>
                      <span className="py-0.2 rounded border border-red-800 bg-red-950 px-1.5 text-[10px] font-bold uppercase">
                        Overdue
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Deadlines */}
          <div className="space-y-3 rounded-2xl border border-[#62695D] bg-[#252D26] p-4 shadow-sm">
            <h3 className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#D7FF00]">
              <Clock className="h-4 w-4 text-[#D7FF00]" />
              Upcoming Deadlines
            </h3>

            {upcomingDeadlines.length === 0 ? (
              <p className="py-3 text-xs text-[#B8B9AA]">No upcoming deadlines scheduled.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map((m) => (
                  <div
                    key={m._id}
                    className="rounded-xl border border-[#62695D] bg-[#202720] p-3 text-xs transition-colors hover:border-[#D7FF00]/60"
                  >
                    <div className="truncate font-bold text-[#F3F0E6]">{m.title}</div>
                    <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-[#B8B9AA]">
                      <span>{m.targetDate.substring(0, 10)}</span>
                      <span className="rounded border border-[#62695D] bg-[#252D26] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#D7FF00]">
                        {m.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Day Milestones Dialog */}
      {selectedDayMilestones && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedDayMilestones(null)}
          />
          <div className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#62695D]/40 pb-3">
              <h3 className="font-mono text-sm font-bold text-[#F3F0E6]">
                Deadlines for {selectedDayMilestones.dateStr}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDayMilestones(null)}
                className="text-[#B8B9AA] hover:text-[#F3F0E6]"
              >
                Close
              </Button>
            </div>

            <div className="custom-scrollbar max-h-80 space-y-2 overflow-y-auto">
              {selectedDayMilestones.items.map((m) => (
                <div
                  key={m._id}
                  className="space-y-1.5 rounded-xl border border-[#62695D] bg-[#202720] p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F3F0E6]">{m.title}</span>
                    <span className="rounded border border-[#62695D] bg-[#252D26] px-1.5 py-0.5 font-mono text-[10px] text-[#D7FF00]">
                      {m.status}
                    </span>
                  </div>
                  {m.description && <p className="text-xs text-[#B8B9AA]">{m.description}</p>}
                  <div className="flex items-center justify-between pt-1 font-mono text-[11px] text-[#B8B9AA]">
                    <span>Priority: {m.priority}</span>
                    {m.status !== "Completed" && (
                      <button
                        onClick={async () => {
                          await updateMilestoneApi(m._id, {
                            status: "Completed",
                            completedAt: new Date().toISOString(),
                          });
                          toast.success("Milestone marked completed!");
                          loadMilestones();
                          setSelectedDayMilestones(null);
                        }}
                        className="flex items-center gap-1 text-emerald-400 hover:underline"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      <AddMilestoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMilestoneCreated={() => {
          loadMilestones();
        }}
      />
    </div>
  );
}
