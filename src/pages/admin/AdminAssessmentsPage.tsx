import { DEPARTMENTS, ASSESSMENT_DEFAULTS } from '@/lib/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatPercent, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import ProgressBar from '@/components/ui/ProgressBar';
import { ClipboardCheck, BarChart3, CheckCircle } from 'lucide-react';

export default function AdminAssessmentsPage() {
  const { deptStats, totalEmployees, submitted, evaluated } = useAdminData();

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">Assessment Management</h1>
        <p className="page-subtitle">
          Post-training assessment configuration and department completion status
        </p>
      </div>

      {/* Config Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Duration', value: `${ASSESSMENT_DEFAULTS.durationMinutes} min`, sub: 'Per session' },
          { label: 'Questions', value: ASSESSMENT_DEFAULTS.questionCount, sub: 'Per assessment' },
          { label: 'Passing Score', value: `${ASSESSMENT_DEFAULTS.passingPercentage}%`, sub: 'Minimum threshold' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card p-5 text-center">
            <div className="kpi-label mb-1">{label}</div>
            <div className="text-2xl font-bold text-brand-navy">{value}</div>
            <div className="kpi-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Assessment Status */}
      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        {/* Submission Status */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-navy/10 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-brand-navy" />
            </div>
            <div>
              <h2 className="font-semibold text-brand-navy text-sm">Post-Training Submissions</h2>
              <p className="text-xs text-brand-muted">AI assessment after Be10x workshop</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Submitted</span>
              <span className="font-semibold text-brand-navy">{submitted} / {totalEmployees}</span>
            </div>
            <ProgressBar value={(submitted / totalEmployees) * 100} colorByScore />
          </div>
          <div className="bg-success-50 rounded-xl p-3 text-xs text-success-700 font-medium">
            ✅ Assessment Active — All employees can submit the post-training assessment
          </div>
        </div>

        {/* Evaluation Status */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-success-600" />
            </div>
            <div>
              <h2 className="font-semibold text-brand-navy text-sm">Trainer Evaluation</h2>
              <p className="text-xs text-brand-muted">Subjective question marking by assessors</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Evaluated</span>
              <span className="font-semibold text-brand-navy">{evaluated} / {submitted}</span>
            </div>
            <ProgressBar value={submitted > 0 ? (evaluated / submitted) * 100 : 0} colorByScore />
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 font-medium">
            📋 Pending trainer review for {submitted - evaluated} submission{submitted - evaluated !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Department Status Table */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-gold" />
          <h2 className="font-semibold text-brand-navy text-sm">Department Completion Status</h2>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Employees</th>
                <th>Submitted</th>
                <th>Completion %</th>
                <th>Avg Score</th>
                <th>AI Readiness</th>
              </tr>
            </thead>
            <tbody>
              {deptStats.map((dept) => {
                const level = dept.avgScore > 0 ? getAIReadinessLevel(dept.avgScore) : null;
                const config = level ? AI_READINESS_CONFIG[level] : null;
                return (
                  <tr key={dept.deptId}>
                    <td>
                      <div>
                        <span className="badge-gray mr-2 text-xs">{dept.code}</span>
                        <span className="text-xs text-brand-muted">{dept.name.split(' / ')[0].split(' & ')[0]}</span>
                      </div>
                    </td>
                    <td className="font-semibold text-brand-navy">{dept.count}</td>
                    <td>
                      <span className="text-sm text-brand-navy">{dept.submitted}</span>
                      <span className="text-xs text-brand-muted ml-1">({formatPercent(dept.completionRate, 0)})</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={dept.completionRate} colorByScore height="sm" className="w-16" />
                        <span className="text-xs text-brand-muted">{formatPercent(dept.completionRate, 0)}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="text-sm font-medium text-brand-navy mb-1">{formatPercent(dept.avgScore, 1)}</div>
                        <ProgressBar value={dept.avgScore} colorByScore height="sm" className="w-16" />
                      </div>
                    </td>
                    <td>
                      {config ? (
                        <span className={`badge ${config.bgColor} ${config.color}`}>{config.label}</span>
                      ) : (
                        <span className="text-xs text-brand-muted">—</span>
                      )}
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
