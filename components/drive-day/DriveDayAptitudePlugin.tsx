"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";

type Props = {
  session: any;
  onSubmit: (answers: Record<string, number>) => Promise<void>;
};

export function DriveDayAptitudePlugin({ session, onSubmit }: Props) {
  const bank = session?.template?.aptitude_bank || [];
  const minutes = Number(session?.current_round?.duration_minutes || 30);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [idx, setIdx] = useState(0);
  const [seconds, setSeconds] = useState(minutes * 60);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (seconds === 0 && !submitting) {
      void handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const q = bank[idx];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const sections = useMemo(() => {
    const s = new Set<string>();
    bank.forEach((x: any) => s.add(x.section));
    return Array.from(s);
  }, [bank]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(answers);
    } finally {
      setSubmitting(false);
    }
  };

  if (!q) {
    return <p className="p-8 text-center text-sm text-slate-500">No aptitude questions configured.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">Aptitude Round</h2>
          <p className="text-xs text-slate-500">
            Negative marking {session?.current_round?.negative_marking ?? 0.25} · Sections:{" "}
            {sections.join(", ")}
          </p>
        </div>
        <Badge className={`text-sm ${seconds < 60 ? "bg-red-600" : "bg-slate-800"}`}>
          {mm}:{ss}
        </Badge>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <div className="flex justify-between text-xs text-slate-500">
          <span>
            Q{idx + 1} / {bank.length}
          </span>
          <Badge variant="outline">{q.section}</Badge>
        </div>
        <p className="font-medium text-slate-900 dark:text-white">{q.stem}</p>
        <div className="space-y-2">
          {(q.options || []).map((opt: string, i: number) => (
            <button
              key={i}
              type="button"
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
              className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition ${
                answers[q.id] === i
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                  : "border-slate-200 dark:border-slate-700 hover:border-orange-300"
              }`}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <Button variant="outline" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>
          Previous
        </Button>
        {idx < bank.length - 1 ? (
          <Button onClick={() => setIdx((i) => i + 1)}>Next</Button>
        ) : (
          <Button onClick={() => void handleSubmit()} disabled={submitting} className="bg-orange-600">
            {submitting ? <Loader className="w-4 h-4" /> : "Submit aptitude"}
          </Button>
        )}
      </div>
    </div>
  );
}
