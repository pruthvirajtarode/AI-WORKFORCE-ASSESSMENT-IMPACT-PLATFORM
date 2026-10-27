import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { DEPARTMENTS } from '@/lib/constants';
import { getAIReadinessLevel } from '@/lib/utils';
import type { SessionAttempt } from '@/types/departmentalAssessment';

export interface MockEmployee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  departmentId: string;
  role: string;
  status: 'active' | 'inactive';
  postScore: number | null;
  postSubmittedAt: string | null;
  postTimeTaken: number | null;
  trainerMarks: number | null;
  finalScore: number | null;
}

export interface DeptStat {
  deptId: string;
  name: string;
  code: string;
  count: number;
  submitted: number;
  avgScore: number;
  completionRate: number;
  hasScores: boolean;
}

export interface AdminDepartment {
  id: string;
  name: string;
  code: string;
}

export interface CompetencyStat {
  key: string;
  name: string;
  avgScore: number;
}

export interface AdminAssessmentAttempt extends SessionAttempt {
  employeeName: string;
  employeeEmail: string;
  employeeCode: string;
  employeeRole: string;
}

interface EmployeeRow {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  department_id: string;
  role: string | null;
  status: string;
}

function toAttempt(row: Record<string, unknown>): SessionAttempt {
  return {
    id: String(row.id),
    employeeUserId: String(row.employee_user_id),
    employeeId: row.employee_id ? String(row.employee_id) : null,
    departmentId: row.department_id ? String(row.department_id) : null,
    sessionNumber: Number(row.session_number),
    assessmentTitle: String(row.assessment_title ?? `Session ${row.session_number}`),
    status: row.status === 'submitted' ? 'submitted' : 'in_progress',
    evaluationStatus: row.evaluation_status === 'evaluated' ? 'evaluated' : 'pending',
    attemptNumber: Number(row.attempt_number ?? 1),
    startedAt: String(row.started_at),
    expiresAt: String(row.expires_at),
    submittedAt: row.submitted_at ? String(row.submitted_at) : null,
    maximumScore: typeof row.maximum_score === 'number' ? row.maximum_score : null,
    rawScore: typeof row.raw_score === 'number' ? row.raw_score : null,
    percentage: typeof row.percentage === 'number' ? row.percentage : null,
    timeTakenSeconds: typeof row.time_taken_seconds === 'number' ? row.time_taken_seconds : null,
    answers: (row.answers ?? {}) as Record<string, SessionAttempt['answers'][string]>,
  };
}

function emptyDistribution() {
  return { needs_development: 0, developing: 0, operational: 0, advanced: 0, ai_leader: 0 };
}

function readDemoAdminData() {
  const employeesById = new Map<string, MockEmployee>();
  try {
    const profiles = JSON.parse(localStorage.getItem('suroj_demo_employee_profiles_v1') ?? '[]') as MockEmployee[];
    for (const profile of profiles) employeesById.set(profile.id, profile);
  } catch { /* Ignore invalid local demo profiles. */ }

  const localAttempts: SessionAttempt[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith('suroj_session_attempts_v1:')) continue;
    try {
      const attempts = JSON.parse(localStorage.getItem(key) ?? '[]') as SessionAttempt[];
      if (Array.isArray(attempts)) localAttempts.push(...attempts);
    } catch { /* Ignore invalid local demo attempts. */ }
  }

  const attempts: AdminAssessmentAttempt[] = localAttempts.map((attempt) => {
    const profile = employeesById.get(attempt.employeeUserId);
    const employeeId = profile?.id ?? attempt.employeeId ?? attempt.employeeUserId;
    const employee = profile ?? {
      id: employeeId,
      name: attempt.employeeUserId === 'demo-emp-001' ? 'Demo Employee' : 'Suroj Employee',
      email: attempt.employeeUserId === 'demo-emp-001' ? 'demo@surojbuildcon.com' : '',
      employeeId: 'SRJ-DEMO',
      departmentId: attempt.departmentId ?? DEPARTMENTS[0].id,
      role: 'Employee',
      status: 'active' as const,
      postScore: null,
      postSubmittedAt: null,
      postTimeTaken: null,
      trainerMarks: null,
      finalScore: null,
    };
    employeesById.set(employee.id, employee);
    return {
      ...attempt,
      employeeId: employee.id,
      departmentId: attempt.departmentId ?? employee.departmentId,
      employeeName: employee.name,
      employeeEmail: employee.email,
      employeeCode: employee.employeeId,
      employeeRole: employee.role,
    };
  });

  const latestSubmitted = new Map<string, AdminAssessmentAttempt>();
  for (const attempt of attempts) {
    if (attempt.status !== 'submitted' || !attempt.employeeId) continue;
    const previous = latestSubmitted.get(attempt.employeeId);
    if (!previous || (attempt.submittedAt ?? '').localeCompare(previous.submittedAt ?? '') > 0) {
      latestSubmitted.set(attempt.employeeId, attempt);
    }
  }

  const employees = [...employeesById.values()].map((employee) => {
    const latest = latestSubmitted.get(employee.id);
    const score = latest?.percentage ?? null;
    return {
      ...employee,
      postScore: score,
      postSubmittedAt: latest?.submittedAt ?? null,
      postTimeTaken: latest?.timeTakenSeconds ?? null,
      trainerMarks: latest?.evaluationStatus === 'evaluated' ? score : null,
      finalScore: score,
    };
  });

  return {
    employees,
    attempts,
    departments: DEPARTMENTS.map(({ id, name, code }) => ({ id, name, code })),
  };
}

export function useAdminData() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [attempts, setAttempts] = useState<AdminAssessmentAttempt[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    if (user?.id === 'demo-admin-001') {
      const demoData = readDemoAdminData();
      setEmployees(demoData.employees);
      setAttempts(demoData.attempts);
      setDepartments(demoData.departments);
      setHasError(false);
      setIsLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setEmployees([]);
      setAttempts([]);
      setDepartments(DEPARTMENTS.map(({ id, name, code }) => ({ id, name, code })));
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    const [employeeResult, attemptResult, departmentResult] = await Promise.all([
      supabase.from('employees')
        .select('id, employee_id, name, email, department_id, role, status')
        .order('name'),
      supabase.from('assessment_attempts')
        .select('id, employee_user_id, employee_id, department_id, session_number, assessment_title, status, evaluation_status, attempt_number, started_at, expires_at, submitted_at, maximum_score, raw_score, percentage, time_taken_seconds, answers')
        .order('submitted_at', { ascending: false, nullsFirst: false }),
      supabase.from('departments').select('id, name, code').order('name'),
    ]);

    if (employeeResult.error || attemptResult.error || departmentResult.error) {
      console.error('[Admin data] Failed to load Supabase records', employeeResult.error ?? attemptResult.error ?? departmentResult.error);
      setEmployees([]);
      setAttempts([]);
      setDepartments([]);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const employeeRows = (employeeResult.data ?? []) as unknown as EmployeeRow[];
    const attemptRows = (attemptResult.data ?? []) as unknown as Record<string, unknown>[];
    const departmentRows = (departmentResult.data ?? []) as unknown as AdminDepartment[];
    const departmentCatalog = departmentRows.length
      ? departmentRows
      : DEPARTMENTS.map(({ id, name, code }) => ({ id, name, code }));
    const employeeById = new Map(employeeRows.map((employee) => [employee.id, employee]));
    const loadedAttempts = attemptRows.map((row) => {
      const attempt = toAttempt(row);
      const employee = attempt.employeeId ? employeeById.get(attempt.employeeId) : undefined;
      return {
        ...attempt,
        employeeName: employee?.name ?? 'Employee profile unavailable',
        employeeEmail: employee?.email ?? '',
        employeeCode: employee?.employee_id ?? '',
        employeeRole: employee?.role ?? '',
      };
    });

    const submittedByEmployee = new Map<string, AdminAssessmentAttempt>();
    for (const attempt of loadedAttempts) {
      if (attempt.status !== 'submitted' || !attempt.employeeId) continue;
      if (!submittedByEmployee.has(attempt.employeeId)) submittedByEmployee.set(attempt.employeeId, attempt);
    }

    setEmployees(employeeRows.map((employee) => {
      const latest = submittedByEmployee.get(employee.id);
      const score = latest?.percentage ?? null;
      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employee_id,
        departmentId: employee.department_id,
        role: employee.role ?? '',
        status: employee.status === 'inactive' ? 'inactive' : 'active',
        postScore: score,
        postSubmittedAt: latest?.submittedAt ?? null,
        postTimeTaken: latest?.timeTakenSeconds ?? null,
        trainerMarks: latest?.evaluationStatus === 'evaluated' ? score : null,
        finalScore: score,
      };
    }));
    setAttempts(loadedAttempts);
    setDepartments(departmentCatalog);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => { void refresh(); }, [refresh]);

  const totalEmployees = employees.filter((employee) => employee.status === 'active').length;
    const submitted = attempts.filter((attempt) => attempt.status === 'submitted').length;
    const employeesSubmitted = new Set(attempts
      .filter((attempt) => attempt.status === 'submitted' && attempt.employeeId)
      .map((attempt) => attempt.employeeId)).size;
  const evaluated = attempts.filter((attempt) => attempt.evaluationStatus === 'evaluated').length;
  const scores = attempts.flatMap((attempt) => attempt.percentage === null ? [] : [attempt.percentage]);
  const overallAvg = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;

  const deptStats: DeptStat[] = departments.map((department) => {
    const departmentEmployees = employees.filter((employee) => employee.status === 'active' && employee.departmentId === department.id);
    const departmentAttempts = attempts.filter((attempt) => attempt.departmentId === department.id);
    const departmentScores = departmentAttempts.flatMap((attempt) => attempt.percentage === null ? [] : [attempt.percentage]);
    const submittedEmployees = new Set(departmentAttempts
      .filter((attempt) => attempt.status === 'submitted')
      .flatMap((attempt) => attempt.employeeId ? [attempt.employeeId] : []));
    return {
      deptId: department.id,
      name: department.name,
      code: department.code,
      count: departmentEmployees.length,
      submitted: departmentAttempts.filter((attempt) => attempt.status === 'submitted').length,
      avgScore: departmentScores.length ? departmentScores.reduce((sum, score) => sum + score, 0) / departmentScores.length : 0,
      completionRate: departmentEmployees.length ? (submittedEmployees.size / departmentEmployees.length) * 100 : 0,
      hasScores: departmentScores.length > 0,
    };
  });

  const readinessDistribution = emptyDistribution();
  for (const score of scores) readinessDistribution[getAIReadinessLevel(score)] += 1;

  const recentSubmissions = attempts
    .filter((attempt) => attempt.status === 'submitted')
    .slice(0, 6)
    .map((attempt) => ({
      id: attempt.id,
      name: attempt.employeeName,
      email: attempt.employeeEmail,
      employeeId: attempt.employeeCode,
      sessionNumber: attempt.sessionNumber,
      assessmentTitle: attempt.assessmentTitle,
      departmentId: attempt.departmentId ?? '',
      role: attempt.employeeRole,
      postScore: attempt.percentage,
      postSubmittedAt: attempt.submittedAt,
      postTimeTaken: attempt.timeTakenSeconds,
      trainerMarks: attempt.evaluationStatus === 'evaluated' ? attempt.percentage : null,
      finalScore: attempt.percentage,
    }));

  return {
    employees,
    attempts,
    departments,
    isLoading,
    hasError,
    refresh,
    totalEmployees,
    submitted,
    employeesSubmitted,
    evaluated,
    overallAvg,
    hasScores: scores.length > 0,
    deptStats,
    competencyStats: [] as CompetencyStat[],
    readinessDistribution,
    recentSubmissions,
  };
}
