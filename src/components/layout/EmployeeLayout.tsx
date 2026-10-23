import { Link, useNavigate } from 'react-router-dom';
import { Brain, LogOut, LayoutDashboard, ClipboardList, User } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.login);
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Top Nav */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to={ROUTES.employeeDashboard} className="flex items-center gap-3 no-underline">
            <div className="w-8 h-8 rounded-xl gradient-navy flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-brand-gold" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-brand-navy tracking-wider uppercase leading-none">SUROJ × BE10X</div>
              <div className="text-[10px] text-brand-muted">AI Assessment Platform</div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            <Link to={ROUTES.employeeDashboard} className="btn-ghost btn-sm gap-1.5 no-underline text-brand-muted hover:text-brand-navy">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link to={ROUTES.employeeResults} className="btn-ghost btn-sm gap-1.5 no-underline text-brand-muted hover:text-brand-navy">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">My Results</span>
            </Link>
          </nav>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-brand-navy">{user?.name}</div>
              <div className="text-[10px] text-brand-muted">{user?.email}</div>
            </div>
            <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
              <span className="text-xs font-bold text-brand-navy">{user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="btn-ghost p-2 rounded-lg text-brand-muted hover:text-danger-600"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
