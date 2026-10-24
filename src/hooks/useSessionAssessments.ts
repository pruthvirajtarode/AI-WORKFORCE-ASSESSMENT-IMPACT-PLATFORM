import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AssessmentAnswer, SessionAttempt } from '@/types/departmentalAssessment';

const STORAGE_PREFIX = 'suroj_session_attempts_v1';

function canUseSupabase(userId: string) {
  return isSupabaseConfigured && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
}

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function readLocalAttempts(userId: string): SessionAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]') as SessionAttempt[];
  } catch {
    return [];
  }
}

function writeLocalAttempts(userId: string, attempts: SessionAttempt[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(attempts));
}

function fromDatabase(row: Record<string, unknown>): SessionAttempt {
  return {
    id: String(row.id),
    employeeUserId: String(row.employee_user_id),
    employeeId: row.employee_id ? String(row.employee_id) : null,
    departmentId: row.department_id ? String(row.department_id) : null,
    sessionNumber: Number(row.session_number),
    assessmentTitle: String(row.assessment_title ?? `Session ${row.session_number}`),
    status: row.status as SessionAttempt['status'],
    evaluationStatus: row.evaluation_status === 'evaluated' ? 'evaluated' : 'pending',
    attemptNumber: Number(row.attempt_number ?? 1),
    startedAt: String(row.started_at),
    expiresAt: String(row.expires_at),
    submittedAt: row.submitted_at ? String(row.submitted_at) : null,
    maximumScore: typeof row.maximum_score === 'number' ? row.maximum_score : null,
    rawScore: typeof row.raw_score === 'number' ? row.raw_score : null,
    percentage: typeof row.percentage === 'number' ? row.percentage : null,
    timeTakenSeconds: typeof row.time_taken_seconds === 'number' ? row.time_taken_seconds : null,
    answers: (row.answers ?? {}) as Record<string, AssessmentAnswer>,
  };
}

export interface AssessmentUser {
  id: string;
  employeeDbId?: string;
  departmentId?: string;
}

export function useSessionAssessments(user: AssessmentUser | null | undefined) {
  const userId = user?.id;
  const [attempts, setAttempts] = useState<SessionAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pendingWrites = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const replaceAttempts = useCallback((next: SessionAttempt[]) => {
    setAttempts(next);
    if (userId) writeLocalAttempts(userId, next);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setAttempts([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    const local = readLocalAttempts(userId);
    setAttempts(local);
    const remoteEnabled = canUseSupabase(userId);
    setIsLoading(remoteEnabled);

    if (!remoteEnabled) return () => { active = false; };

    void supabase
      .from('assessment_attempts')
      .select('*')
      .eq('employee_user_id', userId)
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) {
          const remote = data.map((row) => fromDatabase(row as Record<string, unknown>));
          const remoteBySession = new Map(remote.map((attempt) => [attempt.sessionNumber, attempt]));
          const merged = remote.map((attempt) => {
            const localAttempt = local.find((item) => item.sessionNumber === attempt.sessionNumber && item.id === attempt.id);
            if (!localAttempt || localAttempt.status === 'submitted' || attempt.status === 'submitted') return attempt;
            const recovered = { ...attempt, answers: { ...attempt.answers, ...localAttempt.answers } };
            if (canUseSupabase(userId) && Object.keys(localAttempt.answers).length > 0) {
              void supabase.from('assessment_attempts')
                .update({ answers: recovered.answers, updated_at: new Date().toISOString() })
                .eq('id', attempt.id)
                .eq('employee_user_id', userId)
                .eq('status', 'in_progress');
            }
            return recovered;
          });
          for (const attempt of local) {
            if (!remoteBySession.has(attempt.sessionNumber)) merged.push(attempt);
          }
          replaceAttempts(merged);
        }
        setIsLoading(false);
      });

    return () => { active = false; };
  }, [userId, replaceAttempts]);

  useEffect(() => () => {
    for (const timeout of pendingWrites.current.values()) clearTimeout(timeout);
  }, []);

  const startAttempt = useCallback(async (
    sessionNumber: number,
    durationMinutes: number,
    assessmentTitle: string,
    maximumScore: number,
  ) => {
    if (!userId) throw new Error('You must be signed in to start an assessment.');
    if (canUseSupabase(userId) && !user?.employeeDbId) {
      throw new Error('Your employee profile is not linked. Contact your administrator before starting.');
    }
    const previous = attempts.find((attempt) => attempt.sessionNumber === sessionNumber);
    if (previous) return previous;

    const started = new Date();
    const attempt: SessionAttempt = {
      id: crypto.randomUUID(),
      employeeUserId: userId,
      employeeId: user?.employeeDbId ?? null,
      departmentId: user?.departmentId ?? null,
      sessionNumber,
      assessmentTitle,
      status: 'in_progress',
      evaluationStatus: 'pending',
      attemptNumber: 1,
      startedAt: started.toISOString(),
      expiresAt: new Date(started.getTime() + durationMinutes * 60_000).toISOString(),
      submittedAt: null,
      maximumScore,
      rawScore: null,
      percentage: null,
      timeTakenSeconds: null,
      answers: {},
    };

    if (canUseSupabase(userId)) {
      const { data, error } = await supabase
        .from('assessment_attempts')
        .insert({
          id: attempt.id,
          employee_user_id: userId,
          employee_id: attempt.employeeId,
          department_id: attempt.departmentId,
          session_number: sessionNumber,
          assessment_title: assessmentTitle,
          status: attempt.status,
          started_at: attempt.startedAt,
          expires_at: attempt.expiresAt,
          maximum_score: maximumScore,
          evaluation_status: attempt.evaluationStatus,
          attempt_number: attempt.attemptNumber,
          answers: attempt.answers,
        })
        .select('*')
        .single();

      if (error) {
        if (error.code === '23505') {
          const existing = await supabase
            .from('assessment_attempts')
            .select('*')
            .eq('employee_user_id', userId)
            .eq('session_number', sessionNumber)
            .single();
          if (existing.data) return fromDatabase(existing.data as Record<string, unknown>);
        }
        throw new Error(error.message);
      }
      if (data) Object.assign(attempt, fromDatabase(data as Record<string, unknown>));
    }

    replaceAttempts([...attempts, attempt]);
    return attempt;
  }, [attempts, replaceAttempts, user, userId]);

  const saveAnswer = useCallback((attemptId: string, questionId: string, answer: AssessmentAnswer) => {
    if (!userId) return;
    const current = attempts.find((attempt) => attempt.id === attemptId);
    if (!current || current.status !== 'in_progress') return;
    const updated = { ...current, answers: { ...current.answers, [questionId]: answer } };
    const next = attempts.map((attempt) => attempt.id === attemptId ? updated : attempt);
    replaceAttempts(next);

    const previousTimeout = pendingWrites.current.get(attemptId);
    if (previousTimeout) clearTimeout(previousTimeout);
    if (canUseSupabase(userId)) {
      pendingWrites.current.set(attemptId, setTimeout(() => {
        void supabase
          .from('assessment_attempts')
          .update({ answers: updated.answers, updated_at: new Date().toISOString() })
          .eq('id', attemptId)
          .eq('employee_user_id', userId)
          .eq('status', 'in_progress');
      }, 500));
    }
  }, [attempts, replaceAttempts, userId]);

  const submitAttempt = useCallback(async (attemptId: string) => {
    if (!userId) throw new Error('You must be signed in to submit an assessment.');
    const current = attempts.find((attempt) => attempt.id === attemptId);
    if (!current || current.status !== 'in_progress') throw new Error('This attempt is not available for submission.');
    const pending = pendingWrites.current.get(attemptId);
    if (pending) clearTimeout(pending);
    pendingWrites.current.delete(attemptId);

    const submitted: SessionAttempt = {
      ...current,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      timeTakenSeconds: Math.max(0, Math.floor((Date.now() - new Date(current.startedAt).getTime()) / 1000)),
    };
    if (canUseSupabase(userId)) {
      const { data, error } = await supabase
        .from('assessment_attempts')
        .update({
          answers: submitted.answers,
          status: submitted.status,
          submitted_at: submitted.submittedAt,
          time_taken_seconds: submitted.timeTakenSeconds,
          evaluation_status: submitted.evaluationStatus,
          updated_at: submitted.submittedAt,
        })
        .eq('id', attemptId)
        .eq('employee_user_id', userId)
        .eq('status', 'in_progress')
        .select('id, status, submitted_at')
        .single();
      if (error) throw new Error(error.message);
      if (!data || data.status !== 'submitted') throw new Error('Supabase did not confirm the submission.');
    }
    replaceAttempts(attempts.map((attempt) => attempt.id === attemptId ? submitted : attempt));
    return submitted;
  }, [attempts, replaceAttempts, userId]);

  return { attempts, isLoading, startAttempt, saveAnswer, submitAttempt };
}