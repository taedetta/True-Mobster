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
import MobPage from './pages/MobPage';
import BossPage from './pages/BossPage';
import DailyPage from './pages/DailyPage';
import SocialPage from './pages/SocialPage';
import MailPage from './pages/MailPage';
import NewsPage from './pages/NewsPage';
import TerritoriesPage from './pages/TerritoriesPage';
import MorePage from './pages/MorePage';
import AchievementsPage from './pages/AchievementsPage';
import ScratchPage from './pages/ScratchPage';
import ChatPage from './pages/ChatPage';
import CollectionsPage from './pages/CollectionsPage';
import GoldStorePage from './pages/GoldStorePage';
import RevengePage from './pages/RevengePage';
import { Toast, LoadingScreen } from './components/UI';

function ProtectedRoute({ children }) {
  const { user, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user, authReady } = useAuth();
  const { loading, message } = useGame();

  if (!authReady) return <LoadingScreen />;
  if (user && loading) return <LoadingScreen />;

  return (
    <>
      <Toast message={message} />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route path="/" element={<ProtectedRoute><GameLayout /></ProtectedRoute>}>
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="fight" element={<FightPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="mob" element={<MobPage />} />
          <Route path="daily" element={<DailyPage />} />
          <Route path="more" element={<MorePage />} />
          <Route path="boss" element={<BossPage />} />
          <Route path="social" element={<SocialPage />} />
          <Route path="mail" element={<MailPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="territories" element={<TerritoriesPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="scratch" element={<ScratchPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="gold" element={<GoldStorePage />} />
          <Route path="revenge" element={<RevengePage />} />
          <Route path="hitlist" element={<HitlistPage />} />
          <Route path="crew" element={<CrewPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </>
  );
}
