export interface DashboardStats {
  total_students?: number;
  total_colleges?: number;
  total_assessments?: number;
  active_users?: number;
  [key: string]: any;
}

export interface CollegeStats {
  total_students: number;
  active_students: number;
  assessments_completed: number;
  average_score: number;
}

export interface StudentStats {
  assessments_completed: number;
  average_score: number;
  ats_score: number;
  job_recommendations: number;
  resume_uploaded: boolean;
}

