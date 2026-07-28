"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  FolderKanban,
  Link2,
  Lock,
  Circle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function VirtualInternshipRunPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const [run, setRun] = useState<VIEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getVirtualInternshipRun(runId);
      setRun(data);
    } catch {
      toast.error("Failed to load internship dashboard");
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    void load();
  }, [load]);

  const issueCertificate = async () => {
    setIssuing(true);
    try {
      const cert = await apiClient.issueVirtualInternshipCertificate(runId);
      setRun((prev) => (prev ? { ...prev, certificate: cert } : prev));
      if (cert.certificate_url) {
        window.open(cert.certificate_url, "_blank", "noopener,noreferrer");
      }
      toast.success("Certificate ready");
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Could not issue certificate");
    } finally {
      setIssuing(false);
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

  if (!run) {
    return (
      <DashboardLayout requiredUserType="student">
        <div className="p-8 text-center text-gray-500">Run not found</div>
      </DashboardLayout>
    );
  }

  const progress = run.progress;
  const pct = progress?.completion_percentage ?? run.completion_percentage ?? 0;
  const duration =
    progress?.duration_days ||
    run.program?.duration_days ||
    run.program?.task_count ||
    0;
  const tasks = run.program?.tasks || [];
  const program = run.program;
  const overview = program?.overview || program?.description || null;
  const projectDetails = program?.project_details || null;
  const links = (program?.reference_links || []).filter((l) => l?.url && l?.label);
  const hasBrief =
    Boolean(overview) ||
    Boolean(projectDetails) ||
    links.length > 0 ||
    Boolean(program?.instructor_name) ||
    Boolean(program?.skills?.length);
  const cert = run.certificate;
  const attendanceLocked =
    program?.status === "archived" || program?.status === "draft";
  const availabilityLabel =
    program?.status === "archived"
      ? "Expired"
      : program?.status === "draft"
        ? "Not available"
        : null;

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/student/virtual-internships")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Internships
          </Button>

          <header className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Internship Dashboard
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              {run.program?.title || "Virtual Internship"}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{run.status}</Badge>
              {availabilityLabel && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                  {availabilityLabel}
                </Badge>
              )}
              {program?.technology && (
                <Badge
                  variant="outline"
                  className="border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  {program.technology}
                </Badge>
              )}
              {program?.difficulty && (
                <Badge className="border-transparent bg-slate-200 capitalize text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100">
                  {program.difficulty}
                </Badge>
              )}
            </div>
          </header>

          {attendanceLocked && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              <p className="font-semibold">
                This internship is {availabilityLabel?.toLowerCase() || "not available"}.
              </p>
              <p className="mt-1">
                You can no longer attend or submit tasks. Certificate download may still
                be available if you already qualified.
              </p>
            </section>
          )}

          {run.program_started === false && !attendanceLocked && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
              <p className="font-semibold">Internship has not started yet.</p>
              <p className="mt-1">
                You are enrolled. Daily tasks will unlock after the scheduled start
                {program?.starts_at
                  ? ` (${new Date(program.starts_at).toLocaleString()})`
                  : ""}
                .
              </p>
            </section>
          )}

          {cert?.enabled && (
            <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-gray-900">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Award className="h-5 w-5 text-amber-600" />
                Certificate
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Name: <strong>{cert.student_name || "You"}</strong>
                {" · "}
                Designation:{" "}
                <strong>
                  {cert.designation || cert.internship_title || program?.title}
                </strong>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Need score ≥ {cert.min_score} and completion ≥{" "}
                {Math.round(cert.min_completion_pct)}% (you have {cert.student_score}{" "}
                score, {Math.round(cert.student_completion_pct)}%).
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {cert.issued && cert.certificate_url ? (
                  <Button
                    className="rounded-xl"
                    onClick={() =>
                      window.open(
                        cert.certificate_url!,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Certificate
                  </Button>
                ) : (
                  <Button
                    className="rounded-xl"
                    disabled={!cert.eligible || issuing}
                    onClick={() => void issueCertificate()}
                  >
                    {issuing ? "Issuing…" : "Get Certificate"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    router.push(
                      "/dashboard/student/virtual-internships/certification",
                    )
                  }
                >
                  My Certification
                </Button>
              </div>
            </section>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Current Day"
              value={`${run.current_day} / ${duration}`}
            />
            <SummaryCard
              label="Completed"
              value={String(progress?.completed ?? 0)}
            />
            <SummaryCard
              label="Pending Review"
              value={String(progress?.pending ?? 0)}
            />
            <SummaryCard label="Total Score" value={String(run.total_score ?? 0)} />
          </div>

          <div className="grid gap-6 md:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div
                className="relative flex h-32 w-32 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#4f46e5 ${pct * 3.6}deg, #e5e7eb 0deg)`,
                }}
              >
                <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white text-2xl font-bold dark:bg-gray-900">
                  {Math.round(pct)}%
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">Completion</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-3 font-semibold">Today&apos;s Task</h2>
              {!run.program_started ? (
                <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                  <p className="font-semibold">Internship has not started yet.</p>
                  <p>
                    You are enrolled. Tasks unlock when the internship start time
                    arrives
                    {program?.starts_at
                      ? ` (${new Date(program.starts_at).toLocaleString()})`
                      : ""}
                    .
                  </p>
                </div>
              ) : run.today_task ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Day {run.today_task.day_number}</Badge>
                    <Badge>{run.today_task.task_type}</Badge>
                    {run.latest_submission && (
                      <Badge
                        className={
                          run.latest_submission.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : run.latest_submission.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }
                      >
                        {run.latest_submission.status}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold">{run.today_task.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {run.today_task.description || "Complete and submit this task."}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />{" "}
                      {run.today_task.deadline_days
                        ? `${run.today_task.deadline_days} day deadline`
                        : "No fixed deadline"}
                    </span>
                    <span>{run.today_task.points} pts</span>
                  </div>
                  <Button
                    className="rounded-xl"
                    disabled={attendanceLocked}
                    onClick={() =>
                      router.push(
                        `/dashboard/student/virtual-internships/runs/${run.id}/tasks/${run.today_task!.id}`,
                      )
                    }
                  >
                    {attendanceLocked
                      ? "Not available"
                      : run.latest_submission?.status === "needs_revision"
                        ? "Resubmit Task"
                        : run.latest_submission?.status === "pending"
                          ? "View Submission"
                          : "Start / Submit Task"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-200">
                  <p className="font-semibold">
                    {run.today_task_message || "Task is not published yet."}
                  </p>
                  <p className="text-xs text-slate-500">
                    Your admin will publish this day&apos;s task when it is ready.
                  </p>
                </div>
              )}
            </div>
          </div>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Calendar className="h-4 w-4" /> Timeline
            </h2>
            <div className="space-y-2">
              {(tasks.length
                ? tasks
                : Array.from({ length: duration }, (_, i) => ({
                    id: `d${i + 1}`,
                    day_number: i + 1,
                    title: `Day ${i + 1}`,
                    is_published: false,
                  }))
              ).map(
                (t: {
                  id: string;
                  day_number: number;
                  title: string;
                  is_published?: boolean;
                }) => {
                const day = t.day_number;
                let icon = <Lock className="h-4 w-4 text-gray-400" />;
                let label = "Locked";
                if (t.is_published === false) {
                  icon = <Lock className="h-4 w-4 text-amber-500" />;
                  label = "Not published yet";
                } else if (day < run.current_day) {
                  icon = <CheckCircle2 className="h-4 w-4 text-green-500" />;
                  label = "Done / Passed";
                } else if (day === run.current_day) {
                  icon = <Circle className="h-4 w-4 text-amber-500" />;
                  label = run.program_started ? "Current" : "Waiting to start";
                }
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-sm dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      {icon}
                      <span className="font-medium">
                        Day {day}: {t.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {hasBrief && (
            <section className="space-y-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-6 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-gray-900">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <FileText className="h-5 w-5 text-indigo-600" />
                Internship Brief
              </h2>

              {overview && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Overview &amp; Instructions
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {overview}
                  </p>
                </div>
              )}

              {projectDetails && (
                <div>
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    <FolderKanban className="h-3.5 w-3.5" />
                    Project Details
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {projectDetails}
                  </p>
                </div>
              )}

              {links.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    <Link2 className="h-3.5 w-3.5" />
                    Reference Links
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {links.map((l) => (
                      <li key={`${l.label}-${l.url}`}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-950 dark:text-indigo-300"
                        >
                          {l.label}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {program?.instructor_name && (
                  <span>Instructor: {program.instructor_name}</span>
                )}
                {program?.daily_commitment_hours != null && (
                  <span>~{program.daily_commitment_hours}h / day</span>
                )}
                {program?.skills && program.skills.length > 0 && (
                  <span>Skills: {program.skills.join(", ")}</span>
                )}
              </div>
            </section>
          )}
        </div>
      </StudentBrandPageShell>
    </DashboardLayout>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
