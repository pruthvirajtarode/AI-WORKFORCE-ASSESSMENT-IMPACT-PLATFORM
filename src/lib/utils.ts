import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AIReadinessLevel, AssessmentPhase, CompetencyCategory, Difficulty, QuestionType } from '@/types';

// ─── CSS class merge utility ────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Number formatting ──────────────────────────────────────
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatScore(score: number, max: number): string {
  return `${score}/${max}`;
}

/** @deprecated No longer used — retained for compatibility. */
export function formatImprovement(value: number): string {
  return value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}

// ─── Date formatting ────────────────────────────────────────
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ─── AI Readiness ────────────────────────────────────────────
export function getAIReadinessLevel(percentage: number): AIReadinessLevel {
  if (percentage < 40) return 'needs_development';
  if (percentage < 60) return 'developing';
  if (percentage < 75) return 'operational';
  if (percentage < 90) return 'advanced';
  return 'ai_leader';
}

export const AI_READINESS_CONFIG: Record<
  AIReadinessLevel,
  { label: string; color: string; bgColor: string; description: string }
> = {
  needs_development: {
    label: 'Needs Development',
    color: 'text-danger-600',
    bgColor: 'bg-danger-50',
    description: 'Requires foundational AI skill building',
  },
  developing: {
    label: 'Developing',
    color: 'text-warning-700',
    bgColor: 'bg-warning-50',
    description: 'Building core AI competencies',
  },
  operational: {
    label: 'Operational',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description: 'Capable of everyday AI-assisted work',
  },
  advanced: {
    label: 'Advanced',
    color: 'text-success-700',
    bgColor: 'bg-success-50',
    description: 'Proficient in AI-driven workflows',
  },
  ai_leader: {
    label: 'AI Leader',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    description: 'Exemplary AI adoption and advocacy',
  },
};

// ─── Competency labels ───────────────────────────────────────
export const COMPETENCY_LABELS: Record<CompetencyCategory, string> = {
  ai_fundamentals: 'AI Fundamentals',
  generative_ai: 'Generative AI',
  prompt_engineering: 'Prompt Engineering',
  claude_usage: 'Claude / AI Assistant',
  document_analysis: 'Document Analysis',
  data_analysis: 'Data Analysis',
  department_application: 'Department Application',
  critical_verification: 'Critical Verification',
  workflow_design: 'AI Workflow Design',
  productivity_automation: 'Productivity & Automation',
};

// ─── Question type labels ────────────────────────────────────
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'Multiple Choice',
  multiple_select: 'Multiple Select',
  short_answer: 'Short Answer',
  long_answer: 'Long Answer',
  scenario: 'Scenario Based',
  prompt_writing: 'Prompt Writing',
  document_analysis: 'Document Analysis',
  data_analysis: 'Data Analysis',
  output_evaluation: 'Output Evaluation',
  workflow_design: 'Workflow Design',
};

// ─── Difficulty labels ───────────────────────────────────────
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'badge-success',
  medium: 'badge-blue',
  hard: 'badge-warning',
  expert: 'badge-danger',
};

// ─── Assessment phase labels ─────────────────────────────────
// Only post-training is used operationally; 'pre' kept for question-bank metadata.
export const PHASE_LABELS: Record<AssessmentPhase, string> = {
  pre: 'Question Bank (Pre-Tagged)',
  post: 'Post-Training Assessment',
};

// ─── Score calculation ───────────────────────────────────────
/** @deprecated No pre/post comparison in current platform. Retained for compatibility. */
export function calculateImprovement(pre: number, post: number) {
  const absolute = post - pre;
  const percentage = pre > 0 ? ((post - pre) / pre) * 100 : 0;
  return { absolute, percentage };
}

// ─── Misc helpers ────────────────────────────────────────────
export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Color for percentage (chart/score display) ──────────────
export function getScoreColor(percentage: number): string {
  if (percentage >= 90) return '#7C3AED'; // purple
  if (percentage >= 75) return '#16A34A'; // green
  if (percentage >= 60) return '#2563EB'; // blue
  if (percentage >= 40) return '#D97706'; // amber
  return '#DC2626'; // red
}
