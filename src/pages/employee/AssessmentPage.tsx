import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Send, Flag, CheckSquare, Square,
  LayoutGrid, X, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalAssessment } from '@/hooks/useLocalAssessment';
import type { DeliveredQuestion, AnswerDraft, QuestionType } from '@/types';
import { ROUTES } from '@/lib/constants';
import TimerBar from '@/components/ui/TimerBar';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

// ─── Question type label ─────────────────────────────────────
const Q_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'MCQ', multiple_select: 'Multi-Select', short_answer: 'Short Answer',
  long_answer: 'Long Answer', scenario: 'Scenario', prompt_writing: 'Prompt Writing',
  document_analysis: 'Document Analysis', data_analysis: 'Data Analysis',
  output_evaluation: 'Output Evaluation', workflow_design: 'Workflow Design',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'success', medium: 'blue', hard: 'warning', expert: 'danger',
} as const;

// ─── Single Question Renderer ─────────────────────────────────
interface QuestionViewProps {
  question: DeliveredQuestion;
  answer: AnswerDraft;
  onChange: (draft: AnswerDraft) => void;
  marked: boolean;
  onToggleMark: () => void;
}

function QuestionView({ question, answer, onChange, marked, onToggleMark }: QuestionViewProps) {
  const isObjective = question.question_type === 'mcq' || question.question_type === 'multiple_select';
  const isMulti = question.question_type === 'multiple_select';

  const handleOption = (optId: string) => {
    if (isMulti) {
      const prev = answer.selected_options ?? [];
      const next = prev.includes(optId) ? prev.filter((x) => x !== optId) : [...prev, optId];
      onChange({ ...answer, selected_options: next });
    } else {
      onChange({ ...answer, selected_options: [optId] });
    }
  };

  return (
    <div className="card p-7 animate-fade-in">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={'gray' as any} className="text-xs">
            {Q_TYPE_LABELS[question.question_type]}
          </Badge>
          <Badge variant={(DIFFICULTY_COLORS[question.difficulty] ?? 'gray') as any} className="text-xs capitalize">
            {question.difficulty}
          </Badge>
          <span className="text-xs text-brand-muted">{question.marks} marks</span>
        </div>
        <button
          onClick={onToggleMark}
          className={cn('flex items-center gap-1.5 text-xs font-medium transition-colors', 
            marked ? 'text-warning-600' : 'text-brand-muted hover:text-warning-600'
          )}
          title={marked ? 'Remove flag' : 'Flag for review'}
        >
          <Flag className={cn('w-3.5 h-3.5', marked && 'fill-warning-500')} />
          {marked ? 'Flagged' : 'Flag'}
        </button>
      </div>

      {/* Scenario */}
      {question.scenario_text && (
        <div className="bg-brand-cream rounded-xl p-5 mb-5 border-l-4 border-brand-gold">
          <p className="text-sm font-semibold text-brand-navy mb-2">Scenario</p>
          <p className="text-sm text-brand-charcoal whitespace-pre-wrap leading-relaxed">{question.scenario_text}</p>
        </div>
      )}

      {/* Question Text */}
      <p className="text-brand-charcoal font-medium leading-relaxed mb-6 text-[15px]">
        {question.question_text}
      </p>

      {/* Options / Input */}
      {isObjective && question.options ? (
        <div className="space-y-3">
          {isMulti && (
            <p className="text-xs text-brand-muted mb-1">Select all that apply</p>
          )}
          {question.options.map((opt) => {
            const selected = (answer.selected_options ?? []).includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => handleOption(opt.id)}
                className={cn(
                  'question-option w-full text-left',
                  selected && 'question-option-selected',
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded shrink-0 border-2 flex items-center justify-center mt-0.5 transition-all',
                  isMulti ? 'rounded-sm' : 'rounded-full',
                  selected ? 'border-brand-blue bg-brand-blue' : 'border-brand-border',
                )}>
                  {selected && (
                    <div className={cn('bg-white', isMulti ? 'w-2.5 h-2.5 rounded-sm' : 'w-2 h-2 rounded-full')} />
                  )}
                </div>
                <span className="text-sm text-brand-charcoal">{opt.text}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          {['short_answer', 'prompt_writing'].includes(question.question_type) ? (
            <textarea
              value={answer.answer_text ?? ''}
              onChange={(e) => onChange({ ...answer, answer_text: e.target.value })}
              placeholder="Type your answer here... Be specific and practical. Reference real workplace scenarios."
              className="textarea w-full h-32 text-sm"
            />
          ) : (
            <textarea
              value={answer.answer_text ?? ''}
              onChange={(e) => onChange({ ...answer, answer_text: e.target.value })}
              placeholder="Type your detailed answer here... Use bullet points, numbered lists, or structured paragraphs. Be specific and practical."
              className="textarea w-full h-48 text-sm"
            />
          )}
          <div className="flex justify-between text-xs text-brand-muted mt-1.5">
            <span>
              {['short_answer', 'prompt_writing'].includes(question.question_type)
                ? 'Aim for 3–6 sentences'
                : 'Detailed response required (minimum 5 points)'}
            </span>
            <span>{(answer.answer_text ?? '').length} chars</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nav Dot ─────────────────────────────────────────────────
function NavDot({
  seq, current, answered, flagged, onClick,
}: { seq: number; current: boolean; answered: boolean; flagged: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'nav-dot',
        current && 'nav-dot-current',
        !current && flagged && 'nav-dot-marked',
        !current && !flagged && answered && 'nav-dot-answered',
        !current && !flagged && !answered && 'nav-dot-unanswered',
      )}
    >
      {seq}
    </button>
  );
}

// ─── Main Assessment Page ─────────────────────────────────────
export default function AssessmentPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, saveAnswer, submitAssessment } = useLocalAssessment();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>(session?.answers ?? {});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showNav, setShowNav] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if no session or wrong session
  useEffect(() => {
    if (!session || session.id !== sessionId || session.status === 'submitted') {
      navigate(ROUTES.employeeDashboard);
    }
  }, [session, sessionId, navigate]);

  if (!session) return null;

  const questions = session.questions;
  const currentQ = questions[currentIdx];
  const currentAnswer = answers[currentQ?.id] ?? {};

  const handleAnswerChange = (draft: AnswerDraft) => {
    if (!currentQ) return;
    const updated = { ...answers, [currentQ.id]: draft };
    setAnswers(updated);
    saveAnswer(currentQ.id, draft);
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      currentQ && (next.has(currentQ.id) ? next.delete(currentQ.id) : next.add(currentQ.id));
      return next;
    });
  };

  const isAnswered = (q: DeliveredQuestion) => {
    const a = answers[q.id];
    if (!a) return false;
    if (a.selected_options?.length) return true;
    if (a.answer_text?.trim()) return true;
    return false;
  };

  const answeredCount = questions.filter(isAnswered).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = flagged.size;

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = submitAssessment();
    if (result) {
      navigate(`/assessment/${session.id}/result`);
    } else {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Top Bar */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
          <div className="flex-1">
            <TimerBar expiresAt={session.expiresAt} onExpire={handleSubmit} />
          </div>
          <div className="text-xs text-brand-muted hidden sm:block shrink-0">
            {answeredCount}/{questions.length} answered
          </div>
          <button
            onClick={() => setShowNav(true)}
            className="btn-secondary btn-sm gap-1.5 shrink-0"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Navigator</span>
          </button>
          <button
            id="submit-assessment-btn"
            onClick={() => setShowSubmitConfirm(true)}
            className="btn-primary btn-sm shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Submit
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-brand-cream-dark">
        <div
          className="h-full bg-brand-gold transition-all duration-300"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Question Number */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-sm font-semibold text-brand-navy">
            Question {currentIdx + 1} <span className="text-brand-muted font-normal">of {questions.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-muted">
            {unansweredCount > 0 && (
              <span>{unansweredCount} unanswered</span>
            )}
            {flaggedCount > 0 && (
              <span className="text-warning-600">{flaggedCount} flagged</span>
            )}
          </div>
        </div>

        {currentQ && (
          <QuestionView
            question={currentQ}
            answer={currentAnswer}
            onChange={handleAnswerChange}
            marked={flagged.has(currentQ.id)}
            onToggleMark={toggleFlag}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="btn-secondary"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <div className="flex-1" />
          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              className="btn-primary"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => setShowSubmitConfirm(true)} className="btn-gold">
              <Send className="w-4 h-4" /> Submit Assessment
            </button>
          )}
        </div>
      </main>

      {/* Navigator Modal */}
      <Modal isOpen={showNav} onClose={() => setShowNav(false)} title="Question Navigator" size="lg">
        <div className="mb-4 flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-navy" /> Answered</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-gold" /> Current</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-warning-200" /> Flagged</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-brand-border bg-white" /> Unanswered</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <NavDot
              key={q.id}
              seq={i + 1}
              current={i === currentIdx}
              answered={isAnswered(q)}
              flagged={flagged.has(q.id)}
              onClick={() => { setCurrentIdx(i); setShowNav(false); }}
            />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-brand-border flex justify-between text-sm text-brand-muted">
          <span>{answeredCount} answered, {unansweredCount} remaining</span>
          <button onClick={() => setShowNav(false)} className="btn-secondary btn-sm">Close</button>
        </div>
      </Modal>

      {/* Submit Confirm Modal */}
      <Modal isOpen={showSubmitConfirm} onClose={() => !submitting && setShowSubmitConfirm(false)} title="Submit Assessment" size="sm">
        {unansweredCount > 0 && (
          <div className="flex items-start gap-2 bg-warning-50 border border-warning-200 rounded-xl p-3.5 mb-5">
            <AlertTriangle className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
            <p className="text-sm text-warning-700">
              You have <strong>{unansweredCount} unanswered</strong> question{unansweredCount > 1 ? 's' : ''}.
              Unanswered questions will receive zero marks.
            </p>
          </div>
        )}
        <p className="text-sm text-brand-muted mb-6">
          Once submitted, you cannot return to this assessment. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setShowSubmitConfirm(false)} className="btn-secondary flex-1" disabled={submitting}>
            Continue Reviewing
          </button>
          <button
            id="confirm-submit-btn"
            onClick={handleSubmit}
            className="btn-primary flex-1"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Confirm Submit'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
