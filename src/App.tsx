import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MobileLayout from './components/MobileLayout';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import AIAssistantPage from './pages/AIAssistantPage';
import ForumPage from './pages/ForumPage';
import PostDetailPage from './pages/PostDetailPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import LoginScreen from './components/LoginScreen';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const { user, loading } = useAuth();

  // 1. 載入中畫面
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 2. 登入邏輯：如果沒登入，所有路徑都導向 LoginScreen
  if (!user) {
    return (
      <div className="max-w-[448px] mx-auto min-h-screen bg-background relative shadow-xl overflow-hidden">
        <LoginScreen />
        <Toaster position="top-center" />
      </div>
    );
  }

  // 3. 登入後畫面：顯示主程式路由
  return (
    <Router>
      <div className="max-w-[448px] mx-auto min-h-screen bg-background relative shadow-xl overflow-hidden">
        <Routes>
          <Route element={<MobileLayout />}>
            <Route path="/" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/ai" element={<AIAssistantPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/:id" element={<PostDetailPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}
