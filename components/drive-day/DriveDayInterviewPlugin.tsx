"use client";

import { MockInterviewRoom } from "@/components/interview/MockInterviewRoom";

type Props = {
  session: any;
  onComplete: (result: { overall_score: number; report?: any }) => Promise<void>;
};

export function DriveDayInterviewPlugin({ session, onComplete }: Props) {
  const persona = session?.template?.interview_persona || session?.current_round?.persona || {};
  const resume = session?.active_resume;
  const parse = resume?.canonical_parse || {};
  const name = parse?.personal_info?.name || "Candidate";
  const skills = (() => {
    const s = parse?.skills || {};
    if (Array.isArray(s)) return s.join(", ");
    return [...(s.technical || []), ...(s.tools || [])].slice(0, 12).join(", ");
  })();
  const projects = (parse?.projects || [])
    .slice(0, 3)
    .map((p: any) => p.name || p.title)
    .filter(Boolean)
    .join("; ");

  const targetRole =
    resume?.target_role_id?.replace(/_/g, " ") ||
    session?.context?.target_role_id?.replace(/_/g, " ") ||
    "Software Engineer";

  const jobDescription = [
    `Interview grounded in locked resume for ${name}.`,
    skills ? `Skills on resume: ${skills}.` : "",
    projects ? `Projects: ${projects}.` : "",
    "Ask only about experience present on the resume. Do not invent employers or skills.",
  ]
    .filter(Boolean)
    .join(" ");

  const personaType =
    persona.persona_type === "hr" || persona.persona_type === "culture_fit"
      ? persona.persona_type
      : "technical";

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3">
      <div>
        <h2 className="text-lg font-bold">Technical Interview</h2>
        <p className="text-xs text-slate-500">
          {persona.name || "Interviewer"} · {persona.title || "TCS"} · Resume-grounded
          {!resume && " (lock a resume in Resume Agent for best grounding)"}
        </p>
      </div>
      <MockInterviewRoom
        persona={personaType}
        personaName={persona.name}
        personaTitle={persona.title}
        targetRole={targetRole}
        company={persona.company || session?.template?.company || "TCS"}
        jobDescription={jobDescription}
        maxTurns={Number(session?.current_round?.max_turns || persona.max_turns || 6)}
        onComplete={async (result) => {
          await onComplete({
            overall_score: result.overall_score,
            report: result.report,
          });
        }}
      />
    </div>
  );
}
