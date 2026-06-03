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
import PlayerProfilePage from './pages/PlayerProfilePage';
import CrewPage from './pages/CrewPage';
import MobPage from './pages/MobPage';
import BossPage from './pages/BossPage';
import DailyPage from './pages/DailyPage';
import MailPage from './pages/MailPage';
import MorePage from './pages/MorePage';
import ChatPage from './pages/ChatPage';
import HospitalPage from './pages/HospitalPage';
import GodfatherPage from './pages/GodfatherPage';
import RevengePage from './pages/RevengePage';
import NewsPage from './pages/NewsPage';
import CollectionsPage from './pages/CollectionsPage';
import ScratchPage from './pages/ScratchPage';
import TerritoriesPage from './pages/TerritoriesPage';
import AchievementsPage from './pages/AchievementsPage';
import SocialPage from './pages/SocialPage';
import LeaderboardPage from './pages/LeaderboardPage';
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
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={<ProtectedRoute><GameLayout /></ProtectedRoute>}>
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="fight" element={<FightPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="mob" element={<MobPage />} />
          <Route path="daily" element={<DailyPage />} />
          <Route path="more" element={<MorePage />} />
          <Route path="boss" element={<BossPage />} />
          <Route path="mail" element={<MailPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="scratch" element={<ScratchPage />} />
          <Route path="territories" element={<TerritoriesPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="social" element={<SocialPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="hospital" element={<HospitalPage />} />
          <Route path="godfather" element={<GodfatherPage />} />
          <Route path="gold" element={<Navigate to="/godfather" replace />} />
          <Route path="revenge" element={<RevengePage />} />
          <Route path="hitlist" element={<HitlistPage />} />
          <Route path="crew" element={<CrewPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="player/:userId" element={<PlayerProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </>
  );
}
