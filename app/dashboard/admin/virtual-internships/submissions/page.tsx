"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import type { VISubmission } from "@/types/virtualInternships";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Paperclip,
  RotateCcw,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "needs_revision", label: "Needs revision" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
] as const;

function statusBadgeClass(status: string) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "rejected":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "needs_revision":
      return "bg-amber-100 text-amber-900 hover:bg-amber-100";
    case "pending":
      return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
    default:
      return "bg-slate-200 text-slate-800 hover:bg-slate-200";
  }
}

export default function AdminVirtualInternshipSubmissionsPage() {
  const [subs, setSubs] = useState<VISubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [pendingLeft, setPendingLeft] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadCounts = async () => {
    try {
      const allRes = await apiClient.adminListVirtualInternshipSubmissions({
        status: "all",
      });
      const all = (allRes.submissions || []) as VISubmission[];
      const counts: Record<string, number> = {
        pending: 0,
        needs_revision: 0,
        approved: 0,
        rejected: 0,
        all: all.length,
      };
      for (const s of all) {
        if (s.status in counts) {
          counts[s.status] += 1;
        }
      }
      setStatusCounts(counts);
      setPendingLeft(counts.pending || 0);
    } catch {
      // keep last known counts
    }
  };

  const load = async (s = status) => {
    setLoading(true);
    try {
      const res = await apiClient.adminListVirtualInternshipSubmissions({
        status: s,
      });
      setSubs(res.submissions || []);
      await loadCounts();
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const review = async (
    id: string,
    decision: "approved" | "rejected" | "needs_revision",
  ) => {
    setBusyId(id);
    try {
      await apiClient.adminReviewVirtualInternshipSubmission(id, {
        decision,
        marks: marks[id] ? Number(marks[id]) : undefined,
        feedback: feedback[id] || undefined,
      });
      toast.success(`Marked as ${decision}`);
      await load();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Review failed");
    } finally {
      setBusyId(null);
    }
  };

  const downloadArtifact = async (s: VISubmission) => {
    setDownloadingId(s.id);
    try {
      const { blob, filename } = await apiClient.adminDownloadVirtualInternshipArtifact(
        s.id,
      );
      if (blob.type.includes("application/json")) {
        const text = await blob.text();
        try {
          const parsed = JSON.parse(text) as { detail?: string };
          toast.error(parsed.detail || "Could not open the submitted file");
        } catch {
          toast.error("Could not open the submitted file");
        }
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = s.artifact_filename || filename || "attachment";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error("Could not open the submitted file");
    } finally {
      setDownloadingId(null);
    }
  };

  const actionableCount = useMemo(
    () =>
      subs.filter(
        (s) => s.status === "pending" || s.status === "needs_revision",
      ).length,
    [subs],
  );

  return (
    <DashboardLayout requiredUserType="admin">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Button asChild variant="ghost" className="-ml-2 mb-1 px-2">
              <Link href="/dashboard/admin/virtual-internships">
                <ArrowLeft className="mr-2 h-4 w-4" /> Programs
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              Submission Review
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review student deliverables, leave feedback, and advance internship days.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/40">
              <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
              <div>
                <p className="text-xs uppercase tracking-wide text-indigo-700/80 dark:text-indigo-200/80">
                  Reviews left
                </p>
                <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                  {loading && pendingLeft === 0 ? "…" : pendingLeft}
                  <span className="ml-1 text-sm font-medium text-indigo-700/80 dark:text-indigo-200/80">
                    pending
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  In this view
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {loading
                    ? "…"
                    : `${subs.length} submission${subs.length === 1 ? "" : "s"}`}
                  {!loading && actionableCount > 0
                    ? ` · ${actionableCount} need action`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
          {STATUS_FILTERS.map((f) => {
            const active = status === f.value;
            const count = statusCounts[f.value];
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setStatus(f.value);
                  void load(f.value);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {f.label}
                {typeof count === "number" && (
                  <span
                    className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none ${
                      active
                        ? "bg-white/20 text-white"
                        : f.value === "pending" && count > 0
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : subs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="font-medium text-slate-800 dark:text-slate-100">
              No submissions in this filter
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try another status tab, or wait for students to submit work.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {subs.map((s) => {
              const canReview =
                s.status === "pending" || s.status === "needs_revision";
              const hasFile = Boolean(s.has_artifact || s.artifact_url);
              const links = [
                s.github_url && { label: "GitHub", href: s.github_url },
                s.drive_url && { label: "Drive", href: s.drive_url },
                s.external_url && { label: "External", href: s.external_url },
              ].filter(Boolean) as { label: string; href: string }[];

              return (
                <article
                  key={s.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                          {s.student_name || "Student"}
                        </h2>
                        <Badge className={statusBadgeClass(s.status)}>
                          {s.status.replace("_", " ")}
                        </Badge>
                        {s.is_late && (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                            Late
                          </Badge>
                        )}
                        {hasFile && (
                          <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">
                            File attached
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {s.program_title || "Internship"}
                        </span>
                        {" · "}
                        Day {s.day_number ?? "—"} — {s.task_title || "Task"}
                      </p>
                    </div>
                    <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {s.submitted_at
                        ? new Date(s.submitted_at).toLocaleString()
                        : "—"}
                    </p>
                  </div>

                  <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
                    <div className="space-y-4 border-b border-slate-100 p-5 lg:border-b-0 lg:border-r dark:border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <FileText className="h-3.5 w-3.5" />
                        Deliverable
                      </div>
                      {s.text_answer ? (
                        <p className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200">
                          {s.text_answer}
                        </p>
                      ) : (
                        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-700">
                          No text answer submitted.
                        </p>
                      )}

                      {hasFile && (
                        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/40 dark:bg-sky-950/30">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-200">
                                <Paperclip className="h-3.5 w-3.5" />
                                Uploaded file
                              </p>
                              <p className="mt-1 truncate text-sm font-medium text-slate-900 dark:text-white">
                                {s.artifact_filename || "Attachment"}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-xl border-sky-300 bg-white hover:bg-sky-100"
                              disabled={downloadingId === s.id}
                              onClick={() => void downloadArtifact(s)}
                            >
                              <Download className="mr-1.5 h-4 w-4" />
                              {downloadingId === s.id
                                ? "Opening..."
                                : "View / Download"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {links.map((l) => (
                            <a
                              key={l.href}
                              href={l.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-800 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
                            >
                              {l.label}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ))}
                        </div>
                      )}
                      {s.comments && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          <span className="font-medium text-slate-800 dark:text-slate-100">
                            Student note:
                          </span>{" "}
                          {s.comments}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4 bg-slate-50/50 p-5 dark:bg-slate-950/20">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Review panel
                      </p>

                      {canReview ? (
                        <>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                Marks
                              </label>
                              <Input
                                type="number"
                                placeholder="e.g. 10"
                                className="bg-white dark:bg-slate-900"
                                value={marks[s.id] || ""}
                                onChange={(e) =>
                                  setMarks({ ...marks, [s.id]: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                Feedback
                              </label>
                              <textarea
                                className="min-h-[88px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                placeholder="What went well / what to improve"
                                value={feedback[s.id] || ""}
                                onChange={(e) =>
                                  setFeedback({
                                    ...feedback,
                                    [s.id]: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                              disabled={busyId === s.id}
                              onClick={() => void review(s.id, "approved")}
                            >
                              <Check className="mr-1.5 h-4 w-4" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-xl"
                              disabled={busyId === s.id}
                              onClick={() => void review(s.id, "needs_revision")}
                            >
                              <RotateCcw className="mr-1.5 h-4 w-4" /> Changes
                            </Button>
                            <Button
                              variant="destructive"
                              className="rounded-xl"
                              disabled={busyId === s.id}
                              onClick={() => void review(s.id, "rejected")}
                            >
                              <X className="mr-1.5 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                          <p className="text-slate-600 dark:text-slate-300">
                            {s.feedback ? (
                              <>
                                <span className="font-medium text-slate-900 dark:text-white">
                                  Feedback:
                                </span>{" "}
                                {s.feedback}
                              </>
                            ) : (
                              "No feedback recorded."
                            )}
                          </p>
                          {s.marks != null && (
                            <p className="mt-2 font-medium text-slate-900 dark:text-white">
                              Marks: {s.marks}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
