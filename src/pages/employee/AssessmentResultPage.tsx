import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Trophy, Clock, CheckCircle, BarChart3, ArrowRight, Home,
  TrendingUp, Award, Star,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useLocalAssessment } from '@/hooks/useLocalAssessment';
import {
  formatPercent, formatDuration, getAIReadinessLevel,
  AI_READINESS_CONFIG, COMPETENCY_LABELS, formatScore,
} from '@/lib/utils';
import EmployeeLayout from '@/components/layout/EmployeeLayout';
import ProgressBar from '@/components/ui/ProgressBar';

export default function AssessmentResultPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, results } = useLocalAssessment();

  // Find the result matching this session
  const result = results.find((r) => r.sessionId === sessionId);

  useEffect(() => {
    if (!result) navigate(ROUTES.employeeDashboard);
  }, [result, navigate]);

  if (!result) return null;

  const level = getAIReadinessLevel(result.percentage);
  const config = AI_READINESS_CONFIG[level];
  const competencies = Object.entries(result.competencyScores).sort((a, b) => b[1].percentage - a[1].percentage);
  const isPostAssessment = result.phase === 'post';

  // Score color
  const scoreColor = result.percentage >= 75 ? 'text-success-600' :
    result.percentage >= 60 ? 'text-brand-blue' :
    result.percentage >= 40 ? 'text-warning-600' : 'text-danger-600';

  return (
    <EmployeeLayout>
      <div className="max-w-2xl mx-auto">
        {/* Hero Score Card */}
        <div className="gradient-navy rounded-2xl p-8 text-center text-white mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-5">
            <Trophy className="w-8 h-8 text-brand-navy" />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
              {result.phase === 'pre' ? 'Pre-Training' : 'Post-Training'} Assessment Complete
            </span>
          </div>
          <div className={`text-6xl font-bold mb-2 ${result.percentage >= 75 ? 'text-brand-gold' : 'text-white'}`}>
            {formatPercent(result.percentage, 0)}
          </div>
          <p className="text-white/60 mb-4">
            {result.rawScore} / {result.maxScore} marks
          </p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${config.bgColor}`}>
            <Award className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
          </div>
          <p className="text-white/50 text-xs mt-3">{config.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Clock, label: 'Time Taken', value: formatDuration(result.timeTaken) },
            { icon: CheckCircle, label: 'Score', value: formatScore(result.rawScore, result.maxScore) },
            { icon: BarChart3, label: 'Competencies', value: `${competencies.length}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-4 text-center">
              <Icon className="w-4 h-4 text-brand-muted mx-auto mb-2" />
              <div className="text-xs text-brand-muted mb-1">{label}</div>
              <div className="text-sm font-bold text-brand-navy">{value}</div>
            </div>
          ))}
        </div>

        {/* Competency Breakdown */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-brand-gold" />
            <h2 className="font-semibold text-brand-navy">Competency Breakdown</h2>
          </div>
          <div className="space-y-4">
            {competencies.map(([key, { score, max, percentage }]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-brand-charcoal">
                    {COMPETENCY_LABELS[key as keyof typeof COMPETENCY_LABELS] ?? key}
                  </span>
                  <span className="text-xs font-semibold text-brand-navy">
                    {score}/{max} ({formatPercent(percentage, 0)})
                  </span>
                </div>
                <ProgressBar value={percentage} colorByScore />
              </div>
            ))}
          </div>
        </div>

        {/* Subjective Note */}
        <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <Star className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-brand-navy mb-1">Note on Subjective Scores</p>
              <p className="text-xs text-brand-muted">
                Written/scenario answers are provisionally scored at 60% pending manual review by assessors. 
                Your final score may change after evaluation. Check back in the results section for updates.
              </p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-brand-gold" />
            <h2 className="font-semibold text-brand-navy">What's Next</h2>
          </div>
          {result.phase === 'pre' ? (
            <div className="space-y-3 text-sm text-brand-charcoal">
              <p>✅ Your pre-training baseline is now recorded.</p>
              <p>📚 Participate in the Be10x 3-day AI training workshop.</p>
              <p>🎯 After the workshop, complete the Post-Training Assessment to measure your improvement.</p>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-brand-charcoal">
              <p>✅ Both assessments completed. Your impact score is calculated.</p>
              <p>📊 View your detailed results including pre/post comparison.</p>
              <p>🏆 Share your AI readiness level with your manager and department head.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to={ROUTES.employeeDashboard} className="btn-secondary flex-1 justify-center no-underline">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <Link to={ROUTES.employeeResults} className="btn-primary flex-1 justify-center no-underline">
            Full Results <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </EmployeeLayout>
  );
}
