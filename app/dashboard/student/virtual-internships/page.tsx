"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StudentBrandPageShell } from "@/components/dashboard/StudentBrandPageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import type { VIEnrollment, VIProgram } from "@/types/virtualInternships";
import {
  ArrowRight,
  Award,
  Clock,
  GraduationCap,
  History,
  ImageIcon,
  Play,
  Star,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

type CardAction = {
  label: string;
  href: string;
  kind: "join" | "continue" | "certificate";
};

function resolveCardAction(
  program: VIProgram,
  run: VIEnrollment | undefined,
): CardAction {
  if (!run) {
    return {
      label: "Join Internship",
      href: `/dashboard/student/virtual-internships/programs/${program.id}`,
      kind: "join",
    };
  }

  const started =
    run.program_started ??
    run.program?.has_started ??
    program.has_started ??
    true;

  if (!started) {
    return {
      label: "Not started yet",
      href: `/dashboard/student/virtual-internships/runs/${run.id}`,
      kind: "continue",
    };
  }

  const done =
    run.status === "completed" ||
    Boolean(run.certificate?.issued) ||
    Boolean(run.certificate?.eligible) ||
    (run.completion_percentage ?? 0) >= 100;

  if (done) {
    return {
      label: "View Certificate",
      href: "/dashboard/student/virtual-internships/certification",
      kind: "certificate",
    };
  }

  return {
    label: "Continue where left",
    href: `/dashboard/student/virtual-internships/runs/${run.id}`,
    kind: "continue",
  };
}

export default function VirtualInternshipsLandingPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<VIProgram[]>([]);
  const [myRuns, setMyRuns] = useState<VIEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [progRes, runsRes] = await Promise.all([
          apiClient.listVirtualInternshipPrograms(),
          apiClient.getMyVirtualInternshipRuns().catch(() => ({ runs: [] })),
        ]);
        setPrograms(progRes.programs || []);
        setMyRuns(runsRes.runs || []);
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || "Failed to load internships";
        toast.error(typeof msg === "string" ? msg : "Failed to load internships");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const runsByProgramId = useMemo(() => {
    const map = new Map<string, VIEnrollment>();
    for (const run of myRuns) {
      map.set(run.program_id, run);
    }
    return map;
  }, [myRuns]);

  const activeRuns = useMemo(
    () => myRuns.filter((run) => run.status === "active"),
    [myRuns],
  );

  const historyCount = myRuns.length;

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-8 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 md:p-10">
            <div className="pointer-events-none absolute -right-8 top-4 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-700/20" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-indigo-200/30 blur-2xl" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                  Virtual AI Internships
                </p>
                <h1 className="max-w-xl text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
                  Learn. Build. Submit.
                  <br />
                  Get Industry Experience.
                </h1>
                <p className="max-w-lg text-sm text-slate-600 dark:text-slate-300 md:text-base">
                  Enroll in structured AI-powered internships with daily practical
                  tasks, deadlines, and mentor-style reviews.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    className="rounded-xl bg-indigo-600 px-5 text-white hover:bg-indigo-700"
                    onClick={() =>
                      document
                        .getElementById("explore")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Explore
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    onClick={() =>
                      router.push(
                        "/dashboard/student/virtual-internships/certification",
                      )
                    }
                  >
                    My Certification
                  </Button>
                </div>
              </div>
              <div className="hidden justify-center md:flex">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-sky-100 bg-white/80 shadow-inner dark:border-slate-700 dark:bg-slate-800/60">
                  <GraduationCap className="h-20 w-20 text-indigo-500" />
                  <div className="absolute inset-3 rounded-full border border-dashed border-sky-300/70 dark:border-sky-700/50" />
                </div>
              </div>
            </div>
          </section>

          {/* My Internships — active only */}
          {(activeRuns.length > 0 || historyCount > 0) && (
            <section id="my-internships" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    My Internships
                  </h2>
                  <p className="text-xs text-slate-500">
                    Active programs you can continue right now
                  </p>
                </div>
                {historyCount > 0 && (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() =>
                      router.push(
                        "/dashboard/student/virtual-internships/history",
                      )
                    }
                  >
                    <History className="mr-2 h-4 w-4" />
                    View internship history
                    {historyCount > activeRuns.length && (
                      <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {historyCount}
                      </span>
                    )}
                  </Button>
                )}
              </div>

              {activeRuns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    No active internships right now.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Explore new programs below, or open your full history.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {activeRuns.map((run) => {
                    const expired =
                      run.program?.status === "archived" ||
                      run.program?.status === "draft";
                    return (
                      <button
                        key={run.id}
                        type="button"
                        onClick={() =>
                          router.push(
                            `/dashboard/student/virtual-internships/runs/${run.id}`,
                          )
                        }
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                      >
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                          {run.program?.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={run.program.thumbnail_url}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                            {run.program?.title || "Internship"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Day {run.current_day} ·{" "}
                            {run.completion_percentage?.toFixed?.(0) ?? 0}%
                            complete
                          </p>
                          {expired && (
                            <p className="text-xs font-medium text-red-600">
                              Expired
                            </p>
                          )}
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          In progress
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Explore */}
          <section id="explore" className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Explore Internships
            </h2>
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader />
              </div>
            ) : programs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                <GraduationCap className="mx-auto mb-3 h-10 w-10 text-indigo-400" />
                No published internships yet. Check back soon.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {programs.map((p) => {
                  const run = runsByProgramId.get(p.id);
                  const action = resolveCardAction(p, run);
                  const buttonClass =
                    action.kind === "certificate"
                      ? "mt-1 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
                      : action.kind === "continue"
                        ? "mt-1 w-full rounded-xl bg-blue-500 hover:bg-blue-600"
                        : "mt-1 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700";

                  return (
                    <article
                      key={p.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="relative h-40 overflow-hidden bg-slate-200 dark:bg-slate-800">
                        {p.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.thumbnail_url}
                            alt={p.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                            <ImageIcon className="h-10 w-10" />
                            <span className="text-xs">No thumbnail</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                            {p.technology || p.category || "Tech"}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {p.difficulty}
                          </Badge>
                          {run && (
                            <Badge
                              className={
                                action.kind === "certificate"
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              }
                            >
                              {action.kind === "certificate"
                                ? "Completed"
                                : "In progress"}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                          {p.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-slate-500">
                          {p.description || "Hands-on virtual internship program."}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {p.duration_days} Days
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {p.enrolled_count}{" "}
                            enrolled
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-400" /> Starts
                            Immediately
                          </span>
                        </div>
                        <Button
                          className={buttonClass}
                          onClick={() => router.push(action.href)}
                        >
                          {action.kind === "certificate" && (
                            <Award className="mr-2 h-4 w-4" />
                          )}
                          {action.kind === "continue" && (
                            <Play className="mr-2 h-4 w-4" />
                          )}
                          {action.label}
                          {action.kind === "join" && (
                            <ArrowRight className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </StudentBrandPageShell>
    </DashboardLayout>
  );
}
