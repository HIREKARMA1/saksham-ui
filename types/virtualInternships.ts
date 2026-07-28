/** Types for Virtual Internship Module (POC). */

export type VIReferenceLink = {
  label: string;
  url: string;
};

export type VIProgram = {
  id: string;
  title: string;
  description?: string | null;
  overview?: string | null;
  project_details?: string | null;
  reference_links?: VIReferenceLink[] | null;
  category?: string | null;
  technology?: string | null;
  difficulty: string;
  duration_days: number;
  daily_commitment_hours?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  starts_at?: string | null;
  has_started?: boolean;
  enrollment_limit?: number | null;
  banner_url?: string | null;
  thumbnail_url?: string | null;
  skills?: string[];
  learning_outcomes?: string[];
  prerequisites?: string[];
  instructor_name?: string | null;
  certificate_enabled: boolean;
  certificate_min_score?: number;
  certificate_min_completion_pct?: number;
  status: string;
  enrolled_count: number;
  seats_left?: number | null;
  task_count: number;
  tasks?: VITask[];
};

export type VITask = {
  id: string;
  program_id: string;
  day_number: number;
  title: string;
  description?: string | null;
  instructions?: string | null;
  task_type: string;
  resources?: Record<string, unknown> | null;
  deadline_type: string;
  deadline_days?: number | null;
  due_date?: string | null;
  points: number;
  is_mandatory: boolean;
  unlock_after_previous: boolean;
  late_submission_allowed: boolean;
  is_published?: boolean;
  published_at?: string | null;
};

export type VIProgress = {
  total_tasks: number;
  completed: number;
  pending: number;
  late: number;
  missed: number;
  completion_percentage: number;
  total_score: number;
  current_day: number;
  duration_days: number;
};

export type VISubmission = {
  id: string;
  enrollment_id: string;
  task_id: string;
  student_id: string;
  text_answer?: string | null;
  github_url?: string | null;
  drive_url?: string | null;
  external_url?: string | null;
  artifact_url?: string | null;
  has_artifact?: boolean;
  artifact_filename?: string | null;
  comments?: string | null;
  status: string;
  marks?: number | null;
  feedback?: string | null;
  submitted_at?: string | null;
  is_late?: boolean;
  task_title?: string | null;
  day_number?: number | null;
  student_name?: string | null;
  program_title?: string | null;
};

export type VICertificateStatus = {
  enabled: boolean;
  eligible: boolean;
  issued: boolean;
  min_score: number;
  min_completion_pct: number;
  student_score: number;
  student_completion_pct: number;
  certificate_url?: string | null;
  issued_at?: string | null;
  internship_title?: string | null;
  designation?: string | null;
  student_name?: string | null;
};

export type VICertificateItem = {
  enrollment_id: string;
  program_id: string;
  internship_title?: string | null;
  designation?: string | null;
  student_name?: string | null;
  eligible: boolean;
  issued: boolean;
  certificate_url?: string | null;
  issued_at?: string | null;
  student_score: number;
  student_completion_pct: number;
  min_score: number;
  min_completion_pct: number;
  status: string;
};

export type VIEnrollment = {
  id: string;
  program_id: string;
  student_id: string;
  current_day: number;
  completion_percentage: number;
  total_score: number;
  status: string;
  enrolled_at?: string | null;
  program_started?: boolean;
  today_task_available?: boolean;
  today_task_message?: string | null;
  program?: VIProgram | null;
  progress?: VIProgress | null;
  today_task?: VITask | null;
  latest_submission?: VISubmission | null;
  certificate?: VICertificateStatus | null;
};
