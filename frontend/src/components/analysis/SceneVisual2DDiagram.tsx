import React, { useState, useMemo } from 'react';
import {
  Layers,
  Car,
  User,
  AlertTriangle,
  Compass,
  Eye,
  Info,
  MapPin,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { GeminiSceneReconstruction, GeminiSceneReconstructionElement } from '../../types';

interface SceneVisual2DDiagramProps {
  reconstruction: GeminiSceneReconstruction;
}

interface DiagramElement extends GeminiSceneReconstructionElement {
  id: string;
  type: 'vehicle' | 'impact' | 'debris' | 'pedestrian' | 'object';
  x: number;
  y: number;
  angle: number;
  color: string;
}

export const SceneVisual2DDiagram: React.FC<SceneVisual2DDiagramProps> = ({ reconstruction }) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showDebris, setShowDebris] = useState<boolean>(true);
  const [roadLayout, setRoadLayout] = useState<'intersection' | 'straight'>('intersection');

  // SVG Canvas dimensions
  const width = 680;
  const height = 440;
  const centerX = width / 2; // 340
  const centerY = height / 2; // 220

  // Derive mapped 2D coordinates for elements based on evidence-grounded clues
  const diagramElements = useMemo<DiagramElement[]>(() => {
    const rawElements = reconstruction.elements || [];
    
    // Color palette for vehicles and scene elements
    const vehicleColors = ['#0ea5e9', '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6'];
    let vehicleIdx = 0;

    return rawElements.map((el, idx) => {
      const text = `${el.label} ${el.description} ${el.position}`.toLowerCase();
      let type: DiagramElement['type'] = 'vehicle';
      let color = '#0ea5e9';
      let x = centerX;
      let y = centerY;
      let angle = 0;

      // Classify type
      if (text.includes('impact') || text.includes('collision') || text.includes('contact point') || text.includes('area of contact')) {
        type = 'impact';
        color = '#ef4444';
        x = centerX;
        y = centerY;
      } else if (text.includes('debris') || text.includes('glass') || text.includes('scatter') || text.includes('fragment')) {
        type = 'debris';
        color = '#f59e0b';
        x = centerX + 30;
        y = centerY - 25;
      } else if (text.includes('pedestrian') || text.includes('walker') || text.includes('person') || text.includes('cyclist') || text.includes('bicycle')) {
        type = 'pedestrian';
        color = '#ec4899';
        x = centerX - 80;
        y = centerY + 45;
        angle = 90;
      } else if (text.includes('pole') || text.includes('curb') || text.includes('barrier') || text.includes('guardrail')) {
        type = 'object';
        color = '#94a3b8';
        x = centerX - 120;
        y = centerY - 90;
      } else {
        type = 'vehicle';
        color = vehicleColors[vehicleIdx % vehicleColors.length];
        vehicleIdx++;
      }

      // Assign position coordinates based on text cues if present
      if (type === 'vehicle') {
        const hasNorth = text.includes('north') || text.includes('northbound');
        const hasSouth = text.includes('south') || text.includes('southbound');
        const hasEast = text.includes('east') || text.includes('eastbound');
        const hasWest = text.includes('west') || text.includes('westbound');
        const hasCenter = text.includes('center') || text.includes('middle') || text.includes('intersection');

        if (hasNorth && hasEast) {
          x = centerX + 60;
          y = centerY - 75;
          angle = 45;
        } else if (hasNorth && hasWest) {
          x = centerX - 65;
          y = centerY - 75;
          angle = 315;
        } else if (hasSouth && hasEast) {
          x = centerX + 65;
          y = centerY + 80;
          angle = 135;
        } else if (hasSouth && hasWest) {
          x = centerX - 65;
          y = centerY + 80;
          angle = 225;
        } else if (hasNorth) {
          x = centerX - 25;
          y = centerY - 95;
          angle = 0; // facing north
        } else if (hasSouth) {
          x = centerX + 25;
          y = centerY + 95;
          angle = 180; // facing south
        } else if (hasEast) {
          x = centerX + 115;
          y = centerY + 20;
          angle = 90; // facing east
        } else if (hasWest) {
          x = centerX - 115;
          y = centerY - 20;
          angle = 270; // facing west
        } else if (hasCenter) {
          // Centered near impact
          const offset = idx === 0 ? -35 : 35;
          x = centerX + offset;
          y = centerY + (idx % 2 === 0 ? -20 : 20);
          angle = idx === 0 ? 30 : 280;
        } else {
          // Default staggered positioning for vehicles
          if (idx === 0) {
            x = centerX - 65;
            y = centerY - 45;
            angle = 35;
          } else if (idx === 1) {
            x = centerX + 55;
            y = centerY + 30;
            angle = 290;
          } else {
            const spreadAngle = (idx * (2 * Math.PI)) / rawElements.length;
            x = centerX + Math.cos(spreadAngle) * 95;
            y = centerY + Math.sin(spreadAngle) * 95;
            angle = Math.round((spreadAngle * 180) / Math.PI);
          }
        }
      }

      return {
        ...el,
        id: `recon-el-${idx}`,
        type,
        x,
        y,
        angle,
        color
      };
    });
  }, [reconstruction.elements, centerX, centerY]);

  const selectedElement = diagramElements.find((e) => e.id === selectedElementId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* 2D Canvas Container with Forensic Graph Paper Styling */}
      <div
        style={{
          width: '100%',
          position: 'relative',
          backgroundColor: '#0b0f19',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-medium)',
          boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Top Control Bar inside canvas */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            pointerEvents: 'none',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          {/* Status Badge */}
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.35rem 0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              pointerEvents: 'auto'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }}
            />
            <span style={{ fontWeight: 700 }}>2D SCENE RECONSTRUCTION DIAGRAM</span>
          </div>

          {/* Interactive Layer & Geometry Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              pointerEvents: 'auto'
            }}
          >
            <button
              type="button"
              onClick={() => setRoadLayout((prev) => (prev === 'intersection' ? 'straight' : 'intersection'))}
              className="mono"
              style={{
                fontSize: '0.68rem',
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}
              title="Toggle roadway layout"
            >
              Layout: {roadLayout === 'intersection' ? 'Intersection' : 'Straight Road'}
            </button>

            <button
              type="button"
              onClick={() => setShowVectors((v) => !v)}
              className="mono"
              style={{
                fontSize: '0.68rem',
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: showVectors ? 'var(--accent-surface)' : 'rgba(15, 23, 42, 0.85)',
                color: showVectors ? 'var(--accent-text)' : 'var(--text-tertiary)',
                border: showVectors ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}
            >
              {showVectors ? 'Vectors: ON' : 'Vectors: OFF'}
            </button>

            <button
              type="button"
              onClick={() => setShowDebris((d) => !d)}
              className="mono"
              style={{
                fontSize: '0.68rem',
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: showDebris ? 'var(--accent-surface)' : 'rgba(15, 23, 42, 0.85)',
                color: showDebris ? 'var(--accent-text)' : 'var(--text-tertiary)',
                border: showDebris ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}
            >
              {showDebris ? 'Debris: ON' : 'Debris: OFF'}
            </button>
          </div>
        </div>

        {/* SVG Canvas */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', minHeight: '380px' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="recon-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            </pattern>

            {/* Impact Glow */}
            <radialGradient id="recon-impact-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>

            {/* Vector Arrow Heads */}
            <marker id="recon-arrow-cyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#0ea5e9" />
            </marker>
            <marker id="recon-arrow-amber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
            </marker>
            <marker id="recon-arrow-magenta" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#ec4899" />
            </marker>
          </defs>

          {/* Background Grid */}
          <rect width={width} height={height} fill="#090d16" />
          <rect width={width} height={height} fill="url(#recon-grid)" />

          {/* Roadway Geometry: 4-Way Intersection */}
          {roadLayout === 'intersection' && (
            <g id="layout-intersection">
              {/* North-South Roadway */}
              <rect x={centerX - 80} y="0" width="160" height={height} fill="#141c2b" />
              {/* East-West Roadway */}
              <rect x="0" y={centerY - 75} width={width} height="150" fill="#141c2b" />

              {/* Road Curbs (White / Grey) */}
              <path d={`M 0 ${centerY - 75} L ${centerX - 80} ${centerY - 75} L ${centerX - 80} 0`} fill="none" stroke="#334155" strokeWidth="3" />
              <path d={`M ${centerX + 80} 0 L ${centerX + 80} ${centerY - 75} L ${width} ${centerY - 75}`} fill="none" stroke="#334155" strokeWidth="3" />
              <path d={`M 0 ${centerY + 75} L ${centerX - 80} ${centerY + 75} L ${centerX - 80} ${height}`} fill="none" stroke="#334155" strokeWidth="3" />
              <path d={`M ${centerX + 80} ${height} L ${centerX + 80} ${centerY + 75} L ${width} ${centerY + 75}`} fill="none" stroke="#334155" strokeWidth="3" />

              {/* Double Yellow Center Dividing Lines */}
              {/* North branch */}
              <line x1={centerX - 2} y1="0" x2={centerX - 2} y2={centerY - 95} stroke="#f59e0b" strokeWidth="2" />
              <line x1={centerX + 2} y1="0" x2={centerX + 2} y2={centerY - 95} stroke="#f59e0b" strokeWidth="2" />
              {/* South branch */}
              <line x1={centerX - 2} y1={centerY + 95} x2={centerX - 2} y2={height} stroke="#f59e0b" strokeWidth="2" />
              <line x1={centerX + 2} y1={centerY + 95} x2={centerX + 2} y2={height} stroke="#f59e0b" strokeWidth="2" />
              {/* West branch */}
              <line x1="0" y1={centerY - 2} x2={centerX - 100} y2={centerY - 2} stroke="#f59e0b" strokeWidth="2" />
              <line x1="0" y1={centerY + 2} x2={centerX - 100} y2={centerY + 2} stroke="#f59e0b" strokeWidth="2" />
              {/* East branch */}
              <line x1={centerX + 100} y1={centerY - 2} x2={width} y2={centerY - 2} stroke="#f59e0b" strokeWidth="2" />
              <line x1={centerX + 100} y1={centerY + 2} x2={width} y2={centerY + 2} stroke="#f59e0b" strokeWidth="2" />

              {/* White Stop Bars */}
              <line x1={centerX - 80} y1={centerY - 95} x2={centerX} y2={centerY - 95} stroke="#ffffff" strokeWidth="3" />
              <line x1={centerX} y1={centerY + 95} x2={centerX + 80} y2={centerY + 95} stroke="#ffffff" strokeWidth="3" />
              <line x1={centerX - 100} y1={centerY} x2={centerX - 100} y2={centerY + 75} stroke="#ffffff" strokeWidth="3" />
              <line x1={centerX + 100} y1={centerY - 75} x2={centerX + 100} y2={centerY} stroke="#ffffff" strokeWidth="3" />

              {/* Zebra Crosswalks */}
              {/* South Crosswalk */}
              {[centerX - 70, centerX - 50, centerX - 30, centerX - 10, centerX + 10, centerX + 30, centerX + 50, centerX + 70].map((x) => (
                <line key={`cw-s-${x}`} x1={x} y1={centerY + 80} x2={x} y2={centerY + 90} stroke="#ffffff" strokeWidth="6" opacity="0.75" />
              ))}
              {/* North Crosswalk */}
              {[centerX - 70, centerX - 50, centerX - 30, centerX - 10, centerX + 10, centerX + 30, centerX + 50, centerX + 70].map((x) => (
                <line key={`cw-n-${x}`} x1={x} y1={centerY - 90} x2={x} y2={centerY - 80} stroke="#ffffff" strokeWidth="6" opacity="0.75" />
              ))}

              {/* Pavement Lane Direction Text */}
              <text x={centerX} y="30" fill="rgba(255,255,255,0.22)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" letterSpacing="2">
                NORTHBOUND
              </text>
              <text x={centerX} y={height - 20} fill="rgba(255,255,255,0.22)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" letterSpacing="2">
                SOUTHBOUND
              </text>
              <text x="50" y={centerY + 4} fill="rgba(255,255,255,0.22)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="start" letterSpacing="2">
                EASTBOUND &gt;&gt;
              </text>
              <text x={width - 50} y={centerY + 4} fill="rgba(255,255,255,0.22)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end" letterSpacing="2">
                &lt;&lt; WESTBOUND
              </text>
            </g>
          )}

          {/* Roadway Geometry: Straight Multi-Lane Roadway */}
          {roadLayout === 'straight' && (
            <g id="layout-straight">
              {/* Road surface */}
              <rect x="0" y="70" width={width} height="300" fill="#141c2b" />
              {/* Curbs */}
              <line x1="0" y1="70" x2={width} y2="70" stroke="#334155" strokeWidth="4" />
              <line x1="0" y1="370" x2={width} y2="370" stroke="#334155" strokeWidth="4" />

              {/* Double yellow center line */}
              <line x1="0" y1={centerY - 2} x2={width} y2={centerY - 2} stroke="#f59e0b" strokeWidth="2" strokeDasharray="14 10" />
              <line x1="0" y1={centerY + 2} x2={width} y2={centerY + 2} stroke="#f59e0b" strokeWidth="2" strokeDasharray="14 10" />

              {/* White dashed lane dividers */}
              <line x1="0" y1="145" x2={width} y2="145" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="12 12" opacity="0.6" />
              <line x1="0" y1="295" x2={width} y2="295" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="12 12" opacity="0.6" />

              {/* Lane labels */}
              <text x="80" y="115" fill="rgba(255,255,255,0.22)" fontSize="10" fontFamily="var(--font-mono)">
                WESTBOUND TRAVEL LANE
              </text>
              <text x="80" y="340" fill="rgba(255,255,255,0.22)" fontSize="10" fontFamily="var(--font-mono)">
                EASTBOUND TRAVEL LANE
              </text>
            </g>
          )}

          {/* Trajectory / Vector Arrows between Vehicles & Impact */}
          {showVectors && (
            <g id="recon-vectors" opacity="0.8">
              {diagramElements
                .filter((el) => el.type === 'vehicle' || el.type === 'pedestrian')
                .map((el) => {
                  const marker = el.type === 'pedestrian' ? 'url(#recon-arrow-magenta)' : 'url(#recon-arrow-cyan)';
                  return (
                    <g key={`vec-${el.id}`}>
                      <line
                        x1={el.x}
                        y1={el.y}
                        x2={centerX}
                        y2={centerY}
                        stroke={el.color}
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        markerEnd={marker}
                        opacity="0.65"
                      />
                      <circle cx={el.x} cy={el.y} r="3" fill={el.color} />
                    </g>
                  );
                })}
            </g>
          )}

          {/* Debris Field Scatter (If toggled) */}
          {showDebris && (
            <g id="recon-debris-layer">
              {/* Concentric scatter ring around impact */}
              <circle
                cx={centerX}
                cy={centerY}
                r="38"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              {/* Scattered debris dots */}
              <circle cx={centerX + 14} cy={centerY - 18} r="2" fill="#cbd5e1" opacity="0.85" />
              <circle cx={centerX - 22} cy={centerY + 12} r="2.5" fill="#f59e0b" opacity="0.85" />
              <circle cx={centerX + 26} cy={centerY + 16} r="1.5" fill="#ef4444" opacity="0.85" />
              <circle cx={centerX - 12} cy={centerY - 24} r="2" fill="#e2e8f0" opacity="0.7" />
              <circle cx={centerX + 32} cy={centerY - 8} r="2" fill="#0ea5e9" opacity="0.75" />
            </g>
          )}

          {/* Render Elements: Impact Zone first (underneath vehicles) */}
          {diagramElements
            .filter((el) => el.type === 'impact')
            .map((el) => {
              const isSelected = selectedElementId === el.id;
              return (
                <g
                  key={el.id}
                  transform={`translate(${el.x}, ${el.y})`}
                  onClick={() => setSelectedElementId(el.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx="0" cy="0" r={isSelected ? 44 : 36} fill="url(#recon-impact-glow)" />
                  <circle cx="0" cy="0" r="18" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="0" cy="0" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />

                  {/* Impact Label Badge */}
                  <g transform="translate(0, -26)">
                    <rect
                      x="-65"
                      y="-11"
                      width="130"
                      height="20"
                      rx="4"
                      fill="#090d16"
                      opacity="0.95"
                      stroke={isSelected ? '#ffffff' : '#ef4444'}
                      strokeWidth={isSelected ? '2' : '1'}
                    />
                    <text
                      x="0"
                      y="3"
                      fill="#ef4444"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {el.label.toUpperCase()}
                    </text>
                  </g>
                </g>
              );
            })}

          {/* Render Other Elements: Vehicles, Pedestrians, Debris Markers */}
          {diagramElements
            .filter((el) => el.type !== 'impact')
            .map((el) => {
              const isSelected = selectedElementId === el.id;

              if (el.type === 'pedestrian') {
                return (
                  <g
                    key={el.id}
                    transform={`translate(${el.x}, ${el.y}) rotate(${el.angle})`}
                    onClick={() => setSelectedElementId(el.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <circle cx="0" cy="0" r="18" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
                    )}
                    <circle cx="0" cy="0" r="9" fill={el.color} stroke="#ffffff" strokeWidth="2" />
                    <line x1="0" y1="0" x2="0" y2="-16" stroke="#ffffff" strokeWidth="2" />
                    <polygon points="-3,-14 0,-20 3,-14" fill="#ffffff" />
                    <g transform={`rotate(${-el.angle}) translate(0, 22)`}>
                      <rect
                        x="-40"
                        y="-9"
                        width="80"
                        height="18"
                        rx="3"
                        fill="#090d16"
                        opacity="0.95"
                        stroke={isSelected ? '#ffffff' : el.color}
                        strokeWidth={isSelected ? '2' : '1'}
                      />
                      <text
                        x="0"
                        y="4"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontFamily="var(--font-mono)"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {el.label}
                      </text>
                    </g>
                  </g>
                );
              }

              if (el.type === 'debris') {
                return (
                  <g
                    key={el.id}
                    transform={`translate(${el.x}, ${el.y})`}
                    onClick={() => setSelectedElementId(el.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <circle cx="0" cy="0" r="26" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
                    )}
                    <circle cx="0" cy="0" r="12" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="1.5" />
                    <circle cx="-3" cy="-3" r="2" fill="#cbd5e1" />
                    <circle cx="3" cy="2" r="2" fill="#f59e0b" />
                    <g transform="translate(0, -18)">
                      <rect
                        x="-45"
                        y="-9"
                        width="90"
                        height="18"
                        rx="3"
                        fill="#090d16"
                        opacity="0.95"
                        stroke={isSelected ? '#ffffff' : el.color}
                        strokeWidth={isSelected ? '2' : '1'}
                      />
                      <text
                        x="0"
                        y="4"
                        fill="#f59e0b"
                        fontSize="8"
                        fontFamily="var(--font-mono)"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {el.label}
                      </text>
                    </g>
                  </g>
                );
              }

              // Default: Top-down vehicle representation (approx 48px x 26px)
              return (
                <g
                  key={el.id}
                  transform={`translate(${el.x}, ${el.y}) rotate(${el.angle})`}
                  onClick={() => setSelectedElementId(el.id)}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  {/* Highlight ring if selected */}
                  {isSelected && (
                    <rect
                      x="-19"
                      y="-31"
                      width="38"
                      height="62"
                      rx="9"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                    />
                  )}

                  {/* Vehicle Body Shadow */}
                  <rect
                    x="-14"
                    y="-25"
                    width="28"
                    height="50"
                    rx="6"
                    fill="#000000"
                    opacity="0.45"
                    transform="translate(2, 3)"
                  />

                  {/* Vehicle Chassis Body */}
                  <rect
                    x="-13"
                    y="-24"
                    width="26"
                    height="48"
                    rx="6"
                    fill={el.color}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                  />

                  {/* Windshield & Windows */}
                  <rect x="-10" y="-12" width="20" height="9" rx="2" fill="#0f172a" opacity="0.88" />
                  <rect x="-9" y="11" width="18" height="7" rx="2" fill="#0f172a" opacity="0.88" />
                  <rect x="-11" y="-1" width="3" height="10" rx="1" fill="#0f172a" opacity="0.7" />
                  <rect x="8" y="-1" width="3" height="10" rx="1" fill="#0f172a" opacity="0.7" />

                  {/* Headlights (yellow cast) */}
                  <rect x="-11" y="-24" width="5" height="3" rx="1" fill="#fef08a" />
                  <rect x="6" y="-24" width="5" height="3" rx="1" fill="#fef08a" />

                  {/* Direction Heading Pointer */}
                  <line x1="0" y1="-8" x2="0" y2="-28" stroke="#ffffff" strokeWidth="2" />
                  <polygon points="-3,-26 0,-33 3,-26" fill="#ffffff" />

                  {/* Label Chip Badge (Counter-rotated for horizontal readability) */}
                  <g transform={`rotate(${-el.angle}) translate(0, 38)`}>
                    <rect
                      x="-48"
                      y="-11"
                      width="96"
                      height="20"
                      rx="4"
                      fill="#090d16"
                      opacity="0.95"
                      stroke={isSelected ? '#ffffff' : el.color}
                      strokeWidth={isSelected ? '2' : '1'}
                    />
                    <text
                      x="0"
                      y="4"
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {el.label}
                    </text>
                  </g>
                </g>
              );
            })}

          {/* Compass Rose (Top Right) */}
          <g transform={`translate(${width - 45}, 48)`}>
            <circle cx="0" cy="0" r="16" fill="#090d16" stroke="#334155" strokeWidth="1" />
            <polygon points="0,-12 4,0 -4,0" fill="#ef4444" />
            <polygon points="0,12 4,0 -4,0" fill="#64748b" />
            <text x="0" y="-15" fill="#ffffff" fontSize="8" fontFamily="var(--font-mono)" fontWeight="bold" textAnchor="middle">
              N
            </text>
          </g>

          {/* Approximate Scale Bar (Bottom Left) */}
          <g transform="translate(25, 415)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <line x1="60" y1="-4" x2="60" y2="4" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <text x="30" y="-6" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle">
              SCALE: QUALITATIVE / NON-SURVEY GRADE
            </text>
          </g>
        </svg>

        {/* Selected Element Floating Inspector on Canvas */}
        {selectedElement && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              maxWidth: '340px',
              backgroundColor: 'rgba(9, 13, 22, 0.94)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${selectedElement.color}`,
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 0.9rem',
              color: 'var(--text-primary)',
              zIndex: 20,
              fontSize: '0.8rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: selectedElement.color
                  }}
                />
                <strong style={{ fontSize: '0.88rem' }}>{selectedElement.label}</strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedElementId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.35rem' }}>
              {selectedElement.description}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-text)' }}>
              <strong>Observed Position: </strong> {selectedElement.position}
            </div>
          </div>
        )}
      </div>

      {/* Structured Elements Grid Breakdown */}
      {reconstruction.elements && reconstruction.elements.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <h4
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0
              }}
            >
              Identified Scene Elements ({reconstruction.elements.length})
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              Click element to highlight on 2D diagram
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.75rem'
            }}
          >
            {diagramElements.map((el) => {
              const isSelected = selectedElementId === el.id;
              return (
                <div
                  key={el.id}
                  onClick={() => setSelectedElementId(isSelected ? null : el.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: isSelected ? 'var(--accent-surface)' : 'var(--bg-canvas-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? `1.5px solid ${el.color}` : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: el.color,
                          flexShrink: 0
                        }}
                      />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {el.label}
                      </span>
                    </div>
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.65rem',
                        padding: '0.15rem 0.4rem',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {el.type}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {el.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.4rem',
                      fontSize: '0.78rem',
                      color: 'var(--text-primary)',
                      marginTop: '0.2rem',
                      paddingTop: '0.4rem',
                      borderTop: '1px solid var(--border-subtle)'
                    }}
                  >
                    <MapPin size={13} style={{ color: el.color, flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase', display: 'block' }}>
                        Qualitative Position:
                      </strong>
                      <span>{el.position}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
