import React, { useMemo } from 'react';
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
import { GeminiAnalysisOutput, GeminiSceneReconstruction } from '../../types';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { SceneVisual2DDiagram } from './SceneVisual2DDiagram';

interface GeminiAnalysisDisplayProps {
  analysis: GeminiAnalysisOutput;
}

export const GeminiAnalysisDisplay: React.FC<GeminiAnalysisDisplayProps> = ({ analysis }) => {
  const reconstruction = useMemo<GeminiSceneReconstruction>(() => {
    const raw = analysis.possible_scene_reconstruction;
    if (!raw) {
      return {
        available: false,
        description: 'No physical reconstruction could be generated from the available photographic record.',
        elements: [],
        limitations: 'Evidence-based visualization — not a definitive forensic or legal reconstruction. Photographic evidence was insufficient to establish spatial coordinates or scene layout.'
      };
    }

    // Convert legacy participants if elements not present
    let elements = raw.elements || [];
    if (!elements.length && raw.participants && raw.participants.length > 0) {
      elements = raw.participants.map((p) => ({
        label: p.label,
        description: p.type || p.movement || 'Participant in collision',
        position: p.position || 'Position not established'
      }));
    }

    const available = typeof raw.available === 'boolean'
      ? raw.available
      : elements.length > 0;

    return {
      available,
      description: raw.description || (available ? 'Evidence-based reconstruction generated from photographic findings.' : 'Photographic evidence is insufficient to model physical scene arrangement.'),
      elements,
      limitations: raw.limitations || 'Evidence-based visualization — not a definitive forensic or legal reconstruction. Exact vehicle trajectories, speeds, and positions cannot be definitively established from the supplied photographic evidence.'
    };
  }, [analysis.possible_scene_reconstruction]);

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

      {/* Possible Scene Reconstruction */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {/* Section Header */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Possible Scene Reconstruction
              </h3>
            </div>
            {reconstruction.available ? (
              <span
                className="mono"
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-xs)',
                  textTransform: 'uppercase'
                }}
              >
                2D Visual Reconstruction Active
              </span>
            ) : (
              <span
                className="mono"
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--tag-unknown-text)',
                  backgroundColor: 'var(--tag-unknown-bg)',
                  border: '1px solid var(--tag-unknown-border)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-xs)',
                  textTransform: 'uppercase'
                }}
              >
                2D Diagram Unavailable
              </span>
            )}
          </div>
          <p
            className="mono"
            style={{
              fontSize: '0.76rem',
              color: 'var(--accent-text)',
              margin: 0,
              fontWeight: 600
            }}
          >
            Evidence-based visualization — not a definitive forensic or legal reconstruction.
          </p>
        </div>

        {/* Narrative Description */}
        <div
          style={{
            padding: '0.9rem 1.1rem',
            backgroundColor: 'var(--bg-canvas-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
            Reconstruction Findings & Kinematics
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
            {reconstruction.description}
          </p>
        </div>

        {/* 2D Visual Scene Diagram (when available) OR Insufficient Evidence Notice */}
        {reconstruction.available ? (
          <SceneVisual2DDiagram reconstruction={reconstruction} />
        ) : (
          <div
            style={{
              padding: '1.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.04)',
              border: '1px dashed rgba(239, 68, 68, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.75rem'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              2D Scene Diagram Unavailable
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '560px', lineHeight: 1.55, margin: 0 }}>
              The submitted photographic evidence does not provide sufficient spatial landmarks, wide roadway perspective, or geometric reference points to model an evidence-grounded 2D diagram without speculative extrapolation.
            </p>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
              Upload wide-angle scene photographs or roadway perspective shots to enable physical 2D diagramming.
            </div>
          </div>
        )}

        {/* Limitations Section */}
        {reconstruction.limitations && (
          <div
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--tag-unknown-bg)',
              border: '1px solid var(--tag-unknown-border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <HelpCircle size={16} style={{ color: 'var(--tag-unknown-text)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--tag-unknown-text)' }}>Evidentiary Limitations: </strong>
              {reconstruction.limitations}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
