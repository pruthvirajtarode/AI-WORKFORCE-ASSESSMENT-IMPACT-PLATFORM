import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Briefcase, Building2, Award, Clock, BarChart3, CheckCircle, Save } from 'lucide-react';
import { ROUTES, DEPARTMENT_MAP } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, formatDuration, formatDateTime, getAIReadinessLevel, AI_READINESS_CONFIG, COMPETENCY_LABELS } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';

export default function AdminEmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { employees } = useAdminData();
  const [trainerInput, setTrainerInput] = useState<string>('');
  const [saved, setSaved] = useState(false);

  const emp = employees.find((e) => e.id === id);

  if (!emp) {
    return (
      <AdminLayout>
        <div className="text-center py-24 text-brand-muted">
          Employee not found.{' '}
          <Link to={ROUTES.adminEmployees} className="text-brand-blue">Back to employees</Link>
        </div>
      </AdminLayout>
    );
  }

  const dept = DEPARTMENT_MAP[emp.departmentId as keyof typeof DEPARTMENT_MAP];
  const finalScore = emp.trainerMarks ?? emp.postScore ?? 0;
  const level = finalScore > 0 ? getAIReadinessLevel(finalScore) : null;
  const levelConfig = level ? AI_READINESS_CONFIG[level] : null;

  // Mock per-competency scores from the employee's post score
  const competencyKeys = Object.keys(COMPETENCY_LABELS) as (keyof typeof COMPETENCY_LABELS)[];
  const competencyData = competencyKeys.map((key, i) => {
    const variance = ((i * 17 + emp.id.charCodeAt(emp.id.length - 1)) % 20) - 10;
    const postC = emp.postScore !== null ? Math.max(10, Math.min(98, emp.postScore + variance * 0.8)) : null;
    return { key, label: COMPETENCY_LABELS[key], postC };
  });

  const handleSaveTrainerMark = () => {
    const val = parseFloat(trainerInput);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <AdminLayout>
      <Link to={ROUTES.adminEmployees} className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-navy mb-6 no-underline transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Employees
      </Link>

      {/* Profile Header */}
      <div className="card p-6 mb-5 flex flex-wrap gap-5 items-start">
        <div className="w-16 h-16 rounded-2xl gradient-navy flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">
            {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-brand-navy">{emp.name}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-brand-muted">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{emp.email}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{emp.role}</span>
            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{dept?.name}</span>
          </div>
          <div className="mt-3">
            <span className="badge-gray mr-2">{emp.employeeId}</span>
            {levelConfig && (
              <span className={`badge ${levelConfig.bgColor} ${levelConfig.color}`}>
                {levelConfig.label}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          {finalScore > 0 && (
            <>
              <div className="text-3xl font-bold text-brand-navy">{formatPercent(finalScore, 0)}</div>
              <div className="text-xs text-brand-muted">
                {emp.trainerMarks !== null ? 'Final Score (Trainer Marked)' : 'Provisional Score'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        {[
          {
            icon: BarChart3, label: 'Post Score',
            value: emp.postScore ? formatPercent(emp.postScore, 0) : 'Pending',
            sub: emp.postTimeTaken ? `Time: ${formatDuration(emp.postTimeTaken)}` : undefined,
            date: emp.postSubmittedAt,
          },
          {
            icon: Award, label: 'Trainer Marks',
            value: emp.trainerMarks ? formatPercent(emp.trainerMarks, 0) : 'Not Set',
            sub: 'Manual evaluation',
            date: null,
            highlight: emp.trainerMarks !== null,
          },
          {
            icon: CheckCircle, label: 'Final Score',
            value: finalScore > 0 ? formatPercent(finalScore, 0) : '—',
            sub: emp.trainerMarks !== null ? 'Trainer-marked' : 'Objective only',
            date: null,
            highlight: finalScore > 0,
          },
        ].map(({ icon: Icon, label, value, sub, date, highlight }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-brand-muted" />
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wide">{label}</span>
            </div>
            <div className={`text-2xl font-bold mb-1 ${highlight ? 'text-success-600' : 'text-brand-navy'}`}>
              {value}
            </div>
            {sub && <div className="text-xs text-brand-muted">{sub}</div>}
            {date && <div className="text-xs text-brand-muted mt-1">{formatDateTime(date)}</div>}
          </div>
        ))}
      </div>

      {/* Trainer Mark Entry */}
      {emp.postScore !== null && (
        <div className="card p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-brand-gold" />
            <h2 className="font-semibold text-brand-navy">Set / Update Trainer Mark</h2>
          </div>
          <p className="text-sm text-brand-muted mb-4">
            Enter the trainer-evaluated score (0–100%) for subjective answers. This will become the final score for this employee.
          </p>
          <div className="flex gap-3 max-w-sm">
            <div className="flex-1 relative">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={trainerInput}
                onChange={(e) => { setTrainerInput(e.target.value); setSaved(false); }}
                placeholder={emp.trainerMarks ? emp.trainerMarks.toFixed(1) : 'Enter score %'}
                className="input w-full pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">%</span>
            </div>
            <button
              onClick={handleSaveTrainerMark}
              className={`btn-primary gap-1.5 ${saved ? 'bg-success-600' : ''}`}
            >
              {saved ? <><CheckCircle className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save</>}
            </button>
          </div>
          {saved && (
            <p className="text-xs text-success-600 mt-2">
              Trainer mark saved. (In production this would persist to the database.)
            </p>
          )}
        </div>
      )}

      {/* Competency Detail */}
      {emp.postScore !== null && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-brand-gold" />
            <h2 className="font-semibold text-brand-navy">Competency-Level Scores</h2>
            <span className="text-xs text-brand-muted ml-2">(Provisional — objective questions only)</span>
          </div>
          <div className="space-y-4">
            {competencyData.map(({ key, label, postC }) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-brand-charcoal">{label}</span>
                  {postC !== null && (
                    <span className="text-xs font-semibold text-brand-navy">{formatPercent(postC, 0)}</span>
                  )}
                </div>
                {postC !== null && <ProgressBar value={postC} colorByScore height="sm" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {emp.postScore === null && (
        <div className="card p-8 text-center text-brand-muted">
          <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p>This employee has not yet submitted the post-training assessment.</p>
        </div>
      )}
    </AdminLayout>
  );
}
