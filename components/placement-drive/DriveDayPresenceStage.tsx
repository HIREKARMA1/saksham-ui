'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, IdCard, Shield } from 'lucide-react';

export type PresenceKind = 'reporting' | 'transition' | 'results_reveal';

type Props = {
  kind: PresenceKind;
  title: string;
  company?: string | null;
  seatId?: string;
  stageConfig?: Record<string, unknown> | null;
  immersion?: {
    branding?: { company_pattern_name?: string; hall_label?: string };
    interviewer_persona_name?: string;
    exit_warning?: string;
  } | null;
  /** Scored-round results for results_reveal */
  attempt?: {
    verdict?: string;
    combined_score?: number;
    readiness_score?: number;
    report?: { summary?: string; stage_breakdown?: Array<{ title?: string; score?: number; passed?: boolean; stage_type?: string }> };
    template?: { company?: string; title?: string };
  } | null;
  onContinue: () => void | Promise<void>;
  continuing?: boolean;
};

const PRESENCE_SKIP = new Set(['reporting', 'transition', 'results_reveal']);

export function DriveDayPresenceStage({
  kind,
  title,
  company,
  seatId,
  stageConfig,
  immersion,
  attempt,
  onContinue,
  continuing,
}: Props) {
  const config = stageConfig || {};
  const autoSeconds = Number(config.auto_advance_seconds || (kind === 'transition' ? 6 : 0));
  const [secondsLeft, setSecondsLeft] = useState(autoSeconds);
  const skipAllowed = config.skip_allowed === true; // reporting must stay false

  useEffect(() => {
    if (kind !== 'transition' || autoSeconds <= 0) return;
    setSecondsLeft(autoSeconds);
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tick);
          void onContinue();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
    // intentionally re-run only when stage changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, autoSeconds, title]);

  const scoredBreakdown = useMemo(() => {
    const rows =
      attempt?.report?.stage_breakdown ||
      (attempt as { stage_results?: Array<{ title?: string; score?: number; passed?: boolean; stage_type?: string }> })
        ?.stage_results ||
      [];
    return rows.filter((r) => !PRESENCE_SKIP.has(String(r.stage_type || '')));
  }, [attempt]);

  const previewCombined = useMemo(() => {
    if (attempt?.combined_score != null) return attempt.combined_score;
    if (!scoredBreakdown.length) return null;
    const sum = scoredBreakdown.reduce((acc, s) => acc + Number(s.score || 0), 0);
    return Math.round((sum / scoredBreakdown.length) * 10) / 10;
  }, [attempt?.combined_score, scoredBreakdown]);

  if (kind === 'reporting') {
    const batch = String(config.batch_label || 'Batch 2027');
    const briefing = String(
      config.briefing ||
        immersion?.exit_warning ||
        'Timed rounds cannot be paused. Stay in fullscreen — this mirrors a real online assessment.',
    );
    const pattern = immersion?.branding?.company_pattern_name || company || 'Campus Drive';

    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 py-10 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">
          Reporting desk
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Reporting for {pattern} Mock Drive
        </h1>
        <p className="mt-2 text-sky-100/80">{batch}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-lg">
            <IdCard className="h-5 w-5 text-sky-300" />
            {seatId || 'ASSIGNING…'}
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <Shield className="h-4 w-4" />
            Proctor active — no pause on timed rounds
          </div>
        </div>

        <p className="mt-8 max-w-xl text-sm leading-relaxed text-slate-200">{briefing}</p>
        <p className="mt-2 text-xs text-slate-400">{title}</p>

        <Button
          size="lg"
          className="mt-10 gap-2 rounded-xl bg-sky-500 text-white hover:bg-sky-400"
          disabled={continuing}
          onClick={() => void onContinue()}
        >
          Enter Aptitude Hall
          <ArrowRight className="h-4 w-4" />
        </Button>
        {skipAllowed ? null : (
          <p className="mt-3 text-xs text-slate-500">Reporting cannot be skipped.</p>
        )}
      </div>
    );
  }

  if (kind === 'transition') {
    const headline = String(config.headline || title);
    const body = String(config.body || 'Moving to the next round.');
    const tone = String(config.tone || 'neutral');
    const toneClass =
      tone === 'shortlist'
        ? 'from-emerald-900 via-slate-900 to-slate-950'
        : tone === 'complete'
          ? 'from-indigo-950 via-slate-900 to-slate-950'
          : 'from-slate-900 via-slate-850 to-slate-950';

    return (
      <div className={`flex min-h-full flex-col items-center justify-center bg-gradient-to-br ${toneClass} px-6 py-12 text-center text-white`}>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Transition</p>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">{headline}</h1>
        <p className="mt-4 max-w-lg text-base text-slate-300">{body}</p>
        {autoSeconds > 0 && (
          <p className="mt-8 text-sm text-white/40">Continuing in {secondsLeft}s…</p>
        )}
        <Button
          variant="secondary"
          className="mt-6 gap-2 rounded-xl"
          disabled={continuing}
          onClick={() => void onContinue()}
        >
          Continue now
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // results_reveal
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-10 dark:from-slate-950 dark:to-slate-900">
      <CheckCircle2 className="h-14 w-14 text-emerald-600" />
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Results Reveal</h1>
      <p className="mt-2 max-w-lg text-center text-slate-600 dark:text-slate-300">
        {attempt?.report?.summary ||
          `What this would mean at a real ${attempt?.template?.company || company || 'campus'} drive.`}
      </p>

      <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 p-4 text-center dark:border-slate-700">
          <p className="text-xs uppercase text-slate-500">Verdict</p>
          <p className="text-xl font-bold">{attempt?.verdict || '—'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4 text-center dark:border-slate-700">
          <p className="text-xs uppercase text-slate-500">Combined</p>
          <p className="text-xl font-bold">{previewCombined ?? '—'}%</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-slate-200 p-4 text-center dark:border-slate-700">
          <p className="text-xs uppercase text-slate-500">Readiness delta</p>
          <p className="text-xl font-bold">{attempt?.readiness_score ?? '—'}%</p>
        </div>
      </div>

      <div className="mt-6 w-full max-w-md space-y-2">
        {scoredBreakdown.map((s, i) => (
          <div
            key={`${s.title}-${i}`}
            className="flex justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
          >
            <span>{s.title}</span>
            <span>
              {s.score}% {s.passed ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        className="mt-8 gap-2 rounded-xl"
        disabled={continuing}
        onClick={() => void onContinue()}
      >
        Finish Drive Day
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
