import React from 'react';
import {
  ShieldAlert,
  Eye,
  MessageSquare,
  Clock,
  AlertTriangle,
  HelpCircle,
  Car,
  Shield,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { GeminiAnalysisOutput } from '../../types';
import { EvidenceBadge } from '../common/EvidenceBadge';

interface GeminiAnalysisDisplayProps {
  analysis: GeminiAnalysisOutput;
}

export const GeminiAnalysisDisplay: React.FC<GeminiAnalysisDisplayProps> = ({ analysis }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Mandatory Disclaimer Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.9rem 1.15rem',
          backgroundColor: 'rgba(234, 179, 8, 0.08)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)'
        }}
      >
        <ShieldAlert size={18} style={{ color: '#eab308', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
          <strong>Evidentiary Classification & Safety Notice: </strong>
          AI-assisted analysis. This output is for investigative support only and does not determine legal fault.
          All conclusions are strictly classified under police investigative standards.
        </div>
      </div>

      {/* 1. AI Evidence Summary */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1. AI Evidence Summary
          </h3>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>
          {analysis.summary}
        </p>
      </div>

      {/* 2. Observed Evidence */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={16} style={{ color: 'var(--tag-observed-text)' }} />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              2. Observed Evidence
            </h3>
          </div>
          <EvidenceBadge type="OBSERVED" size="sm" />
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
          Direct physical indicators visibly captured in the submitted accident photographs:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {analysis.observed_evidence.map((item, idx) => {
            const conf = item.confidence || 'medium';
            const confColor =
              conf === 'high'
                ? 'var(--tag-observed-text)'
                : conf === 'medium'
                ? 'var(--accent-text)'
                : 'var(--tag-unknown-text)';

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  backgroundColor: 'var(--bg-canvas-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--tag-observed-text)',
                      marginTop: '7px',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {item.text}
                  </span>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: confColor,
                    backgroundColor: 'var(--bg-surface)',
                    padding: '0.15rem 0.4rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {conf} confidence
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Reported Information */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={16} style={{ color: 'var(--tag-reported-text)' }} />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              3. Reported Information
            </h3>
          </div>
          <EvidenceBadge type="REPORTED" size="sm" />
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
          Statements, particulars, and conditions provided in the initial officer case documentation:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {analysis.reported_information.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-canvas-subtle)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--tag-reported-text)',
                  marginTop: '7px',
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Possible Sequence of Events */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} style={{ color: 'var(--tag-inferred-text)' }} />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              4. Possible Sequence of Events
            </h3>
          </div>
          <EvidenceBadge type="INFERRED" size="sm" />
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
          Inferred chronology derived from photographic deformation patterns and reported vectors:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {analysis.possible_sequence_of_events.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem 0.85rem',
                backgroundColor: 'var(--bg-canvas-subtle)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--tag-inferred-text)',
                  backgroundColor: 'var(--tag-inferred-bg)',
                  border: '1px solid var(--tag-inferred-border)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-xs)',
                  flexShrink: 0
                }}
              >
                Step {idx + 1}
              </span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Possible Contributing Factors */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} style={{ color: 'var(--tag-inferred-text)' }} />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              5. Possible Contributing Factors
            </h3>
          </div>
          <EvidenceBadge type="INFERRED" size="sm" />
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
          Potential physical, geometric, or environmental factors consistent with evidence:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {analysis.possible_contributing_factors.map((factor, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-canvas-subtle)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--tag-inferred-text)',
                  marginTop: '7px',
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {factor}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Evidence Limitations */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={16} style={{ color: 'var(--tag-unknown-text)' }} />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              6. Evidence Limitations
            </h3>
          </div>
          <EvidenceBadge type="UNKNOWN" size="sm" />
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
          Parameters that cannot be definitively established from the provided visual record:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {analysis.evidence_limitations.map((lim, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-canvas-subtle)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--tag-unknown-text)',
                  marginTop: '7px',
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {lim}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Possible Scene Reconstruction */}
      <div
        className="card"
        style={{
          padding: '1.35rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Layers size={17} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              7. Possible Scene Reconstruction
            </h3>
          </div>
          <p
            className="mono"
            style={{
              fontSize: '0.72rem',
              color: 'var(--accent-text)',
              margin: 0,
              fontWeight: 600
            }}
          >
            Evidence-based visualization — not a definitive forensic or legal reconstruction.
          </p>
        </div>

        {/* Narrative Description */}
        <div>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Reconstruction Overview
          </h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
            {analysis.possible_scene_reconstruction?.description}
          </p>
        </div>

        {/* Structured Participants Grid */}
        {analysis.possible_scene_reconstruction?.participants &&
          analysis.possible_scene_reconstruction.participants.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Reconstructed Actor Layout
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '0.75rem'
                }}
              >
                {analysis.possible_scene_reconstruction.participants.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem',
                      backgroundColor: 'var(--bg-canvas-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Car size={15} style={{ color: 'var(--accent-primary)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {p.label}
                        </span>
                      </div>
                      <span
                        className="mono"
                        style={{
                          fontSize: '0.66rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-tertiary)',
                          textTransform: 'uppercase'
                        }}
                      >
                        {p.type}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Position: </strong>
                        {p.position}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Movement: </strong>
                        {p.movement}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
