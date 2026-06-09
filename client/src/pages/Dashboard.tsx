import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  Sun, 
  Leaf, 
  Trash2, 
  Droplet, 
  Flame, 
  Shield, 
  Compass, 
  Award,
  ChevronRight,
  TrendingDown,
  Edit2,
  Milestone,
  Trees
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile } from '../App';
import { LineChart } from '../components/SVGCharts';

interface DashboardProps {
  user: UserProfile | null;
  onNavigate: (viewId: string) => void;
}

const ALL_POSSIBLE_BADGES = [
  { id: 'eco-pioneer', title: 'Eco Pioneer', description: 'Activated your CarbonWise 2050 credentials.', icon: 'Compass' },
  { id: 'streak-master', title: 'Streak Master', description: 'Log actions for 5 consecutive days.', icon: 'Flame' },
  { id: 'green-warrior', title: 'Green Warrior', description: 'Resolve 5 sustainability challenges.', icon: 'Shield' },
  { id: 'carbon-minimalist', title: 'Carbon Minimalist', description: 'Keep total emissions under 3.0 tCO2e/year.', icon: 'Award' },
  { id: 'eco-commuter', title: 'Eco Commuter', description: 'Keep transport emissions under 0.6 tCO2e/year.', icon: 'Bike' },
  { id: 'solar-advocate', title: 'Solar Advocate', description: 'Domestic electricity emissions under 0.3 tCO2e/year.', icon: 'Sun' },
  { id: 'green-plate', title: 'Green Plate Special', description: 'Maintain vegan/vegetarian habits.', icon: 'Leaf' },
  { id: 'circular-pioneer', title: 'Circular Pioneer', description: 'Recycle 60%+ or waste footprint under 0.15 tCO2e.', icon: 'Trash2' },
  { id: 'forest-pioneer', title: 'Forest Guardian', description: 'Plant 5 or more virtual carbon-eating trees.', icon: 'Trees' },
  { id: 'water-conservationist', title: 'Hydro-Saver Master', description: 'Accumulate over 100 liters of water saved.', icon: 'Droplet' },
  { id: 'green-speedster', title: 'Transit Overlord', description: 'Travel 50+ km in active/public transit modes.', icon: 'Milestone' }
];

const iconMap: Record<string, React.ComponentType<any>> = {
  Compass, Flame, Shield, Award, Bike, Sun, Leaf, Trash2, Trees, Droplet, Milestone
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  // Trigger celebration on dashboard load if user has unlocked badges recently
  useEffect(() => {
    if (user && user.unlockedBadges.length > 1) {
      // Small trigger
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00f2fe', '#05f3a6', '#7f00ff']
      });
    }
  }, []);

  if (!user) {
    return <div className="flex-center" style={{ minHeight: '60vh' }}>Loading telemetry...</div>;
  }

  const handleNameSave = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        setEditingName(false);
        window.location.reload(); // Quick sync
      }
    } catch (e) {
      // fallback
      user.name = newName;
      setEditingName(false);
    }
  };

  // Convert calculations history to line chart format
  const chartData = user.calculationsHistory && user.calculationsHistory.length > 0
    ? user.calculationsHistory.map(pt => ({
        label: new Date(pt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        val1: pt.scores.total
      }))
    : [{ label: 'Baseline', val1: user.carbonScore }];

  const nextLevelXP = 250;
  const currentXP = user.sustainabilityScore % nextLevelXP;
  const xpPct = (currentXP / nextLevelXP) * 100;
  const currentLevel = Math.floor(user.sustainabilityScore / nextLevelXP) + 1;

  // Grade carbon footprint status
  const getFootprintRating = (score: number) => {
    if (score === 0) return { label: 'Incomplete Baseline', color: 'var(--text-secondary)' };
    if (score < 2.5) return { label: 'Optimal Carbon Zero', color: 'var(--accent-green)' };
    if (score < 5.0) return { label: 'Moderate Impact', color: 'var(--accent-cyan)' };
    return { label: 'Carbon Heavy Profile', color: 'var(--accent-danger)' };
  };

  const footprintRating = getFootprintRating(user.carbonScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header Profile Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {editingName ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  style={{ fontSize: '1.5rem', fontWeight: 700, padding: '4px 12px', width: '200px' }}
                />
                <button className="btn btn-primary" onClick={handleNameSave} style={{ padding: '8px 16px' }}>Save</button>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>Welcome Back, {user.name}</h1>
                <button 
                  onClick={() => { setNewName(user.name); setEditingName(true); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
                >
                  <Edit2 size={16} />
                </button>
              </>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>System synchronization status: Operational.</p>
        </div>

        {/* Global Level Indicator */}
        <div className="glass-card" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Rank</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Level {currentLevel} Specialist</p>
          </div>
          <div style={{ width: '60px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${xpPct}%`, background: 'var(--accent-cyan)' }} />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{currentXP}/{nextLevelXP} XP</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {/* Carbon Footprint Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }} onClick={() => onNavigate('calculator')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Global Footprint</span>
            <TrendingDown size={18} style={{ color: footprintRating.color }} />
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-header)' }}>
            {user.carbonScore > 0 ? user.carbonScore.toFixed(1) : '—'} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>tCO2e/yr</span>
          </p>
          <span style={{ fontSize: '0.85rem', color: footprintRating.color, fontWeight: 600 }}>{footprintRating.label}</span>
        </div>

        {/* Sustainability Score */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }} onClick={() => onNavigate('challenges')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Sustainability XP</span>
            <Award size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-header)' }}>
            {user.sustainabilityScore} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Points</span>
          </p>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            {user.challengesCompleted} Eco Missions Complete
          </span>
        </div>

        {/* Logging Streak */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }} onClick={() => onNavigate('challenges')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Active Log Streak</span>
            <Flame size={18} style={{ color: '#ff7c3b' }} />
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-header)', color: '#ff7c3b' }}>
            {user.streak} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Days</span>
          </p>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Log challenges daily to maintain boost.
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }} className="grid-cols-2">
        {/* Left Side: Historical Line Chart & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: 600 }}>Decarbonization Trajectory</h3>
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LineChart 
                data={chartData} 
                line1Color="var(--accent-cyan)" 
                line1Name="Your Emission Record" 
                yUnit="t"
              />
            </div>
          </div>

          {/* Quick Tracking Log Shortcuts */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', fontWeight: 600 }}>Telemetry Logs Shortcuts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="grid-cols-3">
              <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                <Trees style={{ color: 'var(--accent-green)', margin: '0 auto 8px' }} size={24} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Trees Planted</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>{user.treesPlanted}</p>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                <Droplet style={{ color: 'var(--accent-cyan)', margin: '0 auto 8px' }} size={24} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Liters Saved</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>{user.waterSavedLiters}L</p>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                <Milestone style={{ color: 'var(--accent-purple)', margin: '0 auto 8px' }} size={24} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Green Commute</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>{user.transportKmSaved}km</p>
              </div>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => onNavigate('challenges')}
              style={{ width: '100%', marginTop: '16px', fontSize: '0.9rem' }}
            >
              <span>Access Logging Terminal</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Side: Badges List */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Unlocked Credentials</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Level up to unlock environmental qualification badges.
            </p>
          </div>

          <div className="badge-grid" style={{ overflowY: 'auto', maxHeight: '430px', paddingRight: '4px' }}>
            {ALL_POSSIBLE_BADGES.map(badge => {
              const isUnlocked = user.unlockedBadges.some(b => b.id === badge.id);
              const IconComp = iconMap[badge.icon] || Compass;

              return (
                <div 
                  key={badge.id} 
                  className={`badge-card ${isUnlocked ? 'unlocked' : ''}`}
                  style={{ opacity: isUnlocked ? 1 : 0.4 }}
                  title={badge.description}
                >
                  <div className="badge-icon-wrapper">
                    <IconComp size={20} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{badge.title}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                    {isUnlocked ? 'Credentials Valid' : 'Locked'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
