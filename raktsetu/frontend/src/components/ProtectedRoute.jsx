import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { donor, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-24 flex justify-center">
        <div className="w-6 h-6 border-2 border-[var(--color-crimson-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!donor) return <Navigate to="/login" replace />;
  return children;
}
