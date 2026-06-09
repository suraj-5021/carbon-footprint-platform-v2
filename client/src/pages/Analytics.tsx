import React from 'react';
import type { UserProfile } from '../App';
import { DonutChart, LineChart, BarChart } from '../components/SVGCharts';
import { FileText, Download } from 'lucide-react';

interface AnalyticsProps {
  user: UserProfile | null;
}

export const Analytics: React.FC<AnalyticsProps> = ({ user }) => {
  if (!user || user.carbonScore === 0) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <FileText size={48} style={{ color: 'var(--accent-cyan)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Analytics Unavailable</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          Please complete your carbon footprint calculations baseline first to compile this reports telemetry.
        </p>
      </div>
    );
  }

  const latestCalc = user.calculationsHistory[user.calculationsHistory.length - 1].scores;

  const breakdownData = [
    { name: 'Transport', value: latestCalc.transport, color: '#00f2fe' },
    { name: 'Electricity', value: latestCalc.electricity, color: '#7f00ff' },
    { name: 'Diet', value: latestCalc.food, color: '#05f3a6' },
    { name: 'Waste', value: latestCalc.waste, color: '#ff4a5a' }
  ];

  // Compare user score against World Average per category
  // World averages (approx): Transport 1.8, Electricity 1.4, Food 2.0, Waste 0.6
  const comparisonData = [
    { label: 'Transport', userVal: latestCalc.transport, avgVal: 1.8 },
    { label: 'Electricity', userVal: latestCalc.electricity, avgVal: 1.4 },
    { label: 'Food', userVal: latestCalc.food, avgVal: 2.0 },
    { label: 'Waste', userVal: latestCalc.waste, avgVal: 0.6 }
  ];

  // Convert history points to line chart
  const historyData = user.calculationsHistory.map(pt => ({
    label: new Date(pt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    val1: pt.scores.total
  }));

  // PDF report generation function using print-friendly HTML iframe
  const generatePDFReport = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      alert("Please allow popups to export the report.");
      return;
    }

    const today = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

    const htmlContent = `
      <html>
        <head>
          <title>CarbonWise 2050 - Sustainability Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; line-height: 1.5; }
            .header { border-bottom: 2px solid #00f2fe; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
            .meta { font-size: 14px; color: #64748b; text-align: right; }
            .score-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; display: flex; justify-content: space-between; margin-bottom: 30px; }
            .score-item { text-align: center; flex: 1; }
            .score-val { font-size: 28px; font-weight: bold; color: #0ea5e9; margin-top: 5px; }
            .section-title { font-size: 18px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">CarbonWise 2050 Credentials</h1>
              <p style="margin: 4px 0 0 0; color: #64748b;">Environmental Impact Report</p>
            </div>
            <div class="meta">
              <p>Generated: <strong>${today}</strong></p>
              <p>Node: <strong>Specialist ${user.name}</strong></p>
            </div>
          </div>

          <div class="score-box">
            <div class="score-item" style="border-right: 1px solid #e2e8f0;">
              <div style="font-size: 13px; color: #64748b;">CARBON FOOTPRINT</div>
              <div class="score-val">${latestCalc.total.toFixed(2)} tCO2e/yr</div>
            </div>
            <div class="score-item" style="border-right: 1px solid #e2e8f0;">
              <div style="font-size: 13px; color: #64748b;">SUSTAINABILITY XP</div>
              <div class="score-val" style="color: #10b981;">${user.sustainabilityScore} XP</div>
            </div>
            <div class="score-item">
              <div style="font-size: 13px; color: #64748b;">LOG STREAK</div>
              <div class="score-val" style="color: #ff7c3b;">${user.streak} Days</div>
            </div>
          </div>

          <div class="section-title">Emissions Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Emissions (tCO2e/yr)</th>
                <th>Comparison Reference (Avg)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Transportation</td>
                <td><strong>${latestCalc.transport.toFixed(2)}</strong></td>
                <td>1.80</td>
                <td>${latestCalc.transport < 1.8 ? 'Under Average' : 'Above Average'}</td>
              </tr>
              <tr>
                <td>Electricity Usage</td>
                <td><strong>${latestCalc.electricity.toFixed(2)}</strong></td>
                <td>1.40</td>
                <td>${latestCalc.electricity < 1.4 ? 'Under Average' : 'Above Average'}</td>
              </tr>
              <tr>
                <td>Dietary Habits</td>
                <td><strong>${latestCalc.food.toFixed(2)}</strong></td>
                <td>2.00</td>
                <td>${latestCalc.food < 2.0 ? 'Under Average' : 'Above Average'}</td>
              </tr>
              <tr>
                <td>Waste Generation</td>
                <td><strong>${latestCalc.waste.toFixed(2)}</strong></td>
                <td>0.60</td>
                <td>${latestCalc.waste < 0.6 ? 'Under Average' : 'Above Average'}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">Milestones & Completed Badges</div>
          <p>Logged Saved Water: <strong>${user.waterSavedLiters} L</strong></p>
          <p>Trees Seeded: <strong>${user.treesPlanted} planted</strong></p>
          <p>Transit Kilometers Offset: <strong>${user.transportKmSaved} km</strong></p>
          <p>Credentials Unlocked: <strong>${user.unlockedBadges.map(b => b.title).join(', ')}</strong></p>

          <div class="footer">
            <p>© 2026 CarbonWise 2050 Climate Registry. Diagnostics are heuristically verified.</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    reportWindow.document.open();
    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>Analytics & Reports</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Deep-dive analysis of your emission baselines and comparative charts.</p>
        </div>

        <button className="btn btn-primary" onClick={generatePDFReport}>
          <Download size={16} />
          <span>Export PDF Report</span>
        </button>
      </div>

      {/* Grid Charts */}
      <div className="grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '24px' }}>
        
        {/* Left Side: Emissions pie/donut breakdown */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 600 }}>Emissions Breakdown Segment</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
            <DonutChart data={breakdownData} title="Footprint" unit="t" />
          </div>
        </div>

        {/* Right Side: Comparison Bar Chart */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 600 }}>Comparison vs Global Averages</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart 
              data={comparisonData} 
              userColor="var(--accent-cyan)" 
              avgColor="var(--text-secondary)" 
              yUnit="t"
            />
          </div>
        </div>

      </div>

      {/* Trajectory Timeline Chart */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 600 }}>Historical Trajectory logs</h3>
        <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LineChart 
            data={historyData} 
            line1Color="var(--accent-cyan)" 
            line1Name="Baseline Total score"
            yUnit="t"
          />
        </div>
      </div>
    </div>
  );
};
