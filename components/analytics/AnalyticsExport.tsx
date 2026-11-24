"use client";

import React, { useState } from "react";
import { Download, FileText, Table, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchAnalyticsExportData } from "@/services/api";
import { AnalyticsFilterState, OverviewStats, WeeklyProgressAnalytics } from "@/types/analytics";
import { toast } from "sonner";

interface AnalyticsExportProps {
  filters: AnalyticsFilterState;
  overview?: OverviewStats | null;
  weekly?: WeeklyProgressAnalytics | null;
}

export function AnalyticsExport({ filters, overview, weekly }: AnalyticsExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const data = await fetchAnalyticsExportData(filters);
      if (data.length === 0) {
        toast.info("No study session data found in this date range to export.");
        return;
      }

      // Build CSV string
      const headers = ["Date", "Roadmap", "Topic", "Duration (Minutes)", "Sessions", "Status"];
      const rows = data.map((r) => [
        `"${r.date}"`,
        `"${r.roadmap.replace(/"/g, '""')}"`,
        `"${r.topic.replace(/"/g, '""')}"`,
        r.durationMinutes,
        r.sessionCount,
        `"${r.status}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `mypath_analytics_${filters.dateRange}_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV report downloaded successfully!");
      setIsOpen(false);
    } catch {
      toast.error("Failed to export CSV report");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    // Open print preview which applies print stylesheets
    toast.info("Opening print dialog for PDF export...");
    setIsOpen(false);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 border-[#62695D] bg-[#202720] font-mono text-xs text-[#F3F0E6] hover:border-[#D7FF00] hover:text-[#D7FF00]"
      >
        <Download className="h-3.5 w-3.5 text-[#D7FF00]" />
        Export
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 space-y-1 rounded-2xl border border-[#62695D] bg-[#252D26] p-2 shadow-2xl">
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#D7FF00]" />
              ) : (
                <Table className="h-4 w-4 text-[#D7FF00]" />
              )}
              <div>
                <div className="font-bold">Export as CSV</div>
                <div className="text-[10px] text-[#B8B9AA]">Spreadsheet data rows</div>
              </div>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
            >
              <FileText className="h-4 w-4 text-[#EDE8D8]" />
              <div>
                <div className="font-bold">Print / PDF Report</div>
                <div className="text-[10px] text-[#B8B9AA]">Executive dashboard view</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
