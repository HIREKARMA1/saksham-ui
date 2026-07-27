"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Map, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CareerOsHome {
  narrative?: string;
  next_action?: {
    readiness_index?: number;
    weakest_lever?: string;
    target_role?: string;
    mission?: {
      id: string;
      title: string;
      description?: string;
      href?: string;
      estimated_minutes?: number;
      mission_type?: string;
    } | null;
  };
  graph?: {
    readiness_index?: number;
    weakest_lever?: string;
    competencies?: Array<{
      key: string;
      label: string;
      score: number;
      confidence: number;
    }>;
  };
  predictions?: Array<{
    company: string;
    role: string;
    offer_probability: number;
    ci_low: number;
    ci_high: number;
  }>;
  passport_count?: number;
}

export interface CareerHomeViewProps {
  studentName: string;
  careerHome?: CareerOsHome | null;
  /** Legacy fallback stats from /students/dashboard */
  stats?: any;
  analytics?: any;
  onCompleteMission?: (missionId: string) => Promise<void> | void;
}

/**
 * Solviq Career Home — one narrative, one next action, living graph signals.
 */
export function CareerHomeView({
  studentName,
  careerHome,
  stats,
  onCompleteMission,
}: CareerHomeViewProps) {
  const mission = careerHome?.next_action?.mission;
  const readiness = Math.round(
    careerHome?.graph?.readiness_index ??
      careerHome?.next_action?.readiness_index ??
      stats?.readiness_index ??
      0,
  );
  const weakest =
    careerHome?.graph?.weakest_lever ||
    careerHome?.next_action?.weakest_lever ||
    stats?.readiness_gaps?.[0]?.area ||
    "foundations";
  const narrative =
    careerHome?.narrative ||
    stats?.next_action?.label ||
    "Set a goal and start today’s mission.";
  const targetRole =
    careerHome?.next_action?.target_role ||
    careerHome?.graph?.target_role ||
    "your target role";
  const primaryHref = mission?.href || "/dashboard/student/internships";
  const comps = (careerHome?.graph?.competencies || [])
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  const preds = (careerHome?.predictions || []).slice(0, 3);

  return (
    <div className="sq-page mx-auto max-w-3xl space-y-10 pb-8">
      <header className="space-y-3">
        <p className="sq-label text-[var(--sq-accent)]">Career Home</p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="sq-display text-[var(--sq-ink)]"
        >
          Hello, {studentName.split(" ")[0]}
        </motion.h1>
        <p className="sq-body text-[var(--sq-muted)] max-w-xl">{narrative}</p>
      </header>

      <section>
        <div
          className={cn(
            "rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)]",
            "bg-[var(--sq-surface)] p-6 sm:p-8",
          )}
        >
          <p className="sq-label text-[var(--sq-accent)]">Today&apos;s mission</p>
          <h2 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-[var(--sq-ink)] font-[family-name:var(--font-jakarta)]">
            {mission?.title || "Generate your Career GPS plan"}
          </h2>
          {mission?.description && (
            <p className="mt-2 text-sm text-[var(--sq-muted)]">{mission.description}</p>
          )}
          <p className="mt-3 text-sm text-[var(--sq-muted)]">
            Becoming <span className="text-[var(--sq-ink)] font-medium">{targetRole}</span>
            {" · "}
            Readiness {readiness}%
            {" · "}
            Weakest lever: {weakest}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={primaryHref}
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-[var(--sq-accent)]",
                "px-5 py-3 text-sm font-semibold text-white",
                "transition-transform hover:translate-x-0.5",
              )}
            >
              Start
              <ArrowRight className="h-4 w-4" />
            </Link>
            {mission?.id && onCompleteMission && (
              <button
                type="button"
                onClick={() => void onCompleteMission(mission.id)}
                className="inline-flex items-center rounded-full border border-[var(--sq-border)] px-5 py-3 text-sm font-medium text-[var(--sq-ink)] hover:bg-[var(--sq-surface-2)]"
              >
                Mark complete
              </button>
            )}
          </div>
        </div>
      </section>

      <section
        aria-label="Career signals"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-y border-[var(--sq-border)] py-8"
      >
        <Signal label="Readiness" value={`${readiness}%`} hint="Living Career Graph" href="/dashboard/student" />
        <Signal
          label="Passport"
          value={careerHome?.passport_count ?? 0}
          hint="Verified artifacts"
          href="/dashboard/student/passport"
        />
        <Signal
          label="Focus"
          value={String(weakest).split(".").pop() || "—"}
          hint="Weakest lever"
          href="/dashboard/student/readiness/coding"
        />
      </section>

      {comps.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-[var(--sq-accent)]" />
            <h3 className="text-sm font-semibold text-[var(--sq-ink)]">Career Graph — lift these next</h3>
          </div>
          <ul className="space-y-3">
            {comps.map((c) => (
              <li key={c.key} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[var(--sq-ink)]">{c.label}</span>
                <span className="tabular-nums text-[var(--sq-muted)]">{Math.round(c.score * 100)}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {preds.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--sq-accent)]" />
            <h3 className="text-sm font-semibold text-[var(--sq-ink)]">Placement probability</h3>
          </div>
          <ul className="space-y-3">
            {preds.map((p) => (
              <li key={`${p.company}-${p.role}`} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[var(--sq-ink)]">
                  {p.company} · {p.role}
                </span>
                <span className="tabular-nums text-[var(--sq-muted)]">
                  {Math.round(p.offer_probability * 100)}%
                  <span className="ml-2 text-xs">
                    ({Math.round(p.ci_low * 100)}–{Math.round(p.ci_high * 100)})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-wrap gap-4 pb-2 text-sm">
        <Link href="/dashboard/student/readiness/coding" className="inline-flex items-center gap-2 font-medium text-[var(--sq-accent)] hover:underline">
          Coding drill
        </Link>
        <Link href="/dashboard/student/readiness/interview" className="inline-flex items-center gap-2 font-medium text-[var(--sq-ink)] hover:text-[var(--sq-accent)]">
          AI interview
        </Link>
        <Link href="/dashboard/student/internships" className="inline-flex items-center gap-2 font-medium text-[var(--sq-accent)] hover:underline">
          <Briefcase className="h-4 w-4" />
          Enter AI Office
        </Link>
        <Link href="/immersive/drive-day" className="inline-flex items-center gap-2 font-medium text-[var(--sq-ink)] hover:text-[var(--sq-accent)]">
          Start Drive Day
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  );
}

function Signal({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-[var(--sq-muted)]">{label}</span>
      <p className="text-2xl font-semibold tabular-nums text-[var(--sq-ink)] font-[family-name:var(--font-jakarta)] group-hover:text-[var(--sq-accent)] transition-colors">
        {value}
      </p>
      <p className="text-xs text-[var(--sq-muted)]">{hint}</p>
    </Link>
  );
}
