"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SqButton } from "@/components/solviq/SqButton";
import { apiClient } from "@/lib/api";

type QueueItem = {
  student_id: string;
  name: string;
  branch?: string;
  readiness_index: number;
  weakest_lever?: string;
  priority: string;
  reasons: string[];
};

export default function InstituteIntelligencePage() {
  const [overview, setOverview] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [ov, fc, cur] = await Promise.all([
        apiClient.getInstituteOverview(true),
        apiClient.getInstituteForecasts(90),
        apiClient.getInstituteCurriculumInsights(),
      ]);
      setOverview(ov);
      setForecast(fc);
      setInsights(cur);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Could not load institute intelligence");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function assign(item: QueueItem) {
    setBusyId(item.student_id);
    setError(null);
    try {
      const action =
        (item.weakest_lever || "").includes("coding")
          ? "coding"
          : (item.weakest_lever || "").includes("interview")
            ? "interview"
            : "mission";
      await apiClient.assignInstituteIntervention({
        student_id: item.student_id,
        title: `Lift: ${item.weakest_lever || "foundations"}`,
        action_type: action,
        reason: item.reasons?.[0] || "TPO intervention",
        competency_key: item.weakest_lever,
        priority: item.priority === "critical" ? "critical" : "high",
      });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Assign failed");
    } finally {
      setBusyId(null);
    }
  }

  const queue: QueueItem[] = overview?.intervention_queue || [];
  const cohort = overview?.cohort || {};

  return (
    <DashboardLayout requiredUserType="college">
      <div className="sq-page mx-auto max-w-4xl space-y-10 pb-16 px-4 sm:px-6">
        <header className="space-y-3 pt-2">
          <p className="sq-label text-[var(--sq-accent)]">Institute Intelligence</p>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="sq-display text-[var(--sq-ink)]"
          >
            {overview?.headline || "Who needs help"}
          </motion.h1>
          <p className="sq-body text-[var(--sq-muted)] max-w-2xl">
            {overview?.narrative ||
              "Intervention queue first — not vanity KPIs."}
          </p>
          <p className="text-sm text-[var(--sq-muted)]">
            {cohort.total_students ?? 0} students · {cohort.at_risk_count ?? 0} at risk · avg
            readiness {cohort.avg_readiness ?? 0}%
          </p>
        </header>

        {loading ? (
          <div className="h-40 animate-pulse rounded-[var(--sq-radius-lg)] bg-[var(--sq-surface-2)]" />
        ) : (
          <>
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--sq-muted)]">
                Intervention queue
              </h2>
              {queue.length === 0 ? (
                <p className="text-sm text-[var(--sq-muted)]">
                  No at-risk students right now. Link students to this college and run Career OS
                  activity to populate the queue.
                </p>
              ) : (
                <ul className="space-y-3">
                  {queue.map((item) => (
                    <li
                      key={item.student_id}
                      className="flex flex-col gap-3 rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-[var(--sq-ink)]">{item.name}</p>
                        <p className="text-xs text-[var(--sq-muted)]">
                          {item.branch || "—"} · readiness {Math.round(item.readiness_index)}% ·{" "}
                          {item.priority}
                        </p>
                        <p className="text-sm text-[var(--sq-muted)]">
                          {(item.reasons || []).slice(0, 2).join(" · ")}
                        </p>
                      </div>
                      <SqButton
                        size="sm"
                        disabled={busyId === item.student_id}
                        onClick={() => void assign(item)}
                      >
                        {busyId === item.student_id ? "Assigning…" : "Assign mission"}
                      </SqButton>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {forecast && (
              <section className="space-y-3 border-t border-[var(--sq-border)] pt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--sq-muted)]">
                  Placement forecast (90d)
                </h2>
                <p className="text-3xl font-semibold tabular-nums text-[var(--sq-ink)] font-[family-name:var(--font-jakarta)]">
                  {Math.round((forecast.predicted_placement_rate || 0) * 100)}%
                  <span className="ml-3 text-sm font-normal text-[var(--sq-muted)]">
                    CI {Math.round((forecast.ci_low || 0) * 100)}–
                    {Math.round((forecast.ci_high || 0) * 100)}%
                  </span>
                </p>
                {(forecast.by_department || []).length > 0 && (
                  <ul className="space-y-2 text-sm">
                    {forecast.by_department.slice(0, 6).map((d: any) => (
                      <li key={d.department} className="flex justify-between gap-4">
                        <span className="text-[var(--sq-ink)]">{d.department}</span>
                        <span className="tabular-nums text-[var(--sq-muted)]">
                          {Math.round((d.predicted_placement_rate || 0) * 100)}% · {d.at_risk} at
                          risk
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {insights?.themes?.length > 0 && (
              <section className="space-y-3 border-t border-[var(--sq-border)] pt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--sq-muted)]">
                  Curriculum insights
                </h2>
                <ul className="space-y-3">
                  {insights.themes.slice(0, 5).map((t: any) => (
                    <li key={t.competency_key} className="text-sm">
                      <p className="font-medium text-[var(--sq-ink)]">{t.insight}</p>
                      <p className="text-[var(--sq-muted)]">
                        Recommend: {t.recommended_action} · {t.affected_students} students
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="text-sm">
              <Link href="/dashboard/college/students" className="text-[var(--sq-accent)] hover:underline">
                Manage roster →
              </Link>
            </p>
          </>
        )}

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
