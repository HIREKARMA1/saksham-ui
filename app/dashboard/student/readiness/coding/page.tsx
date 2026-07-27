"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StudentBrandPageShell } from "@/components/dashboard/StudentBrandPageShell";
import { SqButton } from "@/components/solviq/SqButton";
import { apiClient } from "@/lib/api";

type Problem = {
  slug: string;
  title: string;
  difficulty: string;
  statement: string;
  starter: string;
};

type SubmitResult = {
  attempt_id: string;
  tests_passed: number;
  tests_total: number;
  score: number;
  feedback?: { tests?: any; ai?: { summary?: string; improvements?: string[]; bugs?: string[] } };
  readiness_index?: number;
  coach?: { headline?: string; feedback?: string };
};

export default function CodingReadinessPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [slug, setSlug] = useState("two_sum");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const selected = useMemo(
    () => problems.find((p) => p.slug === slug) || problems[0],
    [problems, slug],
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiClient.getCodingProblems();
        const list: Problem[] = res.problems || [];
        setProblems(list);
        if (list[0]) {
          setSlug(list[0].slug);
          setCode(list[0].starter);
        }
      } catch (e: any) {
        setError(e?.response?.data?.detail || "Could not load problems");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selected) {
      setCode(selected.starter);
      setResult(null);
      setError(null);
    }
  }, [selected?.slug]);

  async function onSubmit() {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.submitCodingAttempt({
        problem_slug: selected.slug,
        source_code: code,
        language: "python",
        use_ai: true,
      });
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        <div className="sq-page mx-auto max-w-3xl space-y-8">
          <header className="space-y-2">
            <p className="sq-label text-[var(--sq-accent)]">Placement Readiness</p>
            <h1 className="sq-display text-[var(--sq-ink)]">Coding drill</h1>
            <p className="sq-body text-[var(--sq-muted)]">
              Solve a problem. Real tests run. Your Career Graph updates.
            </p>
            <p className="text-sm">
              <Link
                href="/dashboard/student/readiness/interview"
                className="text-[var(--sq-accent)] hover:underline"
              >
                Switch to AI interview →
              </Link>
            </p>
          </header>

          {loading ? (
            <div className="h-40 animate-pulse rounded-[var(--sq-radius-lg)] bg-[var(--sq-surface-2)]" />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {problems.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setSlug(p.slug)}
                    className={
                      p.slug === slug
                        ? "rounded-full bg-[var(--sq-accent)] px-4 py-2 text-xs font-semibold text-white"
                        : "rounded-full border border-[var(--sq-border)] px-4 py-2 text-xs font-medium text-[var(--sq-ink)] hover:bg-[var(--sq-surface-2)]"
                    }
                  >
                    {p.title}
                    <span className="ml-2 opacity-70">{p.difficulty}</span>
                  </button>
                ))}
              </div>

              {selected && (
                <section className="space-y-4">
                  <p className="text-sm text-[var(--sq-muted)] whitespace-pre-wrap">
                    {selected.statement}
                  </p>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    rows={14}
                    className="w-full rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] p-4 font-mono text-sm text-[var(--sq-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--sq-accent)]"
                  />
                  <SqButton onClick={() => void onSubmit()} disabled={submitting}>
                    {submitting ? "Judging…" : "Submit"}
                  </SqButton>
                </section>
              )}
            </>
          )}

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {result && (
            <section className="space-y-3 rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] p-5">
              <p className="sq-label text-[var(--sq-accent)]">Result</p>
              <p className="text-lg font-semibold text-[var(--sq-ink)]">
                {result.tests_passed}/{result.tests_total} tests · score{" "}
                {Math.round((result.score || 0) * 100)}%
              </p>
              {result.readiness_index != null && (
                <p className="text-sm text-[var(--sq-muted)]">
                  Readiness now {Math.round(result.readiness_index * 100)}%
                </p>
              )}
              {result.feedback?.ai?.summary && (
                <p className="text-sm text-[var(--sq-ink)]">{result.feedback.ai.summary}</p>
              )}
              {result.coach?.headline && (
                <p className="text-sm text-[var(--sq-muted)]">
                  Coach: {result.coach.headline}
                  {result.coach.feedback ? ` — ${result.coach.feedback}` : ""}
                </p>
              )}
            </section>
          )}
        </div>
      </StudentBrandPageShell>
    </DashboardLayout>
  );
}
