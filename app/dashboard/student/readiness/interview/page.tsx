"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StudentBrandPageShell } from "@/components/dashboard/StudentBrandPageShell";
import { SqButton } from "@/components/solviq/SqButton";
import { apiClient } from "@/lib/api";

type Turn = { role: string; content: string };

type Session = {
  id: string;
  target_role: string;
  interview_type: string;
  status: string;
  turns: Turn[];
  score?: number | null;
  feedback?: { summary?: string; strengths?: string[]; weaknesses?: string[] } | null;
  latest?: { interviewer_message?: string; follow_up_hint?: string };
  coach?: { headline?: string; feedback?: string };
  readiness_index?: number;
};

export default function InterviewReadinessPage() {
  const [role, setRole] = useState("Software Engineer");
  const [interviewType, setInterviewType] = useState("technical");
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const turns = useMemo(() => session?.turns || [], [session]);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiClient.startInterviewPractice({
        target_role: role,
        interview_type: interviewType,
      });
      setSession(res);
      setMessage("");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Could not start interview");
    } finally {
      setBusy(false);
    }
  }

  async function sendTurn() {
    if (!session?.id || !message.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiClient.interviewPracticeTurn(session.id, message.trim());
      setSession(res);
      setMessage("");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Turn failed");
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    if (!session?.id) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiClient.completeInterviewPractice(session.id);
      setSession(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Complete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        <div className="sq-page mx-auto max-w-3xl space-y-8">
          <header className="space-y-2">
            <p className="sq-label text-[var(--sq-accent)]">Placement Readiness</p>
            <h1 className="sq-display text-[var(--sq-ink)]">AI interview</h1>
            <p className="sq-body text-[var(--sq-muted)]">
              Practice under pressure. Feedback writes into your Career Graph.
            </p>
            <p className="text-sm">
              <Link
                href="/dashboard/student/readiness/coding"
                className="text-[var(--sq-accent)] hover:underline"
              >
                Switch to coding drill →
              </Link>
            </p>
          </header>

          {!session && (
            <section className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-[var(--sq-muted)]">
                  Target role
                </span>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] px-4 py-3 text-sm text-[var(--sq-ink)]"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-[var(--sq-muted)]">
                  Interview type
                </span>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] px-4 py-3 text-sm text-[var(--sq-ink)]"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="hr">HR</option>
                </select>
              </label>
              <SqButton onClick={() => void start()} disabled={busy || role.trim().length < 2}>
                {busy ? "Starting…" : "Begin interview"}
              </SqButton>
            </section>
          )}

          {session && (
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--sq-muted)]">
                <span>
                  {session.target_role} · {session.interview_type}
                </span>
                <span className="uppercase tracking-wide">{session.status}</span>
              </div>

              <ul className="space-y-3">
                {turns.map((t, i) => (
                  <li
                    key={`${t.role}-${i}`}
                    className={
                      t.role === "student"
                        ? "ml-6 rounded-[var(--sq-radius-lg)] bg-[var(--sq-accent)]/10 px-4 py-3 text-sm text-[var(--sq-ink)]"
                        : "mr-6 rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] px-4 py-3 text-sm text-[var(--sq-ink)]"
                    }
                  >
                    <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--sq-muted)]">
                      {t.role}
                    </p>
                    {t.content}
                  </li>
                ))}
              </ul>

              {session.status === "active" && (
                <div className="space-y-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Your answer…"
                    className="w-full rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] p-4 text-sm text-[var(--sq-ink)]"
                  />
                  <div className="flex flex-wrap gap-3">
                    <SqButton onClick={() => void sendTurn()} disabled={busy || message.trim().length < 2}>
                      {busy ? "Thinking…" : "Send answer"}
                    </SqButton>
                    <SqButton variant="secondary" onClick={() => void complete()} disabled={busy}>
                      End & score
                    </SqButton>
                  </div>
                  {session.latest?.follow_up_hint && (
                    <p className="text-xs text-[var(--sq-muted)]">
                      Hint: {session.latest.follow_up_hint}
                    </p>
                  )}
                </div>
              )}

              {session.status === "completed" && (
                <div className="space-y-2 rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] p-5">
                  <p className="sq-label text-[var(--sq-accent)]">Debrief</p>
                  <p className="text-lg font-semibold text-[var(--sq-ink)]">
                    Score {Math.round((session.score || 0) * 100)}%
                  </p>
                  {session.feedback?.summary && (
                    <p className="text-sm text-[var(--sq-ink)]">{session.feedback.summary}</p>
                  )}
                  {session.coach?.headline && (
                    <p className="text-sm text-[var(--sq-muted)]">
                      Coach: {session.coach.headline}
                    </p>
                  )}
                  <SqButton
                    variant="secondary"
                    onClick={() => {
                      setSession(null);
                      setMessage("");
                    }}
                  >
                    Practice again
                  </SqButton>
                </div>
              )}
            </section>
          )}

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </StudentBrandPageShell>
    </DashboardLayout>
  );
}
