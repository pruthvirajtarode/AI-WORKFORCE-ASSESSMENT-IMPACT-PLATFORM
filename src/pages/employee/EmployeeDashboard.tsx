import { Link, useNavigate } from 'react-router-dom';
import { Brain, ClipboardList, CheckCircle2, Lock, Clock, ArrowRight, TrendingUp, Award } from 'lucide-react';
import { ROUTES, DEPARTMENTS, DEPARTMENT_MAP } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalAssessment } from '@/hooks/useLocalAssessment';
import { formatDateTime, formatDuration, formatPercent, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import EmployeeLayout from '@/components/layout/EmployeeLayout';
import ProgressBar from '@/components/ui/ProgressBar';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { hasCompleted, getResult } = useLocalAssessment();
  const navigate = useNavigate();

  const preResult = getResult('pre');
  const postResult = getResult('post');
  const preCompleted = hasCompleted('pre');
  const postCompleted = hasCompleted('post');

  const deptId = user?.departmentId ?? DEPARTMENTS[0].id;
  const dept = DEPARTMENT_MAP[deptId as keyof typeof DEPARTMENT_MAP];

  const preReadiness = preResult ? getAIReadinessLevel(preResult.percentage) : null;
  const postReadiness = postResult ? getAIReadinessLevel(postResult.percentage) : null;

  const assessmentCards = [
    {
      phase: 'pre' as const,
      title: 'Pre-Training Assessment',
      subtitle: 'Baseline AI readiness before Be10x workshop',
      icon: ClipboardList,
      result: preResult,
      completed: preCompleted,
      locked: false,
    },
    {
      phase: 'post' as const,
      title: 'Post-Training Assessment',
      subtitle: 'Measure your improvement after the workshop',
      icon: TrendingUp,
      result: postResult,
      completed: postCompleted,
      locked: !preCompleted,
    },
  ];

  return (
    <EmployeeLayout>
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-navy flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-brand-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">
              Welcome back, {user?.name?.split(' ')[0] ?? 'Colleague'}
            </h1>
            <p className="text-brand-muted mt-0.5">
              {dept?.name ?? 'Your Department'} · SUROJ × BE10X AI Assessment Platform
            </p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {(preCompleted || postCompleted) && (
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-brand-gold" />
            <h2 className="font-semibold text-brand-navy">Your Progress</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {preResult && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-brand-navy">Pre-Assessment</span>
                  <span className="text-sm font-bold text-brand-navy">{formatPercent(preResult.percentage)}</span>
                </div>
                <ProgressBar value={preResult.percentage} colorByScore showPercent={false} />
                {preReadiness && (
                  <span className={`text-xs font-medium mt-1 block ${AI_READINESS_CONFIG[preReadiness].color}`}>
                    {AI_READINESS_CONFIG[preReadiness].label}
                  </span>
                )}
              </div>
            )}
            {postResult && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-brand-navy">Post-Assessment</span>
                  <span className="text-sm font-bold text-brand-navy">{formatPercent(postResult.percentage)}</span>
                </div>
                <ProgressBar value={postResult.percentage} colorByScore showPercent={false} />
                {postReadiness && (
                  <span className={`text-xs font-medium mt-1 block ${AI_READINESS_CONFIG[postReadiness].color}`}>
                    {AI_READINESS_CONFIG[postReadiness].label}
                  </span>
                )}
              </div>
            )}
            {preResult && postResult && (
              <div className="sm:col-span-2 bg-brand-cream rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success-600" />
                  <span className="text-sm font-semibold text-brand-navy">
                    Score Improvement: {' '}
                    <span className="text-success-600">
                      +{(postResult.percentage - preResult.percentage).toFixed(1)}%
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assessment Cards */}
      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        {assessmentCards.map(({ phase, title, subtitle, icon: Icon, result, completed, locked }) => (
          <div key={phase} className={`card p-6 flex flex-col gap-4 ${locked ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                completed ? 'bg-success-100' : locked ? 'bg-gray-100' : 'bg-brand-navy/10'
              }`}>
                {completed ? (
                  <CheckCircle2 className="w-5 h-5 text-success-600" />
                ) : locked ? (
                  <Lock className="w-5 h-5 text-gray-400" />
                ) : (
                  <Icon className="w-5 h-5 text-brand-navy" />
                )}
              </div>
              {completed && (
                <span className="badge-success text-xs">Completed</span>
              )}
              {locked && (
                <span className="badge-gray text-xs">Locked</span>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-brand-navy">{title}</h3>
              <p className="text-sm text-brand-muted mt-0.5">{subtitle}</p>
            </div>

            {result ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Score</span>
                  <span className="font-semibold text-brand-navy">{formatPercent(result.percentage)}</span>
                </div>
                <ProgressBar value={result.percentage} colorByScore height="sm" />
                <div className="flex justify-between text-xs text-brand-muted">
                  <span>Time: {formatDuration(result.timeTaken)}</span>
                  <span>{formatDateTime(result.submittedAt)}</span>
                </div>
                <Link
                  to={ROUTES.employeeResults}
                  className="btn-secondary btn-sm w-full justify-center mt-2 no-underline"
                >
                  View Details
                </Link>
              </div>
            ) : (
              <div className="mt-auto">
                <div className="flex items-center gap-4 text-xs text-brand-muted mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    90 minutes
                  </span>
                  <span>30 questions</span>
                </div>
                <button
                  onClick={() => !locked && navigate(ROUTES.assessmentStart + `?phase=${phase}&dept=${deptId}`)}
                  disabled={locked}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    locked
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {locked ? 'Complete Pre-Assessment First' : 'Start Assessment'}
                  {!locked && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-brand-navy mb-3">Assessment Guidelines</h3>
        <ul className="space-y-2 text-sm text-brand-muted">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
            Questions are scenario-based and tailored for your department ({dept?.name})
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
            Each assessment has a 90-minute time limit. Submit before time expires.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
            Do not refresh or close the browser during the assessment.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
            Each phase can only be attempted once. Complete the pre-assessment before the post.
          </li>
        </ul>
      </div>
    </EmployeeLayout>
  );
}
