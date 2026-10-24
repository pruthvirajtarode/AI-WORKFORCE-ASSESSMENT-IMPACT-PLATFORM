import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, AI_READINESS_CONFIG, COMPETENCY_LABELS, getAIReadinessLevel } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Users, Award, BarChart3, Target, Trophy } from 'lucide-react';

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return <div className="flex items-center gap-2 mb-5"><Icon className="w-4 h-4 text-brand-gold" /><h2 className="font-semibold text-brand-navy">{title}</h2></div>;
}

export default function AdminAnalyticsPage() {
  const { totalEmployees, submitted, employeesSubmitted, evaluated, overallAvg, hasScores, deptStats, competencyStats, readinessDistribution, isLoading, hasError } = useAdminData();
  const readinessTotal = Object.values(readinessDistribution).reduce((sum, count) => sum + count, 0);
  const completion = totalEmployees ? employeesSubmitted / totalEmployees * 100 : 0;

  if (isLoading) return <LoadingScreen />;

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">Analytics & Insights</h1>
        <p className="page-subtitle">Department assessment results from Supabase</p>
      </div>
      {hasError && <div role="alert" className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-5 text-sm text-danger-700">Live analytics could not be loaded. Check Supabase connectivity and administrator RLS access.</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Employees', value: totalEmployees, sub: 'Supabase profiles' },
          { label: 'Submitted Attempts', value: submitted, sub: totalEmployees ? `${formatPercent(completion, 0)} completion` : 'No active profiles' },
          { label: 'Evaluated', value: evaluated, sub: submitted ? 'Of submitted attempts' : 'No submissions' },
          { label: 'Average Score', value: hasScores ? formatPercent(overallAvg, 1) : 'N/A', sub: hasScores ? 'Evaluated results' : 'No scored results' },
        ].map(({ label, value, sub }) => <div key={label} className="card p-5"><div className="kpi-label mb-1">{label}</div><div className="text-2xl font-bold text-brand-navy">{value}</div><div className="kpi-sub">{sub}</div></div>)}
      </div>

      <div className="card p-6 mb-6">
        <SectionTitle icon={BarChart3} title="Department assessment results" />
        {deptStats.some((department) => department.count > 0) ? <div className="space-y-5">
          {deptStats.map((department) => <div key={department.deptId} className="border-b border-brand-border/50 last:border-0 pb-5 last:pb-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div><div className="font-semibold text-brand-navy text-sm">{department.name}</div><div className="text-xs text-brand-muted">{department.count} active employees · {department.submitted} submitted attempts · {formatPercent(department.completionRate, 0)} completion</div></div>
              <div className="text-right shrink-0"><div className="text-lg font-bold text-brand-navy">{department.hasScores ? formatPercent(department.avgScore, 1) : 'N/A'}</div><div className="text-xs text-brand-muted">{department.hasScores ? 'average score' : 'no evaluated scores'}</div></div>
            </div>
            {department.hasScores && <ProgressBar value={department.avgScore} colorByScore height="md" />}
          </div>)}
        </div> : <EmptyState icon={Users} title="No employees found" description="Active employee profiles will appear when available in Supabase." />}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <div className="card p-6">
          <SectionTitle icon={Award} title="Readiness distribution" />
          {readinessTotal === 0 ? <EmptyState icon={Award} title="No assessment results available" description="Readiness is calculated from evaluated assessment percentages." /> : <div className="space-y-4">
            {(Object.entries(AI_READINESS_CONFIG) as [keyof typeof AI_READINESS_CONFIG, typeof AI_READINESS_CONFIG[keyof typeof AI_READINESS_CONFIG]][]).reverse().map(([level, config]) => {
              const count = readinessDistribution[level] ?? 0;
              const percentage = readinessTotal ? count / readinessTotal * 100 : 0;
              return <div key={level}><div className="flex items-center justify-between mb-2"><span className={`text-sm font-medium ${config.color}`}>{config.label}</span><span className="text-xs text-brand-muted">{count} · {formatPercent(percentage, 0)}</span></div><ProgressBar value={percentage} height="md" colorByScore /></div>;
            })}
          </div>}
        </div>
        <div className="card p-6">
          <SectionTitle icon={Target} title="Competency scores" />
          {competencyStats.length === 0 ? <EmptyState icon={Target} title="No competency scores available" description="The source assessment answer keys are maintained outside this repository; competency scoring will appear when approved scoring data is connected." /> : <div className="space-y-3">{[...competencyStats].sort((a, b) => b.avgScore - a.avgScore).map((competency, index) => <div key={competency.key} className="flex items-center gap-3"><span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-brand-cream text-brand-muted">{index + 1}</span><span className="flex-1 text-sm text-brand-charcoal">{COMPETENCY_LABELS[competency.key as keyof typeof COMPETENCY_LABELS] ?? competency.name}</span><span className="font-semibold text-brand-navy">{formatPercent(competency.avgScore, 1)}</span></div>)}</div>}
        </div>
      </div>

      <div className="card p-6">
        <SectionTitle icon={Users} title="Department summary" />
        {deptStats.length === 0 ? <EmptyState title="No department data" description="Department statistics are unavailable." /> : <div className="table-wrapper"><table className="table"><thead><tr><th>Department</th><th>Active employees</th><th>Submitted</th><th>Completion</th><th>Average score</th><th>Readiness</th></tr></thead><tbody>
          {deptStats.map((department) => {
            const level = department.hasScores ? AI_READINESS_CONFIG[getAIReadinessLevel(department.avgScore)] : null;
            return <tr key={department.deptId}><td><span className="badge-gray mr-2">{department.code}</span>{department.name}</td><td>{department.count}</td><td>{department.submitted}</td><td>{formatPercent(department.completionRate, 0)}</td><td>{department.hasScores ? formatPercent(department.avgScore, 1) : 'N/A'}</td><td>{level ? <span className={`badge ${level.bgColor} ${level.color}`}><Trophy className="inline w-3 h-3 mr-1" />{level.label}</span> : 'Pending'}</td></tr>;
          })}
        </tbody></table></div>}
      </div>
    </AdminLayout>
  );
}
