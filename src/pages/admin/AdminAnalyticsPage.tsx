import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, AI_READINESS_CONFIG, COMPETENCY_LABELS } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';
import { Users, Award, BarChart3, Target, Trophy } from 'lucide-react';

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon className="w-4 h-4 text-brand-gold" />
      <h2 className="font-semibold text-brand-navy">{title}</h2>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const {
    totalEmployees, submitted, evaluated,
    overallAvg, deptStats, competencyStats, readinessDistribution,
  } = useAdminData();

  const readinessTotals = Object.values(readinessDistribution).reduce((s, v) => s + v, 0);
  const completionPct = (submitted / totalEmployees) * 100;

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">Analytics & Insights</h1>
        <p className="page-subtitle">Post-training assessment analysis across all departments and competencies</p>
      </div>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Enrolled', value: totalEmployees, sub: 'Employees' },
          { label: 'Submitted', value: submitted, sub: `${formatPercent(completionPct, 0)} completion` },
          { label: 'Evaluated', value: evaluated, sub: 'Trainer-marked' },
          { label: 'Avg Post Score', value: formatPercent(overallAvg, 1), sub: 'Organisation-wide' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card p-5">
            <div className="kpi-label mb-1">{label}</div>
            <div className="text-2xl font-bold text-brand-navy">{value}</div>
            <div className="kpi-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Department Scores */}
      <div className="card p-6 mb-6">
        <SectionTitle icon={BarChart3} title="Department-Level Post-Training Scores" />
        <div className="space-y-5">
          {deptStats.map((dept) => (
            <div key={dept.deptId} className="border-b border-brand-border/50 last:border-0 pb-5 last:pb-0">
              <div className="flex items-start justify-between mb-3 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-brand-navy text-sm">{dept.name.split(' / ')[0]}</div>
                  <div className="text-xs text-brand-muted">{dept.count} employees · {dept.submitted} submitted · {formatPercent(dept.completionRate, 0)} completion</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-brand-navy">{formatPercent(dept.avgScore, 1)}</div>
                  <div className="text-xs text-brand-muted">avg score</div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-brand-muted mb-1.5">
                  <span>Post-Training Score</span>
                  <span className="font-medium">{formatPercent(dept.avgScore, 1)}</span>
                </div>
                <ProgressBar value={dept.avgScore} colorByScore height="md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        {/* Readiness Distribution */}
        <div className="card p-6">
          <SectionTitle icon={Award} title="Post-Training Readiness Distribution" />
          <div className="space-y-4">
            {(Object.entries(AI_READINESS_CONFIG) as [string, typeof AI_READINESS_CONFIG[keyof typeof AI_READINESS_CONFIG]][]).reverse().map(([level, config]) => {
              const count = readinessDistribution[level as keyof typeof readinessDistribution] ?? 0;
              const pct = readinessTotals > 0 ? (count / readinessTotals) * 100 : 0;
              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${config.bgColor.replace('bg-', 'bg-').replace('-50', '-400')}`} />
                      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-brand-muted">
                      <span>{count} employees</span>
                      <span className="font-semibold w-10 text-right">{formatPercent(pct, 0)}</span>
                    </div>
                  </div>
                  <ProgressBar
                    value={pct}
                    height="md"
                    color={
                      level === 'ai_leader' ? 'bg-purple-500' :
                      level === 'advanced' ? 'bg-success-500' :
                      level === 'operational' ? 'bg-blue-500' :
                      level === 'developing' ? 'bg-warning-500' : 'bg-danger-500'
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Competency Rankings */}
        <div className="card p-6">
          <SectionTitle icon={Target} title="Competency Score Ranking" />
          <div className="space-y-3">
            {[...competencyStats]
              .sort((a, b) => b.avgScore - a.avgScore)
              .map((comp, i) => (
                <div key={comp.key} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? 'bg-brand-gold text-brand-navy' :
                    i === 1 ? 'bg-gray-200 text-gray-700' :
                    i === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-brand-cream text-brand-muted'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-brand-charcoal truncate">
                      {COMPETENCY_LABELS[comp.key as keyof typeof COMPETENCY_LABELS] ?? comp.name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-brand-navy">{formatPercent(comp.avgScore, 1)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Participation Summary */}
      <div className="card p-6">
        <SectionTitle icon={Users} title="Department Summary" />
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Enrolled</th>
                <th>Submitted</th>
                <th>Completion %</th>
                <th>Avg Score</th>
                <th>Top Readiness</th>
              </tr>
            </thead>
            <tbody>
              {deptStats.map((dept) => {
                const topScore = dept.avgScore;
                const topLevel = topScore > 0 ? AI_READINESS_CONFIG[Object.entries(AI_READINESS_CONFIG)
                  .sort((a, b) => {
                    const bands = { needs_development: 0, developing: 40, operational: 60, advanced: 75, ai_leader: 90 };
                    return (bands[b[0] as keyof typeof bands] ?? 0) - (bands[a[0] as keyof typeof bands] ?? 0);
                  })
                  .find(([, c]) => topScore >= ({ needs_development: 0, developing: 40, operational: 60, advanced: 75, ai_leader: 90 }['' as never] ?? 0))
                  ?.[0] as keyof typeof AI_READINESS_CONFIG ?? 'needs_development'
                ] : null;
                return (
                  <tr key={dept.deptId}>
                    <td>
                      <span className="badge-gray mr-2">{dept.code}</span>
                      <span className="text-xs text-brand-muted">{dept.name.split(' / ')[0].split(' & ')[0]}</span>
                    </td>
                    <td className="font-semibold text-brand-navy">{dept.count}</td>
                    <td>{dept.submitted}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={dept.completionRate} height="sm" colorByScore className="w-16" />
                        <span className="text-xs text-brand-muted">{formatPercent(dept.completionRate, 0)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="min-w-[80px]">
                        <div className="text-sm font-semibold text-brand-navy mb-1">{formatPercent(dept.avgScore, 1)}</div>
                        <ProgressBar value={dept.avgScore} colorByScore height="sm" />
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-xs text-brand-gold font-medium">
                        <Trophy className="w-3 h-3" />
                        {dept.submitted > 0 ? 'Scored' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
