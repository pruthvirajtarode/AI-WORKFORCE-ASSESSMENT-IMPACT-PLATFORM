import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Brain, ArrowLeft, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/ui/Spinner';

interface AdminLoginForm {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdminLoginForm>();

  const onSubmit = async (data: AdminLoginForm) => {
    setError(null);
    const { error: authError } = await signIn(data.email, data.password);
    if (authError) {
      setError(authError);
    } else {
      navigate(ROUTES.adminDashboard);
    }
  };

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-modal p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-brand-navy" />
            </div>
            <h1 className="text-xl font-bold text-brand-navy">Admin Sign In</h1>
            <p className="text-sm text-brand-muted mt-1">
              Restricted to authorized administrators only
            </p>
          </div>

          {/* Demo note */}
          <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-3.5 mb-6">
            <p className="text-xs text-brand-charcoal">
              <strong>Demo access:</strong>{' '}
              <code className="bg-white/70 rounded px-1">admin@surojbuildcon.com</code>
              {' '}/ <code className="bg-white/70 rounded px-1">Admin@2024</code>
            </p>
          </div>

          {error && (

            <div className="flex items-start gap-2 bg-danger-50 border border-danger-200 rounded-xl p-3.5 mb-5">
              <AlertCircle className="w-4 h-4 text-danger-600 shrink-0 mt-0.5" />
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="label">Admin Email</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@surojbuildcon.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                })}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="admin-password" className="label">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-navy"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              id="admin-login-submit"
              className="btn-primary w-full btn-lg mt-2"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? <Spinner className="text-white" /> : 'Sign In as Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to={ROUTES.home} className="inline-flex items-center gap-1 text-xs text-brand-muted hover:text-brand-navy">
              <ArrowLeft className="w-3 h-3" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
