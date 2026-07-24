export const EMBEDDED_EXAM_STAGE_TYPES = [
  'coding',
  'mock_interview',
  'playground',
  'short_answer',
  'essay',
  'prompt_engineering',
  'case_study',
  'finance',
  'presence',
] as const;

export function isEmbeddedExamStage(runnerType?: string): boolean {
  return EMBEDDED_EXAM_STAGE_TYPES.includes(runnerType as (typeof EMBEDDED_EXAM_STAGE_TYPES)[number]);
}

export function isPresenceRunner(runner?: { type?: string; presence_kind?: string }): boolean {
  return runner?.type === 'presence';
}
