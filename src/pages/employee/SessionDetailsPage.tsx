import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, FileText, ShieldCheck } from 'lucide-react';
import assessmentsData from '@/data/departmentalAssessments.json';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionAssessments } from '@/hooks/useSessionAssessments';
import type { DepartmentalAssessment } from '@/types/departmentalAssessment';
import EmployeeLayout from '@/components/layout/EmployeeLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';

const assessments = assessmentsData as unknown as DepartmentalAssessment[];

export default function SessionDetailsPage() {
  const { sessionNumber: routeSession } = useParams<{ sessionNumber: string }>();
  const sessionNumber = Number(routeSession);
  const assessment = assessments.find((item) => item.number === sessionNumber);
  const { user } = useAuth();
  const { attempts, isLoading, startAttempt } = useSessionAssessments(user?.id);
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const attempt = useMemo(() => attempts.find((item) => item.sessionNumber === sessionNumber), [attempts, sessionNumber]);

  if (isLoading) return <LoadingScreen />;
  if (!assessment) {
    return <EmployeeLayout><p className="text-sm text-brand-muted">Assessment session not found.</p></EmployeeLayout>;
  }

  const startOrResume = async () => {
    setStarting(true);
    setStartError('');
    try {
      const nextAttempt = attempt ?? await startAttempt(sessionNumber, assessment.durationMinutes);
      navigate(`/employee/sessions/${sessionNumber}/assessment/${nextAttempt.id}`);
    } catch (error) {
      setStartError(error instanceof Error ? error.message : 'The assessment attempt could not be started.');
      setStarting(false);
    }
  };
  const status = attempt?.status === 'submitted' ? 'Completed' : attempt ? 'In Progress' : 'Not Started';

  return (
    <EmployeeLayout>
      <div className="max-w-3xl mx-auto">
        <Link to={ROUTES.employeeDashboard} className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-navy no-underline mb-8">
          <ArrowLeft className="w-4 h-4" /> All assessment sessions
        </Link>

        <div className="border-b-2 border-brand-navy pb-7 mb-7">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Session {String(assessment.number).padStart(2, '0')}</span>
            <span className="text-xs font-medium text-brand-muted">{assessment.category}</span>
            <span className={`text-xs font-semibold ${attempt?.status === 'submitted' ? 'text-success-700' : 'text-brand-muted'}`}>{status}</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-brand-navy">{assessment.title}</h1>
          <p className="text-base text-brand-muted mt-4 leading-relaxed">{assessment.description}</p>
          <p className="text-sm text-brand-charcoal mt-4 leading-relaxed">{assessment.introduction}</p>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 border-y border-brand-border mb-8">
          <div className="py-4 pr-3 border-r border-brand-border"><dt className="text-xs text-brand-muted">Duration</dt><dd className="mt-1 flex items-center gap-2 font-semibold text-brand-navy"><Clock3 className="w-4 h-4" />{assessment.durationMinutes} minutes</dd></div>
          <div className="py-4 px-3 sm:border-r border-brand-border"><dt className="text-xs text-brand-muted">Questions</dt><dd className="mt-1 font-semibold text-brand-navy">{assessment.questionCount}</dd></div>
          <div className="py-4 pr-3 sm:px-3 border-r border-brand-border"><dt className="text-xs text-brand-muted">Total marks</dt><dd className="mt-1 font-semibold text-brand-navy">{assessment.totalMarks}</dd></div>
          <div className="py-4 pl-3"><dt className="text-xs text-brand-muted">Attempts</dt><dd className="mt-1 flex items-center gap-2 font-semibold text-brand-navy"><ShieldCheck className="w-4 h-4" />One attempt</dd></div>
        </dl>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-brand-navy mb-3">Assessment instructions</h2>
          <ul className="space-y-2 text-sm text-brand-charcoal">
            {assessment.instructions.map((instruction) => <li key={instruction} className="flex gap-2"><span className="text-brand-gold">•</span><span>{instruction}</span></li>)}
            <li className="flex gap-2"><span className="text-brand-gold">•</span><span>Answers are saved as you work. Your timer continues if you leave or refresh the page.</span></li>
            <li className="flex gap-2"><span className="text-brand-gold">•</span><span>Questions marked for the trainer will be reviewed after submission.</span></li>
          </ul>
        </section>

        <section className="border-t border-brand-border pt-6 mb-8">
          <h2 className="text-lg font-bold text-brand-navy mb-4">Assessment parts</h2>
          <div className="divide-y divide-brand-border">
            {assessment.parts.map((part) => (
              <div key={part.id} className="py-3 grid sm:grid-cols-[2rem_1fr_auto] gap-2 sm:gap-4 items-start">
                <span className="font-mono text-xs font-bold text-brand-muted">{part.id}</span>
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy">{part.title}</h3>
                  <p className="text-xs text-brand-muted mt-1 whitespace-pre-line">{part.briefText}</p>
                  {part.files.length > 0 && <p className="flex flex-wrap gap-x-2 gap-y-1 mt-2 text-[11px] text-brand-muted"><FileText className="w-3.5 h-3.5" />{part.files.join(' · ')}</p>}
                </div>
                <span className="text-xs text-brand-muted">~{part.mins} min</span>
              </div>
            ))}
          </div>
        </section>

        {attempt?.status === 'submitted' ? (
          <div className="flex items-center gap-3 border-t border-brand-border pt-6 text-success-700">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-semibold">Submitted {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : ''}</p>
          </div>
        ) : (
          <button onClick={() => void startOrResume()} disabled={starting} className="btn-primary w-full justify-center">
            {starting ? 'Starting...' : attempt ? 'Continue Assessment' : 'Start Assessment'} <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {startError && <p role="alert" className="text-sm text-danger-700 mt-3">{startError}</p>}
      </div>
    </EmployeeLayout>
  );
}