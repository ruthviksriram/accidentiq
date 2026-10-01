import React from 'react';
import { EventSequenceStep } from '../../types';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { Clock } from 'lucide-react';

interface TimelineProps {
  steps: EventSequenceStep[];
}

export const Timeline: React.FC<TimelineProps> = ({ steps }) => {
  return (
    <div style={{ position: 'relative', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Vertical Connecting Line */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          bottom: '12px',
          left: '11px',
          width: '2px',
          backgroundColor: 'var(--border-medium)',
          zIndex: 1
        }}
      />

      {steps.map((step) => {
        return (
          <div
            key={step.stepNumber}
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}
          >
            {/* Step Number Dot */}
            <div
              style={{
                position: 'absolute',
                left: '-1.5rem',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface)',
                border: '2px solid var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--accent-text)',
                boxShadow: '0 0 0 3px var(--bg-canvas)'
              }}
            >
              {String(step.stepNumber).padStart(2, '0')}
            </div>

            {/* Step Content Card */}
            <div
              className="card card-elevated"
              style={{
                flex: 1,
                padding: '1.1rem 1.25rem',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {step.title}
                  </h4>
                  {step.timeReference && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.72rem',
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      <Clock size={11} /> {step.timeReference}
                    </span>
                  )}
                </div>

                <EvidenceBadge type={step.classification} size="sm" />
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {step.description}
              </p>

              {step.evidenceRefIds && step.evidenceRefIds.length > 0 && (
                <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    Evidence references:
                  </span>
                  {step.evidenceRefIds.map((refId) => (
                    <span
                      key={refId}
                      className="mono"
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-canvas-subtle)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--accent-text)'
                      }}
                    >
                      #{refId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
