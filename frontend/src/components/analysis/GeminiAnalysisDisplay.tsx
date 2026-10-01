import React, { useMemo } from 'react';
import {
  ShieldAlert,
  Eye,
  MessageSquare,
  Clock,
  AlertTriangle,
  HelpCircle,
  Car,
  User,
  Bike,
  Shield,
  Layers,
  Sparkles,
  Info,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  GeminiAnalysisOutput,
  GeminiParticipant,
  GeminiVisibleDamage,
  GeminiSceneObservation,
  GeminiParticipantAction,
  GeminiSceneReconstruction
} from '../../types';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { SceneVisual2DDiagram } from './SceneVisual2DDiagram';

interface GeminiAnalysisDisplayProps {
  analysis: GeminiAnalysisOutput;
}

export const GeminiAnalysisDisplay: React.FC<GeminiAnalysisDisplayProps> = ({ analysis }) => {
  // 1. Normalize participants
  const participants = useMemo<GeminiParticipant[]>(() => {
    if (analysis.participants && Array.isArray(analysis.participants) && analysis.participants.length > 0) {
      return analysis.participants;
    }
    // Fallback: derive from reconstruction elements
    if (analysis.possible_scene_reconstruction?.elements && analysis.possible_scene_reconstruction.elements.length > 0) {
      return analysis.possible_scene_reconstruction.elements.map((el, idx) => ({
        id: `p-${idx + 1}`,
        label: el.label,
        type: el.label.toLowerCase().includes('pedestrian') ? 'pedestrian' : 'vehicle',
        evidence: `Observed at: ${el.position}`,
        damage: el.description
      }));
    }
    return [];
  }, [analysis.participants, analysis.possible_scene_reconstruction]);

  // 2. Normalize visible damage
  const visibleDamage = useMemo<GeminiVisibleDamage[]>(() => {
    if (analysis.visible_damage && Array.isArray(analysis.visible_damage) && analysis.visible_damage.length > 0) {
      return analysis.visible_damage;
    }
    // Fallback: extract from observed_evidence
    if (analysis.observed_evidence && Array.isArray(analysis.observed_evidence)) {
      const damageMatches = analysis.observed_evidence.filter((ev) =>
        /damage|crush|deformation|impact|broken|shattered|dented/i.test(ev.text)
      );
      if (damageMatches.length > 0) {
        return damageMatches.map((ev, idx) => ({
          participantLabel: participants[idx]?.label || `Participant ${idx + 1}`,
          component: 'Observed Impact Contact Zone',
          severity: 'Moderate' as const,
          description: ev.text
        }));
      }
    }
    return [];
  }, [analysis.visible_damage, analysis.observed_evidence, participants]);

  // 3. Normalize scene observations
  const sceneObservations = useMemo<GeminiSceneObservation[]>(() => {
    if (analysis.scene_observations && Array.isArray(analysis.scene_observations) && analysis.scene_observations.length > 0) {
      return analysis.scene_observations;
    }
    const combined: GeminiSceneObservation[] = [];
    if (analysis.observed_evidence && Array.isArray(analysis.observed_evidence)) {
      analysis.observed_evidence.forEach((ev) => {
        combined.push({
          observation: ev.text,
          classification: 'OBSERVED'
        });
      });
    }
    if (analysis.reported_information && Array.isArray(analysis.reported_information)) {
      analysis.reported_information.forEach((rep) => {
        combined.push({
          observation: rep,
          classification: 'REPORTED'
        });
      });
    }
    return combined;
  }, [analysis.scene_observations, analysis.observed_evidence, analysis.reported_information]);

  // 4. Normalize sequence of events
  const sequenceOfEvents = useMemo<string[]>(() => {
    if (analysis.possible_sequence_of_events && Array.isArray(analysis.possible_sequence_of_events)) {
      return analysis.possible_sequence_of_events;
    }
    return [];
  }, [analysis.possible_sequence_of_events]);

  // 5. Normalize participant actions & contributing factors
  const participantActions = useMemo<GeminiParticipantAction[]>(() => {
    if (analysis.participant_actions && Array.isArray(analysis.participant_actions) && analysis.participant_actions.length > 0) {
      return analysis.participant_actions;
    }
    // Fallback: build from contributing factors
    if (analysis.possible_contributing_factors && Array.isArray(analysis.possible_contributing_factors) && analysis.possible_contributing_factors.length > 0) {
      return [
        {
          participantLabel: participants[0]?.label || 'Involved Traffic Units',
          action: 'Transiting incident roadway sector',
          possibleContributingFactors: analysis.possible_contributing_factors,
          classification: 'INFERRED'
        }
      ];
    }
    return [];
  }, [analysis.participant_actions, analysis.possible_contributing_factors, participants]);

  // 6. Compute 4-card evidence classification counts
  const evidenceClassification = useMemo(() => {
    const obsCount = sceneObservations.filter((s) => s.classification === 'OBSERVED').length +
      (analysis.observed_evidence?.length || 0) +
      visibleDamage.length;

    const repCount = sceneObservations.filter((s) => s.classification === 'REPORTED').length +
      (analysis.reported_information?.length || 0);

    const infCount = sequenceOfEvents.length +
      participantActions.filter((a) => a.classification === 'INFERRED').length +
      (analysis.possible_contributing_factors?.length || 0);

    const unkCount = analysis.evidence_limitations?.length || 0;

    return {
      observed: Math.max(obsCount, 1),
      reported: Math.max(repCount, 1),
      inferred: Math.max(infCount, 1),
      unknown: unkCount
    };
  }, [analysis, visibleDamage, sceneObservations, sequenceOfEvents, participantActions]);

  // 7. Reconstruction
  const reconstruction = useMemo<GeminiSceneReconstruction>(() => {
    const raw = analysis.possible_scene_reconstruction;
    if (!raw) {
      return {
        available: false,
        description: 'Insufficient photographic evidence to determine physical scene reconstruction.',
        elements: [],
        limitations: 'Evidence-based visualization — not a definitive forensic or legal reconstruction. Photographic evidence was insufficient to establish spatial coordinates or scene layout.'
      };
    }

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

  const getParticipantIcon = (type?: string, label?: string) => {
    const t = (type || label || '').toLowerCase();
    if (t.includes('pedestrian') || t.includes('walker') || t.includes('person')) return User;
    if (t.includes('bike') || t.includes('bicycle') || t.includes('cyclist')) return Bike;
    return Car;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* Top Evidentiary Safety & Classification Notice */}
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
          AI-assisted forensic analysis. Output is structured under formal police evidentiary standards (Observed, Reported, Inferred, Unknown) and does not make definitive legal fault or liability findings.
        </div>
      </div>

      {/* AI Evidence Summary Overview */}
      {analysis.summary && (
        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Investigation Overview Summary
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>
            {analysis.summary}
          </p>
        </div>
      )}

      {/* ==============================================================
          1. PARTICIPANTS INVOLVED
          ============================================================== */}
      <section
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              01 / INVESTIGATION UNITS
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              1. Participants Involved ({participants.length})
            </h3>
          </div>
          <EvidenceBadge type="OBSERVED" size="sm" />
        </div>

        {participants.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {participants.map((p, idx) => {
              const Icon = getParticipantIcon(p.type, p.label);
              return (
                <div
                  key={idx}
                  style={{
                    padding: '1rem 1.15rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-canvas-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--accent-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-text)'
                        }}
                      >
                        <Icon size={14} />
                      </div>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {p.label}
                      </span>
                    </div>
                    {p.type && (
                      <span
                        className="mono"
                        style={{
                          fontSize: '0.66rem',
                          padding: '0.12rem 0.4rem',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-tertiary)',
                          textTransform: 'uppercase'
                        }}
                      >
                        {p.type}
                      </span>
                    )}
                  </div>

                  {p.evidence && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Available Evidence: </strong>
                      {p.evidence}
                    </div>
                  )}

                  {p.damage && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--tag-observed-text)', paddingTop: '0.45rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <strong>Visible Damage Summary: </strong>
                      {p.damage}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
            No information available from the supplied evidence.
          </div>
        )}
      </section>

      {/* ==============================================================
          2. VISIBLE DAMAGE
          ============================================================== */}
      <section
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              02 / PHYSICAL IMPACT OBSERVATIONS
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              2. Visible Damage ({visibleDamage.length} Items)
            </h3>
          </div>
          <EvidenceBadge type="OBSERVED" size="sm" />
        </div>

        {visibleDamage.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {visibleDamage.map((dmg, idx) => {
              const sev = dmg.severity || 'Moderate';
              const sevColor =
                sev === 'Severe'
                  ? 'var(--danger-text)'
                  : sev === 'Moderate'
                  ? '#f59e0b'
                  : 'var(--accent-text)';

              const sevBg =
                sev === 'Severe'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : sev === 'Moderate'
                  ? 'rgba(245, 158, 11, 0.1)'
                  : 'var(--accent-surface)';

              return (
                <div
                  key={idx}
                  style={{
                    padding: '0.95rem 1.1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-canvas-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-text)', textTransform: 'uppercase' }}>
                      {dmg.participantLabel}
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '0.12rem 0.45rem',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: sevBg,
                        color: sevColor,
                        border: `1px solid ${sevColor}44`,
                        textTransform: 'uppercase'
                      }}
                    >
                      {sev} Impact
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {dmg.component}
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {dmg.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
            No information available from the supplied evidence.
          </div>
        )}
      </section>

      {/* ==============================================================
          3. SCENE OBSERVATIONS
          ============================================================== */}
      <section
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              03 / ROADWAY ARTIFACTS & PARTICULARS
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              3. Scene Observations ({sceneObservations.length} Items)
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <EvidenceBadge type="OBSERVED" size="sm" />
            <EvidenceBadge type="REPORTED" size="sm" />
          </div>
        </div>

        {sceneObservations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {sceneObservations.map((so, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  padding: '0.75rem 0.95rem',
                  backgroundColor: 'var(--bg-canvas-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: so.classification === 'OBSERVED' ? 'var(--tag-observed-text)' : 'var(--tag-reported-text)',
                      marginTop: '7px',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {so.observation}
                  </span>
                </div>
                <EvidenceBadge type={so.classification} size="sm" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
            No information available from the supplied evidence.
          </div>
        )}
      </section>

      {/* ==============================================================
          4. POSSIBLE SEQUENCE OF EVENTS
          ============================================================== */}
      <section
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              04 / CHRONOLOGICAL RECONSTRUCTION
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              4. Possible Sequence of Events ({sequenceOfEvents.length} Steps)
            </h3>
          </div>
          <EvidenceBadge type="INFERRED" size="sm" />
        </div>

        {sequenceOfEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {sequenceOfEvents.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '0.85rem 1rem',
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
                    padding: '0.12rem 0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    flexShrink: 0
                  }}
                >
                  Step {idx + 1}
                </span>
                <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
            No information available from the supplied evidence.
          </div>
        )}
      </section>

      {/* ==============================================================
          5. PARTICIPANT ACTIONS & POSSIBLE CONTRIBUTING FACTORS
          ============================================================== */}
      <section
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              05 / ACTIONS & CONTRIBUTING FACTORS
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              5. Participant Actions & Possible Contributing Factors
            </h3>
          </div>
          <EvidenceBadge type="INFERRED" size="sm" />
        </div>

        {participantActions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {participantActions.map((act, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-canvas-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Car size={15} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {act.participantLabel}
                    </span>
                  </div>
                  <EvidenceBadge type={act.classification || 'INFERRED'} size="sm" />
                </div>

                <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: '0.72rem', display: 'block', marginBottom: '0.2rem' }}>
                    Identified Movement / Action:
                  </strong>
                  {act.action}
                </div>

                {act.possibleContributingFactors && act.possibleContributingFactors.length > 0 && (
                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--tag-inferred-text)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
                      Possible Contributing Factors (Inferred):
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {act.possibleContributingFactors.map((f, fIdx) => (
                        <span
                          key={fIdx}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.55rem',
                            backgroundColor: 'var(--tag-inferred-bg)',
                            color: 'var(--tag-inferred-text)',
                            border: '1px solid var(--tag-inferred-border)',
                            borderRadius: 'var(--radius-xs)'
                          }}
                        >
                          • {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
            No information available from the supplied evidence.
          </div>
        )}
      </section>

      {/* ==============================================================
          6. EVIDENCE CLASSIFICATION (4-CARD GRID)
          ============================================================== */}
      <section
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
            06 / POLICE EVIDENCE RIGOR
          </span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
            6. Evidence Classification
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0 0' }}>
            The 4-tier evidentiary division separating directly visible physical proof from reported testimony, inferences, and unknown parameters.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {/* OBSERVED */}
          <div style={{ padding: '0.95rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-observed-bg)', border: '1px solid var(--tag-observed-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="badge badge-observed" style={{ fontSize: '0.68rem' }}>OBSERVED</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--tag-observed-text)' }}>
                {evidenceClassification.observed} items
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Damage contact zones, paint transference, tire scrub patterns, and debris fields documented in supplied photographs.
            </p>
          </div>

          {/* REPORTED */}
          <div style={{ padding: '0.95rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-reported-bg)', border: '1px solid var(--tag-reported-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="badge badge-reported" style={{ fontSize: '0.68rem' }}>REPORTED</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--tag-reported-text)' }}>
                {evidenceClassification.reported} items
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Driver intentions, perceived signal phases, travel speeds, and witness testimonies documented in case narrative.
            </p>
          </div>

          {/* INFERRED */}
          <div style={{ padding: '0.95rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-inferred-bg)', border: '1px solid var(--tag-inferred-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="badge badge-inferred" style={{ fontSize: '0.68rem' }}>INFERRED</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--tag-inferred-text)' }}>
                {evidenceClassification.inferred} items
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Kinematic trajectory vectors, relative contact angles, and chronological sequence of events modeled by AI.
            </p>
          </div>

          {/* UNKNOWN */}
          <div style={{ padding: '0.95rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-unknown-bg)', border: '1px solid var(--tag-unknown-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="badge badge-unknown" style={{ fontSize: '0.68rem' }}>UNKNOWN</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--tag-unknown-text)' }}>
                {evidenceClassification.unknown} items
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Exact millisecond-level traffic light states, EDR vehicle black box telemetry, and post-impact pedestrian eye-line.
            </p>
          </div>
        </div>
      </section>

      {/* ==============================================================
          7. POSSIBLE SCENE RECONSTRUCTION (2D Visual Scene Diagram)
          ============================================================== */}
      <section
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
        {/* Section Header: Requirements 7 & 8 */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
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
              2D Scene Diagram Unavailable — Insufficient Evidence
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
      </section>
    </div>
  );
};
