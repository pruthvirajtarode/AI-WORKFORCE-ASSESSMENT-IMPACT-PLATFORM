// ============================================================
// SUROJ × BE10X – Core Domain Types
// ============================================================

// ─── Enums ────────────────────────────────────────────────
export type UserRole = 'admin' | 'employee';
export type AssessmentPhase = 'pre' | 'post';
export type QuestionPhase = AssessmentPhase | 'both';

/**
 * in_progress – employee is answering
 * submitted   – submitted, one or more subjective answers awaiting evaluation
 * evaluated   – all answers scored; score is final
 */
export type SubmissionStatus = 'in_progress' | 'submitted' | 'evaluated';

export type EvaluationStatus = 'pending' | 'auto_scored' | 'manually_scored' | 'unanswered';
export type EvaluationMethod = 'auto' | 'manual' | 'ai_assisted';

export type QuestionType =
  | 'mcq'
  | 'multiple_select'
  | 'short_answer'
  | 'long_answer'
  | 'scenario'
  | 'prompt_writing'
  | 'document_analysis'
  | 'data_analysis'
  | 'output_evaluation'
  | 'workflow_design';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type AIReadinessLevel =
  | 'needs_development'
  | 'developing'
  | 'operational'
  | 'advanced'
  | 'ai_leader';

export type CompetencyKey =
  | 'ai_fundamentals'
  | 'generative_ai'
  | 'prompt_engineering'
  | 'claude_usage'
  | 'document_analysis'
  | 'data_analysis'
  | 'department_application'
  | 'critical_verification'
  | 'workflow_design'
  | 'productivity_automation';

/** @deprecated alias kept for readability in older modules */
export type CompetencyCategory = CompetencyKey;

// ─── Database Entities ────────────────────────────────────
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string | null;
  /** Role / designation, e.g. "Senior Manager – Tendering" */
  role: string;
  department_id: string;
  status: 'active' | 'inactive';
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  employee_id: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Competency {
  id: CompetencyKey;
  name: string;
  description: string;
  weight: number;
  is_active: boolean;
  created_at: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  department_id: string | null; // null = common question for all departments
  question_type: QuestionType;
  competency: CompetencyKey;
  difficulty: Difficulty;
  question_text: string;
  scenario_text: string | null;
  max_marks: number;
  options: QuestionOption[] | null;
  /** Option ids. MCQ has exactly one; multiple-select has one or more. Null for subjective. */
  correct_answer: string[] | null;
  rubric: string | null;
  explanation: string | null;
  assessment_phase: QuestionPhase;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

/** Question as delivered to an employee — never includes answer keys or rubrics. */
export interface DeliveredQuestion {
  id: string;
  question_type: QuestionType;
  competency: CompetencyKey;
  difficulty: Difficulty;
  question_text: string;
  scenario_text: string | null;
  options: QuestionOption[] | null;
  marks: number;
  sequence: number;
}

/** Shape used by static question-bank source files. Normalised before use. */
export interface SeedQuestion {
  id: string;
  department_id: string | null;
  question_type: QuestionType;
  competency: CompetencyKey;
  difficulty: Difficulty;
  question_text: string;
  scenario_text?: string;
  max_marks: number;
  options?: QuestionOption[];
  correct_answer?: string | string[];
  rubric?: string;
  explanation?: string;
  assessment_phase: QuestionPhase;
}

export interface AssessmentBlueprint {
  /** Share of questions (percent, sums to 100) per competency */
  competency_weights: Record<CompetencyKey, number>;
  /** Minimum share (0–1) of department-specific questions */
  min_department_specific_share: number;
  /** Minimum share (0–1) of hard + expert questions */
  min_advanced_share: number;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  department_id: string;
  assessment_type: AssessmentPhase;
  duration_minutes: number;
  total_marks: number;
  question_count: number;
  passing_percentage: number;
  is_active: boolean;
  randomize_order: boolean;
  blueprint: AssessmentBlueprint;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_id: string;
  sequence: number;
  marks: number;
  created_at: string;
}

export interface Submission {
  id: string;
  employee_id: string;
  assessment_id: string;
  assessment_type: AssessmentPhase;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  status: SubmissionStatus;
  raw_score: number;
  maximum_score: number;
  /** Final percentage once evaluated; provisional (scored items only) while submitted */
  percentage: number;
  objective_score: number;
  objective_max: number;
  pending_count: number;
  /** Seconds */
  time_taken: number | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  submission_id: string;
  question_id: string;
  answer_text: string | null;
  selected_options: string[] | null;
  max_marks: number;
  marks_awarded: number | null;
  evaluation_status: EvaluationStatus;
  evaluation_method: EvaluationMethod | null;
  evaluator_feedback: string | null;
  evaluated_by: string | null;
  evaluated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCompetencyScore {
  id: string;
  employee_id: string;
  competency_id: CompetencyKey;
  assessment_type: AssessmentPhase;
  score: number;
  maximum_score: number;
  percentage: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeScore {
  id: string;
  employee_id: string;
  pre_score: number | null;
  post_score: number | null;
  absolute_improvement: number | null;
  percentage_improvement: number | null;
  ai_readiness_level: AIReadinessLevel | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  actor_email: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type AuditAction =
  | 'employee.created'
  | 'employee.updated'
  | 'employee.status_changed'
  | 'department.updated'
  | 'question.created'
  | 'question.updated'
  | 'question.status_changed'
  | 'assessment.created'
  | 'assessment.updated'
  | 'assessment.activated'
  | 'assessment.deactivated'
  | 'assessment.questions_generated'
  | 'answer.evaluated'
  | 'report.generated'
  | 'settings.updated';

// ─── Settings ─────────────────────────────────────────────
/** Lower bound (inclusive, percent) of each readiness band above "needs development". */
export interface ReadinessThresholds {
  developing: number;
  operational: number;
  advanced: number;
  ai_leader: number;
}

export interface AppSettings {
  organization_name: string;
  platform_title: string;
  platform_subtitle: string;
  default_duration_minutes: number;
  default_question_count: number;
  passing_percentage: number;
  readiness_thresholds: ReadinessThresholds;
  assessments_open: boolean;
  pre_enabled: boolean;
  post_enabled: boolean;
  randomize_order: boolean;
  one_attempt_per_phase: boolean;
  show_results_to_employees: boolean;
  report_include_competencies: boolean;
  report_include_recommendations: boolean;
  report_footer: string;
}

// ─── Auth ─────────────────────────────────────────────────
export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  /** employees.id (uuid) — present for employees */
  employeeDbId: string | null;
  name: string;
}

export interface EmployeeIdentificationInput {
  employee_id: string;
  name: string;
  email: string;
  department_id: string;
  role: string;
}

export interface IdentificationResult {
  user: AuthUser;
  employee: Employee;
  /** true when an existing profile was found and department/role inputs were ignored */
  existing: boolean;
  departmentMismatch: boolean;
}

// ─── Assessment runtime ───────────────────────────────────
export interface AnswerDraft {
  answer_text?: string | null;
  selected_options?: string[] | null;
}

export type AvailabilityState = 'available' | 'in_progress' | 'completed' | 'locked' | 'unavailable';

export interface AssessmentAvailability {
  phase: AssessmentPhase;
  assessment: Assessment | null;
  submission: Submission | null;
  state: AvailabilityState;
  reason: string | null;
}

export interface AssessmentSession {
  submission: Submission;
  assessment: Assessment;
  employee: Employee;
  department: Department | null;
  questions: DeliveredQuestion[];
  answers: Record<string, AnswerDraft>;
  serverNow: string;
}

// ─── Results & analytics view models ──────────────────────
export interface CompetencyResult {
  competency: CompetencyKey;
  score: number;
  maximum: number;
  percentage: number;
}

export interface CompetencyComparison {
  competency: CompetencyKey;
  pre: number | null;
  post: number | null;
  improvement: number | null;
}

export interface ScoreComparison {
  preScore: number;
  postScore: number;
  absoluteImprovement: number;
  /** null when PRE score is 0 (relative improvement undefined) */
  percentageImprovement: number | null;
}

export interface SubmissionResult {
  submission: Submission;
  assessment: Assessment;
  employee: Employee;
  department: Department | null;
  competencies: CompetencyResult[];
}

export interface EmployeeResultSummary {
  employee: Employee;
  department: Department | null;
  pre: Submission | null;
  post: Submission | null;
  comparison: ScoreComparison | null;
  competencies: CompetencyComparison[];
  readiness: AIReadinessLevel | null;
}

export interface ReviewItem {
  answer: Answer;
  question: Question;
  sequence: number;
}

export interface SubmissionReview {
  submission: Submission;
  assessment: Assessment;
  employee: Employee;
  department: Department | null;
  items: ReviewItem[];
}

export interface Paged<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EmployeeListRow {
  employee: Employee;
  department: Department | null;
  preScore: number | null;
  postScore: number | null;
  improvement: number | null;
  readiness: AIReadinessLevel | null;
  preStatus: SubmissionStatus | null;
  postStatus: SubmissionStatus | null;
  lastActivity: string | null;
}

export interface EmployeeFilter {
  search?: string;
  department_id?: string;
  role?: string;
  completion?: 'all' | 'none' | 'pre_only' | 'both';
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  pageSize?: number;
}

export interface QuestionFilter {
  search?: string;
  department_id?: string; // 'common' for null
  competency?: CompetencyKey;
  difficulty?: Difficulty;
  question_type?: QuestionType;
  phase?: QuestionPhase;
  active?: 'all' | 'active' | 'inactive';
  page?: number;
  pageSize?: number;
}

export interface SubmissionFilter {
  search?: string;
  department_id?: string;
  phase?: AssessmentPhase;
  status?: SubmissionStatus;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface SubmissionListRow {
  submission: Submission;
  employee: Employee;
  department: Department | null;
  assessmentTitle: string;
}

export interface AssessmentWithStats extends Assessment {
  linked_question_count: number;
  submission_count: number;
}

/** Raw data the analytics engine works on (admin only). */
export interface AnalyticsDataset {
  departments: Department[];
  employees: Employee[];
  submissions: Submission[];
  competencyScores: EmployeeCompetencyScore[];
  settings: AppSettings;
}
