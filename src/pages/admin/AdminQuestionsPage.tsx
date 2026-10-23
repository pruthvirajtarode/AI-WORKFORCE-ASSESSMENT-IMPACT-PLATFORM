import { useState } from 'react';
import { Brain, Search, Filter, Plus, ChevronDown, ChevronUp, Tag, Clock, Award } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/constants';
import { COMPETENCY_LABELS, QUESTION_TYPE_LABELS, DIFFICULTY_LABELS } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';

// Flatten all question banks for admin view
import { COMMON_PRE_QUESTIONS, COMMON_POST_QUESTIONS } from '@/data/questions/common';
import { EPC_PRE_QUESTIONS, EPC_POST_QUESTIONS } from '@/data/questions/epc';
import { ACC_PRE_QUESTIONS, ACC_POST_QUESTIONS } from '@/data/questions/accounts';
import { PAC_PRE_QUESTIONS, PAC_POST_QUESTIONS } from '@/data/questions/people';
import {
  CPS_PRE_QUESTIONS, CPS_POST_QUESTIONS,
  PRO_PRE_QUESTIONS, PRO_POST_QUESTIONS,
  DDQ_PRE_QUESTIONS, DDQ_POST_QUESTIONS,
} from '@/data/questions/other-depts';
import { EPC_PRACTICAL, ACC_PRACTICAL, PAC_PRACTICAL, CPS_PRACTICAL, PRO_PRACTICAL, DDQ_PRACTICAL } from '@/data/questions/practical';

const ALL_Q = [
  ...COMMON_PRE_QUESTIONS, ...COMMON_POST_QUESTIONS,
  ...EPC_PRE_QUESTIONS, ...EPC_POST_QUESTIONS,
  ...ACC_PRE_QUESTIONS, ...ACC_POST_QUESTIONS,
  ...PAC_PRE_QUESTIONS, ...PAC_POST_QUESTIONS,
  ...CPS_PRE_QUESTIONS, ...CPS_POST_QUESTIONS,
  ...PRO_PRE_QUESTIONS, ...PRO_POST_QUESTIONS,
  ...DDQ_PRE_QUESTIONS, ...DDQ_POST_QUESTIONS,
  ...EPC_PRACTICAL, ...ACC_PRACTICAL, ...PAC_PRACTICAL,
  ...CPS_PRACTICAL, ...PRO_PRACTICAL, ...DDQ_PRACTICAL,
];

const DEPT_LABEL: Record<string, string> = {
  'dept-01': 'EPC', 'dept-02': 'ACC', 'dept-03': 'PAC',
  'dept-04': 'CPS', 'dept-05': 'PRO', 'dept-06': 'DDQ',
};

const TYPE_BADGE_COLOR: Record<string, string> = {
  mcq: 'badge-blue', multiple_select: 'badge-blue',
  short_answer: 'badge-warning', long_answer: 'badge-warning',
  scenario: 'badge-gold', prompt_writing: 'badge-gold',
  document_analysis: 'badge-gray', data_analysis: 'badge-gray',
  output_evaluation: 'badge-danger', workflow_design: 'badge-success',
};

function QuestionRow({ q }: { q: typeof ALL_Q[0] }) {
  const [expanded, setExpanded] = useState(false);
  const deptCode = q.department_id ? DEPT_LABEL[q.department_id] ?? q.department_id : 'Common';
  const typeLabel = QUESTION_TYPE_LABELS[q.question_type as keyof typeof QUESTION_TYPE_LABELS] ?? q.question_type ?? '';
  const diffLabel = DIFFICULTY_LABELS[q.difficulty as keyof typeof DIFFICULTY_LABELS] ?? q.difficulty ?? '';
  const typeColor = TYPE_BADGE_COLOR[q.question_type ?? ''] ?? 'badge-gray';
  const diffColor = q.difficulty === 'expert' ? 'badge-danger' : q.difficulty === 'hard' ? 'badge-warning' : q.difficulty === 'medium' ? 'badge-blue' : 'badge-success';

  return (
    <div className="border-b border-brand-border/60 last:border-0">
      <div
        className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-brand-cream/40 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="badge-gray text-xs">{deptCode}</span>
            <span className={`badge ${typeColor} text-xs`}>{typeLabel}</span>
            <span className={`badge ${diffColor} text-xs`}>{diffLabel}</span>
            <span className="text-xs text-brand-muted">{q.max_marks} marks · {q.assessment_phase}</span>
          </div>
          <p className="text-sm text-brand-charcoal leading-relaxed line-clamp-2">{q.question_text}</p>
        </div>
        <button className="shrink-0 text-brand-muted hover:text-brand-navy mt-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {expanded && (
        <div className="px-5 pb-5 bg-brand-cream/30 animate-fade-in">
          {q.scenario_text && (
            <div className="bg-white border-l-4 border-brand-gold rounded-r-xl p-4 mb-4 text-sm text-brand-charcoal">
              <strong className="text-brand-navy block mb-1">Scenario</strong>
              {q.scenario_text}
            </div>
          )}
          {q.options && q.options.length > 0 && (
            <div className="space-y-2 mb-4">
              {q.options.map((opt) => (
                <div key={opt.id} className={`flex items-start gap-2 text-sm p-2 rounded-lg ${
                  opt.id === q.correct_answer ? 'bg-success-50 text-success-800 font-medium' : 'text-brand-charcoal'
                }`}>
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                    opt.id === q.correct_answer ? 'bg-success-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>{opt.id.toUpperCase()}</span>
                  {opt.text}
                </div>
              ))}
            </div>
          )}
          {q.rubric && (
            <div className="text-xs text-brand-muted bg-white rounded-lg p-3 border border-brand-border">
              <strong className="text-brand-navy block mb-1">Rubric</strong>
              {q.rubric}
            </div>
          )}
          {q.explanation && (
            <div className="text-xs text-brand-muted mt-2">
              <strong className="text-brand-navy">Explanation: </strong>{q.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminQuestionsPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');

  const filtered = ALL_Q.filter((q) => {
    const matchSearch = !search || q.question_text?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || q.department_id === deptFilter || (!q.department_id && deptFilter === 'common');
    const matchType = typeFilter === 'all' || q.question_type === typeFilter;
    const matchPhase = phaseFilter === 'all' || q.assessment_phase === phaseFilter;
    return matchSearch && matchDept && matchType && matchPhase;
  });

  const mcqCount = ALL_Q.filter((q) => q.question_type === 'mcq').length;
  const openCount = ALL_Q.filter((q) => q.question_type !== 'mcq').length;

  return (
    <AdminLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Question Bank</h1>
          <p className="page-subtitle">
            {ALL_Q.length} questions · {mcqCount} objective · {openCount} open-ended
          </p>
        </div>
        <button className="btn-primary btn-sm gap-1.5" disabled>
          <Plus className="w-3.5 h-3.5" /> Add Question
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
        {DEPARTMENTS.map((d) => {
          const cnt = ALL_Q.filter((q) => q.department_id === d.id).length;
          return (
            <button
              key={d.id}
              onClick={() => setDeptFilter(deptFilter === d.id ? 'all' : d.id)}
              className={`card p-3 text-center transition-all ${deptFilter === d.id ? 'ring-2 ring-brand-navy' : 'hover:shadow-card-hover'}`}
            >
              <div className="text-xs text-brand-muted mb-1">{d.code}</div>
              <div className="text-xl font-bold text-brand-navy">{cnt}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-brand-cream rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-brand-muted shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search question text…"
            className="bg-transparent text-sm outline-none placeholder:text-brand-muted/60 w-full text-brand-charcoal"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="select w-auto text-sm py-2">
          <option value="all">All Types</option>
          {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)} className="select w-auto text-sm py-2">
          <option value="all">All Phases</option>
          <option value="pre">Pre-Training</option>
          <option value="post">Post-Training</option>
        </select>
      </div>

      {/* Question List */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <span className="text-sm font-semibold text-brand-navy">{filtered.length} questions</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-brand-muted">
            <Brain className="w-10 h-10 mx-auto mb-2 opacity-30" />
            No questions match your filters
          </div>
        ) : (
          <div>
            {filtered.slice(0, 80).map((q) => (
              <QuestionRow key={q.id} q={q} />
            ))}
            {filtered.length > 80 && (
              <div className="px-5 py-4 text-center text-xs text-brand-muted border-t border-brand-border">
                Showing first 80 of {filtered.length} questions. Use filters to narrow down.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
