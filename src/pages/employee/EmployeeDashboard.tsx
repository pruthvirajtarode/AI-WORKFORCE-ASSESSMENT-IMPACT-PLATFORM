import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, FileText, LoaderCircle } from 'lucide-react';
import assessmentsData from '@/data/departmentalAssessments.json';
import { getEmployeeSessionNumber } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionAssessments } from '@/hooks/useSessionAssessments';
import type { DepartmentalAssessment } from '@/types/departmentalAssessment';
import EmployeeLayout from '@/components/layout/EmployeeLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';

const assessments = assessmentsData as unknown as DepartmentalAssessment[];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { attempts, isLoading } = useSessionAssessments(user);
  const assignedSessionNumber = getEmployeeSessionNumber(user?.departmentId, user?.departmentCode);
  const assignedAssessments = assessments.filter((assessment) => assessment.number === assignedSessionNumber);

  if (isLoading) return <LoadingScreen />;

  return (
    <EmployeeLayout>
      <div className="mb-8 border-b-2 border-brand-navy pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">SUROJ × BE10X · Employee Portal</p>
        <h1 className="text-3xl font-bold text-brand-navy">Welcome, {user?.name?.split(' ')[0] ?? 'Colleague'}</h1>
        <h2 className="text-lg font-semibold text-brand-charcoal mt-5">Choose an Assessment Session</h2>
        <p className="text-sm text-brand-muted mt-1">Your assigned department assessment session is ready to complete.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-x-8 gap-y-0">
        {assignedAssessments.map((assessment) => {
          const attempt = attempts.find((item) => item.sessionNumber === assessment.number);
          const completed = attempt?.status === 'submitted';
          const inProgress = attempt?.status === 'in_progress';
          const status = completed ? 'Completed' : inProgress ? 'In Progress' : 'Not Started';
          return (
            <Link
              key={assessment.number}
              to={`/employee/sessions/${assessment.number}`}
              className="group flex gap-4 border-b border-brand-border py-6 no-underline hover:bg-white/50 transition-colors"
            >
              <span className="font-mono text-sm font-bold text-brand-gold pt-1">SESSION {String(assessment.number).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold leading-snug text-brand-navy group-hover:text-brand-blue">{assessment.title}</h3>
                  <ArrowRight className="w-4 h-4 shrink-0 text-brand-muted mt-1 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs font-medium text-brand-muted mt-1">{assessment.category}</p>
                <p className="text-sm text-brand-charcoal mt-2 leading-relaxed">{assessment.description}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-brand-muted"><Clock3 className="w-3.5 h-3.5" />{assessment.durationMinutes} min</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-brand-muted"><FileText className="w-3.5 h-3.5" />{assessment.questionCount} questions</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${completed ? 'text-success-700' : inProgress ? 'text-warning-700' : 'text-brand-muted'}`}>
                    {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : inProgress ? <LoaderCircle className="w-3.5 h-3.5" /> : null}
                    {status}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        {assignedAssessments.length === 0 && <p role="alert" className="text-sm text-warning-700 py-6">Your employee profile does not have a recognized assessment department. Contact your administrator to update your profile.</p>}
      </div>
    </EmployeeLayout>
  );
}
