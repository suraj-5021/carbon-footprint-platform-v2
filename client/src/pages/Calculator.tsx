import React, { useState } from 'react';
import { 
  Car, 
  Zap, 
  Leaf, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  ArrowRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile, Badge } from '../App';
import { DonutChart } from '../components/SVGCharts';

interface CalculatorPageProps {
  user: UserProfile | null;
  onCalculated: () => void;
  onNavigate: (viewId: string) => void;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({ user: _user, onCalculated, onNavigate }) => {
  const [step, setStep] = useState(1);
  
  // Form fields
  const [transportType, setTransportType] = useState('petrol');
  const [transportKm, setTransportKm] = useState(120);
  const [electricityKwh, setElectricityKwh] = useState(320);
  const [electricitySource, setElectricitySource] = useState('grid');
  const [dietType, setDietType] = useState('average');
  const [wasteKg, setWasteKg] = useState(15);
  const [recycleRate, setRecycleRate] = useState(30);

  // Result state
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    breakdown: { name: string; value: number; color: string }[];
    newBadges: Badge[];
  } | null>(null);

  const steps = [
    { id: 1, name: 'Transportation', icon: Car },
    { id: 2, name: 'Electricity', icon: Zap },
    { id: 3, name: 'Dietary Habits', icon: Leaf },
    { id: 4, name: 'Waste Management', icon: Trash2 }
  ];

  const handleNext = () => {
    if (step < 4) setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      const response = await fetch('http://localhost:5000/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transportType,
          transportKm: parseFloat(transportKm.toString()),
          electricityKwh: parseFloat(electricityKwh.toString()),
          electricitySource,
          dietType,
          wasteKg: parseFloat(wasteKg.toString()),
          recycleRate: parseFloat(recycleRate.toString())
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Parse results for charting
        const currentScores = data.currentScores;
        const breakdown = [
          { name: 'Transport', value: currentScores.transport, color: '#00f2fe' },
          { name: 'Electricity', value: currentScores.electricity, color: '#7f00ff' },
          { name: 'Diet', value: currentScores.food, color: '#05f3a6' },
          { name: 'Waste', value: currentScores.waste, color: '#ff4a5a' }
        ];

        setResults({
          total: currentScores.total,
          breakdown,
          newBadges: data.newUnlockedBadges
        });

        // Trigger confetti celebration!
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00f2fe', '#05f3a6', '#7f00ff']
        });

        // Callback to refresh root App user stats
        onCalculated();
      }
    } catch (e) {
      console.error("Backend error. Simulating calculations locally.", e);
      simulateLocalCalculation();
    } finally {
      setCalculating(false);
    }
  };

  const simulateLocalCalculation = () => {
    // Local mathematical approximation matching server equations
    let transportFactor = 0.18;
    if (transportType === 'hybrid') transportFactor = 0.10;
    else if (transportType === 'electric') transportFactor = 0.05;
    else if (transportType === 'public') transportFactor = 0.04;
    else if (transportType === 'active') transportFactor = 0.0;
    const tScore = (transportKm * 52 * transportFactor) / 1000;

    let electricityFactor = 0.40;
    if (electricitySource === 'solar') electricityFactor = 0.02;
    else if (electricitySource === 'mixed') electricityFactor = 0.21;
    const eScore = (electricityKwh * 12 * electricityFactor) / 1000;

    let dietScore = 2.0;
    if (dietType === 'vegan') dietScore = 0.9;
    else if (dietType === 'vegetarian') dietScore = 1.2;
    else if (dietType === 'pescatarian') dietScore = 1.5;
    else if (dietType === 'meat-heavy') dietScore = 3.2;

    const wScore = (wasteKg * 52 * 0.45 * (1 - recycleRate / 100)) / 1000;

    const total = tScore + eScore + dietScore + wScore;

    setResults({
      total: parseFloat(total.toFixed(2)),
      breakdown: [
        { name: 'Transport', value: parseFloat(tScore.toFixed(2)), color: '#00f2fe' },
        { name: 'Electricity', value: parseFloat(eScore.toFixed(2)), color: '#7f00ff' },
        { name: 'Diet', value: parseFloat(dietScore.toFixed(2)), color: '#05f3a6' },
        { name: 'Waste', value: parseFloat(wScore.toFixed(2)), color: '#ff4a5a' }
      ],
      newBadges: [] // Mock empty badges
    });

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>Carbon Footprint baselining</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Input your daily habits to compute your metric CO2 footprint.</p>
      </div>

      {/* Step Indicators */}
      {!results && (
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          {steps.map(s => {
            const Icon = s.icon;
            const isCurrent = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div 
                key={s.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  opacity: isCurrent || isCompleted ? 1 : 0.4,
                  borderBottom: isCurrent ? '2px solid var(--accent-cyan)' : 'none',
                  paddingBottom: '8px',
                  marginBottom: '-18px',
                  fontWeight: isCurrent ? 600 : 400
                }}
              >
                <Icon size={18} style={{ color: isCurrent ? 'var(--accent-cyan)' : isCompleted ? 'var(--accent-green)' : 'inherit' }} />
                <span style={{ fontSize: '0.9rem' }}>{s.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Wizard / Results */}
      <div className="glass-card" style={{ padding: '32px', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {!results ? (
          <div>
            {/* Step 1: Transport */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Car style={{ color: 'var(--accent-cyan)' }} />
                  <span>Transportation Audit</span>
                </h3>
                
                <div>
                  <label htmlFor="transport-type">Primary Transit Vehicle</label>
                  <select 
                    id="transport-type"
                    value={transportType} 
                    onChange={(e) => setTransportType(e.target.value)}
                  >
                    <option value="petrol">Internal Combustion Engine (Petrol/Diesel)</option>
                    <option value="hybrid">Plug-in Hybrid Vehicle (PHEV)</option>
                    <option value="electric">Battery Electric Vehicle (BEV)</option>
                    <option value="public">Municipal Transit (Bus, Subways, Rail)</option>
                    <option value="active">Active Mobility (Bicycle, Walking, Electric Scooter)</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label htmlFor="transport-km">Estimated Weekly Commute Distance</label>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{transportKm} km</span>
                  </div>
                  <input 
                    id="transport-km"
                    type="range" 
                    min="0" 
                    max="600" 
                    value={transportKm} 
                    onChange={(e) => setTransportKm(parseInt(e.target.value))} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>0 km</span>
                    <span>300 km (Avg)</span>
                    <span>600 km</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Electricity */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap style={{ color: 'var(--accent-purple)' }} />
                  <span>Residential Electricity Consumption</span>
                </h3>

                <div>
                  <label htmlFor="electricity-source">Domestic Power Grid Profile</label>
                  <select 
                    id="electricity-source"
                    value={electricitySource} 
                    onChange={(e) => setElectricitySource(e.target.value)}
                  >
                    <option value="grid">Standard Coal/Natural Gas Municipal Grid</option>
                    <option value="mixed">Mixed Renewables / Hybrid Grid contract</option>
                    <option value="solar">Rooftop Solar PV Array / Clean Offgrid</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label htmlFor="electricity-kwh">Monthly Electrical Draw</label>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-purple)' }}>{electricityKwh} kWh</span>
                  </div>
                  <input 
                    id="electricity-kwh"
                    type="range" 
                    min="0" 
                    max="1000" 
                    value={electricityKwh} 
                    onChange={(e) => setElectricityKwh(parseInt(e.target.value))} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>0 kWh</span>
                    <span>350 kWh (Avg)</span>
                    <span>1000 kWh</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Diet */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Leaf style={{ color: 'var(--accent-green)' }} />
                  <span>Dietary Protocols</span>
                </h3>

                <div>
                  <label htmlFor="diet-type">Average Food Consumption Profile</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { value: 'meat-heavy', label: 'Heavy Meat Consumer', desc: 'Frequent red meat, beef, and dairy meals daily.' },
                      { value: 'average', label: 'Mixed Omnivore', desc: 'Balanced diet of vegetables, poultry, and occasional beef.' },
                      { value: 'pescatarian', label: 'Pescatarian', desc: 'Vegetables and dairy with seafood. Zero red meats.' },
                      { value: 'vegetarian', label: 'Vegetarian', desc: 'Complete plant and dairy menu. Zero meat.' },
                      { value: 'vegan', label: 'Vegan Protocol', desc: 'Strict plant-based food only. Zero animal bypass products.' }
                    ].map(opt => (
                      <div 
                        key={opt.value}
                        onClick={() => setDietType(opt.value)}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          border: `1px solid ${dietType === opt.value ? 'var(--accent-green)' : 'var(--glass-border)'}`,
                          background: dietType === opt.value ? 'rgba(5, 243, 166, 0.05)' : 'rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <h4 style={{ fontWeight: 600, fontSize: '0.95rem', color: dietType === opt.value ? 'var(--accent-green)' : 'inherit' }}>{opt.label}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{opt.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Waste */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trash2 style={{ color: '#ff4a5a' }} />
                  <span>Waste Output Audit</span>
                </h3>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label htmlFor="waste-kg">Weekly Non-Recyclable Waste Output</label>
                    <span style={{ fontWeight: 'bold', color: '#ff4a5a' }}>{wasteKg} kg</span>
                  </div>
                  <input 
                    id="waste-kg"
                    type="range" 
                    min="0" 
                    max="60" 
                    value={wasteKg} 
                    onChange={(e) => setWasteKg(parseInt(e.target.value))} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>0 kg</span>
                    <span>15 kg (Avg)</span>
                    <span>60 kg</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label htmlFor="recycle-rate">Recycling Sorting Rate</label>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{recycleRate}%</span>
                  </div>
                  <input 
                    id="recycle-rate"
                    type="range" 
                    min="0" 
                    max="100" 
                    value={recycleRate} 
                    onChange={(e) => setRecycleRate(parseInt(e.target.value))} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>0% (Landfill only)</span>
                    <span>100% (Perfect sorting)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results Layout */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', alignItems: 'center' }} className="grid-cols-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(5, 243, 166, 0.1)', color: 'var(--accent-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
              }}>
                <CheckCircle size={40} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Telemetry Computed</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Baseline uploaded to dashboard credentials.</p>
              </div>

              <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', width: '100%' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Computed Footprint</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-header)', color: 'var(--accent-cyan)' }}>
                  {results.total.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>tCO2e/yr</span>
                </p>
              </div>

              {results.newBadges.length > 0 && (
                <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05), rgba(5, 243, 166, 0.05))', border: '1px solid var(--accent-cyan)', borderRadius: '10px', width: '100%' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>⚡ Credentials Unlocked!</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>{results.newBadges.map(b => b.title).join(', ')}</p>
                </div>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 600 }}>Emissions Breakdown Segment</h4>
              <DonutChart data={results.breakdown} title="Footprint" unit="t" />
            </div>
          </div>
        )}

        {/* Buttons Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '24px', marginTop: '32px' }}>
          {!results ? (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleBack} 
                disabled={step === 1}
                style={{ opacity: step === 1 ? 0.3 : 1, cursor: step === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
              
              {step < 4 ? (
                <button className="btn btn-primary" onClick={handleNext}>
                  <span>Next Step</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleCalculate} disabled={calculating}>
                  <span>{calculating ? 'Analyzing...' : 'Evaluate Footprint'}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setResults(null)}>
                <span>Re-baseline</span>
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>
                  <span>Go Dashboard</span>
                </button>
                <button className="btn btn-primary" onClick={() => onNavigate('advisor')}>
                  <span>Consult AI Advisor</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Global Average Comparison Banner */}
      {!results && (
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(0, 242, 254, 0.02)' }}>
          <Info size={24} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong>Reference Metrics:</strong> The global average carbon footprint per human is approximately <strong>4.8 tons of CO2e</strong> per year. In carbon-heavy societies (e.g. United States, Australia), the domestic baseline averages exceed <strong>14.5 tons</strong> per capita.
          </p>
        </div>
      )}
    </div>
  );
};
