import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import OperatorPage from './pages/OperatorPage';
import AdminPage from './pages/AdminPage';

function AppInner() {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
  );
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
