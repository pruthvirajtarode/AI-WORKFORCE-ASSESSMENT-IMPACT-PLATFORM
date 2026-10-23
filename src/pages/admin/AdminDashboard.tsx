import { Link } from 'react-router-dom';
import {
  Users, ClipboardList, TrendingUp, Award, ArrowUpRight,
  BarChart3, Brain, CheckCircle, Clock, ChevronRight,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, formatImprovement, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';

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
    employees, totalEmployees, preCompleted, postCompleted,
    overallPreAvg, overallPostAvg, overallImprovement,
    deptStats, competencyStats, readinessDistribution,
  } = useAdminData();

  const completionPct = (preCompleted / totalEmployees) * 100;
  const postPct = (postCompleted / preCompleted) * 100;

  // Top 5 most recent submissions
  const recentSubmissions = [...employees]
    .filter((e) => e.postSubmittedAt || e.preSubmittedAt)
    .sort((a, b) => {
      const aDate = a.postSubmittedAt ?? a.preSubmittedAt ?? '';
      const bDate = b.postSubmittedAt ?? b.preSubmittedAt ?? '';
      return bDate.localeCompare(aDate);
    })
    .slice(0, 6);

  // Top performing department
  const topDept = [...deptStats].sort((a, b) => b.improvement - a.improvement)[0];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Platform Overview</h1>
          <p className="page-subtitle">
            SUROJ × BE10X · AI Workforce Assessment Dashboard
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

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={Users} label="Total Employees" value={totalEmployees} sub="Across 6 departments" accent />
        <KpiCard icon={ClipboardList} label="Pre-Assessment" value={preCompleted} sub={`${formatPercent(completionPct, 0)} completion`} />
        <KpiCard icon={CheckCircle} label="Post-Assessment" value={postCompleted} sub={`${formatPercent(postPct, 0)} of pre-completers`} />
        <KpiCard icon={TrendingUp} label="Avg Improvement" value={`+${overallImprovement.toFixed(1)}%`} sub="Pre → Post delta" />
      </div>

      {/* Score Overview Card */}
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        {/* Aggregate Scores */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Brain className="w-4 h-4 text-brand-gold" />
            <h2 className="font-semibold text-brand-navy">Overall AI Readiness</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-brand-muted">Pre-Training Baseline</span>
                <span className="text-sm font-bold text-brand-navy">{formatPercent(overallPreAvg, 1)}</span>
              </div>
              <ProgressBar value={overallPreAvg} height="md" color="bg-brand-muted/40" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-brand-muted">Post-Training Score</span>
                <span className="text-sm font-bold text-success-600">{formatPercent(overallPostAvg, 1)}</span>
              </div>
              <ProgressBar value={overallPostAvg} colorByScore height="md" />
            </div>
          </div>

          {/* Readiness Distribution */}
          <div className="border-t border-brand-border pt-4">
            <p className="text-xs text-brand-muted font-semibold uppercase tracking-wider mb-3">Post-Training Readiness Distribution</p>
            <div className="space-y-2">
              {(Object.entries(readinessDistribution) as [string, number][]).reverse().map(([level, count]) => {
                const config = AI_READINESS_CONFIG[level as keyof typeof AI_READINESS_CONFIG];
                const pct = postCompleted > 0 ? (count / postCompleted) * 100 : 0;
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
            </div>
          </div>
        </div>

        {/* Top Dept */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-brand-gold" />
            <h2 className="font-semibold text-brand-navy">Department Highlights</h2>
          </div>

          {topDept && (
            <div className="gradient-navy rounded-xl p-4 mb-4">
              <div className="text-xs text-white/50 mb-1">Highest Improvement</div>
              <div className="text-sm font-bold text-white mb-0.5">{topDept.name.split(' / ')[0]}</div>
              <div className="text-2xl font-bold text-brand-gold">
                +{topDept.improvement.toFixed(1)}%
              </div>
            </div>
          )}

          <div className="space-y-3 flex-1">
            {deptStats.slice(0, 4).map((d) => (
              <div key={d.deptId}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-brand-charcoal">{d.code}</span>
                  <span className="text-success-600 font-semibold">+{d.improvement.toFixed(1)}%</span>
                </div>
                <ProgressBar value={d.postAvg} colorByScore height="sm" />
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
              const score = emp.postScore ?? emp.preScore ?? 0;
              const phase = emp.postScore ? 'post' : 'pre';
              const level = getAIReadinessLevel(score);
              const config = AI_READINESS_CONFIG[level];
              return (
                <div key={emp.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-brand-cream/40 transition-colors">
                  <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-brand-navy truncate">{emp.name}</div>
                    <div className="text-xs text-brand-muted">{emp.employeeId} · {phase === 'post' ? 'Post' : 'Pre'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold ${config.color}`}>{formatPercent(score, 0)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Competency Snapshot */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-brand-navy text-sm">Competency Improvement</h2>
            <Link to={ROUTES.adminAnalytics} className="text-xs text-brand-blue hover:underline flex items-center gap-1">
              Details <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="card-body space-y-4">
            {competencyStats.slice(0, 6).map((c) => (
              <div key={c.key}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-brand-charcoal">{c.name}</span>
                  <span className="text-xs font-semibold text-success-600">+{c.improvement.toFixed(1)}%</span>
                </div>
                <div className="relative">
                  <ProgressBar value={c.preAvg} height="sm" color="bg-brand-muted/25" className="mb-0.5" />
                  <ProgressBar value={c.postAvg} colorByScore height="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
