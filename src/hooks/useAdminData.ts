/**
 * Mock admin data — generates realistic demo data from the local assessment store
 * and synthesises organisation-wide analytics for the admin portal.
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
  preScore: number | null;
  postScore: number | null;
  preSubmittedAt: string | null;
  postSubmittedAt: string | null;
  preTimeTaken: number | null;
  postTimeTaken: number | null;
}

export interface DeptStat {
  deptId: string;
  name: string;
  code: string;
  count: number;
  preAvg: number;
  postAvg: number;
  improvement: number;
  completionRate: number;
}

export interface CompetencyStat {
  key: string;
  name: string;
  preAvg: number;
  postAvg: number;
  improvement: number;
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

const BASE_DATE = new Date('2024-11-04');
const POST_DATE = new Date('2024-11-08');

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

      // Scores — varied by department and individual
      const deptBaseline = 38 + di * 3; // dept-level variance
      const preRaw = Math.max(18, Math.min(82, deptBaseline + (rng() * 40 - 20)));
      const improvement = 8 + rng() * 22; // 8–30% improvement after training
      const postRaw = Math.min(98, preRaw + improvement);

      // Some employees haven't taken post yet
      const tookPost = rng() > 0.18;

      employees.push({
        id: `emp-${empNum}`,
        name,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@surojbuildcon.com`,
        employeeId: `SRJ-${empNum}`,
        departmentId: dept.id,
        role,
        preScore: Math.round(preRaw * 10) / 10,
        postScore: tookPost ? Math.round(postRaw * 10) / 10 : null,
        preSubmittedAt: dateStr(BASE_DATE, i * 0.3 + di * 0.5),
        postSubmittedAt: tookPost ? dateStr(POST_DATE, i * 0.3 + di * 0.5) : null,
        preTimeTaken: Math.floor(2400 + rng() * 2400), // 40–80 min
        postTimeTaken: tookPost ? Math.floor(2400 + rng() * 2400) : null,
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
  const preCompleted = employees.filter((e) => e.preScore !== null).length;
  const postCompleted = employees.filter((e) => e.postScore !== null).length;

  const preScores = employees.filter((e) => e.preScore !== null).map((e) => e.preScore!);
  const postScores = employees.filter((e) => e.postScore !== null).map((e) => e.postScore!);

  const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

  const overallPreAvg = avg(preScores);
  const overallPostAvg = avg(postScores);
  const overallImprovement = overallPostAvg - overallPreAvg;

  // Department stats
  const deptStats: DeptStat[] = DEPARTMENTS.map((dept) => {
    const deptEmps = employees.filter((e) => e.departmentId === dept.id);
    const pre = deptEmps.filter((e) => e.preScore !== null).map((e) => e.preScore!);
    const post = deptEmps.filter((e) => e.postScore !== null).map((e) => e.postScore!);
    const preAvg = avg(pre);
    const postAvg = avg(post);
    return {
      deptId: dept.id,
      name: dept.name,
      code: dept.code,
      count: deptEmps.length,
      preAvg,
      postAvg,
      improvement: postAvg - preAvg,
      completionRate: pre.length > 0 ? (post.length / pre.length) * 100 : 0,
    };
  });

  // Competency stats (mock — derived from department averages)
  const competencyStats: CompetencyStat[] = COMPETENCIES.map((comp, i) => {
    const rng = seededRand(i * 113 + 7);
    const preBase = 38 + rng() * 25;
    const improvementFactor = 8 + rng() * 18;
    return {
      key: comp.category,
      name: comp.name,
      preAvg: Math.round(preBase * 10) / 10,
      postAvg: Math.round(Math.min(95, preBase + improvementFactor) * 10) / 10,
      improvement: Math.round(improvementFactor * 10) / 10,
    };
  });

  // Readiness distribution (post scores)
  const readinessDistribution = {
    needs_development: postScores.filter((s) => getAIReadinessLevel(s) === 'needs_development').length,
    developing: postScores.filter((s) => getAIReadinessLevel(s) === 'developing').length,
    operational: postScores.filter((s) => getAIReadinessLevel(s) === 'operational').length,
    advanced: postScores.filter((s) => getAIReadinessLevel(s) === 'advanced').length,
    ai_leader: postScores.filter((s) => getAIReadinessLevel(s) === 'ai_leader').length,
  };

  return {
    employees,
    totalEmployees,
    preCompleted,
    postCompleted,
    overallPreAvg,
    overallPostAvg,
    overallImprovement,
    deptStats,
    competencyStats,
    readinessDistribution,
  };
}
