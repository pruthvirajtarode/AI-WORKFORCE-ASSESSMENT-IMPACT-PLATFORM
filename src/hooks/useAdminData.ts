/**
 * Mock admin data — generates realistic demo data for the post-training
 * assessment platform across all six Suroj departments.
 *
 * In production this would be replaced by Supabase queries.
 */
import { useMemo } from 'react';
import { DEPARTMENTS, COMPETENCIES } from '@/lib/constants';
import { getAIReadinessLevel } from '@/lib/utils';

// ─── Seed PRNG ───────────────────────────────────────────────
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Types ───────────────────────────────────────────────────
export interface MockEmployee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  departmentId: string;
  role: string;
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
}

export interface CompetencyStat {
  key: string;
  name: string;
  avgScore: number;
}

// ─── Sample names ────────────────────────────────────────────
const FIRST_NAMES = [
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Meera', 'Suresh', 'Anita',
  'Rahul', 'Kavita', 'Sanjay', 'Pooja', 'Arun', 'Deepa', 'Manish', 'Shreya',
  'Kiran', 'Neha', 'Dinesh', 'Rekha', 'Vijay', 'Smita', 'Ramesh', 'Lakshmi',
  'Ashok', 'Geeta', 'Sunil', 'Nisha', 'Manoj', 'Ritu',
];
const LAST_NAMES = [
  'Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Joshi', 'Mehta', 'Desai',
  'Shah', 'Verma', 'Nair', 'Iyer', 'Reddy', 'Rao', 'Pillai', 'Menon',
  'Mishra', 'Tiwari', 'Chaudhary', 'Pandey',
];
const ROLES: Record<string, string[]> = {
  'dept-01': ['Senior Bid Manager', 'Tendering Executive', 'Contracts Manager', 'EPC Consultant', 'Design-Build Lead'],
  'dept-02': ['Senior Accountant', 'Finance Manager', 'GST Analyst', 'Cost Accountant', 'Finance Executive'],
  'dept-03': ['HR Manager', 'Admin Executive', 'Communication Lead', 'People Partner', 'Admin Officer'],
  'dept-04': ['Planning Engineer', 'Cost Manager', 'Project Controller', 'Systems Analyst', 'Planning Lead'],
  'dept-05': ['Procurement Manager', 'Senior Buyer', 'Stores Manager', 'Vendor Relations', 'Purchase Officer'],
  'dept-06': ['Senior Designer', 'Quantity Surveyor', 'Drawing Manager', 'Structural Lead', 'Design Engineer'],
};

const ASSESSMENT_DATE = new Date('2024-11-08');

function dateStr(base: Date, offset: number): string {
  const d = new Date(base.getTime() + offset * 3600_000);
  return d.toISOString();
}

// ─── Generate employees ───────────────────────────────────────
function generateEmployees(): MockEmployee[] {
  const employees: MockEmployee[] = [];
  let empNum = 1001;

  // Distribute 177 employees across 6 departments
  const deptCounts = [32, 28, 31, 27, 34, 25];

  DEPARTMENTS.forEach((dept, di) => {
    const rng = seededRand(di * 997 + 42);
    const count = deptCounts[di];
    for (let i = 0; i < count; i++) {
      const fn = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
      const ln = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
      const name = `${fn} ${ln}`;
      const roles = ROLES[dept.id] ?? ['Executive'];
      const role = roles[Math.floor(rng() * roles.length)];

      // Post-training scores — varied by department
      const deptBase = 52 + di * 3;
      const postRaw = Math.max(28, Math.min(96, deptBase + (rng() * 40 - 16)));

      // Some employees haven't submitted yet
      const submitted = rng() > 0.12;
      // Some have trainer marks applied
      const hasTrainerMark = submitted && rng() > 0.45;
      const trainerMark = hasTrainerMark ? Math.round((postRaw * 0.8 + rng() * 20) * 10) / 10 : null;
      const finalScore = hasTrainerMark ? trainerMark : (submitted ? Math.round(postRaw * 10) / 10 : null);

      employees.push({
        id: `emp-${empNum}`,
        name,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@surojbuildcon.com`,
        employeeId: `SRJ-${empNum}`,
        departmentId: dept.id,
        role,
        postScore: submitted ? Math.round(postRaw * 10) / 10 : null,
        postSubmittedAt: submitted ? dateStr(ASSESSMENT_DATE, i * 0.3 + di * 0.5) : null,
        postTimeTaken: submitted ? Math.floor(2400 + rng() * 2400) : null, // 40–80 min
        trainerMarks: trainerMark,
        finalScore,
      });
      empNum++;
    }
  });

  return employees;
}

// ─── Hook ────────────────────────────────────────────────────
export function useAdminData() {
  const employees = useMemo(() => generateEmployees(), []);

  const totalEmployees = employees.length;
  const submitted = employees.filter((e) => e.postScore !== null).length;
  const evaluated = employees.filter((e) => e.trainerMarks !== null).length;

  const postScores = employees.filter((e) => e.finalScore !== null).map((e) => e.finalScore!);
  const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

  const overallAvg = avg(postScores);

  // Department stats
  const deptStats: DeptStat[] = DEPARTMENTS.map((dept) => {
    const deptEmps = employees.filter((e) => e.departmentId === dept.id);
    const scores = deptEmps.filter((e) => e.finalScore !== null).map((e) => e.finalScore!);
    return {
      deptId: dept.id,
      name: dept.name,
      code: dept.code,
      count: deptEmps.length,
      submitted: scores.length,
      avgScore: avg(scores),
      completionRate: deptEmps.length > 0 ? (scores.length / deptEmps.length) * 100 : 0,
    };
  });

  // Competency stats (mock — derived from seeded data)
  const competencyStats: CompetencyStat[] = COMPETENCIES.map((comp, i) => {
    const rng = seededRand(i * 113 + 7);
    const avgScore = Math.round((52 + rng() * 35) * 10) / 10;
    return {
      key: comp.category,
      name: comp.name,
      avgScore,
    };
  });

  // Readiness distribution (post final scores)
  const readinessDistribution = {
    needs_development: postScores.filter((s) => getAIReadinessLevel(s) === 'needs_development').length,
    developing: postScores.filter((s) => getAIReadinessLevel(s) === 'developing').length,
    operational: postScores.filter((s) => getAIReadinessLevel(s) === 'operational').length,
    advanced: postScores.filter((s) => getAIReadinessLevel(s) === 'advanced').length,
    ai_leader: postScores.filter((s) => getAIReadinessLevel(s) === 'ai_leader').length,
  };

  // Recent submissions
  const recentSubmissions = [...employees]
    .filter((e) => e.postSubmittedAt !== null)
    .sort((a, b) => (b.postSubmittedAt ?? '').localeCompare(a.postSubmittedAt ?? ''))
    .slice(0, 6);

  return {
    employees,
    totalEmployees,
    submitted,
    evaluated,
    overallAvg,
    deptStats,
    competencyStats,
    readinessDistribution,
    recentSubmissions,
  };
}
