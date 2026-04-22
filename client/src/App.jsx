import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';

import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminPage from './pages/AdminPage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import FreelancerProfilePage from './pages/FreelancerProfilePage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MyFreelancerProfilePage from './pages/MyFreelancerProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <ScrollToTop />
      <Navbar />
      <main className="mx-auto min-h-[calc(100vh-11rem)] max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/freelancer/:id" element={<FreelancerProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/my-freelancer-profile"
          element={
            <ProtectedRoute>
              <MyFreelancerProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
