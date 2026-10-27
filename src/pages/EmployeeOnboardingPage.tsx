import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Brain } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { DEPARTMENTS, ROUTES } from '@/lib/constants';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/ui/Spinner';

interface OnboardingForm {
  name: string;
  departmentCode: string;
}

export default function EmployeeOnboardingPage() {
  const { registerGuest } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OnboardingForm>();

  const onSubmit = async (data: OnboardingForm) => {
    setError(null);
    const result = await registerGuest(data.name, data.departmentCode);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate(ROUTES.employeeDashboard);
  };

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-modal p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-navy flex items-center justify-center mx-auto mb-4">
              <Brain className="w-7 h-7 text-brand-gold" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">SUROJ × BE10X</p>
            <h1 className="text-2xl font-bold text-brand-navy">Start Your Assessment</h1>
            <p className="text-sm text-brand-muted mt-2">No employee sign-in is required. Enter your details, then choose any of the six assessment sessions.</p>
          </div>

          {!isSupabaseConfigured && (
            <p className="text-xs text-warning-700 bg-warning-50 border border-warning-200 rounded-lg p-3 mb-5">
              Demo mode stores submissions only in this browser. Configure Supabase to share results with admins across devices.
            </p>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2 bg-danger-50 border border-danger-200 rounded-xl p-3.5 mb-5">
              <AlertCircle className="w-4 h-4 text-danger-600 shrink-0 mt-0.5" />
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="employee-name" className="label">Your name</label>
              <input
                id="employee-name"
                autoComplete="name"
                maxLength={100}
                placeholder="As it should appear in the results"
                className={`input ${errors.name ? 'input-error' : ''}`}
                {...register('name', {
                  required: 'Enter your name',
                  minLength: { value: 2, message: 'Enter at least 2 characters' },
                  maxLength: { value: 100, message: 'Name must be 100 characters or fewer' },
                })}
              />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="employee-department" className="label">Department</label>
              <select
                id="employee-department"
                className={`select w-full ${errors.departmentCode ? 'input-error' : ''}`}
                defaultValue=""
                {...register('departmentCode', { required: 'Select your department' })}
              >
                <option value="" disabled>Select your department</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department.code} value={department.code}>{department.name}</option>
                ))}
              </select>
              {errors.departmentCode && <p className="error-text">{errors.departmentCode.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full btn-lg" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="text-white" /> : <>Continue to Assessments <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to={ROUTES.home} className="inline-flex items-center gap-1 text-xs text-brand-muted hover:text-brand-navy no-underline">
              <ArrowLeft className="w-3 h-3" /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
