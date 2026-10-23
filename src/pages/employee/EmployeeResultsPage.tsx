import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

/**
 * Employee results are not exposed to employees in this platform.
 * Results are reviewed by admins only. Redirect back to dashboard.
 */
export default function EmployeeResultsPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(ROUTES.employeeDashboard, { replace: true });
  }, [navigate]);
  return null;
}
