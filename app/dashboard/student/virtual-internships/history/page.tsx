"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StudentBrandPageShell } from "@/components/dashboard/StudentBrandPageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import type { VIEnrollment } from "@/types/virtualInternships";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  History,
  ImageIcon,
  Play,
} from "lucide-react";
import toast from "react-hot-toast";

type HistoryFilter = "all" | "active" | "completed" | "other";

function isCompleted(run: VIEnrollment) {
  return (
    run.status === "completed" ||
    Boolean(run.certificate?.issued) ||
    Boolean(run.certificate?.eligible) ||
    (run.completion_percentage ?? 0) >= 100
  );
}

function statusLabel(run: VIEnrollment) {
  if (run.status === "dropped") return "Dropped";
  if (isCompleted(run)) return "Completed";
  if (run.status === "active") return "In progress";
  return run.status;
}

function statusBadgeClass(run: VIEnrollment) {
  if (run.status === "dropped") {
    return "bg-slate-200 text-slate-700 hover:bg-slate-200";
  }
  if (isCompleted(run)) {
    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
  }
  return "bg-amber-100 text-amber-800 hover:bg-amber-100";
}

export default function VirtualInternshipHistoryPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<VIEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<HistoryFilter>("all");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await apiClient.getMyVirtualInternshipRuns();
        setRuns(res.runs || []);
      } catch {
        toast.error("Failed to load internship history");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = useMemo(() => {
    const active = runs.filter((r) => r.status === "active" && !isCompleted(r));
    const completed = runs.filter((r) => isCompleted(r));
    const other = runs.filter(
      (r) => r.status !== "active" && !isCompleted(r),
    );
    return {
      all: runs.length,
      active: active.length,
      completed: completed.length,
      other: other.length,
    };
  }, [runs]);

  const filtered = useMemo(() => {
    if (filter === "active") {
      return runs.filter((r) => r.status === "active" && !isCompleted(r));
    }
    if (filter === "completed") {
      return runs.filter((r) => isCompleted(r));
    }
    if (filter === "other") {
      return runs.filter((r) => r.status !== "active" && !isCompleted(r));
    }
    return runs;
  }, [runs, filter]);

  const filters: { value: HistoryFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "active", label: "In progress", count: counts.active },
    { value: "completed", label: "Completed", count: counts.completed },
    { value: "other", label: "Other", count: counts.other },
  ];

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div>
            <Button
              variant="ghost"
              className="-ml-2 mb-1 px-2"
              onClick={() =>
                router.push("/dashboard/student/virtual-internships")
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Virtual Internships
            </Button>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
                  <History className="h-3.5 w-3.5" />
                  History
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                  Internship history
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  All programs you joined — in progress and completed.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {counts.all}
                </span>{" "}
                total ·{" "}
                <span className="text-amber-700 dark:text-amber-300">
                  {counts.active} active
                </span>{" "}
                ·{" "}
                <span className="text-emerald-700 dark:text-emerald-300">
                  {counts.completed} completed
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
            {filters.map((f) => {
              if (f.value === "other" && f.count === 0) return null;
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
              <History className="mx-auto mb-3 h-10 w-10 text-slate-400" />
              <p className="font-medium text-slate-800 dark:text-slate-100">
                No internships in this filter
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Join a program from Explore to start building your history.
              </p>
              <Button
                className="mt-4 rounded-xl"
                onClick={() =>
                  router.push("/dashboard/student/virtual-internships")
                }
              >
                Browse internships
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((run) => {
                const expired =
                  run.program?.status === "archived" ||
                  run.program?.status === "draft";
                const done = isCompleted(run);
                const progress = run.progress;

                return (
                  <article
                    key={run.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-200 sm:h-20 sm:w-28 dark:bg-slate-800">
                        {run.program?.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={run.program.thumbnail_url}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                            {run.program?.title || "Internship"}
                          </h2>
                          <Badge className={statusBadgeClass(run)}>
                            {statusLabel(run)}
                          </Badge>
                          {expired && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                              Expired
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {run.program?.technology ||
                            run.program?.category ||
                            "Virtual internship"}
                          {" · "}
                          Day {run.current_day}
                          {" · "}
                          {(run.completion_percentage ?? 0).toFixed?.(0) ?? 0}%
                          complete
                          {run.total_score != null
                            ? ` · Score ${run.total_score}`
                            : ""}
                        </p>
                        {progress && (
                          <p className="text-xs text-slate-500">
                            {progress.completed} of {progress.total_tasks} tasks
                            done
                            {progress.pending
                              ? ` · ${progress.pending} pending review`
                              : ""}
                            {progress.late ? ` · ${progress.late} late` : ""}
                          </p>
                        )}
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              done ? "bg-emerald-500" : "bg-indigo-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, run.completion_percentage ?? 0),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                        <Button
                          className="rounded-xl"
                          onClick={() =>
                            router.push(
                              `/dashboard/student/virtual-internships/runs/${run.id}`,
                            )
                          }
                        >
                          {done ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              View dashboard
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Continue
                            </>
                          )}
                        </Button>
                        {(run.certificate?.eligible ||
                          run.certificate?.issued ||
                          done) && (
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() =>
                              router.push(
                                "/dashboard/student/virtual-internships/certification",
                              )
                            }
                          >
                            <Award className="mr-2 h-4 w-4" />
                            Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </StudentBrandPageShell>
    </DashboardLayout>
  );
}
