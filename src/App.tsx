import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import OperatorPage from './pages/OperatorPage';
import AdminPage from './pages/AdminPage';

function AppInner() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  if (user.role === 'admin') return <AdminPage />;
  return <OperatorPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
