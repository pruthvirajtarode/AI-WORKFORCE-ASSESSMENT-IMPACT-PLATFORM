import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Briefcase, Building2, Award, Clock, BarChart3, TrendingUp } from 'lucide-react';
import { ROUTES, DEPARTMENT_MAP } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, formatDuration, formatDateTime, getAIReadinessLevel, AI_READINESS_CONFIG, COMPETENCY_LABELS } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';

export default function AdminEmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { employees } = useAdminData();

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
  const improvement = (emp.preScore && emp.postScore) ? emp.postScore - emp.preScore : null;
  const displayScore = emp.postScore ?? emp.preScore ?? 0;
  const level = getAIReadinessLevel(displayScore);
  const levelConfig = AI_READINESS_CONFIG[level];

  // Mock per-competency scores derived from the employee's overall scores
  const competencyKeys = Object.keys(COMPETENCY_LABELS) as (keyof typeof COMPETENCY_LABELS)[];
  const competencyData = competencyKeys.map((key, i) => {
    const variance = ((i * 17 + emp.id.charCodeAt(emp.id.length - 1)) % 20) - 10;
    const preC = emp.preScore !== null ? Math.max(10, Math.min(95, emp.preScore + variance)) : null;
    const postC = emp.postScore !== null ? Math.max(10, Math.min(98, (emp.postScore ?? 0) + variance * 0.8)) : null;
    return { key, label: COMPETENCY_LABELS[key], preC, postC };
  });

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
            <span className={`badge ${levelConfig.bgColor} ${levelConfig.color}`}>
              {levelConfig.label}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          {displayScore > 0 && (
            <>
              <div className="text-3xl font-bold text-brand-navy">{formatPercent(displayScore, 0)}</div>
              <div className="text-xs text-brand-muted">{emp.postScore ? 'Post-Training' : 'Pre-Training'} Score</div>
            </>
          )}
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        {[
          {
            icon: BarChart3, label: 'Pre-Assessment',
            value: emp.preScore ? formatPercent(emp.preScore, 0) : 'Not taken',
            sub: emp.preTimeTaken ? `Time: ${formatDuration(emp.preTimeTaken)}` : undefined,
            date: emp.preSubmittedAt,
          },
          {
            icon: TrendingUp, label: 'Post-Assessment',
            value: emp.postScore ? formatPercent(emp.postScore, 0) : 'Pending',
            sub: emp.postTimeTaken ? `Time: ${formatDuration(emp.postTimeTaken)}` : undefined,
            date: emp.postSubmittedAt,
          },
          {
            icon: Award, label: 'Improvement',
            value: improvement !== null ? `${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%` : '—',
            sub: 'Pre → Post delta',
            date: null,
            highlight: improvement !== null && improvement > 0,
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

      {/* Competency Detail */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-brand-gold" />
          <h2 className="font-semibold text-brand-navy">Competency-Level Analysis</h2>
          <div className="ml-auto flex items-center gap-4 text-xs text-brand-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-brand-muted/30" /> Pre</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-brand-navy" /> Post</span>
          </div>
        </div>
        <div className="space-y-5">
          {competencyData.map(({ key, label, preC, postC }) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-brand-charcoal">{label}</span>
                <div className="flex items-center gap-3 text-xs">
                  {preC !== null && <span className="text-brand-muted">{formatPercent(preC, 0)}</span>}
                  {postC !== null && (
                    <span className={`font-semibold ${
                      preC && postC > preC ? 'text-success-600' : 'text-brand-navy'
                    }`}>
                      {formatPercent(postC, 0)}{preC && postC > preC ? ' ↑' : ''}
                    </span>
                  )}
                </div>
              </div>
              {preC !== null && <ProgressBar value={preC} height="sm" color="bg-brand-muted/25" className="mb-1" />}
              {postC !== null && <ProgressBar value={postC} colorByScore height="sm" />}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
