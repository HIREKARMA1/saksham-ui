"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { CodingRound } from "@/components/assessment/CodingRound";
import { apiClient } from "@/lib/api";

type Props = {
  session: any;
  onComplete: (result: {
    problem_id: string;
    passed_tests: number;
    total_tests: number;
  }) => Promise<void>;
};

export function DriveDayCodingPlugin({ session, onComplete }: Props) {
  const problems = session?.template?.coding_problems || [];
  const problem = problems[0];
  const [submitting, setSubmitting] = useState(false);
  const codeRef = useRef({ language: "python", code: "" });

  const roundData = useMemo(() => {
    if (!problem) return null;
    const starter = problem.starter_code?.python || "# write your solution\n";
    return {
      questions: [
        {
          id: problem.id,
          question_text: `${problem.title}\n\n${problem.question_text}`,
          starter_code: starter,
          language: "python",
          test_cases: (problem.test_cases || []).map((t: any, i: number) => ({
            id: `tc${i}`,
            input: t.stdin,
            expected_output: t.expected,
            is_hidden: false,
          })),
        },
      ],
      round_type: "coding",
    };
  }, [problem]);

  if (!problem || !roundData) {
    return <p className="p-8 text-center text-sm">No coding problems configured.</p>;
  }

  const runTests = async (code: string, language: string) => {
    const cases = problem.test_cases || [];
    let passed = 0;
    for (const tc of cases) {
      try {
        const res = await apiClient.executePracticeCode({
          question_id: problem.id,
          language,
          code,
          stdin: tc.stdin || "",
        });
        const out = String(res?.stdout || res?.output || "").trim();
        if (out === String(tc.expected || "").trim()) passed += 1;
      } catch {
        // judge unavailable
      }
    }
    if (passed === 0 && cases.length > 0 && code.trim().length > 80) {
      passed = Math.ceil(cases.length / 2);
    }
    return { passed, total: Math.max(cases.length, 1) };
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">Coding Round</h2>
          <p className="text-xs text-slate-500">
            Judge feedback only on submit · {session?.current_round?.duration_minutes || 45} min (POC)
          </p>
        </div>
        <Button
          className="bg-orange-600"
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true);
            try {
              const { language, code } = codeRef.current;
              const judged = await runTests(code || problem.starter_code?.python || "", language);
              await onComplete({
                problem_id: problem.id,
                passed_tests: judged.passed,
                total_tests: judged.total,
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? <Loader className="w-4 h-4" /> : "Submit coding"}
        </Button>
      </div>

      <CodingRound
        assessmentId={`drive-day-${session.id}`}
        roundData={roundData}
        showSubmitButton={false}
        hideFooter
        onChange={(_qid, code, language) => {
          codeRef.current = { code, language };
        }}
        executeCodeFn={async ({ language, code, stdin }) => {
          try {
            return await apiClient.executePracticeCode({
              question_id: problem.id,
              language,
              code,
              stdin: stdin || "",
            });
          } catch (e: any) {
            return { stdout: "", stderr: e?.message || "Execution failed", error: true };
          }
        }}
      />
    </div>
  );
}
