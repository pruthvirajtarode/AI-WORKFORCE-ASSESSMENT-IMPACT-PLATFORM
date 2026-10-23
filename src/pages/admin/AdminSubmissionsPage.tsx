import { useState, useMemo } from 'react';
import { Search, Download, Clock, CheckCircle, ClipboardList } from 'lucide-react';
import { DEPARTMENTS, DEPARTMENT_MAP } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, formatDateTime, formatDuration, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';

interface SubmissionRow {
  empId: string;
  name: string;
  employeeId: string;
  departmentId: string;
  role: string;
  postScore: number;
  trainerMarks: number | null;
  finalScore: number;
  timeTaken: number;
  submittedAt: string;
}

export default function AdminSubmissionsPage() {
  const { employees } = useAdminData();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [evalFilter, setEvalFilter] = useState<'all' | 'evaluated' | 'pending'>('all');

  // Build flat submission list (only submitted employees)
  const allSubmissions: SubmissionRow[] = useMemo(() => {
    const rows: SubmissionRow[] = [];
    employees.forEach((e) => {
      if (e.postScore !== null && e.postSubmittedAt) {
        rows.push({
          empId: e.id, name: e.name, employeeId: e.employeeId,
          departmentId: e.departmentId, role: e.role,
          postScore: e.postScore,
          trainerMarks: e.trainerMarks,
          finalScore: e.finalScore ?? e.postScore,
          timeTaken: e.postTimeTaken ?? 0,
          submittedAt: e.postSubmittedAt,
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
    if (evalFilter === 'evaluated') list = list.filter((r) => r.trainerMarks !== null);
    else if (evalFilter === 'pending') list = list.filter((r) => r.trainerMarks === null);
    return list;
  }, [allSubmissions, search, deptFilter, evalFilter]);

  const evaluated = allSubmissions.filter((r) => r.trainerMarks !== null).length;
  const avgScore = filtered.length ? filtered.reduce((s, r) => s + r.finalScore, 0) / filtered.length : 0;

  const handleExport = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Role', 'Post Score (%)', 'Trainer Marks (%)', 'Final Score (%)', 'Time Taken', 'Submitted At'];
    const rows = filtered.map((r) => {
      const dept = DEPARTMENT_MAP[r.departmentId as keyof typeof DEPARTMENT_MAP];
      return [
        r.employeeId, r.name, dept?.name ?? r.departmentId, r.role,
        r.postScore.toFixed(1),
        r.trainerMarks?.toFixed(1) ?? '',
        r.finalScore.toFixed(1),
        formatDuration(r.timeTaken),
        r.submittedAt,
      ];
    });
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'suroj-submissions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Submissions</h1>
          <p className="page-subtitle">
            {allSubmissions.length} post-training submissions · {evaluated} evaluated
          </p>
        </div>
        <button onClick={handleExport} className="btn-secondary btn-sm gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { icon: ClipboardList, label: 'Total Submissions', value: allSubmissions.length, color: 'text-brand-navy' },
          { icon: CheckCircle, label: 'Evaluated', value: evaluated, color: 'text-success-600' },
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
          {(['all', 'evaluated', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setEvalFilter(f)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                evalFilter === f
                  ? 'bg-brand-navy text-white'
                  : 'bg-white text-brand-muted hover:bg-brand-cream'
              }`}
            >
              {f === 'all' ? 'All' : f === 'evaluated' ? 'Evaluated' : 'Pending'}
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
                <th>Post Score</th>
                <th>Trainer Marks</th>
                <th>Final Score</th>
                <th>Readiness</th>
                <th>Time Taken</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-brand-muted">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No submissions match your filters
                  </td>
                </tr>
              ) : filtered.map((row, i) => {
                const level = getAIReadinessLevel(row.finalScore);
                const config = AI_READINESS_CONFIG[level];
                const dept = DEPARTMENT_MAP[row.departmentId as keyof typeof DEPARTMENT_MAP];
                return (
                  <tr key={`${row.empId}-${i}`}>
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
                      <div className="min-w-[90px]">
                        <div className="text-sm font-semibold text-brand-navy mb-1">{formatPercent(row.postScore, 0)}</div>
                        <ProgressBar value={row.postScore} colorByScore height="sm" />
                      </div>
                    </td>
                    <td>
                      {row.trainerMarks !== null ? (
                        <span className="text-sm font-semibold text-success-600">{formatPercent(row.trainerMarks, 0)}</span>
                      ) : (
                        <span className="text-xs text-warning-600 font-medium">Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="min-w-[90px]">
                        <div className="text-sm font-bold text-brand-navy mb-1">{formatPercent(row.finalScore, 0)}</div>
                        <ProgressBar value={row.finalScore} colorByScore height="sm" />
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
