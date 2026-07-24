"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { Layers, FileText, ArrowRight } from "lucide-react";

/**
 * Phase-1 Drive Day entry — launches the seeded TCS NQT immersive template
 * into the existing Placement Drive run page (reporting / transition / results_reveal).
 */
export default function DriveDayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<any | null>(null);
  const [context, setContext] = useState<any | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [tpl, ctx] = await Promise.all([
          apiClient.getPhase1TcsNqtDrive().catch(() => null),
          apiClient.getStudentContext().catch(() => null),
        ]);
        setTemplate(tpl);
        setContext(ctx?.context || null);
      } catch {
        /* ignore preview errors */
      }
    })();
  }, []);

  const start = async () => {
    setLoading(true);
    try {
      const attempt = await apiClient.startPhase1TcsNqtDrive();
      const attemptId = attempt?.attempt_id || attempt?.id;
      if (!attemptId) throw new Error("No attempt id returned");
      toast.success("Entering TCS NQT Drive Day");
      router.replace(`/dashboard/student/placement-drives/run?attempt_id=${attemptId}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || e?.message || "Could not start Drive Day");
      setLoading(false);
    }
  };

  const stages = template?.stages || [];
  const immersion = template?.immersion;
  const plan = context?.agent_notes?.curriculum_agent || context?.curriculum_plan;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold">Phase 1</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Layers className="w-7 h-7" style={{ color: immersion?.branding?.primary_color || "#4B6CB7" }} />
            {template?.title || "TCS NQT Drive Day"}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {template?.description ||
              "Immersive campus drive — uses the Placement Drive engine (reporting → aptitude → coding → interview → results)."}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-sm space-y-3">
          <p className="font-semibold">Round order (from config seed)</p>
          {stages.length === 0 ? (
            <p className="text-slate-500">Template will be seeded on start.</p>
          ) : (
            <ol className="list-decimal pl-5 space-y-1 text-slate-700 dark:text-slate-300">
              {stages.map((s: any, i: number) => (
                <li key={i}>
                  <span className="font-medium">{s.title || s.stage_type}</span>
                  <span className="text-slate-400 text-xs ml-2">({s.stage_type})</span>
                </li>
              ))}
            </ol>
          )}
          {immersion?.exit_warning && (
            <p className="text-xs text-amber-700 dark:text-amber-300 border-t border-slate-100 pt-3">
              {immersion.exit_warning}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-sm space-y-2">
          <p className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" /> Before you start
          </p>
          <p className="text-slate-600">
            Lock a resume in{" "}
            <Link href="/dashboard/student/resume-agent" className="text-orange-600 underline">
              Resume Agent
            </Link>{" "}
            (or{" "}
            <Link href="/dashboard/student/resume" className="text-orange-600 underline">
              Resume Analysis
            </Link>
            ) so the interview is resume-grounded.
          </p>
          {plan?.sidebar?.items && (
            <ul className="list-disc pl-5 text-slate-600">
              {(plan.sidebar.items || plan.items || []).map((i: any) => (
                <li key={i.id || i.title}>{i.title}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="px-8"
            style={{ background: immersion?.branding?.primary_color || "#4B6CB7" }}
            onClick={() => void start()}
            disabled={loading}
          >
            {loading ? <Loader className="w-4 h-4" /> : (
              <>
                Start TCS NQT Drive Day <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
          <Link
            href="/dashboard/student/placement-drives"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-900"
          >
            Browse all drives
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
