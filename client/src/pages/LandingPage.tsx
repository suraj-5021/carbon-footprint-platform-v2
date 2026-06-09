import React from 'react';
import { EarthCanvas } from '../components/EarthCanvas';
import { ArrowRight, Flame, Shield, Activity, Cpu } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '80px',
      position: 'relative',
      zIndex: 2
    }}>
      {/* Hero Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        alignItems: 'center',
        gap: '40px',
        minHeight: '80vh',
      }} className="grid-cols-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 242, 254, 0.08)',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            width: 'fit-content',
            fontSize: '0.85rem',
            color: 'var(--accent-cyan)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <Cpu size={14} />
            <span>Futuristic Climate Systems Protocol</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--accent-cyan) 70%, var(--accent-green))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Steer the Timeline.<br/>
            Decarbonize 2050.
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '550px'
          }}>
            Take command of our AI sustainability platform. Calculate your carbon footprint baseline, receive machine-optimized roadmaps, compete in eco missions, and simulate Earth’s future.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={onStart} style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
              <span>Initiate Calculation</span>
              <ArrowRight size={18} />
            </button>
            <a href="#features" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
              <span>Review Core Features</span>
            </a>
          </div>
        </div>

        {/* spinning earth card */}
        <div className="glass-card float-anim" style={{
          position: 'relative',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'radial-gradient(circle at center, rgba(12, 24, 48, 0.5) 0%, rgba(7, 10, 19, 0.8) 100%)',
          minHeight: '400px'
        }}>
          <EarthCanvas scenario="neutral" />
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            right: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            background: 'rgba(7, 10, 19, 0.8)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '12px 16px',
            backdropFilter: 'blur(8px)'
          }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Coordinates</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'var(--font-header)', color: 'var(--accent-cyan)' }}>0.00° N, 0.00° E</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Simulation Year</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'var(--font-header)', color: 'var(--accent-green)' }}>2050 TARGET</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Climate Metrics Tickers */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>System Vital Telemetry</h2>
        <div className="grid-cols-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>Atmospheric Carbon Density</h3>
            <p className="cyan-glow" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-header)' }}>421.8 <span style={{ fontSize: '1rem', fontWeight: 500 }}>ppm</span></p>
            <p style={{ fontSize: '0.8rem', color: '#ff4a5a', marginTop: '6px' }}>+2.4 ppm Annual Accretion</p>
          </div>

          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>Mean Global Temp Anomaly</h3>
            <p className="green-glow" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-header)' }}>+1.26 <span style={{ fontSize: '1rem', fontWeight: 500 }}>°C</span></p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>Stabilized ceiling: +1.5°C</p>
          </div>

          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>Sea Level Deviation</h3>
            <p className="cyan-glow" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-header)' }}>+10.2 <span style={{ fontSize: '1rem', fontWeight: 500 }}>cm</span></p>
            <p style={{ fontSize: '0.8rem', color: '#ff4a5a', marginTop: '6px' }}>+3.4 mm Annual Rise</p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700 }}>Autonomous Optimization Features</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Review the modules equipped within CarbonWise 2050 to help map out your sustainability path.</p>
        </div>

        <div className="grid-cols-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>1. Footprint Baselines</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Compute carbon parameters across Transport, Power, Diet, and Waste. Generate detailed SVG graphical breakdown profiles.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(5, 243, 166, 0.1)', color: 'var(--accent-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>2. AI Sustainability Advisor</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Our heuristic engine evaluates calculator logs and models optimal pathways. Reviews savings in real-time.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(127, 0, 255, 0.1)', color: 'var(--accent-purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>3. Timeline Simulator</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Slide through years 2026 to 2050. Project climate effects and explore Green-Tech versus Industrial trajectories side-by-side.
            </p>
          </div>
        </div>
      </section>

      {/* Gamification Teaser */}
      <section className="glass-card grid-cols-2" style={{
        padding: '40px',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        alignItems: 'center',
        gap: '40px',
        background: 'linear-gradient(135deg, rgba(12, 16, 31, 0.7), rgba(5, 243, 166, 0.03))'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Eco Missions & Badges System</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Completing missions levels up your rank. Earn XP points by completing challenges, log water conservation milestones, virtually plant carbon-eating trees, and scale the global leaderboard.
          </p>
          <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame style={{ color: '#ff7c3b' }} size={20} />
              <span style={{ fontWeight: 600 }}>Streak Trackers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield style={{ color: 'var(--accent-cyan)' }} size={20} />
              <span style={{ fontWeight: 600 }}>8+ Unlockable Badges</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          <div className="badge-card unlocked" style={{ width: '130px', height: '130px' }}>
            <div className="badge-icon-wrapper"><Activity size={24} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Carbon Zero</span>
          </div>
          <div className="badge-card unlocked" style={{ width: '130px', height: '130px', animationDelay: '0.2s' }}>
            <div className="badge-icon-wrapper"><Flame size={24} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Streak Master</span>
          </div>
          <div className="badge-card" style={{ width: '130px', height: '130px', opacity: 0.5 }}>
            <div className="badge-icon-wrapper"><Cpu size={24} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>AI Optimizer</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--glass-border)',
        paddingTop: '32px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <p>© 2026 CarbonWise 2050 Corp. Powered by Gemini Advanced heuristic engines.</p>
        <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Ensuring global carbon awareness through gaming simulation models.</p>
      </footer>
    </div>
  );
};
