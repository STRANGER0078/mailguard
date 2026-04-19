import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const { isAuthenticated, user, logout } = useAuth();

  return isAuthenticated
    ? <Dashboard user={user} onLogout={logout} />
    : <LoginPage />;
}
