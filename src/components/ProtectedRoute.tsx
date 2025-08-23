import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'brand' | 'creator';
}

export const ProtectedRoute = ({ children, requiredUserType }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredUserType && profile?.user_type !== requiredUserType) {
    // Redirect to appropriate dashboard if user type doesn't match
    const redirectPath = profile?.user_type === 'brand' ? '/brand/dashboard' : '/creator/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};