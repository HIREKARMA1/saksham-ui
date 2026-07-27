/** Types for conversational career + resume coach. */

export interface ResumeContact {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
}

export interface ResumeExperience {
  title?: string;
  company?: string;
  duration?: string;
  bullets?: string[];
}

export interface ResumeEducation {
  degree?: string;
  institution?: string;
  year?: string;
}

export interface ResumeProject {
  name?: string;
  description?: string;
  tech?: string[];
}

export interface ResumeJSON {
  name?: string;
  contact?: ResumeContact;
  target_role?: string;
  summary?: string;
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  skills?: string[];
  projects?: ResumeProject[];
}

export interface ResumeEditorVersionSummary {
  id: string;
  version: number;
  target_role?: string | null;
  change_summary?: string | null;
  is_current: boolean;
  created_at?: string | null;
  pdf_url?: string | null;
  docx_url?: string | null;
}

export interface ResumeEditorMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  meta?: {
    action?: string;
    edit_class?: string;
    clarifying_questions?: string[];
    diff?: Record<string, unknown>;
    version?: number;
  } | null;
  created_at?: string | null;
}

export interface ResumeEditorSession {
  id: string;
  title?: string | null;
  status: string;
  current_version?: ResumeEditorVersionSummary | null;
  pending_pivot?: {
    prompt?: string;
    questions?: string[];
  } | null;
  created_at?: string | null;
}

export interface StartResumeEditorResponse {
  session: ResumeEditorSession;
  resume_json?: ResumeJSON;
  assistant_message?: string;
}

export interface GetResumeEditorSessionResponse {
  session: ResumeEditorSession;
  messages: ResumeEditorMessage[];
  resume_json?: ResumeJSON | null;
}

export interface ChatTurnResponse {
  session_id: string;
  assistant_message: string;
  action: string;
  edit_class?: string | null;
  clarifying_questions?: string[] | null;
  diff?: Record<string, unknown> | null;
  version?: ResumeEditorVersionSummary | null;
  resume_json?: ResumeJSON | null;
}

export interface ChatMessagePayload {
  message: string;
  pivot_answers?: Record<string, string> | null;
}
