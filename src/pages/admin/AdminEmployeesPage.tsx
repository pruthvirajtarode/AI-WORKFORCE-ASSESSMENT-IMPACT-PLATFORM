import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, ChevronRight, Users } from 'lucide-react';
import { ROUTES, DEPARTMENTS, DEPARTMENT_MAP } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';

const PHASE_OPTIONS = [
  { value: 'all', label: 'All Employees' },
  { value: 'both', label: 'Completed Both' },
  { value: 'pre_only', label: 'Pre Only' },
  { value: 'none', label: 'Not Started' },
];

export default function AdminEmployeesPage() {
  const { employees } = useAdminData();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'postScore' | 'improvement'>('name');

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

    if (phaseFilter === 'both') list = list.filter((e) => e.preScore !== null && e.postScore !== null);
    else if (phaseFilter === 'pre_only') list = list.filter((e) => e.preScore !== null && e.postScore === null);
    else if (phaseFilter === 'none') list = list.filter((e) => e.preScore === null);

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'postScore') return (b.postScore ?? -1) - (a.postScore ?? -1);
      if (sortBy === 'improvement') {
        const ai = (a.preScore && a.postScore) ? a.postScore - a.preScore : -999;
        const bi = (b.preScore && b.postScore) ? b.postScore - b.preScore : -999;
        return bi - ai;
      }
      return 0;
    });

    return list;
  }, [employees, search, deptFilter, phaseFilter, sortBy]);

  return (
    <AdminLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} enrolled · {filtered.length} shown</p>
        </div>
        <button className="btn-secondary btn-sm gap-1.5">
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
          {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.code} — {d.name.split(' / ')[0]}</option>)}
        </select>
        <select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)} className="select w-auto text-sm py-2">
          {PHASE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="select w-auto text-sm py-2">
          <option value="name">Sort: Name</option>
          <option value="postScore">Sort: Post Score</option>
          <option value="improvement">Sort: Improvement</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Role</th>
                <th>Pre Score</th>
                <th>Post Score</th>
                <th>Improvement</th>
                <th>Readiness</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-brand-muted">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No employees match your filters
                  </td>
                </tr>
              ) : filtered.map((emp) => {
                const improvement = (emp.preScore && emp.postScore) ? emp.postScore - emp.preScore : null;
                const displayScore = emp.postScore ?? emp.preScore;
                const level = displayScore ? getAIReadinessLevel(displayScore) : null;
                const levelConfig = level ? AI_READINESS_CONFIG[level] : null;
                const dept = DEPARTMENT_MAP[emp.departmentId as keyof typeof DEPARTMENT_MAP];

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
                      {emp.preScore !== null ? (
                        <div className="min-w-[80px]">
                          <div className="text-sm font-semibold text-brand-navy mb-1">{formatPercent(emp.preScore, 0)}</div>
                          <ProgressBar value={emp.preScore} height="sm" colorByScore />
                        </div>
                      ) : (
                        <span className="text-xs text-brand-muted italic">Not taken</span>
                      )}
                    </td>
                    <td>
                      {emp.postScore !== null ? (
                        <div className="min-w-[80px]">
                          <div className="text-sm font-semibold text-brand-navy mb-1">{formatPercent(emp.postScore, 0)}</div>
                          <ProgressBar value={emp.postScore} height="sm" colorByScore />
                        </div>
                      ) : (
                        <span className="text-xs text-brand-muted italic">Pending</span>
                      )}
                    </td>
                    <td>
                      {improvement !== null ? (
                        <span className={`text-sm font-bold ${improvement > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                          {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                        </span>
                      ) : <span className="text-xs text-brand-muted">—</span>}
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
