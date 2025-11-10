import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { RegistrationForm } from './components/RegistrationForm';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { VotingPage } from './components/VotingPage';
import { Leaderboard } from './components/Leaderboard';
import { HostProfile } from './components/HostProfile';
import { JuryPanel } from './components/JuryPanel';
import { AdminPanel } from './components/AdminPanel';
import { Navigation } from './components/Navigation';

export type Page = 'landing' | 'register' | 'login' | 'dashboard' | 'voting' | 'leaderboard' | 'profile' | 'jury' | 'admin';

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string;
  hostType: 'digital-detox' | 'healthcare-wellness' | 'experiences-entertainment' | 'culture-craft' | 'adventure-exploration' | 'stay-hospitality' | 'culinary-gastronomy' | 'photography' | 'travel' | 'service';
  kycVerified: boolean;
  createdAt: string;
  profileComplete: boolean;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('hoststar_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setCurrentPage('dashboard');
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('hoststar_user');
      }
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('hoststar_user', JSON.stringify(loggedInUser));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hoststar_user');
    setCurrentPage('landing');
  };

  const handleNavigate = (page: Page, entryId?: string) => {
    setCurrentPage(page);
    if (entryId) {
      setSelectedEntryId(entryId);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegistrationForm onNavigate={handleNavigate} onSuccess={handleLogin} />;
      case 'login':
        return <LoginForm onNavigate={handleNavigate} onSuccess={handleLogin} />;
      case 'dashboard':
        return user ? <Dashboard user={user} onNavigate={handleNavigate} /> : <LoginForm onNavigate={handleNavigate} onSuccess={handleLogin} />;
      case 'voting':
        return <VotingPage user={user} onNavigate={handleNavigate} />;
      case 'leaderboard':
        return <Leaderboard onNavigate={handleNavigate} />;
      case 'profile':
        return selectedEntryId ? <HostProfile entryId={selectedEntryId} onNavigate={handleNavigate} /> : <VotingPage user={user} onNavigate={handleNavigate} />;
      case 'jury':
        return <JuryPanel onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPanel onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {currentPage !== 'landing' && (
        <Navigation 
          user={user} 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      <main>
        {renderPage()}
      </main>
    </div>
  );
}
