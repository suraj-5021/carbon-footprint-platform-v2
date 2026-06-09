import React, { useState } from 'react';
import type { LeaderboardUser, UserProfile } from '../App';
import { Award, Flame, Users, Share2, Clipboard, Globe, Shield } from 'lucide-react';

interface LeaderboardProps {
  leaderboard: LeaderboardUser[];
  user: UserProfile | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, user }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const text = `I just registered my carbon credentials on CarbonWise 2050! My sustainability score is ${user?.sustainabilityScore || 250} XP with a ${user?.streak || 5}-day streak. Join the decarbonization protocol here!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* View Header */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>Global Registry rankings</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Compare sustainability achievements with environmental specialists worldwide.</p>
      </div>

      {/* Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }} className="grid-cols-2">
        
        {/* Left Side: Leaderboard Table */}
        <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users style={{ color: 'var(--accent-cyan)' }} />
            <span>Active Registry Nodes</span>
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 8px' }}>Rank</th>
                <th style={{ padding: '12px 8px' }}>Specialist</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Score</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Footprint</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Streak</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Badges</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item, idx) => {
                const isUser = item.isCurrentUser;
                return (
                  <tr 
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--glass-border)',
                      fontSize: '0.9rem',
                      background: isUser ? 'rgba(0, 242, 254, 0.04)' : 'transparent',
                      borderLeft: isUser ? '3px solid var(--accent-cyan)' : 'none',
                      transition: 'background 0.2s',
                      fontWeight: isUser ? 600 : 400
                    }}
                  >
                    <td style={{ padding: '16px 8px', color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'inherit' }}>
                      {idx === 0 || idx === 1 || idx === 2 ? <Award size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> : null}
                      {idx + 1}
                    </td>
                    <td style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar" style={{
                        width: '28px', height: '28px', fontSize: '0.75rem',
                        background: isUser ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))' : 'rgba(255,255,255,0.05)'
                      }}>
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ color: isUser ? 'var(--accent-cyan)' : 'inherit' }}>{item.name}</span>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 'bold' }}>{item.sustainabilityScore} XP</td>
                    <td style={{ padding: '16px 8px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {item.carbonScore > 0 ? `${item.carbonScore.toFixed(1)} t` : '—'}
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Flame size={14} style={{ color: '#ff7c3b' }} />
                        <span>{item.streak}d</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Shield size={14} style={{ color: 'var(--accent-purple)' }} />
                        <span>{item.badgeCount}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Side: Network Stats and Invitation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Global Network Stats */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe style={{ color: 'var(--accent-green)' }} />
              <span>Registry Stats</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active Nodes (Users)</span>
                <strong style={{ fontSize: '0.95rem' }}>14,285 nodes</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Global Offset</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--accent-green)' }}>142,084.5 tCO2e</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Target Net-Zero Goal</span>
                <strong style={{ fontSize: '0.95rem' }}>2050 (UTC+0)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Top Node Sector</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>Scandinavia-08</strong>
              </div>
            </div>
          </div>

          {/* Social Share / Invite */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 style={{ color: 'var(--accent-cyan)' }} />
              <span>Share Credentials</span>
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Advertise your sustainability credentials. Copy this sharing template directly to your LinkedIn network profile.
            </p>

            <div style={{
              background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--glass-border)',
              fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', lineHeight: 1.4
            }}>
              "I just registered my carbon credentials on CarbonWise 2050! My sustainability score is <strong>{user?.sustainabilityScore || 250} XP</strong> with a <strong>{user?.streak || 5}-day streak</strong>. Join the decarbonization protocol here!"
            </div>

            <button className="btn btn-primary" onClick={handleCopyLink} style={{ width: '100%' }}>
              <Clipboard size={16} />
              <span>{copied ? 'Credentials Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
