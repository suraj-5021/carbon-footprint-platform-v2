import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  HelpCircle, 
  Trophy, 
  Award, 
  Sliders, 
  Activity,
  Menu, 
  X, 
  Sun, 
  Moon,
  TrendingUp
} from 'lucide-react';

// Import Pages
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { CalculatorPage } from './pages/Calculator';
import { AIAdvisor } from './pages/AIAdvisor';
import { FutureSimulator } from './pages/FutureSimulator';
import { EcoChallenges } from './pages/EcoChallenges';
import { Leaderboard } from './pages/Leaderboard';
import { Analytics } from './pages/Analytics';

const API_BASE = 'http://localhost:5000/api';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
}

export interface CalculationPoint {
  date: string;
  scores: {
    transport: number;
    electricity: number;
    food: number;
    waste: number;
    total: number;
  };
}

export interface UserProfile {
  name: string;
  carbonScore: number;
  sustainabilityScore: number;
  streak: number;
  lastLogDate: string;
  treesPlanted: number;
  waterSavedLiters: number;
  transportKmSaved: number;
  challengesCompleted: number;
  unlockedBadges: Badge[];
  calculationsHistory: CalculationPoint[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  completed: boolean;
  icon: string;
}

export interface LeaderboardUser {
  name: string;
  sustainabilityScore: number;
  carbonScore: number;
  streak: number;
  badgeCount: number;
  rank: number;
  isCurrentUser: boolean;
}

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // App States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch all initial data
  const refreshData = async () => {
    try {
      const userRes = await fetch(`${API_BASE}/user`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      const challengeRes = await fetch(`${API_BASE}/challenges`);
      if (challengeRes.ok) {
        const challengeData = await challengeRes.json();
        setChallenges(challengeData);
      }

      const leaderboardRes = await fetch(`${API_BASE}/leaderboard`);
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData);
      }
    } catch (e) {
      console.warn("Failed fetching from backend. Simulating local state.", e);
      // Fallback local memory data if backend isn't ready
      simulateLocalState();
    }
  };

  const simulateLocalState = () => {
    const defaultUser: UserProfile = {
      name: "Suraj",
      carbonScore: 6.5,
      sustainabilityScore: 250,
      streak: 5,
      lastLogDate: new Date().toISOString().split('T')[0],
      treesPlanted: 3,
      waterSavedLiters: 80,
      transportKmSaved: 25,
      challengesCompleted: 6,
      unlockedBadges: [
        { id: "eco-pioneer", title: "Eco Pioneer", description: "Created profile.", icon: "Compass", date: "2026-06-08" }
      ],
      calculationsHistory: [
        { date: "2026-06-01", scores: { transport: 2.4, electricity: 1.8, food: 1.5, waste: 0.8, total: 6.5 } }
      ]
    };
    setUser(defaultUser);
    
    setChallenges([
      { id: "challenge-1", title: "Green Commute", description: "Transit or cycle instead of driving.", category: "transport", points: 40, completed: false, icon: "Bike" },
      { id: "challenge-2", title: "Solar Charging Only", description: "Charge devices using day light energy modes.", category: "electricity", points: 20, completed: false, icon: "Sun" },
      { id: "challenge-3", title: "Veg-Day Protocol", description: "Adopt a plant-based meal today.", category: "food", points: 35, completed: false, icon: "Leaf" },
      { id: "challenge-4", title: "Zero Waste Lunch", description: "Leave behind zero lunch trash.", category: "waste", points: 30, completed: false, icon: "Trash2" },
      { id: "challenge-5", title: "H2O Efficiency Mode", description: "Shower under 5 minutes.", category: "waste", points: 25, completed: false, icon: "Droplet" }
    ]);

    setLeaderboard([
      { name: "Nova Green", sustainabilityScore: 920, carbonScore: 1.8, streak: 22, badgeCount: 7, rank: 1, isCurrentUser: false },
      { name: "Kaelen Stark", sustainabilityScore: 790, carbonScore: 2.2, streak: 14, badgeCount: 5, rank: 2, isCurrentUser: false },
      { name: "Aria Vance", sustainabilityScore: 640, carbonScore: 2.9, streak: 9, badgeCount: 4, rank: 3, isCurrentUser: false },
      { name: "Suraj", sustainabilityScore: 250, carbonScore: 6.5, streak: 5, badgeCount: 1, rank: 4, isCurrentUser: true },
      { name: "Elena Rostova", sustainabilityScore: 210, carbonScore: 6.8, streak: 3, badgeCount: 1, rank: 5, isCurrentUser: false }
    ]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Nav list items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', label: 'Carbon Calculator', icon: Calculator },
    { id: 'advisor', label: 'AI Advisor', icon: HelpCircle },
    { id: 'simulator', label: '2050 Simulator', icon: Sliders },
    { id: 'challenges', label: 'Eco Challenges', icon: Trophy },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award },
    { id: 'analytics', label: 'Detailed Analytics', icon: TrendingUp },
  ];

  const handleNav = (viewId: string) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // Render proper page component
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onStart={() => handleNav('calculator')} />;
      case 'dashboard':
        return <Dashboard user={user} onNavigate={handleNav} />;
      case 'calculator':
        return <CalculatorPage user={user} onCalculated={refreshData} onNavigate={handleNav} />;
      case 'advisor':
        return <AIAdvisor user={user} />;
      case 'simulator':
        return <FutureSimulator />;
      case 'challenges':
        return <EcoChallenges user={user} challenges={challenges} onActionCompleted={refreshData} />;
      case 'leaderboard':
        return <Leaderboard leaderboard={leaderboard} user={user} />;
      case 'analytics':
        return <Analytics user={user} />;
      default:
        return <LandingPage onStart={() => handleNav('calculator')} />;
    }
  };

  return (
    <div className="app-container">
      {/* Background Tech Grids */}
      <div className="futuristic-grid" />

      {/* Main Sidebar (Desktop) */}
      {currentView !== 'landing' && (
        <aside className="sidebar">
          <div className="sidebar-brand" style={{ cursor: 'pointer' }} onClick={() => handleNav('landing')}>
            <Activity size={24} style={{ color: 'var(--accent-cyan)' }} />
            <span>CarbonWise 2050</span>
          </div>

          <ul className="sidebar-menu">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id} className={`sidebar-item ${isActive ? 'active' : ''}`}>
                  <a href={`#${item.id}`} onClick={(e) => { e.preventDefault(); handleNav(item.id); }}>
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div style={{ padding: '8px 0', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={toggleTheme} style={{ padding: '8px 12px', width: '100%', fontSize: '0.85rem' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Light Spectrum' : 'Dark Space'}</span>
            </button>
          </div>

          {user && (
            <div className="sidebar-user">
              <div className="avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {user.name || 'Eco Citizen'}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Level {Math.floor(user.sustainabilityScore / 250) + 1}
                </p>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Mobile Navbar */}
      {currentView !== 'landing' && (
        <nav className="mobile-nav">
          <div className="sidebar-brand" style={{ fontSize: '1.25rem' }} onClick={() => handleNav('landing')}>
            <Activity size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span>CarbonWise</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={toggleTheme}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      )}

      {/* Mobile Drawer */}
      {currentView !== 'landing' && mobileMenuOpen && (
        <div className="menu-drawer">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <a 
                key={item.id} 
                href={`#${item.id}`} 
                className={`menu-drawer-item ${isActive ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleNav(item.id); }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content" style={{ marginLeft: currentView === 'landing' ? 0 : undefined }}>
        {renderView()}
      </main>
    </div>
  );
};
