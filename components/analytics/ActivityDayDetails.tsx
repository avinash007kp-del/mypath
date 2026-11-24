"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen, CheckCircle2, FileText, X, Map, Loader2 } from "lucide-react";
import { ActivityCalendarDayDetails } from "@/types/analytics";
import { fetchActivityCalendarDayDetails } from "@/services/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ActivityDayDetailsProps {
  date: string | null;
  roadmapId?: string;
  onClose: () => void;
}

export function ActivityDayDetails({ date, roadmapId, onClose }: ActivityDayDetailsProps) {
  const [details, setDetails] = useState<ActivityCalendarDayDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    fetchActivityCalendarDayDetails({ date, roadmapId })
      .then((data) => setDetails(data))
      .catch((err) => console.error("Error loading day details:", err))
      .finally(() => setLoading(false));
  }, [date, roadmapId]);

  if (!date) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#62695D]/40 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#D7FF00]" />
            <div>
              <h3 className="font-mono text-base font-bold text-[#F3F0E6]">{date}</h3>
              <p className="text-[11px] text-[#B8B9AA]">Activity &amp; focus breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading || !details ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-[#B8B9AA]">
            <Loader2 className="h-6 w-6 animate-spin text-[#D7FF00]" />
            <span className="font-mono text-xs">Retrieving day logs...</span>
          </div>
        ) : (
          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-1">
            {/* Quick KPI Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#62695D] bg-[#202720] p-3">
                <span className="font-mono text-[10px] uppercase text-[#B8B9AA]">Time Studied</span>
                <div className="mt-0.5 font-mono text-xl font-bold text-[#F3F0E6]">
                  {details.totalHours}h{" "}
                  <span className="text-xs font-normal text-[#B8B9AA]">
                    ({details.totalMinutes}m)
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-[#62695D] bg-[#202720] p-3">
                <span className="font-mono text-[10px] uppercase text-[#B8B9AA]">
                  Study Sessions
                </span>
                <div className="mt-0.5 font-mono text-xl font-bold text-[#D7FF00]">
                  {details.sessionCount}
                </div>
              </div>
            </div>

            {/* Roadmaps Worked On */}
            {details.roadmapsWorkedOn.length > 0 && (
              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#F3F0E6]">
                  <Map className="h-3.5 w-3.5 text-[#D7FF00]" />
                  Curriculums Studied
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {details.roadmapsWorkedOn.map((r, i) => (
                    <span
                      key={i}
                      className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-xs text-[#EDE8D8]"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sessions List */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#F3F0E6]">
                <Clock className="h-3.5 w-3.5 text-[#D7FF00]" />
                Study Sessions ({details.sessions.length})
              </span>
              {details.sessions.length === 0 ? (
                <p className="text-xs italic text-[#B8B9AA]">No formal sessions recorded.</p>
              ) : (
                <div className="space-y-2">
                  {details.sessions.map((s) => (
                    <div
                      key={s._id}
                      className="space-y-1 rounded-xl border border-[#62695D] bg-[#202720] p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#F3F0E6]">{s.title}</span>
                        <span className="rounded border border-[#62695D] bg-[#252D26] px-2 py-0.5 font-mono text-[10px] text-[#D7FF00]">
                          {s.durationMinutes}m
                        </span>
                      </div>
                      {s.roadmapTitle && (
                        <div className="text-[11px] text-[#B8B9AA]">{s.roadmapTitle}</div>
                      )}
                      {s.reflection && (
                        <p className="mt-1 border-t border-[#62695D]/40 pt-1 text-[11px] italic text-[#EDE8D8]">
                          &ldquo;{s.reflection}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tasks */}
            {details.completedTasks.length > 0 && (
              <div className="space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#F3F0E6]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#D7FF00]" />
                  Daily Tasks Finished ({details.completedTasks.length})
                </span>
                <div className="space-y-1.5">
                  {details.completedTasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-[#62695D] bg-[#202720] p-2.5 text-xs"
                    >
                      <span className="text-[#F3F0E6]">{t.title}</span>
                      {t.roadmapTitle && (
                        <span className="rounded border border-[#62695D] bg-[#252D26] px-1.5 py-0.5 font-mono text-[10px] text-[#B8B9AA]">
                          {t.roadmapTitle}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Created */}
            {details.notesCreated.length > 0 && (
              <div className="space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#F3F0E6]">
                  <FileText className="h-3.5 w-3.5 text-[#EDE8D8]" />
                  Notes Authored ({details.notesCreated.length})
                </span>
                <div className="space-y-1.5">
                  {details.notesCreated.map((n) => (
                    <div
                      key={n._id}
                      className="flex items-center justify-between rounded-lg border border-[#62695D] bg-[#202720] p-2.5 text-xs"
                    >
                      <span className="text-[#F3F0E6]">{n.title}</span>
                      {n.roadmapTitle && (
                        <span className="rounded border border-[#62695D] bg-[#252D26] px-1.5 py-0.5 font-mono text-[10px] text-[#B8B9AA]">
                          {n.roadmapTitle}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end border-t border-[#62695D]/40 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-[#62695D] text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
