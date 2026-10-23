import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Brain, Clock, FileQuestion, AlertTriangle, Shield, ChevronRight } from 'lucide-react';
import { ROUTES, DEPARTMENTS, DEPARTMENT_MAP, ASSESSMENT_DEFAULTS } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalAssessment } from '@/hooks/useLocalAssessment';
import EmployeeLayout from '@/components/layout/EmployeeLayout';
import Spinner from '@/components/ui/Spinner';

export default function AssessmentStartPage() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasCompleted, startAssessment } = useLocalAssessment();
  const [starting, setStarting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const deptId = params.get('dept') ?? user?.departmentId ?? DEPARTMENTS[0].id;
  const dept = DEPARTMENT_MAP[deptId as keyof typeof DEPARTMENT_MAP];

  // Guard: already completed
  if (hasCompleted) {
    return (
      <EmployeeLayout>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-success-100 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-success-600" />
          </div>
          <h1 className="text-xl font-bold text-brand-navy mb-2">Assessment Already Submitted</h1>
          <p className="text-brand-muted mb-6">
            You have already submitted the Post-Training Assessment. Each employee can only attempt once.
          </p>
          <button onClick={() => navigate(ROUTES.employeeDashboard)} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </EmployeeLayout>
    );
  }

  const handleStart = async () => {
    if (!agreed) return;
    setStarting(true);
    try {
      const empId = user?.employeeId ?? user?.email ?? 'demo';
      const session = startAssessment(empId, deptId);
      navigate(`/assessment/${session.id}`);
    } catch {
      setStarting(false);
    }
  };

  return (
    <EmployeeLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl gradient-navy flex items-center justify-center mx-auto mb-5">
            <Brain className="w-8 h-8 text-brand-gold" />
          </div>
          <div className="inline-flex items-center gap-2 bg-brand-navy/10 rounded-full px-3 py-1 mb-4">
            <span className="text-xs font-semibold text-brand-navy uppercase tracking-wide">
              Post-Training Assessment
            </span>
          </div>
          <h1 className="text-3xl font-bold text-brand-navy mb-3">AI Workforce Assessment</h1>
          <p className="text-brand-muted max-w-lg mx-auto">
            This assessment measures your AI knowledge and practical application skills following the Be10x workshop.
            Department: <strong>{dept?.name ?? deptId}</strong>.
          </p>
        </div>

        {/* Assessment Info */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Clock, label: 'Duration', value: `${ASSESSMENT_DEFAULTS.durationMinutes} minutes` },
            { icon: FileQuestion, label: 'Questions', value: `~${ASSESSMENT_DEFAULTS.questionCount} questions` },
            { icon: Shield, label: 'Department', value: dept?.code ?? deptId },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-5 text-center">
              <Icon className="w-5 h-5 text-brand-muted mx-auto mb-2" />
              <div className="text-xs text-brand-muted mb-1">{label}</div>
              <div className="text-base font-semibold text-brand-navy">{value}</div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-brand-navy mb-4">Before You Begin</h2>
          <ul className="space-y-3">
            {[
              'Once you start, the timer begins and cannot be paused.',
              'You can navigate between questions and change answers any time before submitting.',
              'Do not refresh or close the browser — your progress may be lost.',
              'Some questions are scenario-based and require written responses. Be specific and practical.',
              'This assessment is confidential. Do not share questions with colleagues.',
              'Subjective answers will be reviewed and scored by assessors after submission.',
              'You have exactly one attempt for this post-training assessment.',
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-brand-charcoal">
                <span className="w-5 h-5 rounded-full bg-brand-navy text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
          <p className="text-sm text-warning-700">
            <strong>One attempt only:</strong> Once you begin, the session is recorded. Make sure you have a stable internet connection and at least 90 minutes of uninterrupted time.
          </p>
        </div>

        {/* Agreement */}
        <label className="flex items-start gap-3 cursor-pointer mb-6 select-none">
          <input
            type="checkbox"
            id="assessment-agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded accent-brand-navy"
          />
          <span className="text-sm text-brand-charcoal">
            I have read and understood the instructions. I confirm this is my own attempt and I am ready to begin.
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(ROUTES.employeeDashboard)}
            className="btn-secondary flex-1"
          >
            Go Back
          </button>
          <button
            id="start-assessment-btn"
            onClick={handleStart}
            disabled={!agreed || starting}
            className="btn-primary flex-1 justify-center"
          >
            {starting ? <Spinner className="text-white" /> : (
              <>Begin Assessment <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </EmployeeLayout>
  );
}
