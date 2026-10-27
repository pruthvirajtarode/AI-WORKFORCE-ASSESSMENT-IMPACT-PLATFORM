import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Download, FileText, Mail, Printer, RefreshCw } from 'lucide-react';
import assessmentsData from '@/data/departmentalAssessments.json';
import { DEPARTMENT_MAP, ROUTES } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatDateTime, formatDuration, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
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
  const employee = employees.find((item) => item.id === id);
  const employeeAttempts = useMemo(() => attempts
    .filter((attempt) => attempt.employeeId === id)
    .sort((a, b) => (b.submittedAt ?? b.startedAt).localeCompare(a.submittedAt ?? a.startedAt)), [attempts, id]);
  const selectedAttempt = employeeAttempts.find((attempt) => attempt.id === selectedAttemptId) ?? employeeAttempts[0];

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

  const buildPrintableHtml = () => {
    if (!selectedAttempt) return '';
    const answerRows = Object.entries(selectedAttempt.answers).map(([questionId, answer]) => {
      const rendered = typeof answer === 'string' ? answer : JSON.stringify(answer, null, 2);
      return `<tr><td style="font-family:monospace;font-size:12px;background:#f8fafc;font-weight:600">${escapeHtml(questionId)}</td><td>${escapeHtml(rendered)}</td></tr>`;
    }).join('');

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
    .btn-bar { margin-bottom: 24px; display: flex; gap: 10px; }
    .btn { background: #0f172a; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block; }
    @media print { .btn-bar { display: none !important; } body { margin: 0; padding: 0; max-width: 100%; } }
  </style>
</head>
<body>
  <div class="btn-bar">
    <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <h1>SUROJ × BE10X Assessment Result</h1>
  <div class="subtitle">Workforce Assessment & Impact Platform</div>
  
  <div class="meta-grid">
    <div class="meta-item"><span class="meta-label">Employee</span><span class="meta-val">${escapeHtml(employee.name)}</span></div>
    <div class="meta-item"><span class="meta-label">Employee ID</span><span class="meta-val">${escapeHtml(employee.employeeId)}</span></div>
    <div class="meta-item"><span class="meta-label">Email</span><span class="meta-val">${escapeHtml(employee.email)}</span></div>
    <div class="meta-item"><span class="meta-label">Department</span><span class="meta-val">${escapeHtml(department?.name ?? employee.departmentId)}</span></div>
    <div class="meta-item"><span class="meta-label">Assessment</span><span class="meta-val">${escapeHtml(selectedAttempt.assessmentTitle)}</span></div>
    <div class="meta-item"><span class="meta-label">Attempt</span><span class="meta-val">#${selectedAttempt.attemptNumber}</span></div>
    <div class="meta-item"><span class="meta-label">Submitted</span><span class="meta-val">${escapeHtml(selectedAttempt.submittedAt ? formatDateTime(selectedAttempt.submittedAt) : 'In progress')}</span></div>
    <div class="meta-item"><span class="meta-label">Duration</span><span class="meta-val">${selectedAttempt.timeTakenSeconds === null ? '—' : escapeHtml(formatDuration(selectedAttempt.timeTakenSeconds))}</span></div>
    <div class="meta-item"><span class="meta-label">Score</span><span class="meta-val">${selectedAttempt.rawScore ?? 'Not auto-scored'} / ${selectedAttempt.maximumScore ?? '—'}</span></div>
    <div class="meta-item"><span class="meta-label">Percentage</span><span class="meta-val">${selectedAttempt.percentage === null ? '—' : `${selectedAttempt.percentage.toFixed(1)}%`}</span></div>
    <div class="meta-item"><span class="meta-label">Status</span><span class="meta-val" style="text-transform: capitalize;">${escapeHtml(selectedAttempt.status)}</span></div>
    ${readiness ? `<div class="meta-item"><span class="meta-label">Readiness</span><span class="meta-val">${escapeHtml(readiness.label)}</span></div>` : ''}
  </div>

  <h2 style="margin-top: 32px; font-size: 18px; color: #0f172a;">Submitted Responses (${Object.keys(selectedAttempt.answers).length} Questions)</h2>
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
    const html = buildPrintableHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (employee.name || 'employee').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `Assessment_Result_${safeName}_Session_${selectedAttempt.sessionNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const printResult = () => {
    if (!selectedAttempt) return;
    const html = buildPrintableHtml();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } else {
      // Fallback if popup blocked: direct iframe print
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(html);
        frameDoc.close();
        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          setTimeout(() => document.body.removeChild(printFrame), 2000);
        }, 350);
      }
    }
  };

  const downloadCsv = () => {
    if (!selectedAttempt) return;
    const headers = ['Question ID', 'Response'];
    const rows = Object.entries(selectedAttempt.answers).map(([qId, ans]) => {
      const val = typeof ans === 'string' ? ans : JSON.stringify(ans);
      return `"${qId.replace(/"/g, '""')}","${val.replace(/"/g, '""')}"`;
    });
    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (employee.name || 'employee').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `Responses_${safeName}_Session_${selectedAttempt.sessionNumber}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
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
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={downloadResult} className="btn-primary btn-sm gap-1.5" disabled={!selectedAttempt} title="Download complete report"><Download className="w-4 h-4" /> Download Report</button>
            <button onClick={printResult} className="btn-secondary btn-sm gap-1.5" disabled={!selectedAttempt} title="Print or save as PDF"><Printer className="w-4 h-4" /> Print / PDF</button>
            <button onClick={downloadCsv} className="btn-secondary btn-sm gap-1.5" disabled={!selectedAttempt} title="Export answers to CSV"><FileText className="w-4 h-4" /> Export CSV</button>
          </div>
        </div>

        {selectedAttempt && <>
          <div className="card p-6 mb-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div><div className="kpi-label">Assessment</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.assessmentTitle}</div></div>
              <div><div className="kpi-label">Submitted</div><div className="text-sm text-brand-charcoal mt-1">{selectedAttempt.submittedAt ? formatDateTime(selectedAttempt.submittedAt) : 'In progress'}</div></div>
              <div><div className="kpi-label">Score</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.rawScore === null ? 'Not auto-scored' : `${selectedAttempt.rawScore} / ${selectedAttempt.maximumScore ?? '—'}`}</div></div>
              <div><div className="kpi-label">Evaluation</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.rawScore === null ? 'Submitted' : selectedAttempt.evaluationStatus}</div></div>
              <div><div className="kpi-label">Percentage</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.percentage === null ? '—' : `${selectedAttempt.percentage.toFixed(1)}%`}</div></div>
              <div><div className="kpi-label">Submission</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.status}</div></div>
              <div><div className="kpi-label">Attempt</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.attemptNumber}</div></div>
              <div><div className="kpi-label">Duration</div><div className="font-semibold text-brand-navy mt-1">{selectedAttempt.timeTakenSeconds === null ? '—' : formatDuration(selectedAttempt.timeTakenSeconds)}</div></div>
            </div>
            {readiness && <div className="mt-5"><span className={`badge ${readiness.bgColor} ${readiness.color}`}>{readiness.label}</span></div>}
            {selectedAttempt.status === 'submitted' && selectedAttempt.rawScore === null && <p className="text-xs text-brand-muted mt-5">Submission recorded automatically. Submitted answers are shown below; a numeric score is unavailable because answer keys are not configured in this application.</p>}
          </div>
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
