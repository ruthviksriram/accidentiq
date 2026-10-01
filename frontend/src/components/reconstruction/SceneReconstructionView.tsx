import React, { useMemo } from 'react';
import { ReconstructionData, ReconstructionActor } from '../../types';

interface SceneReconstructionViewProps {
  data: ReconstructionData;
  currentStep: number;
  showVectors?: boolean;
  showDebris?: boolean;
}

export const SceneReconstructionView: React.FC<SceneReconstructionViewProps> = ({
  data,
  currentStep,
  showVectors = true,
  showDebris = true
}) => {
  // SVG Canvas dimensions: 640 x 500
  const width = 640;
  const height = 500;

  // Compute interpolated actor position based on currentStep (0, 1, 2, 3)
  const getActorPosition = (actor: ReconstructionActor) => {
    switch (currentStep) {
      case 0:
        return actor.startPos;
      case 1:
        return actor.preImpactPos;
      case 2:
        return actor.impactPos;
      case 3:
      default:
        return actor.finalRestPos;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '440px',
        backgroundColor: 'var(--road-grass)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid var(--border-medium)',
        boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.4)'
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          {/* Subtle Grid pattern for investigation graph paper feel */}
          <pattern id="investigation-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--grid-line)" strokeWidth="1" />
          </pattern>

          {/* Marker arrow heads */}
          <marker id="arrow-teal" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#5FA6A0" />
          </marker>
          <marker id="arrow-amber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
          </marker>
          <marker id="arrow-magenta" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#ec4899" />
          </marker>

          {/* Impact gradient burst */}
          <radialGradient id="impact-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Grid Background */}
        <rect width={width} height={height} fill="url(#investigation-grid)" />

        {/* ===============================================================
            SCENARIO 1: FOUR WAY INTERSECTION
            =============================================================== */}
        {data.roadType === 'four_way_intersection' && (
          <g id="road-four-way">
            {/* North-South Road */}
            <rect x="230" y="0" width="160" height={height} fill="var(--road-asphalt)" />
            {/* East-West Road */}
            <rect x="0" y="170" width={width} height="160" fill="var(--road-asphalt)" />

            {/* Corner Curbs */}
            <path d="M 0 170 L 230 170 L 230 0" fill="none" stroke="var(--road-curb)" strokeWidth="3" />
            <path d="M 390 0 L 390 170 L 640 170" fill="none" stroke="var(--road-curb)" strokeWidth="3" />
            <path d="M 0 330 L 230 330 L 230 500" fill="none" stroke="var(--road-curb)" strokeWidth="3" />
            <path d="M 390 500 L 390 330 L 640 330" fill="none" stroke="var(--road-curb)" strokeWidth="3" />

            {/* Yellow Center Double Lines */}
            {/* North branch */}
            <line x1="308" y1="0" x2="308" y2="150" stroke="var(--road-line-yellow)" strokeWidth="2" />
            <line x1="312" y1="0" x2="312" y2="150" stroke="var(--road-line-yellow)" strokeWidth="2" />
            {/* South branch */}
            <line x1="308" y1="350" x2="308" y2="500" stroke="var(--road-line-yellow)" strokeWidth="2" />
            <line x1="312" y1="350" x2="312" y2="500" stroke="var(--road-line-yellow)" strokeWidth="2" />
            {/* West branch */}
            <line x1="0" y1="248" x2="210" y2="248" stroke="var(--road-line-yellow)" strokeWidth="2" />
            <line x1="0" y1="252" x2="210" y2="252" stroke="var(--road-line-yellow)" strokeWidth="2" />
            {/* East branch */}
            <line x1="410" y1="248" x2="640" y2="248" stroke="var(--road-line-yellow)" strokeWidth="2" />
            <line x1="410" y1="252" x2="640" y2="252" stroke="var(--road-line-yellow)" strokeWidth="2" />

            {/* White Stop Lines */}
            <line x1="230" y1="345" x2="310" y2="345" stroke="var(--road-line-white)" strokeWidth="4" />
            <line x1="310" y1="155" x2="390" y2="155" stroke="var(--road-line-white)" strokeWidth="4" />
            <line x1="215" y1="170" x2="215" y2="250" stroke="var(--road-line-white)" strokeWidth="4" />
            <line x1="405" y1="250" x2="405" y2="330" stroke="var(--road-line-white)" strokeWidth="4" />

            {/* Crosswalk Zebra Stripes */}
            {/* South Crosswalk */}
            {[240, 260, 280, 300, 320, 340, 360, 380].map((x) => (
              <line key={`cw-s-${x}`} x1={x} y1="333" x2={x} y2="343" stroke="var(--road-line-white)" strokeWidth="6" opacity="0.8" />
            ))}
            {/* North Crosswalk */}
            {[240, 260, 280, 300, 320, 340, 360, 380].map((x) => (
              <line key={`cw-n-${x}`} x1={x} y1="157" x2={x} y2="167" stroke="var(--road-line-white)" strokeWidth="6" opacity="0.8" />
            ))}
            {/* East Crosswalk */}
            {[180, 200, 220, 240, 260, 280, 300, 320].map((y) => (
              <line key={`cw-e-${y}`} x1="393" y1={y} x2="403" y2={y} stroke="var(--road-line-white)" strokeWidth="6" opacity="0.8" />
            ))}

            {/* Street Name Labels */}
            <text x="310" y="30" fill="var(--text-tertiary)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle" letterSpacing="2">
              4TH AVENUE (NORTHBOUND)
            </text>
            <text x="560" y="235" fill="var(--text-tertiary)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle" letterSpacing="2">
              MARKET STREET (WESTBOUND)
            </text>
          </g>
        )}

        {/* ===============================================================
            SCENARIO 2: TWO LANE CROSSWALK (PEDESTRIAN)
            =============================================================== */}
        {data.roadType === 'two_lane_crosswalk' && (
          <g id="road-crosswalk">
            {/* Sidewalks */}
            <rect x="0" y="30" width={width} height="50" fill="var(--road-curb)" opacity="0.4" />
            <rect x="0" y="340" width={width} height="50" fill="var(--road-curb)" opacity="0.4" />

            {/* Roadway */}
            <rect x="0" y="80" width={width} height="260" fill="var(--road-asphalt)" />

            {/* Curbs */}
            <line x1="0" y1="80" x2={width} y2="80" stroke="var(--road-curb)" strokeWidth="3" />
            <line x1="0" y1="340" x2={width} y2="340" stroke="var(--road-curb)" strokeWidth="3" />

            {/* Yellow Center Double Lines */}
            <line x1="0" y1="208" x2={width} y2="208" stroke="var(--road-line-yellow)" strokeWidth="2" strokeDasharray="14 10" />
            <line x1="0" y1="212" x2={width} y2="212" stroke="var(--road-line-yellow)" strokeWidth="2" strokeDasharray="14 10" />

            {/* Marked Mid-Block Zebra Crossing */}
            {[90, 115, 140, 165, 190, 215, 240, 265, 290, 315].map((y) => (
              <line key={`cw-ped-${y}`} x1="270" y1={y} x2="310" y2={y} stroke="var(--road-line-white)" strokeWidth="12" />
            ))}

            {/* Overhead Pedestrian Beacons */}
            <circle cx="290" cy="72" r="5" fill="#f59e0b" className="animate-pulse" />
            <circle cx="290" cy="348" r="5" fill="#f59e0b" className="animate-pulse" />

            <text x="290" y="60" fill="#f59e0b" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="bold">
              PEDESTRIAN BEACON
            </text>

            <text x="500" y="145" fill="var(--text-tertiary)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">
              WESTBOUND LANE (35 KM/H)
            </text>
            <text x="500" y="280" fill="var(--text-tertiary)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">
              EASTBOUND LANE
            </text>
          </g>
        )}

        {/* ===============================================================
            SCENARIO 3: HIGHWAY / CURVED BARRIER
            =============================================================== */}
        {data.roadType === 'highway_curve' && (
          <g id="road-highway">
            <path
              d="M 0 100 Q 300 280 640 280 L 640 460 Q 300 460 0 280 Z"
              fill="var(--road-asphalt)"
            />
            {/* Guardrail Ribbon */}
            <path
              d="M 0 95 Q 300 275 640 275"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="6"
              strokeDasharray="8 3"
            />
            {/* Centerline */}
            <path
              d="M 0 190 Q 300 370 640 370"
              fill="none"
              stroke="var(--road-line-yellow)"
              strokeWidth="3"
              strokeDasharray="12 8"
            />
            <text x="450" y="250" fill="#94a3b8" fontSize="10" fontFamily="var(--font-mono)">
              W-BEAM GUARDRAIL BARRIER
            </text>
          </g>
        )}

        {/* ===============================================================
            TRAJECTORY VECTORS & SIGHT LINES
            =============================================================== */}
        {showVectors && (
          <g id="trajectories" opacity="0.85">
            {data.actors.map((actor) => {
              const markerName =
                actor.type === 'pedestrian'
                  ? 'url(#arrow-magenta)'
                  : actor.id.includes('b') || actor.id.includes('v2')
                  ? 'url(#arrow-amber)'
                  : 'url(#arrow-teal)';

              return (
                <g key={`traj-${actor.id}`}>
                  <path
                    d={`M ${actor.startPos.x} ${actor.startPos.y} L ${actor.preImpactPos.x} ${actor.preImpactPos.y} L ${actor.impactPos.x} ${actor.impactPos.y} L ${actor.finalRestPos.x} ${actor.finalRestPos.y}`}
                    fill="none"
                    stroke={actor.color}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    markerEnd={markerName}
                  />
                  {/* Waypoint dots */}
                  <circle cx={actor.startPos.x} cy={actor.startPos.y} r="3" fill={actor.color} opacity="0.6" />
                  <circle cx={actor.preImpactPos.x} cy={actor.preImpactPos.y} r="3" fill={actor.color} opacity="0.6" />
                  <circle cx={actor.finalRestPos.x} cy={actor.finalRestPos.y} r="3" fill={actor.color} />
                </g>
              );
            })}
          </g>
        )}

        {/* ===============================================================
            DEBRIS FIELD & EVIDENCE SCATTER
            =============================================================== */}
        {showDebris && (
          <g id="debris-field" opacity="0.75">
            {/* Impact radius ring */}
            <circle
              cx={data.impactPoint.x}
              cy={data.impactPoint.y}
              r="34"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              className="animate-pulse"
            />
            {/* Scattered debris dots */}
            <circle cx={data.impactPoint.x + 12} cy={data.impactPoint.y - 14} r="2" fill="#cbd5e1" />
            <circle cx={data.impactPoint.x - 18} cy={data.impactPoint.y + 10} r="1.5" fill="#f59e0b" />
            <circle cx={data.impactPoint.x + 22} cy={data.impactPoint.y + 8} r="2.5" fill="#5FA6A0" />
            <circle cx={data.impactPoint.x - 8} cy={data.impactPoint.y - 20} r="1.5" fill="#ef4444" />
            <circle cx={data.impactPoint.x + 18} cy={data.impactPoint.y - 6} r="1" fill="#e2e8f0" />
          </g>
        )}

        {/* ===============================================================
            POSSIBLE IMPACT POINT BURST
            =============================================================== */}
        <g id="impact-point">
          {currentStep >= 2 && (
            <circle
              cx={data.impactPoint.x}
              cy={data.impactPoint.y}
              r="40"
              fill="url(#impact-glow)"
            />
          )}

          <circle
            cx={data.impactPoint.x}
            cy={data.impactPoint.y}
            r="6"
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth="2"
          />

          <g transform={`translate(${data.impactPoint.x}, ${data.impactPoint.y - 16})`}>
            <rect x="-60" y="-18" width="120" height="18" rx="3" fill="#090d16" opacity="0.85" />
            <text x="0" y="-5" fill="#ef4444" fontSize="9" fontFamily="var(--font-mono)" fontWeight="bold" textAnchor="middle">
              {currentStep === 2 ? 'IMPACT POINT (T-0.0s)' : 'POSSIBLE IMPACT'}
            </text>
          </g>
        </g>

        {/* ===============================================================
            DYNAMIC ACTORS (VEHICLES & PEDESTRIANS)
            =============================================================== */}
        {data.actors.map((actor) => {
          const pos = getActorPosition(actor);

          if (actor.type === 'pedestrian') {
            return (
              <g
                key={actor.id}
                transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.angle})`}
                style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                {/* Pedestrian indicator */}
                <circle cx="0" cy="0" r="8" fill={actor.color} stroke="#ffffff" strokeWidth="2" />
                <line x1="0" y1="0" x2="0" y2="-14" stroke="#ffffff" strokeWidth="2" markerEnd="url(#arrow-magenta)" />
                <text
                  x="14"
                  y="4"
                  fill="#ffffff"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fontWeight="bold"
                  transform={`rotate(${-pos.angle})`}
                >
                  {actor.label}
                </text>
              </g>
            );
          }

          if (actor.type === 'object') {
            return (
              <g
                key={actor.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <rect x="-20" y="-8" width="40" height="16" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
                <text x="0" y="24" fill="#94a3b8" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
                  {actor.label}
                </text>
              </g>
            );
          }

          // Default: Vehicle Top-Down Representation (approx 44px x 24px)
          return (
            <g
              key={actor.id}
              transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.angle})`}
              style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Vehicle Body Shadow */}
              <rect x="-14" y="-24" width="28" height="48" rx="6" fill="#000000" opacity="0.4" transform="translate(2, 3)" />

              {/* Vehicle Body */}
              <rect
                x="-13"
                y="-23"
                width="26"
                height="46"
                rx="6"
                fill={actor.color}
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* Front Windshield */}
              <rect x="-10" y="-12" width="20" height="8" rx="2" fill="#0f172a" opacity="0.8" />
              {/* Rear Window */}
              <rect x="-9" y="10" width="18" height="6" rx="2" fill="#0f172a" opacity="0.8" />
              {/* Side Windows */}
              <rect x="-11" y="-3" width="3" height="12" rx="1" fill="#0f172a" opacity="0.6" />
              <rect x="8" y="-3" width="3" height="12" rx="1" fill="#0f172a" opacity="0.6" />

              {/* Headlights */}
              <rect x="-11" y="-23" width="5" height="3" rx="1" fill="#fef08a" />
              <rect x="6" y="-23" width="5" height="3" rx="1" fill="#fef08a" />

              {/* Direction Pointer */}
              <line x1="0" y1="-8" x2="0" y2="-28" stroke="#ffffff" strokeWidth="2" />
              <polygon points="-3,-26 0,-32 3,-26" fill="#ffffff" />

              {/* Actor Label Chip (Counter-rotated for horizontal readability) */}
              <g transform={`rotate(${-pos.angle}) translate(0, 36)`}>
                <rect x="-45" y="-10" width="90" height="18" rx="3" fill="#090d16" opacity="0.9" stroke="var(--border-subtle)" />
                <text x="0" y="3" fill="#ffffff" fontSize="9" fontFamily="var(--font-mono)" fontWeight="600" textAnchor="middle">
                  {actor.label}
                </text>
              </g>
            </g>
          );
        })}

        {/* ===============================================================
            FORENSIC OVERLAYS: COMPASS ROSE & SCALE BAR
            =============================================================== */}
        {/* Compass Rose (Top Right) */}
        <g transform="translate(600, 45)">
          <circle cx="0" cy="0" r="16" fill="var(--bg-surface)" stroke="var(--border-medium)" strokeWidth="1" />
          <polygon points="0,-12 4,0 -4,0" fill="#ef4444" />
          <polygon points="0,12 4,0 -4,0" fill="var(--text-tertiary)" />
          <text x="0" y="-14" fill="var(--text-primary)" fontSize="8" fontFamily="var(--font-mono)" fontWeight="bold" textAnchor="middle">
            N
          </text>
        </g>

        {/* Forensic Scale Bar (Bottom Left) */}
        <g transform="translate(25, 475)">
          <line x1="0" y1="0" x2="60" y2="0" stroke="var(--text-tertiary)" strokeWidth="2" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--text-tertiary)" strokeWidth="2" />
          <line x1="60" y1="-4" x2="60" y2="4" stroke="var(--text-tertiary)" strokeWidth="2" />
          <text x="30" y="-6" fill="var(--text-tertiary)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle">
            10 METERS (APPROX)
          </text>
        </g>
      </svg>

      {/* Floating Status Badge on Canvas */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xs)',
          padding: '0.35rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.72rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)'
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
        <span>EVIDENCE RECONSTRUCTION V2.4</span>
      </div>
    </div>
  );
};
