import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, ChevronRight, Users, CheckCircle, Clock } from 'lucide-react';
import { ROUTES, DEPARTMENTS, DEPARTMENT_MAP } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingScreen from '@/components/ui/LoadingScreen';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Employees' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'evaluated', label: 'Evaluated' },
  { value: 'pending', label: 'Not Submitted' },
];

export default function AdminEmployeesPage() {
  const { employees, departments, isLoading, hasError } = useAdminData();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'postScore' | 'department'>('name');

  const filtered = useMemo(() => {
    let list = [...employees];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
      );
    }

    if (deptFilter !== 'all') list = list.filter((e) => e.departmentId === deptFilter);

    if (statusFilter === 'submitted') list = list.filter((e) => e.postSubmittedAt !== null);
    else if (statusFilter === 'evaluated') list = list.filter((e) => e.trainerMarks !== null);
    else if (statusFilter === 'pending') list = list.filter((e) => e.postSubmittedAt === null);

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'postScore') return (b.finalScore ?? -1) - (a.finalScore ?? -1);
      if (sortBy === 'department') return a.departmentId.localeCompare(b.departmentId);
      return 0;
    });

    return list;
  }, [employees, search, deptFilter, statusFilter, sortBy]);

  if (isLoading) return <LoadingScreen />;

  const handleExport = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Role', 'Score (%)', 'Trainer Marks (%)', 'Final Score (%)'];
    const rows = filtered.map((e) => {
      const dept = DEPARTMENT_MAP[e.departmentId as keyof typeof DEPARTMENT_MAP];
      return [
        e.employeeId, e.name, e.email,
        dept?.name ?? e.departmentId, e.role,
        e.postScore?.toFixed(1) ?? '',
        e.trainerMarks?.toFixed(1) ?? '',
        e.finalScore?.toFixed(1) ?? '',
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'suroj-ai-assessment-results.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} active profiles · {filtered.length} shown</p>
        </div>
        <button onClick={handleExport} className="btn-secondary btn-sm gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-brand-cream rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-brand-muted shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID, email…"
            className="bg-transparent text-sm outline-none placeholder:text-brand-muted/60 w-full text-brand-charcoal"
          />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="select w-auto text-sm py-2">
          <option value="all">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.code} — {d.name.split(' / ')[0]}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select w-auto text-sm py-2">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="select w-auto text-sm py-2">
          <option value="name">Sort: Name</option>
          <option value="postScore">Sort: Score</option>
          <option value="department">Sort: Department</option>
        </select>
      </div>

      {hasError && <div role="alert" className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-5 text-sm text-danger-700">Employee data could not be loaded from Supabase. Check administrator RLS access and refresh.</div>}

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Post Score</th>
                <th>Trainer Marks</th>
                <th>Final Score</th>
                <th>Readiness</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-brand-muted">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No employees match your filters
                  </td>
                </tr>
              ) : filtered.map((emp) => {
                const displayScore = emp.finalScore;
                const level = displayScore !== null ? getAIReadinessLevel(displayScore) : null;
                const levelConfig = level ? AI_READINESS_CONFIG[level] : null;
                const dept = departments.find((department) => department.id === emp.departmentId)
                  ?? DEPARTMENT_MAP[emp.departmentId as keyof typeof DEPARTMENT_MAP];

                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">
                            {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-brand-navy text-sm">{emp.name}</div>
                          <div className="text-xs text-brand-muted">{emp.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-gray">{dept?.code ?? emp.departmentId}</span>
                    </td>
                    <td className="text-brand-muted text-xs">{emp.role}</td>
                    <td>
                      {emp.trainerMarks !== null ? (
                        <span className="badge badge-success flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Evaluated
                        </span>
                      ) : emp.postScore !== null ? (
                        <span className="badge badge-blue flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> Submitted
                        </span>
                      ) : (
                        <span className="badge-gray text-xs">Pending</span>
                      )}
                    </td>
                    <td>
                      {emp.postScore !== null ? (
                        <div className="min-w-[80px]">
                          <div className="text-sm font-semibold text-brand-navy mb-1">{formatPercent(emp.postScore, 0)}</div>
                          <ProgressBar value={emp.postScore} height="sm" colorByScore />
                        </div>
                      ) : (
                        <span className="text-xs text-brand-muted italic">—</span>
                      )}
                    </td>
                    <td>
                      {emp.trainerMarks !== null ? (
                        <span className="text-sm font-semibold text-brand-navy">{formatPercent(emp.trainerMarks, 0)}</span>
                      ) : (
                        <span className="text-xs text-brand-muted">—</span>
                      )}
                    </td>
                    <td>
                      {displayScore !== null ? (
                        <div className="min-w-[80px]">
                          <div className="text-sm font-bold text-success-600 mb-1">{formatPercent(displayScore, 0)}</div>
                          <ProgressBar value={displayScore} height="sm" colorByScore />
                        </div>
                      ) : (
                        <span className="text-xs text-brand-muted">—</span>
                      )}
                    </td>
                    <td>
                      {levelConfig ? (
                        <span className={`badge ${levelConfig.bgColor} ${levelConfig.color}`}>
                          {levelConfig.label}
                        </span>
                      ) : <span className="text-xs text-brand-muted">—</span>}
                    </td>
                    <td>
                      <Link
                        to={`/admin/employees/${emp.id}`}
                        className="btn-ghost btn-sm no-underline"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-brand-border text-xs text-brand-muted">
            Showing {filtered.length} of {employees.length} employees
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
