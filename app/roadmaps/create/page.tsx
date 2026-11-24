import React from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { RoadmapForm } from "@/components/roadmaps/RoadmapForm";

export const metadata = {
  title: "Create New Roadmap – MyPath",
  description: "Define a tailored developer learning path with topics, milestones and difficulty.",
};

export default function CreateRoadmapPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Back button & Page Title */}
      <div>
        <Link
          href="/roadmaps"
          className="mb-3 inline-flex items-center gap-1.5 font-mono text-xs text-[#B8B9AA] transition-colors hover:text-[#EDE8D8]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Roadmaps
        </Link>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
          <PlusCircle className="h-3.5 w-3.5 text-[#D7FF00]" />
          <span>CURRICULUM ARCHITECT</span>
        </div>
        <h2 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
          Create New Roadmap
        </h2>
        <p className="mt-1 text-xs text-[#B8B9AA] md:text-sm">
          Specify roadmap details, estimated duration, category, and initial topics to track your
          progress.
        </p>
      </div>

      {/* Form */}
      <RoadmapForm />
    </div>
  );
}
