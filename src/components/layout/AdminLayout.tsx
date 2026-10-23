import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, BarChart3, Settings,
  ClipboardList, LogOut, Brain, ChevronRight, BookOpen, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.adminDashboard },
  { label: 'Employees', icon: Users, to: ROUTES.adminEmployees },
  { label: 'Assessments', icon: ClipboardList, to: ROUTES.adminAssessments },
  { label: 'Questions', icon: HelpCircle, to: ROUTES.adminQuestions },
  { label: 'Submissions', icon: FileText, to: ROUTES.adminSubmissions },
  { label: 'Analytics', icon: BarChart3, to: ROUTES.adminAnalytics },
  { label: 'Settings', icon: Settings, to: ROUTES.adminSettings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.adminLogin);
  };

  return (
    <div className="flex min-h-screen bg-brand-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-brand-border">
          <Link to={ROUTES.adminDashboard} className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-xl gradient-navy flex items-center justify-center">
              <Brain className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-navy tracking-wider uppercase">SUROJ × BE10X</div>
              <div className="text-[10px] text-brand-muted leading-tight">Admin Portal</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-0.5">
          {navItems.map(({ label, icon: Icon, to }) => {
            const active = pathname === to || (to !== ROUTES.adminDashboard && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn('sidebar-item no-underline', active && 'sidebar-item-active')}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-brand-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-cream mb-1">
            <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-brand-navy">{user?.name?.charAt(0)?.toUpperCase() ?? 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-brand-navy truncate">{user?.name ?? 'Admin'}</div>
              <div className="text-[10px] text-brand-muted truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleSignOut} className="sidebar-item w-full text-danger-600 hover:text-danger-700 hover:bg-danger-50">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
