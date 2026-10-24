export interface AssessmentOption {
  [key: string]: string;
}

export interface AssessmentQuestionSource {
  id: string;
  type: 'choice' | 'multi' | 'num' | 'text' | 'cw' | 'annexq';
  text: string;
  opts?: AssessmentOption;
  items?: AssessmentOption;
  unit?: string;
  short?: boolean;
  url?: boolean;
  optional?: boolean;
  manual?: boolean;
  ph?: string;
}

export interface AssessmentPart {
  id: string;
  title: string;
  mins: number;
  brief: string;
  briefText: string;
  files: string[];
  qs: AssessmentQuestionSource[];
}

export interface DepartmentalAssessment {
  number: number;
  title: string;
  description: string;
  category: string;
  sourceFile: string;
  sourceTitle: string;
  headline: string;
  introduction: string;
  durationMinutes: number;
  questionCount: number;
  responseCount: number;
  totalMarks: number;
  scoring: {
    autoMarks: number;
    trainerMarks: number;
    autoQuestionIds: string[];
    halfMarkIds: string[];
    manualQuestionIds: string[];
    manualMarks: Record<string, number | null>;
    rules: Record<string, string>;
  };
  instructions: string[];
  parts: AssessmentPart[];
  questionIds: string[];
}

export type AssessmentAnswer = string | string[] | Record<string, string>;

export interface SessionAttempt {
  id: string;
  employeeUserId: string;
  employeeId: string | null;
  departmentId: string | null;
  sessionNumber: number;
  assessmentTitle: string;
  status: 'in_progress' | 'submitted';
  evaluationStatus: 'pending' | 'evaluated';
  attemptNumber: number;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  maximumScore: number | null;
  rawScore: number | null;
  percentage: number | null;
  timeTakenSeconds: number | null;
  answers: Record<string, AssessmentAnswer>;
}