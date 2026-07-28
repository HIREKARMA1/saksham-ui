"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StudentBrandPageShell } from "@/components/dashboard/StudentBrandPageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import type { VIEnrollment, VISubmission, VITask } from "@/types/virtualInternships";
import {
  ArrowLeft,
  Clock,
  FileText,
  Link2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

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

export default function VirtualInternshipTaskSubmitPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const taskId = params.taskId as string;

  const [task, setTask] = useState<VITask | null>(null);
  const [enrollment, setEnrollment] = useState<VIEnrollment | null>(null);
  const [submission, setSubmission] = useState<VISubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [textAnswer, setTextAnswer] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [comments, setComments] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const run = await apiClient.getVirtualInternshipRun(runId);
        setEnrollment(run);
        const found = (run.program?.tasks || []).find(
          (t: VITask) => t.id === taskId,
        );
        if (found) setTask(found);

        const locked =
          run.program?.status === "archived" || run.program?.status === "draft";
        if (!locked) {
          try {
            const data = await apiClient.getVirtualInternshipTodayTask(runId);
            if (data.task) setTask(data.task);
            setSubmission(data.submission);
            if (data.submission) {
              setTextAnswer(data.submission.text_answer || "");
              setGithubUrl(data.submission.github_url || "");
              setDriveUrl(data.submission.drive_url || "");
              setExternalUrl(data.submission.external_url || "");
              setComments(data.submission.comments || "");
            }
          } catch {
            // run already loaded; task may still be from program.tasks
          }
        } else if (run.latest_submission) {
          setSubmission(run.latest_submission);
        }
      } catch {
        toast.error("Failed to load task");
      } finally {
        setLoading(false);
      }
    })();
  }, [runId, taskId]);

  const attendanceLocked =
    enrollment?.program?.status === "archived" ||
    enrollment?.program?.status === "draft";

  const programNotStarted = enrollment?.program_started === false;
  const taskNotPublished =
    Boolean(enrollment) &&
    !programNotStarted &&
    !attendanceLocked &&
    enrollment?.today_task_available === false;

  const canSubmit =
    !attendanceLocked &&
    !programNotStarted &&
    !taskNotPublished &&
    (!submission ||
      submission.status === "needs_revision" ||
      submission.status === "rejected");

  const onSubmit = async () => {
    if (!task) return;
    if (!textAnswer.trim() && !githubUrl.trim() && !driveUrl.trim() && !file) {
      toast.error("Provide an answer, link, or file");
      return;
    }
    setSubmitting(true);
    try {
      const result = await apiClient.submitVirtualInternshipTask({
        runId,
        taskId: task.id,
        textAnswer: textAnswer || undefined,
        githubUrl: githubUrl || undefined,
        driveUrl: driveUrl || undefined,
        externalUrl: externalUrl || undefined,
        comments: comments || undefined,
        file,
      });
      setSubmission(result);
      toast.success("Submitted successfully — pending review");
      router.push(`/dashboard/student/virtual-internships/runs/${runId}`);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Submission failed");
    } finally {
      setSubmitting(false);
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

  if (!task) {
    return (
      <DashboardLayout requiredUserType="student">
        <div className="p-8 text-center text-gray-500">Task not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <Button
            variant="ghost"
            onClick={() =>
              router.push(`/dashboard/student/virtual-internships/runs/${runId}`)
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>

          <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50 px-6 py-5 dark:border-slate-800 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 md:px-8 md:py-6">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                  Day {task.day_number}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {task.task_type}
                </Badge>
                <Badge className="border-transparent bg-slate-200 text-slate-800 hover:bg-slate-200">
                  {task.points} pts
                </Badge>
                {submission && (
                  <Badge className={statusBadgeClass(submission.status)}>
                    {submission.status.replace("_", " ")}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                {task.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
                {task.description || "Complete and submit this task for review."}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                {enrollment && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Current day {enrollment.current_day}
                  </span>
                )}
                <span>
                  Deadline:{" "}
                  {task.deadline_days
                    ? `${task.deadline_days} day(s)`
                    : "None"}
                </span>
                <span>
                  {task.late_submission_allowed
                    ? "Late submissions allowed"
                    : "Late submissions not allowed"}
                </span>
              </div>
            </div>
          </header>

          {(attendanceLocked || programNotStarted || taskNotPublished) && (
            <div
              className={`rounded-2xl border p-4 text-sm ${
                attendanceLocked
                  ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
                  : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
              }`}
            >
              {attendanceLocked
                ? `This internship is ${
                    enrollment?.program?.status === "archived"
                      ? "expired"
                      : "not available"
                  }. Submissions are closed.`
                : programNotStarted
                  ? "Internship has not started yet. You cannot submit until it begins."
                  : enrollment?.today_task_message ||
                    "Task is not published yet."}
            </div>
          )}

          {submission?.feedback && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
              <p className="font-semibold">Reviewer feedback</p>
              <p className="mt-1 whitespace-pre-wrap">{submission.feedback}</p>
              {submission.marks != null && (
                <p className="mt-2 font-medium">Marks: {submission.marks}</p>
              )}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <FileText className="h-3.5 w-3.5" />
                Task brief
              </div>
              {task.instructions ? (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-950 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-100">
                  <p className="font-semibold">Instructions</p>
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                    {task.instructions}
                  </p>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500 dark:border-slate-700">
                  No extra instructions for this task. Use the description above
                  and submit your deliverable.
                </p>
              )}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  Tips
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                  <li>Add a clear text answer and/or working links.</li>
                  <li>Upload PDF, ZIP, or images when required.</li>
                  <li>You can resubmit if the reviewer asks for changes.</li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 md:px-6">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Submission portal
                  </h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Share at least one of: text answer, link, or file.
                </p>
              </div>

              <div className="space-y-4 p-5 md:p-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Text answer
                  </label>
                  <textarea
                    className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    disabled={!canSubmit}
                    placeholder="Describe your solution or paste notes..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      GitHub URL
                    </label>
                    <Input
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      disabled={!canSubmit}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Drive link
                    </label>
                    <Input
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      disabled={!canSubmit}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      External URL
                    </label>
                    <Input
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      disabled={!canSubmit}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Comments
                    </label>
                    <Input
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      disabled={!canSubmit}
                      placeholder="Anything the reviewer should know"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    File (PDF / ZIP / image)
                  </label>
                  <Input
                    type="file"
                    disabled={!canSubmit}
                    className="cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file && (
                    <p className="text-xs text-slate-500">Selected: {file.name}</p>
                  )}
                </div>

                {canSubmit ? (
                  <Button
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
                    disabled={submitting}
                    onClick={() => void onSubmit()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit for Review"}
                  </Button>
                ) : (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300">
                    {submission
                      ? `Submission is ${submission.status.replace("_", " ")}. Waiting for admin review.`
                      : "Submission is currently unavailable for this task."}
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </StudentBrandPageShell>
    </DashboardLayout>
  );
}
