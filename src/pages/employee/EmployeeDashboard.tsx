import { useNavigate } from 'react-router-dom';
import { Brain, ClipboardList, CheckCircle2, Clock, ArrowRight, BookOpen, Target, Shield } from 'lucide-react';
import { ROUTES, DEPARTMENTS, DEPARTMENT_MAP } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalAssessment } from '@/hooks/useLocalAssessment';
import EmployeeLayout from '@/components/layout/EmployeeLayout';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { hasCompleted } = useLocalAssessment();
  const navigate = useNavigate();

  const deptId = user?.departmentId ?? DEPARTMENTS[0].id;
  const dept = DEPARTMENT_MAP[deptId as keyof typeof DEPARTMENT_MAP];

  return (
    <EmployeeLayout>
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-navy flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-brand-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">
              Welcome, {user?.name?.split(' ')[0] ?? 'Colleague'}
            </h1>
            <p className="text-brand-muted mt-0.5">
              {dept?.name ?? 'Your Department'} · SUROJ × BE10X Post-Training AI Assessment
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            hasCompleted ? 'bg-success-100' : 'bg-brand-navy/10'
          }`}>
            {hasCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-success-600" />
            ) : (
              <ClipboardList className="w-6 h-6 text-brand-navy" />
            )}
          </div>
          {hasCompleted && (
            <span className="badge-success text-xs">Submitted</span>
          )}
        </div>

        <h2 className="text-lg font-bold text-brand-navy mb-1">
          Post-Training AI Assessment
        </h2>
        <p className="text-sm text-brand-muted mb-5">
          {dept?.name ?? 'Your department'} — Demonstrate your AI knowledge and practical skills after the Be10x workshop.
        </p>

        {hasCompleted ? (
          <div className="bg-success-50 border border-success-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-success-700 mb-1">Assessment Successfully Submitted</p>
                <p className="text-sm text-success-600">
                  Thank you for completing the assessment. Your responses have been recorded and will be reviewed by the assessment team. Results will be communicated by your HR department.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-5 text-sm text-brand-muted mb-5">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                90 minutes
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                ~30 questions
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                One attempt
              </span>
            </div>
            <button
              id="start-assessment-btn"
              onClick={() => navigate(`${ROUTES.assessmentStart}?dept=${deptId}`)}
              className="btn-primary w-full justify-center"
            >
              Begin Assessment <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Guidelines */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-brand-gold" />
          <h3 className="text-sm font-semibold text-brand-navy">Assessment Guidelines</h3>
        </div>
        <ul className="space-y-2 text-sm text-brand-muted">
          {[
            `Questions are scenario-based and tailored for ${dept?.name ?? 'your department'}`,
            'The assessment has a 90-minute time limit. Submit before time expires.',
            'Do not refresh or close the browser during the assessment.',
            'This is a one-time assessment. Each employee gets a single attempt.',
            'Written/scenario answers will be reviewed and marked by assessors.',
            'Results are confidential and will only be shared through HR.',
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </EmployeeLayout>
  );
}
