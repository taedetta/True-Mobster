import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useGame } from './context/GameContext';
import LoginPage from './pages/LoginPage';
import GameLayout from './pages/GameLayout';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import FightPage from './pages/FightPage';
import ShopPage from './pages/ShopPage';
import HitlistPage from './pages/HitlistPage';
import ProfilePage from './pages/ProfilePage';
import CrewPage from './pages/CrewPage';
import { Toast, LoadingScreen } from './components/UI';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();
  const { loading, message } = useGame();

  if (user && loading) return <LoadingScreen />;

  return (
    <>
      <Toast message={message} />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={<ProtectedRoute><GameLayout /></ProtectedRoute>}>
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="fight" element={<FightPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="hitlist" element={<HitlistPage />} />
          <Route path="crew" element={<CrewPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
