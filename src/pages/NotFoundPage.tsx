import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';

export default function NotFoundPage() {
  const { user, isAdmin } = useAuth();
  const homeRoute = isAdmin ? ROUTES.adminDashboard : user ? ROUTES.employeeDashboard : ROUTES.home;

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl gradient-navy flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-brand-gold" />
        </div>
        <div className="text-8xl font-bold text-brand-navy/10 mb-4 leading-none">404</div>
        <h1 className="text-2xl font-bold text-brand-navy mb-3">Page Not Found</h1>
        <p className="text-brand-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={homeRoute} className="btn-primary no-underline">
          <Home className="w-4 h-4" /> Go Home
        </Link>
      </div>
    </div>
  );
}
