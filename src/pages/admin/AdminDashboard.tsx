import { Link } from 'react-router-dom';
import {
  Users, ClipboardList, ArrowUpRight,
  BarChart3, Brain, CheckCircle, ChevronRight, Award, Target,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';

function KpiCard({
  icon: Icon, label, value, sub, accent = false,
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`kpi-card ${accent ? 'gradient-navy' : ''}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent ? 'bg-white/15' : 'bg-brand-cream'}`}>
        <Icon className={`w-4.5 h-4.5 ${accent ? 'text-brand-gold' : 'text-brand-navy'}`} style={{ width: '1.125rem', height: '1.125rem' }} />
      </div>
      <div>
        <div className={`kpi-label ${accent ? 'text-white/50' : ''}`}>{label}</div>
        <div className={`kpi-value ${accent ? 'text-white' : ''}`}>{value}</div>
        {sub && <div className={`kpi-sub ${accent ? 'text-white/40' : ''}`}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const {
    totalEmployees, submitted, employeesSubmitted, evaluated,
    overallAvg, hasScores, isLoading, hasError, deptStats, competencyStats, readinessDistribution, recentSubmissions,
  } = useAdminData();

  const completionPct = totalEmployees > 0 ? (employeesSubmitted / totalEmployees) * 100 : 0;
  const evaluatedPct = submitted > 0 ? (evaluated / submitted) * 100 : 0;

  const topDept = deptStats.filter((department) => department.hasScores).sort((a, b) => b.avgScore - a.avgScore)[0];

  if (isLoading) return <LoadingScreen />;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Platform Overview</h1>
          <p className="page-subtitle">
            SUROJ × BE10X · Department Assessment Sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={ROUTES.adminAnalytics} className="btn-secondary btn-sm gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </Link>
          <Link to={ROUTES.adminSubmissions} className="btn-primary btn-sm gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" /> Submissions
          </Link>
        </div>
      </div>

      {hasError && <div role="alert" className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-5 text-sm text-danger-700">Live admin data could not be loaded. Check Supabase connectivity and administrator RLS policies, then refresh.</div>}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={Users} label="Total Employees" value={totalEmployees} sub="Across 6 departments" accent />
        <KpiCard icon={ClipboardList} label="Submitted Attempts" value={submitted} sub={totalEmployees ? `${formatPercent(completionPct, 0)} employees completed` : 'No active employees'} />
        <KpiCard icon={CheckCircle} label="Evaluated" value={evaluated} sub={submitted ? `${formatPercent(evaluatedPct, 0)} of submissions` : 'No submissions'} />
        <KpiCard icon={Target} label="Overall Average" value={hasScores ? formatPercent(overallAvg, 1) : 'N/A'} sub={hasScores ? 'Evaluated results' : 'No scored results'} />
      </div>

      {/* Score Overview */}
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        {/* Readiness Distribution */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Brain className="w-4 h-4 text-brand-gold" />
            <h2 className="font-semibold text-brand-navy">Post-Training Readiness Distribution</h2>
          </div>

          {hasScores ? <div className="text-center mb-6">
            <div className="text-4xl font-bold text-brand-navy mb-1">{formatPercent(overallAvg, 1)}</div>
            <div className="text-sm text-brand-muted">Organisation-Wide Average Score</div>
            <ProgressBar value={overallAvg} colorByScore height="md" className="mt-3" />
          </div> : <EmptyState icon={Brain} title="No assessment results available" description="Readiness statistics will appear after result scores are stored and evaluated." />}

          {hasScores && <div className="space-y-2">
            {(Object.entries(readinessDistribution) as [string, number][]).reverse().map(([level, count]) => {
              const config = AI_READINESS_CONFIG[level as keyof typeof AI_READINESS_CONFIG];
              const pct = submitted > 0 ? (count / submitted) * 100 : 0;
              return (
                <div key={level} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${config.bgColor.replace('bg-', 'bg-').replace('-50', '-400')}`} />
                  <span className="text-xs text-brand-charcoal w-32 shrink-0">{config.label}</span>
                  <div className="flex-1">
                    <ProgressBar value={pct} height="sm" color={
                      level === 'ai_leader' ? 'bg-purple-500' :
                      level === 'advanced' ? 'bg-success-500' :
                      level === 'operational' ? 'bg-blue-500' :
                      level === 'developing' ? 'bg-warning-500' : 'bg-danger-500'
                    } />
                  </div>
                  <span className="text-xs text-brand-muted w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>}
        </div>

        {/* Dept Highlights */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-brand-gold" />
            <h2 className="font-semibold text-brand-navy">Department Scores</h2>
          </div>

          {topDept && (
            <div className="gradient-navy rounded-xl p-4 mb-4">
              <div className="text-xs text-white/50 mb-1">Highest Scoring Department</div>
              <div className="text-sm font-bold text-white mb-0.5">{topDept.name.split(' / ')[0]}</div>
              <div className="text-2xl font-bold text-brand-gold">
                {formatPercent(topDept.avgScore, 1)}
              </div>
            </div>
          )}

          {!topDept && <p className="text-sm text-brand-muted mb-4">No department scores yet.</p>}

          <div className="space-y-3 flex-1">
            {deptStats.slice(0, 4).map((d) => (
              <div key={d.deptId}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-brand-charcoal">{d.code}</span>
                  <span className="text-brand-navy font-semibold">{d.hasScores ? formatPercent(d.avgScore, 1) : 'N/A'}</span>
                </div>
                <ProgressBar value={d.avgScore} colorByScore height="sm" />
              </div>
            ))}
          </div>
          <Link to={ROUTES.adminAnalytics} className="btn-secondary btn-sm mt-4 justify-center no-underline">
            Full Analysis <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Submissions */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-brand-navy text-sm">Recent Submissions</h2>
            <Link to={ROUTES.adminSubmissions} className="text-xs text-brand-blue hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-brand-border/60">
            {recentSubmissions.map((emp) => {
              const score = emp.finalScore;
              const config = score === null ? null : AI_READINESS_CONFIG[getAIReadinessLevel(score)];
              return (
                <Link key={emp.id} to={`/admin/employees/${emp.id}`} className="px-5 py-3.5 flex items-center gap-3 no-underline hover:bg-brand-cream/40 transition-colors">
                  <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-brand-navy truncate">{emp.name}</div>
                    <div className="text-xs text-brand-muted">{emp.employeeId} · Session {String(emp.sessionNumber).padStart(2, '0')} · {emp.assessmentTitle}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold ${config?.color ?? 'text-brand-muted'}`}>{score === null ? 'Submitted' : formatPercent(score, 0)}</div>
                    {emp.trainerMarks !== null && (
                      <div className="text-xs text-brand-muted">Evaluated</div>
                    )}
                  </div>
                </Link>
              );
            })}
            {recentSubmissions.length === 0 && <EmptyState icon={ClipboardList} title="No submissions yet" description="Recent employee submissions will appear here." />}
          </div>
        </div>

        {/* Competency Breakdown */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-brand-navy text-sm">Competency Scores</h2>
            <Link to={ROUTES.adminAnalytics} className="text-xs text-brand-blue hover:underline flex items-center gap-1">
              Details <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="card-body space-y-4">
            {competencyStats.slice(0, 6).map((c) => (
              <div key={c.key}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-brand-charcoal">{c.name}</span>
                  <span className="text-xs font-semibold text-brand-navy">{formatPercent(c.avgScore, 1)}</span>
                </div>
                <ProgressBar value={c.avgScore} colorByScore height="sm" />
              </div>
            ))}
            {competencyStats.length === 0 && <p className="text-sm text-brand-muted">Question-level scores are unavailable until approved answer keys and scoring data are connected.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
