"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StudentBrandPageShell } from "@/components/dashboard/StudentBrandPageShell";
import { Office3DExperienceDynamic } from "@/components/office/Office3DExperienceLazy";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { Box, LayoutList } from "lucide-react";

export default function InternshipRunPage() {
  const params = useParams();
  const runId = String(params?.id || "");
  const { user } = useAuth();
  const [run, setRun] = useState<any>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [msgDrafts, setMsgDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"feel" | "work">("feel");
  const [avatarGender, setAvatarGender] = useState<"male" | "female" | null>(null);

  useEffect(() => {
    const g = (user as { gender?: string } | null)?.gender;
    if (g === "male" || g === "female") setAvatarGender(g);
  }, [user]);

  const refresh = useCallback(async () => {
    const data = await apiClient.getInternshipRun(runId);
    setRun(data);
  }, [runId]);

  useEffect(() => {
    if (!runId) return;
    void refresh().catch((e) => setError(e?.message || "Failed to load run"));
  }, [runId, refresh]);

  const submitTask = async (taskId: string) => {
    setBusy(true);
    setError(null);
    try {
      await apiClient.submitInternshipTask(runId, taskId, drafts[taskId] || "Submitted work");
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async (threadId: string) => {
    const body = msgDrafts[threadId];
    if (!body?.trim()) return;
    setBusy(true);
    try {
      await apiClient.postOfficeMessage(runId, threadId, body);
      setMsgDrafts((d) => ({ ...d, [threadId]: "" }));
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Message failed");
    } finally {
      setBusy(false);
    }
  };

  const complete = async () => {
    setBusy(true);
    try {
      const res = await apiClient.completeInternship(runId);
      setRun(res.run);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Complete failed");
    } finally {
      setBusy(false);
    }
  };

  if (!run) {
    return (
      <DashboardLayout requiredUserType="student">
        <StudentBrandPageShell>
          <div className="mx-auto max-w-3xl animate-pulse space-y-4 py-10">
            <div className="h-8 w-64 rounded bg-[var(--sq-surface-2)]" />
            <div className="h-40 rounded-[var(--sq-radius-lg)] bg-[var(--sq-surface-2)]" />
          </div>
        </StudentBrandPageShell>
      </DashboardLayout>
    );
  }

  const company = run.company_snapshot?.company || "Company";
  const studentName = user?.name || "You";
  const studentGender = avatarGender || (user as { gender?: string } | null)?.gender || null;

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        <div className="sq-page mx-auto max-w-5xl space-y-6">
          <header className="space-y-2">
            <p className="sq-label text-[var(--sq-accent)]">AI Office · Day {run.current_day}</p>
            <h1 className="sq-display text-[var(--sq-ink)]">{company}</h1>
            <p className="text-sm text-[var(--sq-muted)]">
              Status: {run.status}
              {run.certificate_id ? " · Certificate minted" : ""}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard/student/internships" className="text-sm text-[var(--sq-accent)] hover:underline">
                All internships
              </Link>
              <div className="inline-flex rounded-full border border-[var(--sq-border)] bg-[var(--sq-surface)] p-1">
                <button
                  type="button"
                  onClick={() => setView("feel")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    view === "feel" ? "bg-teal-700 text-white" : "text-[var(--sq-muted)]"
                  }`}
                >
                  <Box className="h-3.5 w-3.5" />
                  Feel 3D office
                </button>
                <button
                  type="button"
                  onClick={() => setView("work")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    view === "work" ? "bg-teal-700 text-white" : "text-[var(--sq-muted)]"
                  }`}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  Workspace
                </button>
              </div>
              {view === "feel" && (
                <div className="inline-flex rounded-full border border-[var(--sq-border)] bg-[var(--sq-surface)] p-1">
                  <button
                    type="button"
                    onClick={() => setAvatarGender("male")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      studentGender === "male" ? "bg-slate-800 text-white" : "text-[var(--sq-muted)]"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarGender("female")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      studentGender === "female" ? "bg-slate-800 text-white" : "text-[var(--sq-muted)]"
                    }`}
                  >
                    Female
                  </button>
                </div>
              )}
            </div>
          </header>

          {error && <p className="text-sm text-[var(--sq-danger)]">{error}</p>}

          {view === "feel" ? (
            <Office3DExperienceDynamic
              company={company}
              mode="immersive"
              height="min-h-[420px] h-[62vh]"
              studentName={studentName}
              studentGender={studentGender}
              onEnterWork={() => setView("work")}
            />
          ) : (
            <div className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--sq-muted)]">
                  Inbox & channels
                </h2>
                {(run.threads || []).map((t: any) => (
                  <article
                    key={t.id}
                    className="rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-[var(--sq-ink)]">{t.title}</h3>
                      <span className="text-xs uppercase text-[var(--sq-muted)]">{t.channel}</span>
                    </div>
                    <ul className="space-y-2">
                      {(t.messages || []).map((m: any) => (
                        <li key={m.id} className="text-sm">
                          <span className="font-medium text-[var(--sq-ink)]">{m.sender}: </span>
                          <span className="text-[var(--sq-muted)]">{m.body}</span>
                        </li>
                      ))}
                    </ul>
                    {run.status === "active" && (
                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded-lg border border-[var(--sq-border)] bg-[var(--sq-bg)] px-3 py-2 text-sm"
                          placeholder="Reply…"
                          value={msgDrafts[t.id] || ""}
                          onChange={(e) => setMsgDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                        />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void sendMessage(t.id)}
                          className="rounded-full bg-[var(--sq-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </section>

              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--sq-muted)]">Tasks</h2>
                {(run.tasks || []).map((task: any) => (
                  <article
                    key={task.id}
                    className="rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-[var(--sq-ink)]">{task.title}</h3>
                      <span className="text-xs text-[var(--sq-muted)]">{task.status}</span>
                    </div>
                    <p className="text-sm text-[var(--sq-muted)]">{task.description}</p>
                    {task.review && (
                      <p className="text-sm text-[var(--sq-success)]">
                        Review ({task.review.rating}/5): {task.review.summary}
                      </p>
                    )}
                    {task.status === "open" && (
                      <div className="space-y-2">
                        <textarea
                          className="w-full min-h-[88px] rounded-lg border border-[var(--sq-border)] bg-[var(--sq-bg)] px-3 py-2 text-sm"
                          placeholder="Your submission…"
                          value={drafts[task.id] || ""}
                          onChange={(e) => setDrafts((d) => ({ ...d, [task.id]: e.target.value }))}
                        />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void submitTask(task.id)}
                          className="rounded-full bg-[var(--sq-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          Submit for review
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </section>

              {run.status === "active" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void complete()}
                  className="rounded-full border border-[var(--sq-border)] px-5 py-3 text-sm font-semibold text-[var(--sq-ink)] hover:bg-[var(--sq-surface-2)]"
                >
                  Complete internship & mint certificate
                </button>
              )}
            </div>
          )}
        </div>
      </StudentBrandPageShell>
    </DashboardLayout>
  );
}
