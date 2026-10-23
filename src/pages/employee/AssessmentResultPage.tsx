import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Trophy, Clock, CheckCircle, BarChart3, Home,
  Star, Award,
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
  const { result } = useLocalAssessment();

  // Verify result belongs to this session
  const isMatch = result?.sessionId === sessionId;

  useEffect(() => {
    if (!result) navigate(ROUTES.employeeDashboard);
  }, [result, navigate]);

  if (!result) return null;

  const level = getAIReadinessLevel(result.percentage);
  const config = AI_READINESS_CONFIG[level];
  const competencies = Object.entries(result.competencyScores).sort((a, b) => b[1].percentage - a[1].percentage);

  return (
    <EmployeeLayout>
      <div className="max-w-2xl mx-auto">
        {/* Hero Confirmation Card */}
        <div className="gradient-navy rounded-2xl p-8 text-center text-white mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-5">
            <Trophy className="w-8 h-8 text-brand-navy" />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
              Post-Training Assessment Submitted
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Assessment Complete!
          </h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Your responses have been recorded. The assessment team will review and evaluate your answers. Results will be shared through your HR department.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Clock, label: 'Time Taken', value: formatDuration(result.timeTaken) },
            { icon: CheckCircle, label: 'Answers', value: formatScore(result.rawScore, result.maxScore) },
            { icon: BarChart3, label: 'Competencies', value: `${competencies.length}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-4 text-center">
              <Icon className="w-4 h-4 text-brand-muted mx-auto mb-2" />
              <div className="text-xs text-brand-muted mb-1">{label}</div>
              <div className="text-sm font-bold text-brand-navy">{value}</div>
            </div>
          ))}
        </div>

        {/* Provisional Score — shown as informational only */}
        {isMatch && (
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-brand-gold" />
              <h2 className="font-semibold text-brand-navy">Provisional Score Summary</h2>
            </div>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-brand-navy mb-1">
                {formatPercent(result.percentage, 0)}
              </div>
              <div className={`text-sm font-medium ${config.color} mb-1`}>{config.label}</div>
              <div className="text-xs text-brand-muted">{config.description}</div>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl w-full justify-center mt-2 ${config.bgColor}`}>
              <span className={`text-sm font-semibold ${config.color}`}>
                {result.rawScore} / {result.maxScore} marks (objective scoring only)
              </span>
            </div>
          </div>
        )}

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

        {/* Important Note */}
        <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <Star className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-brand-navy mb-1">Note on Final Score</p>
              <p className="text-xs text-brand-muted">
                The score above is provisional (objective questions only). Written/scenario answers will be manually reviewed and marked by assessors. Your final score may differ. Official results will be communicated by HR.
              </p>
            </div>
          </div>
        </div>

        {/* Action */}
        <Link to={ROUTES.employeeDashboard} className="btn-secondary w-full justify-center no-underline">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </EmployeeLayout>
  );
}
