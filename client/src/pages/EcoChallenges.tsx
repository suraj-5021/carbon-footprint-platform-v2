import React, { useState } from 'react';
import { 
  Bike, 
  Sun, 
  Leaf, 
  Trash2, 
  Droplet, 
  CheckSquare, 
  Square,
  Trees,
  PlusCircle,
  Award,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile, Challenge } from '../App';

interface EcoChallengesProps {
  user: UserProfile | null;
  challenges: Challenge[];
  onActionCompleted: () => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Bike, Sun, Leaf, Trash2, Droplet
};

export const EcoChallenges: React.FC<EcoChallengesProps> = ({ user, challenges, onActionCompleted }) => {
  const [planting, setPlanting] = useState(false);
  const [waterAmount, setWaterAmount] = useState(10); // liters
  const [loggingWater, setLoggingWater] = useState(false);
  const [transitKm, setTransitKm] = useState(5); // km
  const [loggingTransit, setLoggingTransit] = useState(false);

  if (!user) {
    return <div className="flex-center" style={{ minHeight: '60vh' }}>Synchronizing missions...</div>;
  }

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/challenges/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId })
      });
      if (res.ok) {
        const data = await res.json();
        
        // Confetti celebration
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#00f2fe', '#05f3a6', '#7f00ff']
        });

        if (data.newlyUnlockedBadges && data.newlyUnlockedBadges.length > 0) {
          alert(`⚡ Unlocked Credentials: ${data.newlyUnlockedBadges.map((b: any) => b.title).join(', ')}! (+100 XP)`);
        }

        onActionCompleted();
      }
    } catch (e) {
      console.warn("Backend offline. Completing challenge locally.", e);
      simulateChallengeComplete(challengeId);
    }
  };

  const simulateChallengeComplete = (id: string) => {
    const chall = challenges.find(c => c.id === id);
    if (chall && !chall.completed) {
      chall.completed = true;
      user.sustainabilityScore += chall.points;
      user.challengesCompleted += 1;
      
      confetti({ particleCount: 40 });
      onActionCompleted();
    }
  };

  const handleResetChallenges = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/challenges/reset', { method: 'POST' });
      if (res.ok) {
        onActionCompleted();
      }
    } catch (e) {
      challenges.forEach(c => { c.completed = false; });
      onActionCompleted();
    }
  };

  const handlePlantTree = async () => {
    try {
      setPlanting(true);
      const res = await fetch('http://localhost:5000/api/tracker/tree', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        confetti({
          particleCount: 50,
          spread: 50,
          colors: ['#05f3a6', '#10b981', '#00f2fe']
        });
        if (data.newlyUnlockedBadges && data.newlyUnlockedBadges.length > 0) {
          alert(`⚡ Credentials Unlocked: ${data.newlyUnlockedBadges.map((b: any) => b.title).join(', ')}!`);
        }
        onActionCompleted();
      }
    } catch (e) {
      user.treesPlanted += 1;
      user.sustainabilityScore += 50;
      confetti({ particleCount: 30 });
      onActionCompleted();
    } finally {
      setPlanting(false);
    }
  };

  const handleLogWater = async () => {
    try {
      setLoggingWater(true);
      const res = await fetch('http://localhost:5000/api/tracker/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liters: waterAmount })
      });
      if (res.ok) {
        const data = await res.json();
        confetti({ particleCount: 30, colors: ['#00f2fe', '#0ea5e9'] });
        if (data.newlyUnlockedBadges && data.newlyUnlockedBadges.length > 0) {
          alert(`⚡ Credentials Unlocked: ${data.newlyUnlockedBadges.map((b: any) => b.title).join(', ')}!`);
        }
        onActionCompleted();
      }
    } catch (e) {
      user.waterSavedLiters += waterAmount;
      user.sustainabilityScore += Math.round(waterAmount * 0.5);
      onActionCompleted();
    } finally {
      setLoggingWater(false);
    }
  };

  const handleLogTransit = async () => {
    try {
      setLoggingTransit(true);
      const res = await fetch('http://localhost:5000/api/tracker/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ km: transitKm })
      });
      if (res.ok) {
        const data = await res.json();
        confetti({ particleCount: 30, colors: ['#a855f7', '#7f00ff'] });
        if (data.newlyUnlockedBadges && data.newlyUnlockedBadges.length > 0) {
          alert(`⚡ Credentials Unlocked: ${data.newlyUnlockedBadges.map((b: any) => b.title).join(', ')}!`);
        }
        onActionCompleted();
      }
    } catch (e) {
      user.transportKmSaved += transitKm;
      user.sustainabilityScore += Math.round(transitKm * 2.0);
      onActionCompleted();
    } finally {
      setLoggingTransit(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header View */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>Eco Missions & logs</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Complete daily missions or log tracking milestones to accumulate sustainability XP.</p>
        </div>

        <button className="btn btn-secondary" onClick={handleResetChallenges} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
          <RotateCcw size={16} />
          <span>Reset Missions</span>
        </button>
      </div>

      {/* Grid Layout splits Daily Missions and logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }} className="grid-cols-2">
        
        {/* Left Column: Daily Mission Terminal */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Daily Sustainability Protocols</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Completing these actions preserves streaks and adds XP points.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {challenges.map(chall => {
              const IconComp = iconMap[chall.icon] || Award;
              return (
                <div 
                  key={chall.id}
                  onClick={() => !chall.completed && handleCompleteChallenge(chall.id)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    background: chall.completed ? 'rgba(5, 243, 166, 0.03)' : 'rgba(0,0,0,0.1)',
                    cursor: chall.completed ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    opacity: chall.completed ? 0.75 : 1,
                    transition: 'all 0.2s'
                  }}
                  className={chall.completed ? '' : 'glass-card-hover'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: chall.completed ? 'rgba(5, 243, 166, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: chall.completed ? 'var(--accent-green)' : 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <IconComp size={20} style={{ margin: '0 auto' }} />
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '0.95rem', fontWeight: 600,
                        textDecoration: chall.completed ? 'line-through' : 'none',
                        color: chall.completed ? 'var(--accent-green)' : 'inherit'
                      }}>{chall.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{chall.description}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.8rem', color: chall.completed ? 'var(--accent-green)' : 'var(--accent-cyan)', fontWeight: 'bold' }}>
                      +{chall.points} XP
                    </span>
                    {chall.completed ? (
                      <CheckSquare size={20} style={{ color: 'var(--accent-green)' }} />
                    ) : (
                      <Square size={20} style={{ color: 'var(--text-secondary)' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tracking terminals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Virtual Tree planting */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trees style={{ color: 'var(--accent-green)' }} />
              <span>Forest Canopy project</span>
            </h3>

            {/* Visual tree grow indicator */}
            <div style={{
              height: '100px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              border: '1px solid var(--glass-border)', position: 'relative'
            }}>
              {Array.from({ length: Math.min(user.treesPlanted, 10) }).map((_, idx) => (
                <Trees 
                  key={idx} 
                  size={24 + (idx % 3) * 6} 
                  style={{ color: 'var(--accent-green)', opacity: 0.4 + (idx / 10) * 0.6, transform: `translateY(${(idx % 2) * 4}px)` }} 
                />
              ))}
              {user.treesPlanted === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No trees planted. Start planting!</span>}
              <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Total: <strong>{user.treesPlanted} planted</strong>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handlePlantTree} disabled={planting} style={{ width: '100%', fontSize: '0.9rem' }}>
              <PlusCircle size={16} />
              <span>{planting ? 'Seeding Forest...' : 'Plant a Virtual Tree (+50 XP)'}</span>
            </button>
          </div>

          {/* Water Saver logs */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplet style={{ color: 'var(--accent-cyan)' }} />
              <span>Domestic Water Conservation</span>
            </h3>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={waterAmount} 
                onChange={(e) => setWaterAmount(parseInt(e.target.value))}
                style={{ flex: 1, padding: '10px' }}
              >
                <option value="10">10 Liters (Short shower upgrade)</option>
                <option value="30">30 Liters (Full washing machine full-load offset)</option>
                <option value="50">50 Liters (No-running tap dishes / domestic hygiene)</option>
                <option value="100">100 Liters (Rainwater collection harvest)</option>
              </select>
              <button className="btn btn-secondary" onClick={handleLogWater} disabled={loggingWater} style={{ padding: '10px 16px' }}>
                Log
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Logged saved: <strong>{user.waterSavedLiters} Liters</strong> total.
            </span>
          </div>

          {/* Active transit logging */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bike style={{ color: 'var(--accent-purple)' }} />
              <span>Transit Offset Terminal</span>
            </h3>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="number" 
                min="1" 
                max="100" 
                value={transitKm} 
                onChange={(e) => setTransitKm(parseInt(e.target.value) || 0)} 
                style={{ flex: 1, padding: '10px' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flexShrink: 0 }}>km offset</span>
              <button className="btn btn-secondary" onClick={handleLogTransit} disabled={loggingTransit} style={{ padding: '10px 16px' }}>
                Log
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Logged transit: <strong>{user.transportKmSaved} km</strong> total.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
