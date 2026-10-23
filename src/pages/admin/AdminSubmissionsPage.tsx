import { useState, useMemo } from 'react';
import { Search, Download, Clock, CheckCircle, ClipboardList } from 'lucide-react';
import { DEPARTMENTS, DEPARTMENT_MAP } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, formatDateTime, formatDuration, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';

type PhaseFilter = 'all' | 'pre' | 'post';

interface SubmissionRow {
  empId: string;
  name: string;
  employeeId: string;
  departmentId: string;
  role: string;
  phase: 'pre' | 'post';
  score: number;
  timeTaken: number;
  submittedAt: string;
}

export default function AdminSubmissionsPage() {
  const { employees } = useAdminData();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all');

  // Build flat submission list
  const allSubmissions: SubmissionRow[] = useMemo(() => {
    const rows: SubmissionRow[] = [];
    employees.forEach((e) => {
      if (e.preScore !== null && e.preSubmittedAt) {
        rows.push({
          empId: e.id, name: e.name, employeeId: e.employeeId,
          departmentId: e.departmentId, role: e.role,
          phase: 'pre', score: e.preScore,
          timeTaken: e.preTimeTaken ?? 0, submittedAt: e.preSubmittedAt,
        });
      }
      if (e.postScore !== null && e.postSubmittedAt) {
        rows.push({
          empId: e.id, name: e.name, employeeId: e.employeeId,
          departmentId: e.departmentId, role: e.role,
          phase: 'post', score: e.postScore,
          timeTaken: e.postTimeTaken ?? 0, submittedAt: e.postSubmittedAt,
        });
      }
    });
    return rows.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [employees]);

  const filtered = useMemo(() => {
    let list = allSubmissions;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q));
    }
    if (deptFilter !== 'all') list = list.filter((r) => r.departmentId === deptFilter);
    if (phaseFilter !== 'all') list = list.filter((r) => r.phase === phaseFilter);
    return list;
  }, [allSubmissions, search, deptFilter, phaseFilter]);

  const preCount = allSubmissions.filter((r) => r.phase === 'pre').length;
  const postCount = allSubmissions.filter((r) => r.phase === 'post').length;
  const avgScore = filtered.length ? filtered.reduce((s, r) => s + r.score, 0) / filtered.length : 0;

  return (
    <AdminLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Submissions</h1>
          <p className="page-subtitle">
            {preCount} pre-assessment · {postCount} post-assessment submissions
          </p>
        </div>
        <button className="btn-secondary btn-sm gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { icon: ClipboardList, label: 'Total Submissions', value: allSubmissions.length, color: 'text-brand-navy' },
          { icon: CheckCircle, label: 'Post-Assessments', value: postCount, color: 'text-success-600' },
          { icon: Clock, label: 'Avg Score (filtered)', value: formatPercent(avgScore, 1), color: 'text-brand-blue' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <Icon className={`w-5 h-5 ${color} shrink-0`} />
            <div>
              <div className="text-xs text-brand-muted">{label}</div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-brand-cream rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-brand-muted shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or employee ID…"
            className="bg-transparent text-sm outline-none placeholder:text-brand-muted/60 w-full text-brand-charcoal"
          />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="select w-auto text-sm py-2">
          <option value="all">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.code}</option>)}
        </select>
        <div className="flex rounded-lg border border-brand-border overflow-hidden">
          {(['all', 'pre', 'post'] as PhaseFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPhaseFilter(p)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                phaseFilter === p
                  ? 'bg-brand-navy text-white'
                  : 'bg-white text-brand-muted hover:bg-brand-cream'
              }`}
            >
              {p === 'all' ? 'All' : p === 'pre' ? 'Pre' : 'Post'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Phase</th>
                <th>Score</th>
                <th>Readiness</th>
                <th>Time Taken</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-brand-muted">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No submissions match your filters
                  </td>
                </tr>
              ) : filtered.map((row, i) => {
                const level = getAIReadinessLevel(row.score);
                const config = AI_READINESS_CONFIG[level];
                const dept = DEPARTMENT_MAP[row.departmentId as keyof typeof DEPARTMENT_MAP];
                return (
                  <tr key={`${row.empId}-${row.phase}-${i}`}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">
                            {row.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-brand-navy text-sm">{row.name}</div>
                          <div className="text-xs text-brand-muted">{row.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge-gray">{dept?.code ?? row.departmentId}</span></td>
                    <td>
                      <span className={`badge ${row.phase === 'post' ? 'badge-success' : 'badge-blue'}`}>
                        {row.phase === 'post' ? 'Post' : 'Pre'}
                      </span>
                    </td>
                    <td>
                      <div className="min-w-[90px]">
                        <div className="text-sm font-semibold text-brand-navy mb-1">{formatPercent(row.score, 0)}</div>
                        <ProgressBar value={row.score} colorByScore height="sm" />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${config.bgColor} ${config.color}`}>{config.label}</span>
                    </td>
                    <td className="text-sm text-brand-muted">{formatDuration(row.timeTaken)}</td>
                    <td className="text-sm text-brand-muted whitespace-nowrap">{formatDateTime(row.submittedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-brand-border text-xs text-brand-muted">
            Showing {filtered.length} of {allSubmissions.length} submissions
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
