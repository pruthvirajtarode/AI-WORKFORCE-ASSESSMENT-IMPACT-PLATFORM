import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, Home } from 'lucide-react';
import assessmentsData from '@/data/departmentalAssessments.json';
import { getEmployeeSessionNumber, ROUTES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionAssessments } from '@/hooks/useSessionAssessments';
import type { DepartmentalAssessment } from '@/types/departmentalAssessment';
import { formatPercent, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import EmployeeLayout from '@/components/layout/EmployeeLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';

const assessments = assessmentsData as unknown as DepartmentalAssessment[];

export default function AssessmentResultPage() {
  const { sessionNumber: routeSession, attemptId } = useParams<{ sessionNumber: string; attemptId: string }>();
  const sessionNumber = Number(routeSession);
  const assessment = assessments.find((item) => item.number === sessionNumber);
  const { user } = useAuth();
  const { attempts, isLoading } = useSessionAssessments(user);
  const assignedSessionNumber = getEmployeeSessionNumber(user?.departmentId, user?.departmentCode);
  const navigate = useNavigate();
  const attempt = attempts.find((item) => item.id === attemptId && item.sessionNumber === sessionNumber);
  const resultLevel = attempt?.percentage === null || attempt?.percentage === undefined
    ? null
    : AI_READINESS_CONFIG[getAIReadinessLevel(attempt.percentage)];

  useEffect(() => {
    if (!isLoading && (!attempt || attempt.status !== 'submitted' || sessionNumber !== assignedSessionNumber)) {
      navigate(attempt ? `/employee/sessions/${sessionNumber}/assessment/${attempt.id}` : ROUTES.employeeDashboard, { replace: true });
    }
  }, [assignedSessionNumber, attempt, isLoading, navigate, sessionNumber]);

  if (isLoading) return <LoadingScreen />;
  if (!assessment || !attempt) return null;

  return (
    <EmployeeLayout>
      <div className="max-w-2xl mx-auto">
        <Link to={ROUTES.employeeDashboard} className="inline-flex items-center gap-2 text-sm text-brand-muted no-underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Assessment sessions
        </Link>
        <div className="border-t-4 border-success-500 bg-white px-6 py-8 sm:px-9">
          <CheckCircle2 className="w-10 h-10 text-success-600 mb-5" />
          <p className="text-xs font-bold uppercase tracking-widest text-success-700">Session {String(sessionNumber).padStart(2, '0')} · Submitted</p>
          <h1 className="text-2xl font-bold text-brand-navy mt-2">Assessment received</h1>
          <p className="text-sm text-brand-muted mt-3 leading-relaxed">Your answers for {assessment.title} have been recorded. Trainer-marked responses will be reviewed by the assessment team.</p>
          {attempt.evaluationStatus === 'evaluated' && attempt.rawScore !== null && attempt.maximumScore !== null && attempt.percentage !== null ? (
            <div className="mt-6 border-y border-brand-border py-5">
              <p className="text-xs uppercase tracking-wide text-brand-muted">Final result</p>
              <p className="text-3xl font-bold text-brand-navy mt-1">{attempt.rawScore} / {attempt.maximumScore} <span className="text-lg">({formatPercent(attempt.percentage, 1)})</span></p>
              {resultLevel && <p className={`text-sm font-semibold mt-2 ${resultLevel.color}`}>{resultLevel.label}</p>}
            </div>
          ) : (
            <p className="text-sm text-brand-muted mt-5">Status: submitted · awaiting trainer evaluation</p>
          )}
          <div className="flex items-center gap-2 text-sm text-brand-charcoal mt-6 pt-5 border-t border-brand-border">
            <Clock3 className="w-4 h-4 text-brand-muted" />
            Submitted {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'successfully'}
          </div>
          <Link to={ROUTES.employeeDashboard} className="btn-primary justify-center mt-7 no-underline"><Home className="w-4 h-4" /> Back to Dashboard</Link>
        </div>
      </div>
    </EmployeeLayout>
  );
}
