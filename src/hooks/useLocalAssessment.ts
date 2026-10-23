/**
 * Local assessment engine — provides a fully working post-training assessment
 * experience using the static question bank. Persists state to localStorage.
 */
import { useState, useCallback } from 'react';
import type { DeliveredQuestion, AnswerDraft, QuestionType, CompetencyKey, Difficulty } from '@/types';
import { ASSESSMENT_DEFAULTS } from '@/lib/constants';

// ─── Import question banks ──────────────────────────────────
import { COMMON_PRE_QUESTIONS, COMMON_POST_QUESTIONS } from '@/data/questions/common';
import { EPC_PRE_QUESTIONS, EPC_POST_QUESTIONS } from '@/data/questions/epc';
import { ACC_PRE_QUESTIONS, ACC_POST_QUESTIONS } from '@/data/questions/accounts';
import { PAC_PRE_QUESTIONS, PAC_POST_QUESTIONS } from '@/data/questions/people';
import {
  CPS_PRE_QUESTIONS, CPS_POST_QUESTIONS,
  PRO_PRE_QUESTIONS, PRO_POST_QUESTIONS,
  DDQ_PRE_QUESTIONS, DDQ_POST_QUESTIONS,
} from '@/data/questions/other-depts';
import {
  EPC_PRACTICAL, ACC_PRACTICAL, PAC_PRACTICAL,
  CPS_PRACTICAL, PRO_PRACTICAL, DDQ_PRACTICAL,
} from '@/data/questions/practical';

type SeedQ = {
  id: string;
  department_id?: string | null;
  question_type?: string;
  competency?: string;
  difficulty?: string;
  question_text?: string;
  scenario_text?: string;
  max_marks?: number;
  options?: { id: string; text: string }[];
  correct_answer?: string | string[];
  rubric?: string;
  explanation?: string;
  assessment_phase?: string;
  is_active?: boolean;
};

// Use all available questions — both pre and post banks are valid content
const ALL_QUESTIONS: SeedQ[] = [
  ...COMMON_PRE_QUESTIONS,
  ...COMMON_POST_QUESTIONS,
  ...EPC_PRE_QUESTIONS,
  ...EPC_POST_QUESTIONS,
  ...ACC_PRE_QUESTIONS,
  ...ACC_POST_QUESTIONS,
  ...PAC_PRE_QUESTIONS,
  ...PAC_POST_QUESTIONS,
  ...CPS_PRE_QUESTIONS,
  ...CPS_POST_QUESTIONS,
  ...PRO_PRE_QUESTIONS,
  ...PRO_POST_QUESTIONS,
  ...DDQ_PRE_QUESTIONS,
  ...DDQ_POST_QUESTIONS,
  ...EPC_PRACTICAL,
  ...ACC_PRACTICAL,
  ...PAC_PRACTICAL,
  ...CPS_PRACTICAL,
  ...PRO_PRACTICAL,
  ...DDQ_PRACTICAL,
] as SeedQ[];

function getQuestionsForDept(departmentId: string): DeliveredQuestion[] {
  const pool = ALL_QUESTIONS.filter((q) => {
    if (!q.id || !q.question_type) return false;
    const deptOk = !q.department_id || q.department_id === departmentId;
    return deptOk && q.is_active !== false;
  });

  // Shuffle
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const deptSpecific = shuffled.filter((q) => q.department_id === departmentId);
  const common = shuffled.filter((q) => !q.department_id);

  const deptCount = Math.min(deptSpecific.length, Math.floor(ASSESSMENT_DEFAULTS.questionCount * 0.4));
  const commonCount = Math.min(common.length, ASSESSMENT_DEFAULTS.questionCount - deptCount);
  const selected = [...deptSpecific.slice(0, deptCount), ...common.slice(0, commonCount)].sort(() => Math.random() - 0.5);

  return selected.slice(0, ASSESSMENT_DEFAULTS.questionCount).map((q, i) => ({
    id: q.id!,
    question_type: (q.question_type ?? 'mcq') as QuestionType,
    competency: (q.competency ?? 'ai_fundamentals') as CompetencyKey,
    difficulty: (q.difficulty ?? 'medium') as Difficulty,
    question_text: q.question_text ?? '',
    scenario_text: q.scenario_text ?? null,
    options: q.options ?? null,
    marks: q.max_marks ?? 2,
    sequence: i + 1,
  }));
}

// ─── Score calculation ──────────────────────────────────────
function scoreAnswer(questionId: string, answer: AnswerDraft): { awarded: number; max: number } {
  const q = ALL_QUESTIONS.find((x) => x.id === questionId);
  if (!q) return { awarded: 0, max: 0 };
  const max = q.max_marks ?? 2;

  if (q.question_type === 'mcq' && answer.selected_options?.length) {
    const correct = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer as string];
    const isCorrect = answer.selected_options.length === 1 && correct.includes(answer.selected_options[0]);
    return { awarded: isCorrect ? max : 0, max };
  }
  if (q.question_type === 'multiple_select' && answer.selected_options) {
    const correct = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer as string ?? ''];
    const selected = answer.selected_options;
    const correctSelected = selected.filter((s) => correct.includes(s)).length;
    const incorrectSelected = selected.filter((s) => !correct.includes(s)).length;
    const awarded = Math.max(0, Math.round((correctSelected / correct.length) * max - incorrectSelected * (max / correct.length)));
    return { awarded, max };
  }
  // Subjective — provisional partial credit for local mode
  if (answer.answer_text && answer.answer_text.trim().length > 20) {
    return { awarded: Math.round(max * 0.6), max }; // provisional 60%
  }
  return { awarded: 0, max };
}

// ─── Types ──────────────────────────────────────────────────
const SESSION_KEY = 'suroj_assessment_session';
const RESULT_KEY = 'suroj_post_result';

export interface LocalSession {
  id: string;
  employeeId: string;
  departmentId: string;
  questions: DeliveredQuestion[];
  answers: Record<string, AnswerDraft>;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  status: 'in_progress' | 'submitted';
}

export interface LocalResult {
  sessionId: string;
  departmentId: string;
  submittedAt: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  competencyScores: Record<string, { score: number; max: number; percentage: number }>;
  timeTaken: number;
}

function loadSession(): LocalSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); } catch { return null; }
}
function saveSession(s: LocalSession) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function loadResult(): LocalResult | null {
  try { return JSON.parse(localStorage.getItem(RESULT_KEY) ?? 'null'); } catch { return null; }
}
function persistResult(r: LocalResult) {
  localStorage.setItem(RESULT_KEY, JSON.stringify(r));
}

// ─── Hook ───────────────────────────────────────────────────
export function useLocalAssessment() {
  const [session, setSession] = useState<LocalSession | null>(loadSession);
  const [result, setResult] = useState<LocalResult | null>(loadResult);

  const hasCompleted = result !== null;

  const startAssessment = useCallback((
    employeeId: string, departmentId: string,
  ): LocalSession => {
    const questions = getQuestionsForDept(departmentId);
    const now = new Date();
    const expires = new Date(now.getTime() + ASSESSMENT_DEFAULTS.durationMinutes * 60 * 1000);
    const newSession: LocalSession = {
      id: `sess-${Date.now()}`,
      employeeId, departmentId, questions,
      answers: {},
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      submittedAt: null,
      status: 'in_progress',
    };
    saveSession(newSession);
    setSession(newSession);
    return newSession;
  }, []);

  const saveAnswer = useCallback((questionId: string, draft: AnswerDraft) => {
    setSession((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, answers: { ...prev.answers, [questionId]: draft } };
      saveSession(updated);
      return updated;
    });
  }, []);

  const submitAssessment = useCallback((): LocalResult | null => {
    const s = loadSession();
    if (!s || s.status === 'submitted') return null;

    const now = new Date();
    const timeTaken = Math.floor((now.getTime() - new Date(s.startedAt).getTime()) / 1000);

    let rawScore = 0;
    let maxScore = 0;
    const competencyMap: Record<string, { score: number; max: number }> = {};

    for (const q of s.questions) {
      const answer = s.answers[q.id] ?? {};
      const { awarded, max } = scoreAnswer(q.id, answer);
      rawScore += awarded;
      maxScore += max;
      if (!competencyMap[q.competency]) competencyMap[q.competency] = { score: 0, max: 0 };
      competencyMap[q.competency].score += awarded;
      competencyMap[q.competency].max += max;
    }

    const competencyScores: LocalResult['competencyScores'] = {};
    for (const [key, { score, max }] of Object.entries(competencyMap)) {
      competencyScores[key] = { score, max, percentage: max > 0 ? (score / max) * 100 : 0 };
    }

    const newResult: LocalResult = {
      sessionId: s.id, departmentId: s.departmentId,
      submittedAt: now.toISOString(), rawScore, maxScore,
      percentage: maxScore > 0 ? (rawScore / maxScore) * 100 : 0,
      competencyScores, timeTaken,
    };

    const submitted = { ...s, submittedAt: now.toISOString(), status: 'submitted' as const };
    saveSession(submitted);
    setSession(submitted);
    persistResult(newResult);
    setResult(newResult);
    return newResult;
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return { session, result, hasCompleted, startAssessment, saveAnswer, submitAssessment, clearSession };
}
