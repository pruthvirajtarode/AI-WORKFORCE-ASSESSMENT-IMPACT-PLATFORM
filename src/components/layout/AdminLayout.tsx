import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, BarChart3, Settings,
  ClipboardList, LogOut, Brain, ChevronRight, HelpCircle, Menu, X,
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

function SidebarContent({
  pathname, user, onSignOut, onClose,
}: {
  pathname: string;
  user: { name?: string; email?: string } | null;
  onSignOut: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-brand-border flex items-center justify-between">
        <Link
          to={ROUTES.adminDashboard}
          className="flex items-center gap-3 no-underline"
          onClick={onClose}
        >
          <div className="w-9 h-9 rounded-xl gradient-navy flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-brand-gold" />
          </div>
          <div>
            <div className="text-xs font-bold text-brand-navy tracking-wider uppercase">SUROJ × BE10X</div>
            <div className="text-[10px] text-brand-muted leading-tight">Admin Portal</div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg text-brand-muted hover:text-brand-navy lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => {
          const active = pathname === to || (to !== ROUTES.adminDashboard && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={cn('sidebar-item no-underline', active && 'sidebar-item-active')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign Out */}
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
        <button
          onClick={onSignOut}
          className="sidebar-item w-full text-danger-600 hover:text-danger-700 hover:bg-danger-50"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.adminLogin);
  };

  return (
    <div className="flex min-h-screen bg-brand-cream">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, slide-in drawer */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-brand-border flex flex-col shrink-0',
        'transition-transform duration-200',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <SidebarContent
          pathname={pathname}
          user={user}
          onSignOut={handleSignOut}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-white border-b border-brand-border px-4 h-14 flex items-center gap-3 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-brand-muted hover:text-brand-navy hover:bg-brand-cream"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-navy flex items-center justify-center">
              <Brain className="w-4 h-4 text-brand-gold" />
            </div>
            <span className="text-sm font-bold text-brand-navy tracking-wider uppercase">SUROJ × BE10X</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
