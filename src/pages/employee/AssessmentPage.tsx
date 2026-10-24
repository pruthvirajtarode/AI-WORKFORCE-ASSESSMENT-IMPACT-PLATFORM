import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Send } from 'lucide-react';
import assessmentsData from '@/data/departmentalAssessments.json';
import { getEmployeeSessionNumber, ROUTES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionAssessments } from '@/hooks/useSessionAssessments';
import type { AssessmentAnswer, AssessmentPart, AssessmentQuestionSource, DepartmentalAssessment } from '@/types/departmentalAssessment';
import TimerBar from '@/components/ui/TimerBar';
import Modal from '@/components/ui/Modal';
import EmployeeLayout from '@/components/layout/EmployeeLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';

const assessments = assessmentsData as unknown as DepartmentalAssessment[];

type Prompt = {
  id: string;
  type: 'choice' | 'multi' | 'num' | 'text' | 'cw' | 'annexq';
  text: string;
  options?: { id: string; text: string }[];
  unit?: string;
  optional?: boolean;
  manual?: boolean;
  short?: boolean;
  url?: boolean;
  placeholder?: string;
  part: AssessmentPart;
};

function getPrompts(assessment: DepartmentalAssessment): Prompt[] {
  const prompts: Prompt[] = [];
  for (const part of assessment.parts) {
    for (const question of part.qs as AssessmentQuestionSource[]) {
      if (question.type === 'cw') {
        for (const [id, text] of Object.entries(question.items ?? {})) {
          prompts.push({
            id,
            type: 'cw',
            text,
            options: [{ id: 'C', text: 'Correct' }, { id: 'W', text: 'Wrong' }],
            part,
          });
        }
      } else if (question.type === 'annexq') {
        prompts.push({
          id: question.id,
          type: 'annexq',
          text: question.text,
          optional: question.optional,
          manual: question.manual,
          part,
        });
      } else {
        prompts.push({
          id: question.id,
          type: question.type,
          text: question.text,
          options: question.opts ? Object.entries(question.opts).map(([id, text]) => ({ id, text })) : undefined,
          unit: question.unit,
          optional: question.optional,
          manual: question.manual,
          short: question.short,
          url: question.url,
          placeholder: question.ph,
          part,
        });
      }
    }
  }
  return prompts;
}

function hasAnswer(answer: AssessmentAnswer | undefined) {
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === 'object' && answer !== null) return Object.values(answer).some((value) => value.trim().length > 0);
  return typeof answer === 'string' && answer.trim().length > 0;
}

export default function AssessmentPage() {
  const { sessionNumber: routeSession, attemptId } = useParams<{ sessionNumber: string; attemptId: string }>();
  const sessionNumber = Number(routeSession);
  const assessment = assessments.find((item) => item.number === sessionNumber);
  const { user } = useAuth();
  const { attempts, isLoading, saveAnswer, submitAttempt } = useSessionAssessments(user);
  const assignedSessionNumber = getEmployeeSessionNumber(user?.departmentId, user?.departmentCode);
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const attempt = attempts.find((item) => item.id === attemptId && item.sessionNumber === sessionNumber);
  const prompts = useMemo(() => assessment ? getPrompts(assessment) : [], [assessment]);
  const current = prompts[currentIndex];

  useEffect(() => {
    if (!isLoading && (!attempt || attempt.status === 'submitted' || sessionNumber !== assignedSessionNumber)) {
      navigate(attempt?.status === 'submitted'
        ? `/employee/sessions/${sessionNumber}/result/${attempt.id}`
        : ROUTES.employeeDashboard, { replace: true });
    }
  }, [assignedSessionNumber, attempt, isLoading, navigate, sessionNumber]);

  useEffect(() => {
    if (attempt) setAnswers(attempt.answers);
  }, [attempt]);

  if (isLoading) return <LoadingScreen />;
  if (!assessment || !attempt || !current) return null;

  const answeredCount = prompts.filter((prompt) => hasAnswer(answers[prompt.id])).length;
  const currentAnswer = answers[current.id];

  const updateAnswer = (value: AssessmentAnswer) => {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    saveAnswer(attempt.id, current.id, value);
  };

  const complete = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await submitAttempt(attempt.id);
      navigate(`/employee/sessions/${sessionNumber}/result/${result.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Submission could not be saved. Your answers remain on this device.');
      setSubmitting(false);
    }
  };

  const renderPrompt = () => {
    if (current.type === 'choice' || current.type === 'multi' || current.type === 'cw') {
      const selected = Array.isArray(currentAnswer) ? currentAnswer : currentAnswer ? [String(currentAnswer)] : [];
      return <div className="space-y-2">
        {current.type === 'multi' && <p className="text-xs text-brand-muted mb-2">Select all that apply</p>}
        {current.options?.map((option) => {
          const active = selected.includes(option.id);
          return <button key={option.id} type="button" onClick={() => {
            if (current.type === 'multi') {
              updateAnswer(active
                ? selected.filter((item) => item !== option.id)
                : [...selected.filter((item) => item !== 'NONE'), option.id]);
            } else {
              updateAnswer(option.id);
            }
          }} className={`question-option w-full text-left ${active ? 'question-option-selected' : ''}`}>
            <span className={`w-5 h-5 shrink-0 border-2 flex items-center justify-center ${current.type === 'multi' ? 'rounded-sm' : 'rounded-full'} ${active ? 'border-brand-blue bg-brand-blue' : 'border-brand-border'}`}>
              {active && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
            <span className="text-sm text-brand-charcoal">{option.text}</span>
          </button>;
        })}
        {current.type === 'multi' && <button type="button" onClick={() => updateAnswer(selected.includes('NONE') ? [] : ['NONE'])} className={`question-option w-full text-left ${selected.includes('NONE') ? 'question-option-selected' : ''}`}>
          <span className="w-5 h-5 shrink-0 border-2 border-brand-border rounded-sm" />
          <span className="text-sm text-brand-charcoal">None of these</span>
        </button>}
      </div>;
    }

    if (current.type === 'num') {
      return <div className="flex items-center gap-3 max-w-md">
        <input type="number" step="any" inputMode="decimal" value={typeof currentAnswer === 'string' ? currentAnswer : ''} onChange={(event) => updateAnswer(event.target.value)} aria-label={`${current.id} answer`} className="input w-full" />
        <span className="text-sm text-brand-muted whitespace-nowrap">{current.unit}</span>
      </div>;
    }

    if (current.type === 'annexq') {
      const value = (typeof currentAnswer === 'object' && !Array.isArray(currentAnswer) ? currentAnswer : {}) as Record<string, string>;
      const fields = [
        ['sec', 'Tender section', false], ['cl', 'Clause no.', false], ['pg', 'Page no.', false],
        ['quote', 'Existing clause (quote)', true], ['query', 'Query / clarification sought', true], ['chg', 'Bidder’s proposed change', true],
      ] as const;
      return <div className="grid sm:grid-cols-2 gap-4">{fields.map(([key, label, multiline]) => <label key={key} className={multiline ? 'sm:col-span-2' : ''}>
        <span className="block text-xs font-semibold text-brand-muted mb-1">{label}</span>
        {multiline ? <textarea rows={3} value={value[key] ?? ''} onChange={(event) => updateAnswer({ ...value, [key]: event.target.value })} className="textarea w-full" />
          : <input value={value[key] ?? ''} onChange={(event) => updateAnswer({ ...value, [key]: event.target.value })} className="input w-full" />}
      </label>)}</div>;
    }

    const text = typeof currentAnswer === 'string' ? currentAnswer : '';
    return <div>
      {current.short ? <input type={current.url ? 'url' : 'text'} value={text} onChange={(event) => updateAnswer(event.target.value)} placeholder={current.placeholder ?? 'Type your answer'} className="input w-full" />
        : <textarea value={text} onChange={(event) => updateAnswer(event.target.value)} placeholder={current.placeholder ?? 'Write your response'} rows={8} className="textarea w-full" />}
      {current.manual && <p className="text-xs text-brand-muted mt-2">Trainer-marked response</p>}
    </div>;
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-white border-b border-brand-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <div className="flex-1"><TimerBar expiresAt={attempt.expiresAt} /></div>
          <span className="text-xs text-brand-muted whitespace-nowrap">{answeredCount}/{prompts.length} answered</span>
          <button onClick={() => setConfirmSubmit(true)} className="btn-primary btn-sm shrink-0" disabled={submitting}><Send className="w-3.5 h-3.5" /> Submit</button>
        </div>
      </header>
      <div className="h-1 bg-brand-cream-dark"><div className="h-full bg-brand-gold transition-all" style={{ width: `${((currentIndex + 1) / prompts.length) * 100}%` }} /></div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-7">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <Link to={`/employee/sessions/${sessionNumber}`} className="inline-flex items-center gap-2 text-xs text-brand-muted no-underline"><ArrowLeft className="w-4 h-4" />Session {String(sessionNumber).padStart(2, '0')}</Link>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">Part {current.part.id} · {current.part.title}</span>
        </div>

        <section className="border-l-4 border-brand-blue bg-white/70 p-4 mb-5">
          <p className="text-sm text-brand-charcoal leading-relaxed whitespace-pre-line">{current.part.briefText}</p>
          {current.part.files.length > 0 && <p className="flex flex-wrap gap-x-2 gap-y-1 mt-3 text-xs text-brand-muted"><FileText className="w-4 h-4" />{current.part.files.join(' · ')}</p>}
        </section>

        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-sm font-semibold text-brand-navy">Response {currentIndex + 1} <span className="font-normal text-brand-muted">of {prompts.length}</span></h1>
          <div className="flex gap-2 text-[11px] text-brand-muted">
            {current.optional && <span>Optional</span>}
            {current.manual && <span>Trainer marked</span>}
            {current.type === 'cw' && <span>0.5 mark</span>}
          </div>
        </div>

        <div className="card p-5 sm:p-7">
          <h2 className="text-base font-medium leading-relaxed text-brand-charcoal mb-6">{current.text}</h2>
          {renderPrompt()}
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} className="btn-secondary" disabled={currentIndex === 0}>Previous</button>
          <div className="flex-1" />
          {currentIndex < prompts.length - 1
            ? <button onClick={() => setCurrentIndex((index) => Math.min(prompts.length - 1, index + 1))} className="btn-primary">Next <ArrowRight className="w-4 h-4" /></button>
            : <button onClick={() => setConfirmSubmit(true)} className="btn-primary"><CheckCircle2 className="w-4 h-4" />Review and Submit</button>}
        </div>
        {submitError && <p role="alert" className="text-sm text-danger-700 mt-4">{submitError}</p>}
      </main>

      <Modal isOpen={confirmSubmit} onClose={() => !submitting && setConfirmSubmit(false)} title="Submit Assessment" size="sm">
        <p className="text-sm text-brand-muted mb-5">You have answered {answeredCount} of {prompts.length} response fields. Submitted answers cannot be changed.</p>
        {submitError && <p role="alert" className="text-sm text-danger-700 mb-4">{submitError}</p>}
        <div className="flex gap-3">
          <button onClick={() => setConfirmSubmit(false)} className="btn-secondary flex-1" disabled={submitting}>Continue</button>
          <button onClick={() => void complete()} className="btn-primary flex-1" disabled={submitting}>{submitting ? 'Submitting...' : 'Confirm Submit'}</button>
        </div>
      </Modal>
    </div>
  );
}
