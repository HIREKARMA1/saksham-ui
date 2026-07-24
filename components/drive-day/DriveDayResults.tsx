"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

type Props = {
  session: any;
  onRestart: () => void;
};

export function DriveDayResults({ session, onRestart }: Props) {
  const results = session?.results || {};
  const shortlist = results.shortlist_status || session?.shortlist_status;
  const passed = shortlist === "SHORTLISTED";
  const feedback = results.feedback || {};
  const skin = session?.template?.branding_skin || {};

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div
        className="rounded-2xl p-8 text-white"
        style={{ background: skin.primary || "#1A4B8C" }}
      >
        <p className="text-xs uppercase tracking-wider opacity-70">Results reveal</p>
        <h2 className="text-2xl font-bold mt-2 flex items-center gap-2">
          {passed ? <CheckCircle2 className="w-7 h-7 text-emerald-300" /> : <XCircle className="w-7 h-7 text-red-300" />}
          {passed ? "Shortlisted" : "Not shortlisted"}
        </h2>
        <p className="mt-3 text-sm opacity-95">{results.what_this_means}</p>
        <Badge className="mt-4 bg-white/20">{session?.candidate_id}</Badge>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {(["aptitude", "coding", "interview"] as const).map((k) => {
          const f = feedback[k];
          return (
            <div
              key={k}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-sm"
            >
              <p className="text-xs uppercase text-slate-500 font-semibold">{k}</p>
              {f ? (
                <p className="mt-2 text-lg font-bold">
                  {f.percent != null ? `${f.percent}%` : f.overall_score != null ? `${f.overall_score}` : "—"}
                </p>
              ) : (
                <p className="mt-2 text-slate-400">—</p>
              )}
            </div>
          );
        })}
      </div>

      {results.readiness_delta && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {results.readiness_delta.note}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={onRestart} variant="outline">
          Run Drive Day again
        </Button>
        <Link
          href="/dashboard/student/resume-agent"
          className="inline-flex items-center justify-center rounded-md bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2"
        >
          Back to Resume Agent
        </Link>
      </div>
    </div>
  );
}
