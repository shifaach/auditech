
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProfile } from './types';
import { SearchProvider } from "./context/SearchContext";
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import FeaturesPage from './pages/FeaturesPage';
import CompliancePage from './pages/CompliancePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PublicLayout from './components/PublicLayout';
import AudioDashboard from './pages/AudioDashboard';
import VideoDashboard from './pages/VideoDashboard';
import ComplianceView from './pages/ComplianceView';
import ReportsView from './pages/ReportsView';
import UserManagement from './pages/UserManagement';
import { Divide } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('auditech_session');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (_) {}
    }
    setLoading(false);
  }, []);

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('auditech_session', JSON.stringify(profile));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('auditech_session');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium tracking-wide uppercase text-xs">Initializing AudiTech Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <SearchProvider>
        <>
          {user ? (
            <div className="flex h-screen overflow-hidden">
              
              <Sidebar 
                user={user} 
                onLogout={handleLogout} 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
              />
  
              <div className="flex-1 flex flex-col min-w-0 lg:ml-64 overflow-hidden">
                
                <Header 
                  user={user} 
                  onLogout={handleLogout} 
                  onMenuClick={() => setSidebarOpen(true)} 
                />
  
                <main className="flex-1 overflow-hidden bg-slate-50 min-h-0">
                  <div className="max-w-7xl mx-auto w-full p-4 lg:p-6 h-full min-h-0 flex flex-col">
                    <Toaster position="top-right" />
                    <div className="flex-1 min-h-0">
                    <div className="h-full min-h-0 overflow-hidden overflow-x-hidden">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard user={user} />} />
                        <Route path="/audio" element={<AudioDashboard user={user} />} />
                        <Route path="/video" element={<VideoDashboard user={user} />} />
                        <Route path="/compliance" element={<ComplianceView user={user} />} />
                        <Route path="/reports" element={<ReportsView user={user} />} />
                        <Route path="/admin" element={<UserManagement user={user} />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                      </div>
                    </div>
                  </div>
                </main>
  
              </div>
            </div>
          ) : (
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/compliance-info" element={<CompliancePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/signup" element={<SignUp onSignup={handleLogin} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </>
      </SearchProvider>
    </HashRouter>
  );
};

export default App;
