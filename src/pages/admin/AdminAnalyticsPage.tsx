import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, AI_READINESS_CONFIG, COMPETENCY_LABELS } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';
import { TrendingUp, Users, Award, BarChart3, Target } from 'lucide-react';

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
    totalEmployees, preCompleted, postCompleted,
    overallPreAvg, overallPostAvg, overallImprovement,
    deptStats, competencyStats, readinessDistribution,
  } = useAdminData();

  const readinessTotals = Object.values(readinessDistribution).reduce((s, v) => s + v, 0);

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">Analytics & Insights</h1>
        <p className="page-subtitle">Training impact analysis across all departments and competencies</p>
      </div>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Enrolled', value: totalEmployees, sub: 'Employees' },
          { label: 'Pre Complete', value: preCompleted, sub: `${formatPercent((preCompleted / totalEmployees) * 100, 0)}` },
          { label: 'Post Complete', value: postCompleted, sub: `${formatPercent((postCompleted / totalEmployees) * 100, 0)}` },
          { label: 'Avg Pre Score', value: formatPercent(overallPreAvg, 1), sub: 'Baseline' },
          { label: 'Avg Post Score', value: formatPercent(overallPostAvg, 1), sub: '+' + overallImprovement.toFixed(1) + '% gain' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card p-5">
            <div className="kpi-label mb-1">{label}</div>
            <div className="text-2xl font-bold text-brand-navy">{value}</div>
            <div className="kpi-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Department Comparison */}
      <div className="card p-6 mb-6">
        <SectionTitle icon={BarChart3} title="Department-Level Impact" />
        <div className="space-y-6">
          {deptStats.map((dept) => (
            <div key={dept.deptId} className="border-b border-brand-border/50 last:border-0 pb-5 last:pb-0">
              <div className="flex items-start justify-between mb-3 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-brand-navy text-sm">{dept.name.split(' / ')[0]}</div>
                  <div className="text-xs text-brand-muted">{dept.count} employees · {formatPercent(dept.completionRate, 0)} post-completion</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-success-600">+{dept.improvement.toFixed(1)}%</div>
                  <div className="text-xs text-brand-muted">improvement</div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs text-brand-muted mb-1.5">
                    <span>Pre-Training</span>
                    <span className="font-medium">{formatPercent(dept.preAvg, 1)}</span>
                  </div>
                  <ProgressBar value={dept.preAvg} height="md" color="bg-brand-muted/30" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-brand-muted">Post-Training</span>
                    <span className="font-semibold text-success-600">{formatPercent(dept.postAvg, 1)}</span>
                  </div>
                  <ProgressBar value={dept.postAvg} colorByScore height="md" />
                </div>
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
          <SectionTitle icon={Target} title="Competency Improvement Ranking" />
          <div className="space-y-3">
            {[...competencyStats]
              .sort((a, b) => b.improvement - a.improvement)
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
                    <div className="text-sm font-bold text-success-600">+{comp.improvement.toFixed(1)}%</div>
                    <div className="text-xs text-brand-muted">{formatPercent(comp.postAvg, 0)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Participation Summary */}
      <div className="card p-6">
        <SectionTitle icon={Users} title="Participation by Department" />
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Enrolled</th>
                <th>Pre Completed</th>
                <th>Post Completed</th>
                <th>Post Completion %</th>
                <th>Avg Pre</th>
                <th>Avg Post</th>
                <th>Δ Improvement</th>
              </tr>
            </thead>
            <tbody>
              {deptStats.map((dept) => (
                <tr key={dept.deptId}>
                  <td>
                    <span className="badge-gray mr-2">{dept.code}</span>
                    <span className="text-xs text-brand-muted">{dept.name.split(' / ')[0].split(' & ')[0]}</span>
                  </td>
                  <td className="font-semibold text-brand-navy">{dept.count}</td>
                  <td>{dept.count}</td>
                  <td>{Math.round(dept.count * dept.completionRate / 100)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={dept.completionRate} height="sm" colorByScore className="w-16" />
                      <span className="text-xs text-brand-muted">{formatPercent(dept.completionRate, 0)}</span>
                    </div>
                  </td>
                  <td className="text-sm text-brand-muted">{formatPercent(dept.preAvg, 1)}</td>
                  <td className="text-sm font-medium text-brand-navy">{formatPercent(dept.postAvg, 1)}</td>
                  <td>
                    <span className="text-sm font-bold text-success-600">+{dept.improvement.toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
