import React, { useState } from 'react';

// ==========================================
// 1. DONUT CHART (For Footprint Breakdowns)
// ==========================================
interface DonutData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutData[];
  title?: string;
  unit?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, title = "Total", unit = "t" }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedAngle = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
          {/* Base Background Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="var(--bg-tertiary)"
            strokeWidth={strokeWidth}
          />
          
          {data.map((item, index) => {
            if (total === 0 || item.value === 0) return null;
            
            const pct = (item.value / total) * 100;
            const strokeDashoffset = circumference - (pct / 100) * circumference;
            const strokeDasharray = `${circumference} ${circumference}`;
            
            // Rotate each segment based on previous ones
            const rotation = (accumulatedAngle / total) * 360 - 90;
            accumulatedAngle += item.value;

            const isHovered = activeIndex === index;

            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotation} ${center} ${center})`}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: isHovered ? `drop-shadow(0 0 8px ${item.color})` : 'none',
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Indicator */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {activeIndex !== null ? data[activeIndex].name : title}
          </span>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-header)', marginTop: '4px' }}>
            {activeIndex !== null 
              ? `${data[activeIndex].value.toFixed(1)}${unit}`
              : `${total.toFixed(1)}${unit}`
            }
          </span>
          {activeIndex !== null && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
              {((data[activeIndex].value / (total || 1)) * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {/* Legend Grid */}
      <div style={{
        marginTop: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        width: '100%'
      }}>
        {data.map((item, index) => (
          <div 
            key={index} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.85rem',
              cursor: 'pointer',
              opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
            <span style={{ fontWeight: 600, marginLeft: 'auto', flexShrink: 0 }}>{item.value.toFixed(1)}{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


// ==========================================
// 2. LINE CHART (For Future Projections & Trends)
// ==========================================
interface LinePoint {
  label: string;
  val1: number; // e.g. Positive Path
  val2?: number; // e.g. Negative Path
}

interface LineChartProps {
  data: LinePoint[];
  line1Color?: string;
  line2Color?: string;
  line1Name?: string;
  line2Name?: string;
  yUnit?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  line1Color = "var(--accent-green)",
  line2Color = "var(--accent-danger)",
  line1Name = "Target Path",
  line2Name = "Business As Usual",
  yUnit = ""
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 500;
  const height = 250;
  const padding = 40;

  // Find bounds
  const allValues = data.flatMap(d => [d.val1, d.val2 !== undefined ? d.val2 : d.val1]);
  const maxVal = Math.max(...allValues, 10) * 1.1;
  const minVal = Math.min(...allValues, 0);

  const mapX = (index: number) => {
    return padding + (index / (data.length - 1)) * (width - 2 * padding);
  };

  const mapY = (val: number) => {
    return height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
  };

  // Generate paths
  const makePath = (key: 'val1' | 'val2') => {
    return data.map((d, i) => {
      const val = d[key];
      if (val === undefined) return '';
      return `${i === 0 ? 'M' : 'L'} ${mapX(i)} ${mapY(val)}`;
    }).join(' ');
  };

  const path1 = makePath('val1');
  const path2 = data[0].val2 !== undefined ? makePath('val2') : '';

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        {/* Gradients */}
        <defs>
          <linearGradient id="gradient-line1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={line1Color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={line1Color} stopOpacity="0.0" />
          </linearGradient>
          {path2 && (
            <linearGradient id="gradient-line2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line2Color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={line2Color} stopOpacity="0.0" />
            </linearGradient>
          )}
        </defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const val = minVal + p * (maxVal - minVal);
          const y = mapY(val);
          return (
            <g key={i}>
              <line 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="var(--glass-border)" 
                strokeDasharray="4 4" 
                strokeWidth={1} 
              />
              <text 
                x={padding - 10} 
                y={y + 4} 
                fill="var(--text-secondary)" 
                fontSize="10px" 
                textAnchor="end"
              >
                {val.toFixed(0)}{yUnit}
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {data.map((d, i) => {
          // Display 5 labels maximum
          const step = Math.ceil(data.length / 5);
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={mapX(i)}
              y={height - padding + 18}
              fill="var(--text-secondary)"
              fontSize="10px"
              textAnchor="middle"
            >
              {d.label}
            </text>
          );
        })}

        {/* Line 1 Gradient Fill */}
        <path
          d={`${path1} L ${mapX(data.length - 1)} ${height - padding} L ${mapX(0)} ${height - padding} Z`}
          fill="url(#gradient-line1)"
          stroke="none"
        />

        {/* Line 2 Gradient Fill */}
        {path2 && (
          <path
            d={`${path2} L ${mapX(data.length - 1)} ${height - padding} L ${mapX(0)} ${height - padding} Z`}
            fill="url(#gradient-line2)"
            stroke="none"
          />
        )}

        {/* Line Paths */}
        <path
          d={path1}
          fill="none"
          stroke={line1Color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 4px ${line1Color}33)` }}
        />

        {path2 && (
          <path
            d={path2}
            fill="none"
            stroke={line2Color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 4px ${line2Color}33)` }}
          />
        )}

        {/* Active Hover Guide and Dots */}
        {data.map((d, i) => {
          const x = mapX(i);
          return (
            <g 
              key={i}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Hotspot transparent bar */}
              <rect
                x={x - 10}
                y={padding}
                width={20}
                height={height - 2 * padding}
                fill="transparent"
              />

              {hoverIdx === i && (
                <>
                  {/* Guide line */}
                  <line
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    stroke="var(--accent-cyan)"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                  />
                  {/* Dot 1 */}
                  <circle
                    cx={x}
                    cy={mapY(d.val1)}
                    r={6}
                    fill={line1Color}
                    stroke="var(--bg-primary)"
                    strokeWidth={2}
                  />
                  {/* Dot 2 */}
                  {d.val2 !== undefined && (
                    <circle
                      cx={x}
                      cy={mapY(d.val2)}
                      r={6}
                      fill={line2Color}
                      stroke="var(--bg-primary)"
                      strokeWidth={2}
                    />
                  )}
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoverIdx !== null && (
        <div className="glass-card" style={{
          position: 'absolute',
          top: '10px',
          left: mapX(hoverIdx) > width / 2 ? '50px' : 'auto',
          right: mapX(hoverIdx) <= width / 2 ? '50px' : 'auto',
          padding: '10px 14px',
          zIndex: 5,
          fontSize: '0.8rem',
          pointerEvents: 'none'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '4px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2px' }}>
            Year: {data[hoverIdx].label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: line1Color }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: line1Color }} />
            <span>{line1Name}: <strong>{data[hoverIdx].val1.toFixed(1)}{yUnit}</strong></span>
          </div>
          {data[hoverIdx].val2 !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: line2Color, marginTop: '2px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: line2Color }} />
              <span>{line2Name}: <strong>{(data[hoverIdx].val2 as number).toFixed(1)}{yUnit}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Legends */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '3px', borderRadius: '1.5px', backgroundColor: line1Color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{line1Name}</span>
        </div>
        {data[0].val2 !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '3px', borderRadius: '1.5px', backgroundColor: line2Color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{line2Name}</span>
          </div>
        )}
      </div>
    </div>
  );
};


// ==========================================
// 3. BAR CHART (For Average Comparison)
// ==========================================
interface BarItem {
  label: string;
  userVal: number;
  avgVal: number;
}

interface BarChartProps {
  data: BarItem[];
  userColor?: string;
  avgColor?: string;
  userLabel?: string;
  avgLabel?: string;
  yUnit?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  userColor = "var(--accent-cyan)",
  avgColor = "var(--text-secondary)",
  userLabel = "You",
  avgLabel = "World Avg",
  yUnit = "t"
}) => {
  const height = 220;
  const width = 500;
  const padding = 40;

  const maxVal = Math.max(...data.flatMap(d => [d.userVal, d.avgVal]), 5) * 1.1;

  const barWidth = 24;
  
  const mapY = (val: number) => {
    return height - padding - (val / maxVal) * (height - 2 * padding);
  };

  const chartInnerWidth = width - 2 * padding;
  const colWidth = chartInnerWidth / data.length;

  return (
    <div style={{ width: '100%' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        {/* Y Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const val = p * maxVal;
          const y = mapY(val);
          return (
            <g key={i}>
              <line 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="var(--glass-border)" 
                strokeDasharray="4 4"
              />
              <text 
                x={padding - 10} 
                y={y + 4} 
                fill="var(--text-secondary)" 
                fontSize="10px" 
                textAnchor="end"
              >
                {val.toFixed(1)}{yUnit}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, i) => {
          const colCenter = padding + i * colWidth + colWidth / 2;
          
          const xUser = colCenter - barWidth - 2;
          const yUser = mapY(item.userVal);
          const hUser = Math.max(height - padding - yUser, 2);

          const xAvg = colCenter + 2;
          const yAvg = mapY(item.avgVal);
          const hAvg = Math.max(height - padding - yAvg, 2);

          return (
            <g key={i}>
              {/* User Bar */}
              <rect
                x={xUser}
                y={yUser}
                width={barWidth}
                height={hUser}
                fill={userColor}
                rx={4}
                style={{
                  filter: `drop-shadow(0 2px 6px ${userColor}44)`,
                  transition: 'y 0.5s ease, height 0.5s ease'
                }}
              />
              <text
                x={xUser + barWidth / 2}
                y={yUser - 6}
                fill="var(--text-primary)"
                fontSize="10px"
                fontWeight="600"
                textAnchor="middle"
              >
                {item.userVal.toFixed(1)}
              </text>

              {/* Average Bar */}
              <rect
                x={xAvg}
                y={yAvg}
                width={barWidth}
                height={hAvg}
                fill={avgColor}
                fillOpacity={0.4}
                stroke={avgColor}
                strokeWidth={1}
                rx={4}
                style={{
                  transition: 'y 0.5s ease, height 0.5s ease'
                }}
              />
              <text
                x={xAvg + barWidth / 2}
                y={yAvg - 6}
                fill="var(--text-secondary)"
                fontSize="10px"
                textAnchor="middle"
              >
                {item.avgVal.toFixed(1)}
              </text>

              {/* Label */}
              <text
                x={colCenter}
                y={height - padding + 18}
                fill="var(--text-primary)"
                fontSize="11px"
                fontWeight="500"
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legends */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: userColor }} />
          <span style={{ color: 'var(--text-secondary)' }}>{userLabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: avgColor, opacity: 0.5, border: `1px solid ${avgColor}` }} />
          <span style={{ color: 'var(--text-secondary)' }}>{avgLabel}</span>
        </div>
      </div>
    </div>
  );
};
