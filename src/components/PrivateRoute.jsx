import Login from "./Login";
import { useAuth } from "../AuthContext";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return children;
}
