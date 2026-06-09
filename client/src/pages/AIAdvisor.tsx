import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Car, Leaf, Trash2, ArrowRight } from 'lucide-react';
import type { UserProfile } from '../App';

interface AIAdvisorProps {
  user: UserProfile | null;
}

interface Recommendation {
  id: string;
  category: 'transport' | 'electricity' | 'food' | 'waste';
  title: string;
  description: string;
  impact: string;
  savingsTons: number;
  action: string;
}

interface RoadmapPoint {
  year: number;
  target: number;
  milestone: string;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ user }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapPoint[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  // If-Then Interactive simulator state variables
  const [simEvShare, setSimEvShare] = useState(0); // 0 to 100%
  const [simSolarShare, setSimSolarShare] = useState(0); // 0 to 100%
  const [simVegDays, setSimVegDays] = useState(0); // 0 to 7 days
  const [simRecycle, setSimRecycle] = useState(30); // 0 to 100%

  // Get active calculations from user history
  const latestCalc = user?.calculationsHistory && user.calculationsHistory.length > 0
    ? user.calculationsHistory[user.calculationsHistory.length - 1].scores
    : null;

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!latestCalc) return;
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/advisor/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scores: latestCalc })
        });
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommendations);
          setRoadmap(data.analysis.futureRoadmap);
          setSummary(data.analysis.summary);

          // Seed default simulator sliders based on user current values
          setSimRecycle(latestCalc.waste > 0 ? 30 : 50);
        }
      } catch (e) {
        console.warn("Backend Advisor offline. Generating local heuristics.", e);
        generateLocalHeuristics();
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  const generateLocalHeuristics = () => {
    if (!latestCalc) return;
    // Heuristic calculations
    const recs: Recommendation[] = [];
    let potRed = 0;

    if (latestCalc.transport > 1.0) {
      recs.push({
        id: "local-rec-1",
        category: "transport",
        title: "Transition to a Smart EV",
        description: "Swap petrol or diesel drives with an electric car or plug-in hybrid option.",
        impact: "Saves ~70% of transit carbon load",
        savingsTons: parseFloat((latestCalc.transport * 0.7).toFixed(2)),
        action: "Look into clean vehicle rebates or municipal transit options."
      });
      potRed += latestCalc.transport * 0.7;
    }
    if (latestCalc.electricity > 0.8) {
      recs.push({
        id: "local-rec-2",
        category: "electricity",
        title: "Install Rooftop Solar",
        description: "Equip clean domestic solar grid options to reduce municipal drawing rates.",
        impact: "Saves ~90% of electricity emissions",
        savingsTons: parseFloat((latestCalc.electricity * 0.9).toFixed(2)),
        action: "Evaluate household rooftop grid sizes or utility green choices."
      });
      potRed += latestCalc.electricity * 0.9;
    }
    if (latestCalc.food >= 1.5) {
      recs.push({
        id: "local-rec-3",
        category: "food",
        title: "Adopt Meat-Free Dinner Protocol",
        description: "Reduce heavy meat meals in favor of legumes and organic vegetables.",
        impact: "Saves up to 1.5 tCO2e/year",
        savingsTons: 1.20,
        action: "Initiate meatless meal schedules 3 days a week."
      });
      potRed += 1.2;
    }

    setRecommendations(recs);
    setSummary(`Your current carbon footprint is ${latestCalc.total} tCO2e/year. Applying these optimization protocols can reduce this score to ${(latestCalc.total - potRed).toFixed(1)} tCO2e/year.`);
    
    setRoadmap([
      { year: 2026, target: latestCalc.total, milestone: "Establish baseline carbon credentials." },
      { year: 2030, target: parseFloat((latestCalc.total * 0.7).toFixed(2)), milestone: "Phase down single plastics and diesel commutes." },
      { year: 2040, target: parseFloat((latestCalc.total * 0.4).toFixed(2)), milestone: "Transition residential heating to renewable solar energy." },
      { year: 2050, target: parseFloat(Math.max(0.5, latestCalc.total - potRed).toFixed(2)), milestone: "Attain net zero carbon status." }
    ]);
  };

  if (!user || user.carbonScore === 0 || !latestCalc) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <Cpu size={48} style={{ color: 'var(--accent-cyan)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Baseline Credentials Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          Please baseline your carbon footprint parameters using the calculator terminal first. The advisor requires this dataset for diagnostics.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          <span>Initialize Calculator</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // Calculate dynamic simulator projection
  // Formula: start with baseline scores, reduce based on slider values
  const currentTransport = latestCalc.transport;
  const currentElectricity = latestCalc.electricity;
  const currentFood = latestCalc.food;
  const currentWaste = latestCalc.waste;

  // EV reduces transport emissions up to 70%
  const simTScore = currentTransport * (1 - (simEvShare / 100) * 0.7);
  // Solar reduces electricity emissions up to 90%
  const simEScore = currentElectricity * (1 - (simSolarShare / 100) * 0.9);
  // Vegetarian days/week: 0 vegan days = normal food. 7 vegan days = reductions.
  // Vegan saves roughly 55% of average food emissions
  const simFScore = currentFood * (1 - (simVegDays / 7) * 0.55);
  // Recycling increases sort rate, reduces waste emissions by up to 50%
  const simWScore = currentWaste * (1 - (simRecycle / 100) * 0.5);

  const simTotal = simTScore + simEScore + simFScore + simWScore;
  const simSaved = latestCalc.total - simTotal;
  const simPct = (simSaved / latestCalc.total) * 100;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'transport': return <Car size={18} style={{ color: 'var(--accent-cyan)' }} />;
      case 'electricity': return <Zap size={18} style={{ color: 'var(--accent-purple)' }} />;
      case 'food': return <Leaf size={18} style={{ color: 'var(--accent-green)' }} />;
      default: return <Trash2 size={18} style={{ color: 'var(--accent-danger)' }} />;
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05) 0%, rgba(12, 16, 31, 0.7) 100%)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Cpu size={24} style={{ margin: '0 auto' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Heuristics AI Diagnostics</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>{summary || 'Analysing calculator baselines...'}</p>
          </div>
        </div>
      </div>

      {/* Main Double Column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }} className="grid-cols-2">
        
        {/* Left Column: Recommendations Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>Optimization Protocols</h3>
            
            {loading ? (
              <p style={{ color: 'var(--text-secondary)' }}>Computing recommendations...</p>
            ) : recommendations.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No optimization alerts. Your baseline profile is already clean!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recommendations.map(rec => (
                  <div key={rec.id} style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getCategoryIcon(rec.category)}
                        <h4 style={{ fontWeight: 600, fontSize: '1.05rem' }}>{rec.title}</h4>
                      </div>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(5, 243, 166, 0.1)', color: 'var(--accent-green)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        -{rec.savingsTons.toFixed(2)} tCO2e
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{rec.description}</p>
                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>Protocol:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{rec.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Simulation Console */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 600 }}>Interactive Behavior Simulator</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Adjust sliders to simulate behavioral modifications on your baseline score.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Car size={14} /> EV Commute Share</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{simEvShare}%</span>
                </div>
                <input type="range" min="0" max="100" value={simEvShare} onChange={(e) => setSimEvShare(parseInt(e.target.value))} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} /> Rooftop Solar Grid</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>{simSolarShare}%</span>
                </div>
                <input type="range" min="0" max="100" value={simSolarShare} onChange={(e) => setSimSolarShare(parseInt(e.target.value))} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Leaf size={14} /> Veg-based Meals</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{simVegDays} days/wk</span>
                </div>
                <input type="range" min="0" max="7" value={simVegDays} onChange={(e) => setSimVegDays(parseInt(e.target.value))} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Trash2 size={14} /> Recycling rate</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>{simRecycle}%</span>
                </div>
                <input type="range" min="0" max="100" value={simRecycle} onChange={(e) => setSimRecycle(parseInt(e.target.value))} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Roadmap and Simulator Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Simulator Metrics Box */}
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--accent-cyan)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simulated Footprint</p>
            <p style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-header)', marginTop: '8px', color: 'var(--accent-cyan)' }}>
              {simTotal.toFixed(2)} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>tCO2e</span>
            </p>
            
            {simSaved > 0 ? (
              <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(5, 243, 166, 0.1)', color: 'var(--accent-green)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Saved {simSaved.toFixed(2)} tons ({simPct.toFixed(0)}%)</span>
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Adjust sliders to optimize parameters.</p>
            )}
          </div>

          {/* 2050 Roadmap Timeline */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>Decarbonization Roadmap</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingLeft: '20px' }}>
              {/* Timeline Vertical Line */}
              <div style={{ position: 'absolute', top: '8px', bottom: '8px', left: '6px', width: '2px', background: 'var(--glass-border)' }} />
              
              {roadmap.map((pt, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  {/* Circle indicator */}
                  <div style={{
                    position: 'absolute', top: '4px', left: '-20px', width: '12px', height: '12px', borderRadius: '50%',
                    background: i === 0 ? 'var(--accent-cyan)' : i === roadmap.length - 1 ? 'var(--accent-green)' : 'var(--accent-purple)',
                    border: '2px solid var(--bg-secondary)', zIndex: 2
                  }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-header)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{pt.year}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target: {pt.target.toFixed(1)} t</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.3 }}>{pt.milestone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
