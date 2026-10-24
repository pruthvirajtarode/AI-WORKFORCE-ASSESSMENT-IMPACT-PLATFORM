import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Download, FileText, Mail, Printer, RefreshCw } from 'lucide-react';
import assessmentsData from '@/data/departmentalAssessments.json';
import { DEPARTMENT_MAP, ROUTES } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatDateTime, formatDuration, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { DepartmentalAssessment } from '@/types/departmentalAssessment';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';

const assessments = assessmentsData as unknown as DepartmentalAssessment[];

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character);
}

export default function AdminEmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { employees, attempts, departments, isLoading, hasError, refresh } = useAdminData();
  const [selectedAttemptId, setSelectedAttemptId] = useState('');
  const [scoreInput, setScoreInput] = useState('');
  const [evaluationError, setEvaluationError] = useState('');
  const [evaluationSaved, setEvaluationSaved] = useState(false);
  const employee = employees.find((item) => item.id === id);
  const employeeAttempts = useMemo(() => attempts
    .filter((attempt) => attempt.employeeId === id)
    .sort((a, b) => (b.submittedAt ?? b.startedAt).localeCompare(a.submittedAt ?? a.startedAt)), [attempts, id]);
  const selectedAttempt = employeeAttempts.find((attempt) => attempt.id === selectedAttemptId) ?? employeeAttempts[0];

  useEffect(() => {
    setScoreInput(selectedAttempt?.rawScore === null || selectedAttempt?.rawScore === undefined ? '' : String(selectedAttempt.rawScore));
    setEvaluationError('');
    setEvaluationSaved(false);
  }, [selectedAttempt]);

  if (isLoading) return <LoadingScreen />;
  if (!employee) {
    return <AdminLayout><EmptyState title="Employee not found" description="This employee profile is not available in Supabase." action={<Link to={ROUTES.adminEmployees} className="btn-secondary no-underline">Back to employees</Link>} /></AdminLayout>;
  }

  const department = departments.find((item) => item.id === employee.departmentId)
    ?? DEPARTMENT_MAP[employee.departmentId as keyof typeof DEPARTMENT_MAP];
  const session = selectedAttempt ? assessments.find((assessment) => assessment.number === selectedAttempt.sessionNumber) : null;
  const readiness = selectedAttempt?.percentage === null || selectedAttempt?.percentage === undefined
    ? null
    : AI_READINESS_CONFIG[getAIReadinessLevel(selectedAttempt.percentage)];

  const downloadResult = () => {
    if (!selectedAttempt) return;
    const answerRows = Object.entries(selectedAttempt.answers).map(([questionId, answer]) => {
      const rendered = typeof answer === 'string' ? answer : JSON.stringify(answer);
      return `<tr><td>${escapeHtml(questionId)}</td><td>${escapeHtml(rendered)}</td></tr>`;
    }).join('');
    const printable = `<!doctype html><html><head><meta charset="utf-8"><title>Assessment Result - ${escapeHtml(employee.name)}</title><style>body{font:14px Arial,sans-serif;color:#222;max-width:900px;margin:40px auto}h1{font-size:22px}h2{font-size:16px;margin-top:28px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px}.meta div{border-bottom:1px solid #ddd;padding:8px 0}table{border-collapse:collapse;width:100%;margin-top:12px}th,td{border:1px solid #ccc;padding:8px;text-align:left;vertical-align:top;white-space:pre-wrap}button{padding:10px 16px}@media print{button{display:none}body{margin:0 auto}}</style></head><body><button onclick="window.print()">Print / Save as PDF</button><h1>SUROJ × BE10X Assessment Result</h1><div class="meta"><div><b>Employee</b><br>${escapeHtml(employee.name)}</div><div><b>Employee ID</b><br>${escapeHtml(employee.employeeId)}</div><div><b>Email</b><br>${escapeHtml(employee.email)}</div><div><b>Department</b><br>${escapeHtml(department?.name ?? employee.departmentId)}</div><div><b>Assessment</b><br>${escapeHtml(selectedAttempt.assessmentTitle)}</div><div><b>Attempt</b><br>${selectedAttempt.attemptNumber}</div><div><b>Submitted</b><br>${escapeHtml(selectedAttempt.submittedAt ? formatDateTime(selectedAttempt.submittedAt) : 'In progress')}</div><div><b>Time taken</b><br>${selectedAttempt.timeTakenSeconds === null ? '—' : escapeHtml(formatDuration(selectedAttempt.timeTakenSeconds))}</div><div><b>Result</b><br>${selectedAttempt.rawScore ?? 'Pending'} / ${selectedAttempt.maximumScore ?? '—'}</div><div><b>Percentage</b><br>${selectedAttempt.percentage === null ? 'Pending evaluation' : `${selectedAttempt.percentage.toFixed(1)}%`}</div><div><b>Evaluation status</b><br>${escapeHtml(selectedAttempt.evaluationStatus)}</div>${readiness ? `<div><b>Readiness</b><br>${escapeHtml(readiness.label)}</div>` : ''}</div><h2>Submitted responses</h2><table><thead><tr><th>Question ID</th><th>Response</th></tr></thead><tbody>${answerRows}</tbody></table><script>window.addEventListener('load',()=>window.print())</script></body></html>`;
    const blob = new Blob([printable], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const resultWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!resultWindow) URL.revokeObjectURL(url);
  };

  const saveEvaluation = async () => {
    if (!selectedAttempt || selectedAttempt.status !== 'submitted') return;
    if (!isSupabaseConfigured) {
      setEvaluationError('Supabase is not configured; evaluation cannot be saved.');
      return;
    }
    const rawScore = Number(scoreInput);
    const maximumScore = selectedAttempt.maximumScore;
    if (maximumScore === null || !Number.isFinite(maximumScore) || maximumScore <= 0) {
      setEvaluationError('This attempt has no valid maximum score.');
      return;
    }
    if (!Number.isFinite(rawScore) || rawScore < 0 || rawScore > maximumScore) {
      setEvaluationError(`Enter a score between 0 and ${maximumScore}.`);
      return;
    }

    const percentage = Math.round((rawScore / maximumScore) * 10000) / 100;
    const { data, error } = await supabase.from('assessment_attempts')
      .update({ raw_score: rawScore, percentage, evaluation_status: 'evaluated', updated_at: new Date().toISOString() })
      .eq('id', selectedAttempt.id)
      .eq('status', 'submitted')
      .select('id, raw_score, percentage, evaluation_status')
      .single();
    if (error || data?.evaluation_status !== 'evaluated') {
      console.error('[Assessment evaluation] Could not save evaluation', error);
      setEvaluationError('The score could not be saved. Verify admin access and the applied database migration.');
      return;
    }
    setEvaluationSaved(true);
    await refresh();
  };

  return (
    <AdminLayout>
      <Link to={ROUTES.adminEmployees} className="inline-flex items-center gap-2 text-sm text-brand-muted no-underline mb-6"><ArrowLeft className="w-4 h-4" /> Employees</Link>
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{employee.name}</h1>
          <p className="page-subtitle">{employee.employeeId} · {employee.role || 'Employee'}</p>
        </div>
        <button onClick={() => void refresh()} className="btn-secondary btn-sm" title="Refresh employee results"><RefreshCw className="w-4 h-4" /></button>
      </div>
      {hasError && <div role="alert" className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-5 text-sm text-danger-700">Some Supabase result data could not be loaded.</div>}

      <section className="grid sm:grid-cols-3 gap-4 border-y border-brand-border py-4 mb-7">
        <div className="flex items-center gap-2 text-sm text-brand-charcoal"><Mail className="w-4 h-4 text-brand-muted" />{employee.email}</div>
        <div className="flex items-center gap-2 text-sm text-brand-charcoal"><Building2 className="w-4 h-4 text-brand-muted" />{department?.name ?? employee.departmentId}</div>
        <div className="text-sm text-brand-muted">{employeeAttempts.length} assessment attempt{employeeAttempts.length === 1 ? '' : 's'}</div>
      </section>

      {employeeAttempts.length === 0 ? <EmptyState icon={FileText} title="No assessment results available" description="This employee has no attempts recorded in Supabase." /> : <>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <label className="text-xs font-semibold text-brand-muted">Assessment result
            <select value={selectedAttempt?.id ?? ''} onChange={(event) => setSelectedAttemptId(event.target.value)} className="select ml-3 text-sm">
              {employeeAttempts.map((attempt) => <option key={attempt.id} value={attempt.id}>Session {String(attempt.sessionNumber).padStart(2, '0')} · {attempt.assessmentTitle} · {attempt.status}</option>)}
            </select>
          </label>
          <button onClick={downloadResult} className="btn-primary btn-sm gap-1.5" disabled={!selectedAttempt}><Download className="w-4 h-4" /> Download Result</button>
        </div>

        {selectedAttempt && <>
          <div className="card p-6 mb-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div><div className="kpi-label">Assessment</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.assessmentTitle}</div></div>
              <div><div className="kpi-label">Submitted</div><div className="text-sm text-brand-charcoal mt-1">{selectedAttempt.submittedAt ? formatDateTime(selectedAttempt.submittedAt) : 'In progress'}</div></div>
              <div><div className="kpi-label">Score</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.rawScore === null ? 'Pending evaluation' : `${selectedAttempt.rawScore} / ${selectedAttempt.maximumScore ?? '—'}`}</div></div>
              <div><div className="kpi-label">Evaluation</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.evaluationStatus}</div></div>
              <div><div className="kpi-label">Percentage</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.percentage === null ? '—' : `${selectedAttempt.percentage.toFixed(1)}%`}</div></div>
              <div><div className="kpi-label">Submission</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.status}</div></div>
              <div><div className="kpi-label">Attempt</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.attemptNumber}</div></div>
              <div><div className="kpi-label">Duration</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.timeTakenSeconds === null ? '—' : formatDuration(selectedAttempt.timeTakenSeconds)}</div></div>
            </div>
            {readiness && <div className="mt-5"><span className={`badge ${readiness.bgColor} ${readiness.color}`}>{readiness.label}</span></div>}
            {selectedAttempt.status === 'submitted' && selectedAttempt.evaluationStatus === 'pending' && <p className="text-xs text-brand-muted mt-5">Score is pending trainer evaluation. The source answer keys are not stored in this application, so no marks are inferred.</p>}
          </div>
          {selectedAttempt.status === 'submitted' && <section className="card p-6 mb-5">
            <h2 className="font-semibold text-brand-navy mb-2">Trainer evaluation</h2>
            <p className="text-sm text-brand-muted mb-4">Enter the reviewed total using the source assessment rubric. Maximum: {selectedAttempt.maximumScore ?? 'Unavailable'} marks.</p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs font-semibold text-brand-muted">Obtained marks
                <input type="number" min={0} max={selectedAttempt.maximumScore ?? undefined} step="0.5" value={scoreInput} onChange={(event) => { setScoreInput(event.target.value); setEvaluationSaved(false); }} className="input mt-1 w-40" />
              </label>
              <button onClick={() => void saveEvaluation()} className="btn-primary btn-sm">Save evaluation</button>
              {evaluationSaved && <span role="status" className="text-sm text-success-700">Evaluation saved.</span>}
            </div>
            {evaluationError && <p role="alert" className="text-sm text-danger-700 mt-3">{evaluationError}</p>}
          </section>}
          <section className="card p-6">
            <h2 className="font-semibold text-brand-navy mb-4">Submitted responses</h2>
            <div className="divide-y divide-brand-border">
              {Object.entries(selectedAttempt.answers).map(([questionId, answer]) => (
                <div key={questionId} className="py-3 grid sm:grid-cols-[8rem_1fr] gap-2">
                  <span className="font-mono text-xs text-brand-muted">{questionId}</span>
                  <span className="text-sm text-brand-charcoal whitespace-pre-wrap">{typeof answer === 'string' ? answer : JSON.stringify(answer, null, 2)}</span>
                </div>
              ))}
            </div>
          </section>
        </>}
      </>}
    </AdminLayout>
  );
}
