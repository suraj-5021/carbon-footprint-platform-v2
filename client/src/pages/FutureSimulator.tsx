import React, { useState, useEffect } from 'react';
import { EarthCanvas } from '../components/EarthCanvas';
import { ShieldAlert, Leaf, AlertTriangle, Wind, Waves, Thermometer, ShieldCheck } from 'lucide-react';

interface SimulationYearData {
  year: number;
  positive: {
    globalEmissionsGt: number;
    co2Ppm: number;
    tempAnomaly: number;
    seaLevelRiseCm: number;
    aqi: number;
    forestCoverPct: number;
  };
  negative: {
    globalEmissionsGt: number;
    co2Ppm: number;
    tempAnomaly: number;
    seaLevelRiseCm: number;
    aqi: number;
    forestCoverPct: number;
  };
}

export const FutureSimulator: React.FC = () => {
  const [year, setYear] = useState(2026);
  const [simulationData, setSimulationData] = useState<SimulationYearData[]>([]);
  const [activeScenario, setActiveScenario] = useState<'both' | 'green' | 'industrial'>('both');

  useEffect(() => {
    // Generate the simulation dataset locally
    const years = Array.from({ length: 25 }, (_, i) => 2026 + i);
    const data = years.map(yr => {
      const t = (yr - 2026) / 24; // Normalized 0 to 1
      return {
        year: yr,
        positive: {
          globalEmissionsGt: parseFloat((37.1 * Math.exp(-1.5 * t)).toFixed(1)),
          co2Ppm: parseFloat((420 + 35 * t * (2 - t)).toFixed(0)),
          tempAnomaly: parseFloat((1.2 + 0.3 * Math.sin((t * Math.PI) / 2)).toFixed(2)),
          seaLevelRiseCm: parseFloat((10.1 + 12 * t).toFixed(1)),
          aqi: parseFloat((85 - 45 * t).toFixed(0)),
          forestCoverPct: parseFloat((31.0 + 3.5 * t).toFixed(1))
        },
        negative: {
          globalEmissionsGt: parseFloat((37.1 * (1 + 0.6 * t)).toFixed(1)),
          co2Ppm: parseFloat((420 + 140 * t).toFixed(0)),
          tempAnomaly: parseFloat((1.2 + 1.6 * t).toFixed(2)),
          seaLevelRiseCm: parseFloat((10.1 + 38 * t).toFixed(1)),
          aqi: parseFloat((85 + 90 * t).toFixed(0)),
          forestCoverPct: parseFloat((31.0 - 5.5 * t).toFixed(1))
        }
      };
    });
    setSimulationData(data);
  }, []);

  const currentData = simulationData.find(d => d.year === year) || null;

  const getAqiStatus = (aqi: number) => {
    if (aqi <= 50) return { label: 'Excellent', color: 'var(--accent-green)' };
    if (aqi <= 100) return { label: 'Moderate', color: 'var(--accent-cyan)' };
    return { label: 'Unhealthy / Toxic', color: 'var(--accent-danger)' };
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Simulation Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>2050 future Timeline</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Fast forward to inspect global carbon metrics based on selected trajectories.</p>
        </div>
        
        {/* Scenario Selectors */}
        <div className="glass-card" style={{ padding: '6px', display: 'flex', gap: '4px' }}>
          <button 
            className={`btn ${activeScenario === 'both' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveScenario('both')}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Dual View
          </button>
          <button 
            className={`btn ${activeScenario === 'green' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveScenario('green')}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Green-Tech Only
          </button>
          <button 
            className={`btn ${activeScenario === 'industrial' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveScenario('industrial')}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Industrial Only
          </button>
        </div>
      </div>

      {/* Interactive Slider Widget */}
      <div className="glass-card" style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline Slider</span>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-header)' }}>{year}</span>
        </div>
        <input 
          type="range" 
          min="2026" 
          max="2050" 
          value={year} 
          onChange={(e) => setYear(parseInt(e.target.value))} 
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>2026 (Baseline)</span>
          <span>2038 (Midpoint)</span>
          <span>2050 (Target horizon)</span>
        </div>
      </div>

      {currentData && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: activeScenario === 'both' ? '1fr 1fr' : '1fr',
          gap: '32px'
        }} className="grid-cols-2">
          
          {/* COLUMN 1: GREEN-TECH TRANSITION SCENARIO */}
          {(activeScenario === 'both' || activeScenario === 'green') && (
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', borderTop: '4px solid var(--accent-green)' }}>
              
              {/* Spinning Globe visualizer */}
              <div style={{
                position: 'relative', borderRadius: '16px', padding: '16px', background: 'rgba(0,0,0,0.15)', minHeight: '300px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
              }}>
                <EarthCanvas scenario="green" />
                <div style={{
                  position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(5, 243, 166, 0.1)', color: 'var(--accent-green)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600
                }}>
                  <Leaf size={14} />
                  <span>Green-Tech pathway</span>
                </div>
              </div>

              {/* Data Indices grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-cols-2">
                
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Thermometer size={14} />
                    <span>Global Temp anomaly</span>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px', color: 'var(--accent-green)' }}>
                    +{currentData.positive.tempAnomaly.toFixed(2)}°C
                  </p>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Wind size={14} />
                    <span>Atmospheric CO2</span>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px' }}>
                    {currentData.positive.co2Ppm} ppm
                  </p>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Waves size={14} />
                    <span>Sea Level Rise</span>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px' }}>
                    +{currentData.positive.seaLevelRiseCm.toFixed(1)} cm
                  </p>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Wind size={14} />
                    <span>Air Quality index</span>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px', color: getAqiStatus(currentData.positive.aqi).color }}>
                    {currentData.positive.aqi} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>({getAqiStatus(currentData.positive.aqi).label})</span>
                  </p>
                </div>

              </div>

              {/* Summary description */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(5, 243, 166, 0.05)', padding: '14px', borderRadius: '10px' }}>
                <ShieldCheck size={24} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong>Timeline status: Optimal.</strong> Global emissions dropped to <strong>{currentData.positive.globalEmissionsGt} Gt</strong>. Carbon offsets and grid transition have successfully capped temperature rise.
                </p>
              </div>

            </div>
          )}

          {/* COLUMN 2: INDUSTRIAL/BUSINESS-AS-USUAL SCENARIO */}
          {(activeScenario === 'both' || activeScenario === 'industrial') && (
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', borderTop: '4px solid var(--accent-danger)' }}>
              
              {/* Spinning Globe visualizer */}
              <div style={{
                position: 'relative', borderRadius: '16px', padding: '16px', background: 'rgba(0,0,0,0.15)', minHeight: '300px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
              }}>
                <EarthCanvas scenario="industrial" />
                <div style={{
                  position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600
                }}>
                  <AlertTriangle size={14} />
                  <span>Industrial Core pathway</span>
                </div>
              </div>

              {/* Data Indices grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-cols-2">
                
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Thermometer size={14} />
                    <span>Global Temp anomaly</span>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px', color: 'var(--accent-danger)' }}>
                    +{currentData.negative.tempAnomaly.toFixed(2)}°C
                  </p>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Wind size={14} />
                    <span>Atmospheric CO2</span>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px' }}>
                    {currentData.negative.co2Ppm} ppm
                  </p>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Waves size={14} />
                    <span>Sea Level Rise</span>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px' }}>
                    +{currentData.negative.seaLevelRiseCm.toFixed(1)} cm
                  </p>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Wind size={14} />
                    <span>Air Quality index</span>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px', color: getAqiStatus(currentData.negative.aqi).color }}>
                    {currentData.negative.aqi} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>({getAqiStatus(currentData.negative.aqi).label})</span>
                  </p>
                </div>

              </div>

              {/* Summary description */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '14px', borderRadius: '10px' }}>
                <ShieldAlert size={24} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong>Timeline status: Critical.</strong> Global emissions rose to <strong>{currentData.negative.globalEmissionsGt} Gt</strong>. Sea levels are rising faster; air quality is highly unstable.
                </p>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};
