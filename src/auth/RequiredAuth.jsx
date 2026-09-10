import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from './useSession';

export default function RequireAuth({ children }) {
  const { user, loading } = useSession();
  const location = useLocation();
  if (loading)
    return (
      <p className="p-8 text-center" role="status">
        Checking session…
      </p>
    );
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, message: 'Choose a profile or log in to continue.' }}
      />
    );
  return children;
}
