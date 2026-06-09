import React, { useEffect, useRef } from 'react';

interface EarthCanvasProps {
  scenario?: 'green' | 'industrial' | 'neutral';
}

export const EarthCanvas: React.FC<EarthCanvasProps> = ({ scenario = 'neutral' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    // Handle high DPI screens
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Planet rotation parameters
    let rotationY = 0;
    let rotationX = 0.3; // Earth tilt
    const radius = 120; // Sphere radius in pixels
    
    // Generate lat/long grid lines
    const numLatitudes = 9;
    const numLongitudes = 12;
    
    // Satellites tracking data
    const satellites = [
      { angle: 0, speed: 0.02, distance: 160, color: '#00f2fe', size: 3, trackOffset: 0.2 },
      { angle: Math.PI, speed: -0.015, distance: 180, color: '#05f3a6', size: 4, trackOffset: -0.4 },
      { angle: Math.PI / 2, speed: 0.01, distance: 150, color: '#7f00ff', size: 2.5, trackOffset: 0.8 }
    ];

    const draw = () => {
      // Clear with soft trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / (2 * (window.devicePixelRatio || 1));
      const cy = canvas.height / (2 * (window.devicePixelRatio || 1));

      // Color scheme based on scenario
      let mainColor = '#00f2fe'; // cyan
      let secondColor = '#05f3a6'; // green
      let glowColor = 'rgba(0, 242, 254, 0.2)';
      
      if (scenario === 'green') {
        mainColor = '#05f3a6'; // vibrant green
        secondColor = '#10b981';
        glowColor = 'rgba(5, 243, 166, 0.25)';
      } else if (scenario === 'industrial') {
        mainColor = '#ff6b3d'; // toxic orange/red
        secondColor = '#ef4444';
        glowColor = 'rgba(239, 68, 68, 0.25)';
      }

      // Draw Atmospheric Glow
      const grad = ctx.createRadialGradient(cx, cy, radius - 15, cx, cy, radius + 40);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.5, glowColor);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 40, 0, Math.PI * 2);
      ctx.fill();

      // Rotated 3D projection helper
      const project3D = (lat: number, lon: number) => {
        // Spherical coordinates
        const x3d = radius * Math.cos(lat) * Math.cos(lon);
        const y3d = radius * Math.sin(lat);
        const z3d = radius * Math.cos(lat) * Math.sin(lon);

        // Rotate around Y axis
        const ry_x = x3d * Math.cos(rotationY) - z3d * Math.sin(rotationY);
        const ry_z = x3d * Math.sin(rotationY) + z3d * Math.cos(rotationY);

        // Rotate around X axis (tilt)
        const rx_y = y3d * Math.cos(rotationX) - ry_z * Math.sin(rotationX);
        const rx_z = y3d * Math.sin(rotationX) + ry_z * Math.cos(rotationX);

        // Perspective scale factor
        const perspective = 300 / (300 + rx_z);
        
        return {
          x: cx + ry_x * perspective,
          y: cy + rx_y * perspective,
          z: rx_z // depth
        };
      };

      // Draw latitude lines (horizontal hoops)
      for (let i = 1; i < numLatitudes; i++) {
        const lat = -Math.PI / 2 + (Math.PI * i) / numLatitudes;
        ctx.beginPath();
        
        // Render hoop as connected segments
        for (let j = 0; j <= 40; j++) {
          const lon = (Math.PI * 2 * j) / 40;
          const pt = project3D(lat, lon);
          
          if (j === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 0.5;
        // Fade lines on back side
        ctx.globalAlpha = 0.25;
        ctx.stroke();
      }

      // Draw longitude lines (vertical hoops)
      for (let i = 0; i < numLongitudes; i++) {
        const lon = (Math.PI * 2 * i) / numLongitudes;
        ctx.beginPath();
        
        for (let j = 0; j <= 40; j++) {
          const lat = -Math.PI / 2 + (Math.PI * j) / 40;
          const pt = project3D(lat, lon);
          
          if (j === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.25;
        ctx.stroke();
      }

      // Draw Continent Outline Clusters (Simulated glowing tech continents)
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = secondColor;
      
      const seedPoints = [
        // North America cluster
        { lat: 0.6, lon: -1.7 }, { lat: 0.8, lon: -2.0 }, { lat: 0.5, lon: -2.3 }, { lat: 0.4, lon: -1.9 },
        // South America
        { lat: -0.2, lon: -1.2 }, { lat: -0.5, lon: -1.0 }, { lat: -0.8, lon: -1.1 },
        // Africa
        { lat: 0.1, lon: 0.4 }, { lat: -0.2, lon: 0.6 }, { lat: -0.6, lon: 0.5 },
        // Eurasia
        { lat: 0.9, lon: 0.8 }, { lat: 0.7, lon: 1.5 }, { lat: 0.8, lon: 2.2 }, { lat: 0.5, lon: 0.5 }, { lat: 0.4, lon: 1.2 },
        // Australia
        { lat: -0.5, lon: 2.4 }, { lat: -0.6, lon: 2.6 }
      ];

      seedPoints.forEach(pt => {
        const projected = project3D(pt.lat, pt.lon);
        // Only draw visible side (depth z < 0 is closer to viewer in this math coordinate space)
        if (projected.z < 15) {
          const depthAlpha = Math.max(0.1, 1 - (projected.z + radius) / (2 * radius));
          ctx.globalAlpha = depthAlpha * 0.75;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, 4, 0, Math.PI * 2);
          ctx.shadowBlur = 8;
          ctx.shadowColor = secondColor;
          ctx.fill();
          ctx.shadowBlur = 0; // reset shadow
        }
      });

      // Draw Orbiting Satellites and Data Nodes
      satellites.forEach(sat => {
        sat.angle += sat.speed;
        
        // Orbital projection
        const orbitRadiusX = sat.distance;
        const orbitRadiusY = sat.distance * 0.4;
        
        // Compute ellipse rotation based on offset
        const x = cx + orbitRadiusX * Math.cos(sat.angle) * Math.cos(sat.trackOffset) - orbitRadiusY * Math.sin(sat.angle) * Math.sin(sat.trackOffset);
        const y = cy + orbitRadiusX * Math.cos(sat.angle) * Math.sin(sat.trackOffset) + orbitRadiusY * Math.sin(sat.angle) * Math.cos(sat.trackOffset);
        
        const isBack = Math.sin(sat.angle) < 0; // simple visibility
        
        // Draw path
        ctx.beginPath();
        ctx.ellipse(cx, cy, orbitRadiusX, orbitRadiusY, sat.trackOffset, 0, Math.PI * 2);
        ctx.strokeStyle = sat.color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = isBack ? 0.08 : 0.2;
        ctx.stroke();

        // Draw node
        ctx.beginPath();
        ctx.arc(x, y, sat.size, 0, Math.PI * 2);
        ctx.fillStyle = sat.color;
        ctx.globalAlpha = isBack ? 0.2 : 0.9;
        ctx.shadowBlur = 10;
        ctx.shadowColor = sat.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Draw dynamic signal line from satellite to surface center
        if (!isBack) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = sat.color;
          ctx.lineWidth = 0.3;
          ctx.globalAlpha = 0.15;
          ctx.stroke();
        }
      });

      // Draw Outer Technical Ring / HUD
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 55, 0, Math.PI * 2);
      ctx.stroke();

      // Outer dashed HUD ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 65, rotationY, rotationY + Math.PI / 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 65, rotationY + Math.PI, rotationY + 1.5 * Math.PI);
      ctx.stroke();

      // Update rotation
      rotationY += 0.003;
      
      ctx.globalAlpha = 1; // reset alpha
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [scenario]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '350px' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};
