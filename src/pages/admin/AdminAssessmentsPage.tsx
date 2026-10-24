import assessmentsData from '@/data/departmentalAssessments.json';
import { useAdminData } from '@/hooks/useAdminData';
import { DEPARTMENT_MAP } from '@/lib/constants';
import type { DepartmentalAssessment } from '@/types/departmentalAssessment';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { ClipboardCheck } from 'lucide-react';

const assessments = assessmentsData as unknown as DepartmentalAssessment[];

export default function AdminAssessmentsPage() {
  const { attempts, departments, isLoading, hasError } = useAdminData();
  if (isLoading) return <LoadingScreen />;

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">Assessment Sessions</h1>
        <p className="page-subtitle">Approved source sessions and live completion status</p>
      </div>
      {hasError && <div role="alert" className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-5 text-sm text-danger-700">Assessment status could not be loaded from Supabase.</div>}
      <div className="divide-y divide-brand-border">
        {assessments.map((assessment) => {
          const departmentCode = ['EPC', 'ACC', 'PAC', 'CPS', 'PRO', 'DDQ'][assessment.number - 1];
          const department = departments.find((item) => item.code === departmentCode)
            ?? Object.values(DEPARTMENT_MAP).find((item) => item.code === departmentCode);
          const sessionAttempts = attempts.filter((attempt) => (
            attempt.sessionNumber === assessment.number
            || (department && attempt.departmentId === department.id)
          ));
          const submitted = sessionAttempts.filter((attempt) => attempt.status === 'submitted').length;
          const evaluated = sessionAttempts.filter((attempt) => attempt.evaluationStatus === 'evaluated').length;
          return <article key={assessment.number} className="py-5 grid sm:grid-cols-[1fr_auto] gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-gold">Session {String(assessment.number).padStart(2, '0')} · {assessment.category}</div>
              <h2 className="text-base font-semibold text-brand-navy mt-1">{assessment.title}</h2>
              <p className="text-sm text-brand-muted mt-1">{assessment.description}</p>
              <p className="text-xs text-brand-muted mt-2">{assessment.durationMinutes} minutes · {assessment.questionCount} sections/questions · {assessment.totalMarks} marks · one attempt</p>
            </div>
            <div className="flex sm:flex-col sm:items-end gap-4 text-sm">
              <span><strong className="text-brand-navy">{submitted}</strong> submitted</span>
              <span><strong className="text-brand-navy">{evaluated}</strong> evaluated</span>
            </div>
          </article>;
        })}
      </div>
      {attempts.length === 0 && !hasError && <EmptyState icon={ClipboardCheck} title="No submissions yet" description="Live assessment activity will appear here after employees start and submit a session." />}
    </AdminLayout>
  );
}
