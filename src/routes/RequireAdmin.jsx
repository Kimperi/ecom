// src/routes/RequireAdmin.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../auth/useSession";

export default function RequireAdmin({ children }) {
  const { isAdmin, loading } = useSession();
  const loc = useLocation();
  if (loading) return null; // or a spinner
  return isAdmin ? (
    children
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ from: loc.pathname, message: "Admin only" }}
    />
  );
}
