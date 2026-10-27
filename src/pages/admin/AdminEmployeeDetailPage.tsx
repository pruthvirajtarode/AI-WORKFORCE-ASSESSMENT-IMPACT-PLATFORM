import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Download, FileText, Mail, Printer, RefreshCw, Award, CheckCircle, AlertCircle } from 'lucide-react';
import assessmentsData from '@/data/departmentalAssessments.json';
import { DEPARTMENT_MAP, ROUTES } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatDateTime, formatDuration, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
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
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const employee = employees.find((item) => item.id === id);
  const employeeAttempts = useMemo(() => attempts
    .filter((attempt) => attempt.employeeId === id)
    .sort((a, b) => (b.submittedAt ?? b.startedAt).localeCompare(a.submittedAt ?? a.startedAt)), [attempts, id]);
  const selectedAttempt = employeeAttempts.find((attempt) => attempt.id === selectedAttemptId) ?? employeeAttempts[0];

  useEffect(() => {
    if (selectedAttempt) {
      setScoreInput(selectedAttempt.rawScore !== null ? String(selectedAttempt.rawScore) : '');
      setSaveError(null);
    }
  }, [selectedAttempt?.id, selectedAttempt?.rawScore]);

  if (isLoading) return <LoadingScreen />;
  if (!employee) {
    return <AdminLayout><EmptyState title="Employee not found" description="This employee profile is not available in Supabase." action={<Link to={ROUTES.adminEmployees} className="btn-secondary no-underline">Back to employees</Link>} /></AdminLayout>;
  }

  const department = departments.find((item) => item.id === employee.departmentId)
    ?? DEPARTMENT_MAP[employee.departmentId as keyof typeof DEPARTMENT_MAP];
  const maxScore = selectedAttempt?.maximumScore || 30;
  const rawScoreNum = Number(scoreInput);
  const calculatedPct = Number.isFinite(rawScoreNum) && rawScoreNum >= 0 && maxScore > 0
    ? Math.min(100, Math.round((rawScoreNum / maxScore) * 1000) / 10)
    : (selectedAttempt?.percentage ?? null);

  const effectivePercentage = selectedAttempt?.percentage ?? (calculatedPct !== null ? calculatedPct : null);
  const readiness = effectivePercentage !== null
    ? AI_READINESS_CONFIG[getAIReadinessLevel(effectivePercentage)]
    : null;

  const applyQuickScore = (targetPct: number) => {
    const calculated = Math.round((targetPct / 100) * maxScore * 10) / 10;
    setScoreInput(String(calculated));
  };

  const handleSaveScore = async () => {
    if (!selectedAttempt) return;
    const num = Number(scoreInput);
    if (!Number.isFinite(num) || num < 0 || num > maxScore) {
      setSaveError(`Please enter a valid score between 0 and ${maxScore}.`);
      return;
    }
    setIsSavingScore(true);
    setSaveError(null);
    const pct = Math.round((num / maxScore) * 1000) / 10;

    const { error } = await supabase
      .from('assessment_attempts')
      .update({
        raw_score: num,
        maximum_score: maxScore,
        percentage: pct,
        evaluation_status: 'evaluated',
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedAttempt.id);

    setIsSavingScore(false);
    if (error) {
      setSaveError('Failed to save evaluation: ' + error.message);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await refresh();
    }
  };

  const getAnswersList = () => {
    if (!selectedAttempt?.answers) return [];
    let answers = selectedAttempt.answers;
    if (typeof answers === 'string') {
      try { answers = JSON.parse(answers); } catch { answers = {}; }
    }
    if (!answers || typeof answers !== 'object') return [];
    return Object.entries(answers).map(([qId, val]) => ({
      questionId: String(qId),
      response: typeof val === 'string' ? val : JSON.stringify(val, null, 2),
    }));
  };

  const buildPrintableHtml = () => {
    if (!selectedAttempt) return '';
    const answersList = getAnswersList();
    const answerRows = answersList.length === 0
      ? '<tr><td colspan="2" style="text-align:center;color:#64748b;padding:20px">No responses recorded</td></tr>'
      : answersList.map(({ questionId, response }) =>
          `<tr><td style="font-family:monospace;font-size:12px;background:#f8fafc;font-weight:600;width:25%">${escapeHtml(questionId)}</td><td>${escapeHtml(response)}</td></tr>`
        ).join('');

    const displayScore = selectedAttempt.rawScore !== null ? `${selectedAttempt.rawScore} / ${maxScore}` : 'Not evaluated yet';
    const displayPct = selectedAttempt.percentage !== null ? `${selectedAttempt.percentage.toFixed(1)}%` : 'Pending evaluation';
    const displayReadiness = readiness?.label ?? 'Pending';

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Assessment Result - ${escapeHtml(employee.name)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 24px; line-height: 1.5; }
    h1 { font-size: 24px; color: #0f172a; margin-bottom: 4px; }
    .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .meta-item { display: flex; flex-direction: column; }
    .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; }
    .meta-val { font-size: 14px; color: #0f172a; font-weight: 600; margin-top: 2px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; vertical-align: top; white-space: pre-wrap; }
    th { background: #0f172a; color: #fff; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #e0f2fe; color: #0369a1; }
    .btn-bar { margin-bottom: 24px; display: flex; gap: 10px; }
    .btn { background: #0f172a; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; }
    @media print { .btn-bar { display: none !important; } body { margin: 0; padding: 0; max-width: 100%; } }
  </style>
</head>
<body>
  <div class="btn-bar">
    <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <h1>SUROJ × BE10X Assessment Result</h1>
  <div class="subtitle">AI Workforce Assessment & Impact Platform</div>
  
  <div class="meta-grid">
    <div class="meta-item"><span class="meta-label">Employee Name</span><span class="meta-val">${escapeHtml(employee.name)}</span></div>
    <div class="meta-item"><span class="meta-label">Employee ID</span><span class="meta-val">${escapeHtml(employee.employeeId)}</span></div>
    <div class="meta-item"><span class="meta-label">Email Address</span><span class="meta-val">${escapeHtml(employee.email)}</span></div>
    <div class="meta-item"><span class="meta-label">Department</span><span class="meta-val">${escapeHtml(department?.name ?? employee.departmentId)}</span></div>
    <div class="meta-item"><span class="meta-label">Assessment Session</span><span class="meta-val">${escapeHtml(selectedAttempt.assessmentTitle)}</span></div>
    <div class="meta-item"><span class="meta-label">Attempt Number</span><span class="meta-val">#${selectedAttempt.attemptNumber}</span></div>
    <div class="meta-item"><span class="meta-label">Submission Date</span><span class="meta-val">${escapeHtml(selectedAttempt.submittedAt ? formatDateTime(selectedAttempt.submittedAt) : 'In progress')}</span></div>
    <div class="meta-item"><span class="meta-label">Time Taken</span><span class="meta-val">${selectedAttempt.timeTakenSeconds === null ? '—' : escapeHtml(formatDuration(selectedAttempt.timeTakenSeconds))}</span></div>
    <div class="meta-item"><span class="meta-label">Evaluation Status</span><span class="meta-val" style="text-transform: capitalize;">${escapeHtml(selectedAttempt.evaluationStatus)}</span></div>
    <div class="meta-item"><span class="meta-label">Final Score</span><span class="meta-val">${displayScore}</span></div>
    <div class="meta-item"><span class="meta-label">Final Percentage</span><span class="meta-val" style="font-size: 16px; color: #0284c7;">${displayPct}</span></div>
    <div class="meta-item"><span class="meta-label">AI Readiness Level</span><span class="meta-val"><span class="badge">${escapeHtml(displayReadiness)}</span></span></div>
  </div>

  <h2 style="margin-top: 32px; font-size: 18px; color: #0f172a;">Submitted Responses (${answersList.length} Questions)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Question ID</th>
        <th>Recorded Response</th>
      </tr>
    </thead>
    <tbody>${answerRows}</tbody>
  </table>
</body>
</html>`;
  };

  const downloadResult = () => {
    if (!selectedAttempt) return;
    try {
      const html = buildPrintableHtml();
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (employee.name || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `Assessment_Result_${safeName}_Session_${selectedAttempt.sessionNumber}.html`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 500);
    } catch (e) {
      console.error('Download error:', e);
      alert('Could not generate download file.');
    }
  };

  const printResult = () => {
    window.print();
  };

  const downloadCsv = () => {
    if (!selectedAttempt) return;
    const answersList = getAnswersList();
    const headers = ['Question ID', 'Response'];
    const rows = answersList.map(({ questionId, response }) => {
      return `"${questionId.replace(/"/g, '""')}","${response.replace(/"/g, '""')}"`;
    });
    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (employee.name || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `Responses_${safeName}_Session_${selectedAttempt.sessionNumber}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <AdminLayout>
      <Link to={ROUTES.adminEmployees} className="inline-flex items-center gap-2 text-sm text-brand-muted no-underline mb-6 print:hidden">
        <ArrowLeft className="w-4 h-4" /> Employees
      </Link>
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{employee.name}</h1>
          <p className="page-subtitle">{employee.employeeId} · {employee.role || 'Employee'}</p>
        </div>
        <button onClick={() => void refresh()} className="btn-secondary btn-sm print:hidden" title="Refresh employee results">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      {hasError && <div role="alert" className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-5 text-sm text-danger-700 print:hidden">Some Supabase result data could not be loaded.</div>}

      <section className="grid sm:grid-cols-3 gap-4 border-y border-brand-border py-4 mb-7">
        <div className="flex items-center gap-2 text-sm text-brand-charcoal"><Mail className="w-4 h-4 text-brand-muted" />{employee.email}</div>
        <div className="flex items-center gap-2 text-sm text-brand-charcoal"><Building2 className="w-4 h-4 text-brand-muted" />{department?.name ?? employee.departmentId}</div>
        <div className="text-sm text-brand-muted">{employeeAttempts.length} assessment attempt{employeeAttempts.length === 1 ? '' : 's'}</div>
      </section>

      {employeeAttempts.length === 0 ? (
        <EmptyState icon={FileText} title="No assessment results available" description="This employee has no attempts recorded in Supabase." />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
            <label className="text-xs font-semibold text-brand-muted">
              Assessment result
              <select value={selectedAttempt?.id ?? ''} onChange={(event) => setSelectedAttemptId(event.target.value)} className="select ml-3 text-sm">
                {employeeAttempts.map((attempt) => (
                  <option key={attempt.id} value={attempt.id}>
                    Session {String(attempt.sessionNumber).padStart(2, '0')} · {attempt.assessmentTitle} · {attempt.status}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={downloadResult} className="btn-primary btn-sm gap-1.5" disabled={!selectedAttempt} title="Download complete HTML report">
                <Download className="w-4 h-4" /> Download Report
              </button>
              <button onClick={printResult} className="btn-secondary btn-sm gap-1.5" disabled={!selectedAttempt} title="Print or save as PDF">
                <Printer className="w-4 h-4" /> Print / PDF
              </button>
              <button onClick={downloadCsv} className="btn-secondary btn-sm gap-1.5" disabled={!selectedAttempt} title="Export answers to CSV">
                <FileText className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {selectedAttempt && (
            <>
              {/* Score Evaluation Card */}
              <div className="card p-6 mb-6 bg-brand-cream/30 border border-brand-gold/40 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-brand-navy text-base flex items-center gap-2">
                      <Award className="w-5 h-5 text-brand-gold" />
                      Assessment Evaluation & Score Entry
                    </h3>
                    <p className="text-xs text-brand-muted mt-0.5">
                      Enter the evaluated score for this submission or use quick scoring to generate client reports.
                    </p>
                  </div>
                  {selectedAttempt.evaluationStatus === 'evaluated' && (
                    <span className="badge bg-success-100 text-success-800 font-semibold px-2.5 py-1">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Evaluated
                    </span>
                  )}
                </div>

                {saveError && (
                  <div className="flex items-center gap-2 text-danger-700 bg-danger-50 border border-danger-200 rounded-lg p-3 text-sm mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-success-800 bg-success-50 border border-success-200 rounded-lg p-3 text-sm mb-4">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Score and evaluation saved successfully!</span>
                  </div>
                )}

                <div className="grid sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="label">Awarded Score</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={maxScore}
                        step="0.5"
                        value={scoreInput}
                        onChange={(e) => setScoreInput(e.target.value)}
                        placeholder="e.g. 25.5"
                        className="input w-full font-semibold"
                      />
                      <span className="text-sm font-semibold text-brand-muted shrink-0">
                        / {maxScore}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="label">Calculated Percentage</label>
                    <div className="input bg-white font-bold text-brand-navy flex items-center">
                      {calculatedPct !== null ? `${calculatedPct.toFixed(1)}%` : '—'}
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleSaveScore}
                      disabled={isSavingScore || !scoreInput}
                      className="btn-primary w-full btn-md"
                    >
                      {isSavingScore ? 'Saving...' : 'Save Evaluation'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-border/60 flex flex-wrap items-center gap-2 text-xs text-brand-muted">
                  <span className="font-medium">Quick scoring presets:</span>
                  <button
                    type="button"
                    onClick={() => applyQuickScore(80)}
                    className="px-2.5 py-1 rounded bg-white border border-brand-border hover:border-brand-navy text-brand-charcoal font-medium transition-colors"
                  >
                    80% (Proficient)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickScore(85)}
                    className="px-2.5 py-1 rounded bg-white border border-brand-border hover:border-brand-navy text-brand-charcoal font-medium transition-colors"
                  >
                    85% (Advanced)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickScore(90)}
                    className="px-2.5 py-1 rounded bg-white border border-brand-border hover:border-brand-navy text-brand-charcoal font-medium transition-colors"
                  >
                    90% (AI Leader)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickScore(95)}
                    className="px-2.5 py-1 rounded bg-white border border-brand-border hover:border-brand-navy text-brand-charcoal font-medium transition-colors"
                  >
                    95% (Expert)
                  </button>
                </div>
              </div>

              {/* Status and KPI Card */}
              <div className="card p-6 mb-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <div className="kpi-label">Assessment</div>
                    <div className="font-semibold text-brand-navy mt-1">{selectedAttempt.assessmentTitle}</div>
                  </div>
                  <div>
                    <div className="kpi-label">Submitted</div>
                    <div className="text-sm text-brand-charcoal mt-1">
                      {selectedAttempt.submittedAt ? formatDateTime(selectedAttempt.submittedAt) : 'In progress'}
                    </div>
                  </div>
                  <div>
                    <div className="kpi-label">Score</div>
                    <div className="font-semibold text-brand-navy mt-1">
                      {selectedAttempt.rawScore !== null ? `${selectedAttempt.rawScore} / ${maxScore}` : 'Not evaluated yet'}
                    </div>
                  </div>
                  <div>
                    <div className="kpi-label">Evaluation</div>
                    <div className="font-semibold text-brand-navy mt-1 capitalize">
                      {selectedAttempt.evaluationStatus}
                    </div>
                  </div>
                  <div>
                    <div className="kpi-label">Percentage</div>
                    <div className="font-semibold text-brand-navy mt-1 text-lg text-brand-navy">
                      {selectedAttempt.percentage !== null ? `${selectedAttempt.percentage.toFixed(1)}%` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="kpi-label">Submission</div>
                    <div className="font-semibold text-brand-navy mt-1 capitalize">{selectedAttempt.status}</div>
                  </div>
                  <div>
                    <div className="kpi-label">Attempt</div>
                    <div className="font-semibold text-brand-navy mt-1">#{selectedAttempt.attemptNumber}</div>
                  </div>
                  <div>
                    <div className="kpi-label">Duration</div>
                    <div className="font-semibold text-brand-navy mt-1">
                      {selectedAttempt.timeTakenSeconds === null ? '—' : formatDuration(selectedAttempt.timeTakenSeconds)}
                    </div>
                  </div>
                </div>
                {readiness && (
                  <div className="mt-5">
                    <span className={`badge ${readiness.bgColor} ${readiness.color} font-semibold px-3 py-1 text-sm`}>
                      {readiness.label}
                    </span>
                  </div>
                )}
                {selectedAttempt.status === 'submitted' && selectedAttempt.rawScore === null && (
                  <p className="text-xs text-brand-muted mt-5">
                    Submission recorded. Use the Evaluation & Score Entry card above to set the score and percentage.
                  </p>
                )}
              </div>

              {/* Submitted Responses Table */}
              <section className="card p-6">
                <h2 className="font-semibold text-brand-navy mb-4">Submitted responses ({getAnswersList().length} recorded)</h2>
                <div className="divide-y divide-brand-border">
                  {getAnswersList().map(({ questionId, response }) => (
                    <div key={questionId} className="py-3 grid sm:grid-cols-[10rem_1fr] gap-2">
                      <span className="font-mono text-xs text-brand-muted font-semibold">{questionId}</span>
                      <span className="text-sm text-brand-charcoal whitespace-pre-wrap">{response}</span>
                    </div>
                  ))}
                  {getAnswersList().length === 0 && (
                    <p className="text-sm text-brand-muted py-4 text-center">No submitted responses recorded for this attempt.</p>
                  )}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </AdminLayout>
  );
}
