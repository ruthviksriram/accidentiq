import React from 'react';
import { ReconstructionData } from '../../types';
import { Play, Pause, RotateCcw, AlertTriangle, Layers, Navigation } from 'lucide-react';

interface ReconstructionPanelProps {
  data: ReconstructionData;
  currentStep: number;
  onStepChange: (step: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  showVectors: boolean;
  onToggleVectors: () => void;
  showDebris: boolean;
  onToggleDebris: () => void;
}

export const ReconstructionPanel: React.FC<ReconstructionPanelProps> = ({
  data,
  currentStep,
  onStepChange,
  isPlaying,
  onTogglePlay,
  onReset,
  showVectors,
  onToggleVectors,
  showDebris,
  onToggleDebris
}) => {
  const stepLabels = [
    { index: 0, label: '01. Approach (T - 3.5s)' },
    { index: 1, label: '02. Pre-Impact Maneuver (T - 1.2s)' },
    { index: 2, label: '03. Possible Impact Area (T - 0.0s)' },
    { index: 3, label: '04. Final Rest Positions (T + 2.0s)' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        height: '100%'
      }}
    >
      {/* Playback Controls Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Reconstruction Timeline
          </span>
          <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--accent-text)', fontWeight: 600 }}>
            {stepLabels[currentStep].label}
          </span>
        </div>

        {/* Timeline Slider */}
        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={currentStep}
          onChange={(e) => onStepChange(parseInt(e.target.value))}
          style={{
            width: '100%',
            cursor: 'pointer',
            accentColor: 'var(--accent-primary)',
            marginBottom: '0.85rem'
          }}
        />

        {/* Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={onTogglePlay}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.4rem 0.85rem' }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause' : 'Play Sequence'}</span>
            </button>
            <button
              onClick={onReset}
              className="btn btn-secondary btn-sm"
              title="Reset Timeline to Start"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Quick step buttons */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[0, 1, 2, 3].map((step) => (
              <button
                key={step}
                onClick={() => onStepChange(step)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: currentStep === step ? 'var(--accent-primary)' : 'var(--bg-canvas-subtle)',
                  color: currentStep === step ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {step + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layer Visibility Toggles */}
      <div
        style={{
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-canvas-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}
      >
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Layers size={13} /> Visual Overlays
        </span>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showVectors}
              onChange={onToggleVectors}
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            Motion Vectors
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showDebris}
              onChange={onToggleDebris}
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            Debris / Evidence Radius
          </label>
        </div>
      </div>

      {/* Structured Reconstruction Data */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
          Reconstruction Data
        </div>

        {/* Actor A Movement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Navigation size={12} /> Participant A (Primary)
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {data.summaryData.vehicleAMovement}
          </p>
        </div>

        {/* Actor B Movement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Navigation size={12} /> Participant B (Secondary / Pedestrian)
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {data.summaryData.vehicleBMovement}
          </p>
        </div>

        {/* Impact Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444' }}>
            Possible Impact Area:
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {data.summaryData.possibleImpactArea}
          </p>
        </div>

        {/* Supporting Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Evidence Supporting Reconstruction:
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {data.summaryData.supportingEvidence}
          </p>
        </div>

        {/* Uncertainty Callout */}
        <div
          style={{
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-canvas-subtle)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '3px solid #f59e0b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.25rem' }}>
            <AlertTriangle size={13} />
            <span>Uncertainty & Forensic Limits</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {data.summaryData.uncertaintyAssessment}
          </p>
        </div>
      </div>
    </div>
  );
};
