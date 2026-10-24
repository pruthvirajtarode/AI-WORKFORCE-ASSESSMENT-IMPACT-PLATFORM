import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileQuestion, RefreshCw, Search } from 'lucide-react';
import assessmentsData from '@/data/departmentalAssessments.json';
import { DEPARTMENT_MAP } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatDateTime, formatDuration } from '@/lib/utils';
import type { DepartmentalAssessment } from '@/types/departmentalAssessment';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';

const assessments = assessmentsData as unknown as DepartmentalAssessment[];

export default function AdminSubmissionsPage() {
  const { attempts, departments, isLoading, hasError, refresh } = useAdminData();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [evaluationFilter, setEvaluationFilter] = useState('all');
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filtered = useMemo(() => attempts.filter((attempt) => {
    const query = search.trim().toLowerCase();
    const matchesEmployee = !query || [attempt.employeeName, attempt.employeeEmail, attempt.employeeCode]
      .some((value) => value.toLowerCase().includes(query));
    const matchesDepartment = departmentFilter === 'all' || attempt.departmentId === departmentFilter;
    const matchesSession = sessionFilter === 'all' || attempt.sessionNumber === Number(sessionFilter);
    const matchesEvaluation = evaluationFilter === 'all' || attempt.evaluationStatus === evaluationFilter;
    const matchesSubmission = submissionFilter === 'all' || attempt.status === submissionFilter;
    const submittedDate = attempt.submittedAt?.slice(0, 10) ?? '';
    const matchesFrom = !fromDate || (submittedDate !== '' && submittedDate >= fromDate);
    const matchesTo = !toDate || (submittedDate !== '' && submittedDate <= toDate);
    return matchesEmployee && matchesDepartment && matchesSession && matchesEvaluation
      && matchesSubmission && matchesFrom && matchesTo;
  }), [attempts, search, departmentFilter, sessionFilter, evaluationFilter, submissionFilter, fromDate, toDate]);

  const exportCsv = () => {
    const headers = ['Employee Name', 'Employee ID', 'Email', 'Department', 'Assessment', 'Attempt', 'Submission Status', 'Evaluation Status', 'Score', 'Maximum Score', 'Percentage', 'Submitted At'];
    const rows = filtered.map((attempt) => [
      attempt.employeeName,
      attempt.employeeCode,
      attempt.employeeEmail,
      DEPARTMENT_MAP[attempt.departmentId as keyof typeof DEPARTMENT_MAP]?.name ?? attempt.departmentId ?? '',
      attempt.assessmentTitle,
      attempt.attemptNumber,
      attempt.status,
      attempt.evaluationStatus,
      attempt.rawScore ?? '',
      attempt.maximumScore ?? '',
      attempt.percentage ?? '',
      attempt.submittedAt ?? '',
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'suroj-assessment-results.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <AdminLayout>
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Assessment Submissions</h1>
          <p className="page-subtitle">Live employee attempts and evaluation status from Supabase</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void refresh()} className="btn-secondary btn-sm" title="Refresh submissions"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={exportCsv} disabled={!filtered.length} className="btn-secondary btn-sm gap-1.5"><Download className="w-3.5 h-3.5" /> Export CSV</button>
        </div>
      </div>

      {hasError && <div role="alert" className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-5 text-sm text-danger-700">Supabase submissions or employee profiles could not be loaded. Confirm the database migration and administrator RLS access, then refresh.</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
        <div className="card p-4"><div className="kpi-label">Attempts</div><div className="kpi-value">{attempts.length}</div></div>
        <div className="card p-4"><div className="kpi-label">Submitted</div><div className="kpi-value">{attempts.filter((attempt) => attempt.status === 'submitted').length}</div></div>
        <div className="card p-4"><div className="kpi-label">Evaluated</div><div className="kpi-value">{attempts.filter((attempt) => attempt.evaluationStatus === 'evaluated').length}</div></div>
      </div>

      <div className="card p-4 mb-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="flex items-center gap-2 bg-brand-cream rounded-lg px-3 py-2 sm:col-span-2">
          <Search className="w-4 h-4 text-brand-muted shrink-0" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter employee, email, or ID" className="bg-transparent text-sm outline-none w-full" />
        </label>
        <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="select text-sm">
          <option value="all">All departments</option>
          {departments.map((department) => <option key={department.id} value={department.id}>{department.code}</option>)}
        </select>
        <select value={sessionFilter} onChange={(event) => setSessionFilter(event.target.value)} className="select text-sm">
          <option value="all">All sessions</option>
          {assessments.map((assessment) => <option key={assessment.number} value={assessment.number}>Session {String(assessment.number).padStart(2, '0')}</option>)}
        </select>
        <select value={evaluationFilter} onChange={(event) => setEvaluationFilter(event.target.value)} className="select text-sm">
          <option value="all">All evaluation states</option><option value="pending">Pending evaluation</option><option value="evaluated">Evaluated</option>
        </select>
        <select value={submissionFilter} onChange={(event) => setSubmissionFilter(event.target.value)} className="select text-sm">
          <option value="all">All submission states</option><option value="in_progress">In progress</option><option value="submitted">Submitted</option>
        </select>
        <label className="text-xs text-brand-muted">From<input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="input mt-1 w-full" /></label>
        <label className="text-xs text-brand-muted">To<input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="input mt-1 w-full" /></label>
      </div>

      <div className="card overflow-x-auto">
        <table className="table min-w-[920px]">
          <thead><tr><th>Employee</th><th>Department</th><th>Assessment</th><th>Score</th><th>Submission</th><th>Evaluation</th><th>Submitted</th><th /></tr></thead>
          <tbody>
            {filtered.map((attempt) => (
              <tr key={attempt.id}>
                <td><div className="font-medium text-brand-navy">{attempt.employeeName}</div><div className="text-xs text-brand-muted">{attempt.employeeCode} · {attempt.employeeEmail}</div></td>
                <td>{DEPARTMENT_MAP[attempt.departmentId as keyof typeof DEPARTMENT_MAP]?.code ?? attempt.departmentId ?? '—'}</td>
                <td><div className="font-medium">Session {String(attempt.sessionNumber).padStart(2, '0')}</div><div className="text-xs text-brand-muted">{attempt.assessmentTitle}</div></td>
                <td>{attempt.percentage === null ? <span className="text-xs text-brand-muted">Pending scoring</span> : `${attempt.rawScore ?? '—'} / ${attempt.maximumScore ?? '—'} (${attempt.percentage.toFixed(1)}%)`}</td>
                <td><span className={attempt.status === 'submitted' ? 'badge-success' : 'badge-warning'}>{attempt.status}</span></td>
                <td><span className={attempt.evaluationStatus === 'evaluated' ? 'badge-success' : 'badge-gray'}>{attempt.evaluationStatus}</span></td>
                <td className="text-xs text-brand-muted">{attempt.submittedAt ? formatDateTime(attempt.submittedAt) : '—'}</td>
                <td>{attempt.employeeId && <Link to={`/admin/employees/${attempt.employeeId}`} className="btn-secondary btn-sm no-underline"><FileQuestion className="w-3.5 h-3.5" /> Details</Link>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !hasError && <EmptyState icon={FileQuestion} title="No submissions yet" description="Submitted employee attempts will appear here." />}
        {filtered.length === 0 && hasError && <EmptyState icon={FileQuestion} title="Submissions unavailable" description="Resolve the Supabase query or RLS issue, then refresh." />}
      </div>
    </AdminLayout>
  );
}
