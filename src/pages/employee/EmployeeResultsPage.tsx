import { Link } from 'react-router-dom';
import {
  TrendingUp, Award, BarChart3, Clock, ArrowUpRight,
  CheckCircle, Circle, AlertCircle, ChevronRight,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useLocalAssessment } from '@/hooks/useLocalAssessment';
import {
  formatPercent, formatDuration, getAIReadinessLevel,
  AI_READINESS_CONFIG, COMPETENCY_LABELS,
} from '@/lib/utils';
import EmployeeLayout from '@/components/layout/EmployeeLayout';
import ProgressBar from '@/components/ui/ProgressBar';

export default function EmployeeResultsPage() {
  const { results } = useLocalAssessment();

  const preResult = results.find((r) => r.phase === 'pre');
  const postResult = results.find((r) => r.phase === 'post');

  const improvement = preResult && postResult
    ? postResult.percentage - preResult.percentage
    : null;

  const preLevel = preResult ? getAIReadinessLevel(preResult.percentage) : null;
  const postLevel = postResult ? getAIReadinessLevel(postResult.percentage) : null;

  // All competency keys from both results
  const allCompetencies = Array.from(new Set([
    ...Object.keys(preResult?.competencyScores ?? {}),
    ...Object.keys(postResult?.competencyScores ?? {}),
  ]));

  if (!preResult && !postResult) {
    return (
      <EmployeeLayout>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-brand-navy mb-2">No Results Yet</h1>
          <p className="text-brand-muted mb-6">
            Complete the Pre-Training Assessment to see your results here.
          </p>
          <Link
            to={`${ROUTES.assessmentStart}?phase=pre`}
            className="btn-primary no-underline"
          >
            Start Pre-Assessment <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-brand-navy mb-6">My Assessment Results</h1>

        {/* Score Cards */}
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {[
            { label: 'Pre-Training Baseline', result: preResult, level: preLevel, phase: 'pre' as const },
            { label: 'Post-Training Assessment', result: postResult, level: postLevel, phase: 'post' as const },
          ].map(({ label, result: r, level, phase }) => (
            <div key={phase} className={`card p-6 ${!r ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-brand-navy">{label}</span>
                {r ? (
                  <CheckCircle className="w-4 h-4 text-success-500" />
                ) : phase === 'post' && !preResult ? (
                  <Circle className="w-4 h-4 text-gray-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-warning-500" />
                )}
              </div>

              {r ? (
                <>
                  <div className="text-4xl font-bold text-brand-navy mb-1">
                    {formatPercent(r.percentage, 0)}
                  </div>
                  <div className="text-sm text-brand-muted mb-3">
                    {r.rawScore}/{r.maxScore} marks
                  </div>
                  <ProgressBar value={r.percentage} colorByScore className="mb-3" />
                  {level && (
                    <div className={`text-sm font-medium ${AI_READINESS_CONFIG[level].color} mb-2`}>
                      {AI_READINESS_CONFIG[level].label}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-brand-muted">
                    <Clock className="w-3 h-3" />
                    {formatDuration(r.timeTaken)}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-brand-muted text-sm mb-3">Not attempted yet</div>
                  {preResult && (
                    <Link
                      to={`${ROUTES.assessmentStart}?phase=post`}
                      className="btn-primary btn-sm no-underline"
                    >
                      Start Now <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Improvement Banner */}
        {improvement !== null && (
          <div className={`rounded-2xl p-6 mb-8 flex items-center gap-5 ${
            improvement > 0 ? 'gradient-navy text-white' : 'bg-gray-100'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              improvement > 0 ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              <TrendingUp className={`w-6 h-6 ${improvement > 0 ? 'text-brand-gold' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <div className={`text-sm font-semibold mb-1 ${improvement > 0 ? 'text-white/70' : 'text-brand-muted'}`}>
                AI Readiness Improvement
              </div>
              <div className={`text-3xl font-bold ${improvement > 0 ? 'text-brand-gold' : 'text-brand-navy'}`}>
                {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
              </div>
              <div className={`text-sm ${improvement > 0 ? 'text-white/50' : 'text-brand-muted'}`}>
                {improvement > 10
                  ? 'Excellent improvement — the training had strong impact!'
                  : improvement > 0
                  ? 'Good progress — keep practicing AI in your daily work.'
                  : 'Room to grow — focus on applying AI in your department workflows.'}
              </div>
            </div>
            <Award className={`w-8 h-8 shrink-0 ${improvement > 0 ? 'text-brand-gold' : 'text-gray-400'}`} />
          </div>
        )}

        {/* Competency Comparison */}
        {allCompetencies.length > 0 && (
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-brand-gold" />
              <h2 className="font-semibold text-brand-navy">Competency Analysis</h2>
              {postResult && preResult && (
                <div className="ml-auto flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded bg-brand-muted/30" />Pre
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded bg-brand-navy" />Post
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-5">
              {allCompetencies.map((key) => {
                const pre = preResult?.competencyScores[key];
                const post = postResult?.competencyScores[key];
                const label = COMPETENCY_LABELS[key as keyof typeof COMPETENCY_LABELS] ?? key;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-brand-charcoal">{label}</span>
                      <div className="flex items-center gap-3 text-xs">
                        {pre && <span className="text-brand-muted">{formatPercent(pre.percentage, 0)}</span>}
                        {post && (
                          <span className={`font-semibold ${
                            pre && post.percentage > pre.percentage ? 'text-success-600' :
                            pre && post.percentage < pre.percentage ? 'text-danger-600' : 'text-brand-navy'
                          }`}>
                            {formatPercent(post.percentage, 0)}
                            {pre && post.percentage > pre.percentage && (
                              <span className="ml-1">↑</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    {pre && (
                      <div className="mb-1">
                        <ProgressBar value={pre.percentage} colorByScore height="sm" className="opacity-40" />
                      </div>
                    )}
                    {post && (
                      <ProgressBar value={post.percentage} colorByScore height="sm" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Provisional Notice */}
        <div className="text-center text-xs text-brand-muted">
          Scores for written/scenario questions are provisional (60% partial credit) pending manual review by assessors.
          Contact your HR/Admin team for final scores.
        </div>
      </div>
    </EmployeeLayout>
  );
}
