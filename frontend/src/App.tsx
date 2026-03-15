import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { useAuth } from './context/useAuth';

function App() {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <main className="loading-screen">
        <p>Dang kiem tra phien dang nhap...</p>
      </main>
    );
  }

  return user ? <DashboardPage /> : <AuthPage />;
}

export default App;
