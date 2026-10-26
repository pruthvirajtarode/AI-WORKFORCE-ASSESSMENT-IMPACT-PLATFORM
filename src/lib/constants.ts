// ============================================================
// DEPARTMENTS — Six Suroj departments
// ============================================================

export const DEPARTMENTS = [
  {
    id: 'dept-01',
    name: 'EPC Bids & Design-Build / Tendering & Contracts',
    code: 'EPC',
    description: 'Engineering, Procurement & Construction bids, design-build projects, tendering and contract management',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dept-02',
    name: 'Accounts & Finance',
    code: 'ACC',
    description: 'Financial accounting, GST compliance, TDS, bank reconciliation, financial reporting and analysis',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dept-03',
    name: 'People, Admin & Communication',
    code: 'PAC',
    description: 'Human resources, administration, internal and external communication management',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dept-04',
    name: 'Cost, Planning & Systems',
    code: 'CPS',
    description: 'Project cost management, planning, scheduling, variance analysis and management reporting',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dept-05',
    name: 'Procurement & Stores',
    code: 'PRO',
    description: 'Vendor management, procurement, purchase orders, stores and inventory management',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dept-06',
    name: 'Design, Drawings & Quantities',
    code: 'DDQ',
    description: 'Structural and architectural design, drawing management, quantity take-off and verification',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
] as const;

export const DEPARTMENT_MAP = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d])
);

export const DEPARTMENT_SESSION_MAP: Record<string, number> = {
  EPC: 1,
  ACC: 2,
  PAC: 3,
  CPS: 4,
  PRO: 5,
  DDQ: 6,
};

export function getEmployeeSessionNumber(departmentId?: string, departmentCode?: string): number | null {
  const code = departmentCode ?? DEPARTMENTS.find((department) => department.id === departmentId)?.code;
  return code ? DEPARTMENT_SESSION_MAP[code] ?? null : null;
}

// ============================================================
// COMPETENCIES
// ============================================================

export const COMPETENCIES = [
  { id: 'comp-01', name: 'AI Fundamentals', category: 'ai_fundamentals', weight: 10 },
  { id: 'comp-02', name: 'Generative AI', category: 'generative_ai', weight: 10 },
  { id: 'comp-03', name: 'Prompt Engineering', category: 'prompt_engineering', weight: 15 },
  { id: 'comp-04', name: 'Claude / AI Assistant Usage', category: 'claude_usage', weight: 10 },
  { id: 'comp-05', name: 'Document Analysis', category: 'document_analysis', weight: 10 },
  { id: 'comp-06', name: 'Data Analysis', category: 'data_analysis', weight: 10 },
  { id: 'comp-07', name: 'Department Application', category: 'department_application', weight: 15 },
  { id: 'comp-08', name: 'Critical Verification', category: 'critical_verification', weight: 10 },
  { id: 'comp-09', name: 'AI Workflow Design', category: 'workflow_design', weight: 10 },
  { id: 'comp-10', name: 'Productivity & Automation', category: 'productivity_automation', weight: 10 },
] as const;

// ============================================================
// ASSESSMENT CONFIG DEFAULTS
// ============================================================

export const ASSESSMENT_DEFAULTS = {
  durationMinutes: 90,
  questionCount: 30,
  passingPercentage: 60,
  randomize: true,
  maxAttempts: 1,
};

// ============================================================
// AI READINESS THRESHOLDS
// ============================================================

export const AI_READINESS_THRESHOLDS = {
  needs_development: { min: 0, max: 39 },
  developing: { min: 40, max: 59 },
  operational: { min: 60, max: 74 },
  advanced: { min: 75, max: 89 },
  ai_leader: { min: 90, max: 100 },
};

// ============================================================
// APP CONFIG
// ============================================================

export const APP_CONFIG = {
  name: 'SUROJ × BE10X',
  subtitle: 'AI Workforce Transformation Assessment & Impact Platform',
  organization: 'Suroj Buildcon',
  trainingPartner: 'Be10x',
  version: '1.0.0',
};

export const ROUTES = {
  home: '/',
  login: '/login',
  employeeOnboarding: '/employee/start',
  adminLogin: '/admin/login',
  employeeDashboard: '/employee/dashboard',
  employeeSessionDetails: '/employee/sessions/:sessionNumber',
  employeeSessionAssessment: '/employee/sessions/:sessionNumber/assessment/:attemptId',
  employeeSessionResult: '/employee/sessions/:sessionNumber/result/:attemptId',
  employeeResults: '/employee/results',
  employeeProfile: '/employee/profile',
  admin: '/admin',
  adminDashboard: '/admin/dashboard',
  adminEmployees: '/admin/employees',
  adminEmployee: '/admin/employees/:id',
  adminDepartments: '/admin/departments',
  adminAssessments: '/admin/assessments',
  adminQuestions: '/admin/questions',
  adminSubmissions: '/admin/submissions',
  adminResults: '/admin/results',
  adminAnalytics: '/admin/analytics',
  adminReports: '/admin/reports',
  adminSettings: '/admin/settings',
} as const;
