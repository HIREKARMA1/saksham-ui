"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StudentBrandPageShell } from "@/components/dashboard/StudentBrandPageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import type { VIProgram } from "@/types/virtualInternships";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

export default function VirtualInternshipProgramDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;
  const [program, setProgram] = useState<VIProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const p = await apiClient.getVirtualInternshipProgram(programId);
        setProgram(p);
      } catch {
        toast.error("Failed to load program");
      } finally {
        setLoading(false);
      }
    })();
  }, [programId]);

  const enroll = async () => {
    if (!showRules) {
      setShowRules(true);
      return;
    }
    setEnrolling(true);
    try {
      const run = await apiClient.enrollVirtualInternship(programId);
      toast.success("Enrolled successfully!");
      router.push(`/dashboard/student/virtual-internships/runs/${run.id}`);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout requiredUserType="student">
        <div className="flex justify-center py-24">
          <Loader />
        </div>
      </DashboardLayout>
    );
  }

  if (!program) {
    return (
      <DashboardLayout requiredUserType="student">
        <div className="p-8 text-center text-gray-500">Program not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/student/virtual-internships")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Internships
          </Button>

          {/* Full-width hero */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="relative h-52 w-full overflow-hidden bg-slate-200 sm:h-64 md:h-72 dark:bg-slate-800">
              {program.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={program.thumbnail_url}
                  alt={program.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600" />
              )}
            </div>

            <div className="space-y-5 p-6 md:p-8 lg:p-10">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                  {program.technology || program.category || "Tech"}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {program.difficulty}
                </Badge>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                    {program.title}
                  </h1>
                  <p className="text-base text-slate-600 dark:text-slate-300">
                    {program.description ||
                      "Structured virtual internship with daily tasks."}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {program.duration_days} days ·{" "}
                      {program.daily_commitment_hours || 2}h / day
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> {program.enrolled_count} enrolled
                      {program.seats_left != null
                        ? ` · ${program.seats_left} seats left`
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                  {program.has_started === false && (
                    <p className="mb-3 text-sm text-amber-800 dark:text-amber-200">
                      Students can enroll now, but the internship has{" "}
                      <strong>not started yet</strong>
                      {program.starts_at
                        ? ` (starts ${new Date(program.starts_at).toLocaleString()})`
                        : ""}
                      .
                    </p>
                  )}
                  {showRules && (
                    <div className="mb-4 space-y-2 text-sm text-indigo-950 dark:text-indigo-100">
                      <h3 className="font-semibold">Accept &amp; Join</h3>
                      <ul className="list-disc space-y-1 pl-5">
                        <li>Complete daily tasks before deadlines when set.</li>
                        <li>Submit PDF, ZIP, GitHub URL, or text as required.</li>
                        <li>Late submissions depend on task policy.</li>
                        <li>Admin review unlocks the next day.</li>
                      </ul>
                    </div>
                  )}
                  <Button
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
                    disabled={enrolling}
                    onClick={enroll}
                  >
                    {enrolling
                      ? "Enrolling..."
                      : showRules
                        ? "Accept & Join"
                        : "Enroll Now"}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {program.learning_outcomes && program.learning_outcomes.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                  Learning Outcomes
                </h2>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {program.learning_outcomes.map((o) => (
                    <li key={o} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {o}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {program.skills && program.skills.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                  Skills You&apos;ll Learn
                </h2>
                <div className="flex flex-wrap gap-2">
                  {program.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {(program.overview || program.project_details) && (
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
              {program.overview && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                    Overview &amp; Instructions
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {program.overview}
                  </p>
                </div>
              )}
              {program.project_details && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                    Project Details
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {program.project_details}
                  </p>
                </div>
              )}
            </section>
          )}

          {program.reference_links && program.reference_links.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                Reference Links
              </h2>
              <div className="flex flex-wrap gap-2">
                {program.reference_links
                  .filter((l) => l.url && l.label)
                  .map((l) => (
                    <a
                      key={`${l.label}-${l.url}`}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-800 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
                    >
                      {l.label}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
              </div>
            </section>
          )}

          {program.prerequisites && program.prerequisites.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                Prerequisites
              </h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                {program.prerequisites.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>
          )}

          {program.tasks && program.tasks.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                Roadmap Timeline
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {program.tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                      {t.day_number}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                        {t.title}
                      </p>
                      <p className="text-xs capitalize text-slate-500">{t.task_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </StudentBrandPageShell>
    </DashboardLayout>
  );
}
