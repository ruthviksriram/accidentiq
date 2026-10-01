import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  FileSpreadsheet,
  AlertTriangle,
  Car,
  User,
  Bike,
  HelpCircle,
  Calendar,
  MapPin,
  Shield,
  ChevronRight,
  Info,
  CheckCircle2,
  Maximize2,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { EvidenceBadge, ConfidenceBadge } from '../components/common/EvidenceBadge';
import { Timeline } from '../components/cases/Timeline';
import { SceneReconstructionView } from '../components/reconstruction/SceneReconstructionView';
import { Modal } from '../components/common/Modal';
import { EvidenceFile, GeminiAnalysisOutput } from '../types';
import { GeminiAnalysisDisplay } from '../components/analysis/GeminiAnalysisDisplay';
import { runGeminiAccidentAnalysis, fetchAnalysisResultForCase } from '../lib/geminiAnalysisService';

export const AnalysisResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCaseById, cases, refreshCases } = useCases();

  const caseData = getCaseById(id || 'ACC-2026-001') || cases[0];
  const [selectedEvidenceModal, setSelectedEvidenceModal] = useState<EvidenceFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisOutput | null>(
    caseData?.analysisResult || null
  );

  useEffect(() => {
    if (caseData?.analysisResult) {
      setAnalysisResult(caseData.analysisResult);
    } else if (caseData?.dbId || caseData?.id) {
      fetchAnalysisResultForCase(caseData.dbId || caseData.id).then((saved) => {
        if (saved) setAnalysisResult(saved);
      });
    }
  }, [caseData]);

  const handleAnalyze = async () => {
    if (isAnalyzing || !caseData) return;
    setAnalysisError(null);

    const hasPhoto = caseData.evidenceFiles && caseData.evidenceFiles.some((f) => f.evidenceType === 'photo');
    if (!hasPhoto) {
      setAnalysisError('Upload at least one accident photo before running AI analysis.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const targetId = caseData.dbId || caseData.id;
      const result = await runGeminiAccidentAnalysis(targetId);
      setAnalysisResult(result);
      await refreshCases();
    } catch (err: unknown) {
      console.error('AI Analysis failed:', err);
      if (err instanceof Error && err.message.includes('Upload at least one accident photo')) {
        setAnalysisError('Upload at least one accident photo before running AI analysis.');
      } else {
        setAnalysisError('Unable to analyze this evidence right now. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!caseData) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Investigation File Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          The requested police accident investigation dossier could not be located.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Return to Investigation Dashboard
        </Link>
      </div>
    );
  }

  const hasAnalysis = caseData.status === 'Analysis Complete' || caseData.status === 'Analyzed' || !!analysisResult;
  if (!hasAnalysis) {
    return (
      <div style={{ textAlign: 'center', padding: '3.5rem 2rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', maxWidth: '640px', margin: '3rem auto' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          No Analysis Yet
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Case #{caseData.id} ({caseData.title}) is currently filed as an active investigation. AI kinematic trajectory synthesis and evidentiary analysis have not been performed yet.
        </p>

        {analysisError && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.85rem 1.15rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#ef4444',
              fontSize: '0.84rem',
              marginBottom: '1.25rem',
              textAlign: 'left'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{analysisError}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn btn-primary"
            style={{ gap: '0.45rem' }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={15} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Analyzing accident evidence...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Analyze Evidence with AI</span>
              </>
            )}
          </button>
          <Link to={`/cases/${caseData.id}/report`} className="btn btn-secondary">
            View Case Report
          </Link>
          <Link to="/dashboard" className="btn btn-ghost">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getParticipantIcon = (type: string) => {
    switch (type) {
      case 'vehicle':
        return Car;
      case 'pedestrian':
        return User;
      case 'bicycle':
        return Bike;
      default:
        return HelpCircle;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header & Police Case Metadata Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
              <ArrowLeft size={15} /> Dashboard
            </Link>
            <span style={{ color: 'var(--border-strong)' }}>/</span>
            <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-text)' }}>
              {caseData.id}
            </span>
            <span className="badge badge-accent">
              {caseData.accidentType.replace(/_/g, ' ')}
            </span>
            <span className="badge badge-observed">
              {caseData.status}
            </span>
          </div>

          {/* Prompt specified title */}
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Accident Investigation Analysis
          </h1>

          {/* Assigned Officer & Case Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap', marginTop: '0.2rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-text)', fontWeight: 600 }}>
              <Shield size={13} /> Assigned: {caseData.assignedOfficer || 'Officer A. Sharma'} ({caseData.badgeNumber || 'CIU-4921'})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} /> {caseData.incidentDate} at {caseData.incidentTime}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={13} /> {caseData.location}
            </span>
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              • {caseData.evidenceFiles.length} Evidence files • {caseData.participants.length} Participants
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn btn-secondary btn-sm"
            style={{
              gap: '0.4rem',
              color: 'var(--accent-text)',
              borderColor: 'var(--accent-border)',
              backgroundColor: 'var(--accent-surface)'
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Analyzing accident evidence...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>{analysisResult ? 'Re-analyze with AI' : 'Analyze Evidence with AI'}</span>
              </>
            )}
          </button>

          <Link
            to={`/cases/${caseData.id}/reconstruction`}
            className="btn btn-primary"
            style={{ gap: '0.45rem' }}
          >
            <Activity size={16} />
            <span>Possible Scene Reconstruction</span>
          </Link>
          <Link
            to={`/cases/${caseData.id}/report`}
            className="btn btn-secondary"
            style={{ gap: '0.45rem' }}
          >
            <FileSpreadsheet size={16} />
            <span>Investigation Report</span>
          </Link>
        </div>
      </div>

      {analysisError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1.15rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#ef4444',
            fontSize: '0.84rem'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Mandatory Responsible AI & Police Investigation Notice */}
      <div className="ai-notice-banner">
        <AlertTriangle size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Police Investigation Support Principle: </strong>
          The system is an investigation support and evidence organization tool. It analyzes supplied evidence using objective probabilistic models. It does not replace on-scene police investigation, forensic examination, or judicial determination, and never declares legal fault.
        </div>
      </div>

      {isAnalyzing && (
        <div
          style={{
            padding: '2.5rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.85rem',
            textAlign: 'center'
          }}
        >
          <Loader2 size={28} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Analyzing accident evidence...
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
            Gemini multimodal vision model is examining photographic scene evidence and kinematics metadata.
          </div>
        </div>
      )}

      {analysisResult && (
        <GeminiAnalysisDisplay analysis={analysisResult} />
      )}

      {/* ==============================================================
          1. INVESTIGATION OVERVIEW
          ============================================================== */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              01 / OVERVIEW
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Investigation Overview
            </h2>
          </div>
          <EvidenceBadge type="INFERRED" size="sm" />
        </div>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>
          {caseData.overviewSummary}
        </p>

        {caseData.roadConditions && (
          <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-canvas-subtle)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Environmental Profile: </strong> {caseData.weatherConditions} • {caseData.roadConditions}
          </div>
        )}
      </section>

      {/* ==============================================================
          2. PARTICIPANTS
          ============================================================== */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
            02 / PARTICIPANTS
          </span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Participants Involved ({caseData.participants.length})
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {caseData.participants.map((p) => {
            const Icon = getParticipantIcon(p.type);
            return (
              <div
                key={p.id}
                style={{
                  padding: '1.1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-canvas-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
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
                    <div>
                      <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.label}
                      </h3>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                        Role: {p.role}
                      </span>
                    </div>
                  </div>

                  <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    #{p.id}
                  </span>
                </div>

                {/* Details Breakdown */}
                {p.type === 'vehicle' && p.vehicleDetails && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>Plate #</span>
                      <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.vehicleDetails.registrationNumber || 'Not filed'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>Model / Type</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {p.vehicleDetails.makeModel || p.vehicleDetails.vehicleType}
                      </span>
                    </div>
                    {p.vehicleDetails.driverName && (
                      <div>
                        <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>Driver</span>
                        <span style={{ color: 'var(--text-primary)' }}>{p.vehicleDetails.driverName}</span>
                      </div>
                    )}
                    {p.vehicleDetails.driverLicense && (
                      <div>
                        <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>License</span>
                        <span className="mono" style={{ color: 'var(--text-primary)' }}>{p.vehicleDetails.driverLicense}</span>
                      </div>
                    )}
                  </div>
                )}

                {p.type === 'pedestrian' && p.pedestrianDetails && (
                  <div style={{ fontSize: '0.78rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', display: 'block' }}>Reported Activity</span>
                      <span style={{ color: 'var(--text-primary)' }}>{p.pedestrianDetails.reportedActivity}</span>
                    </div>
                    {p.pedestrianDetails.clothingDescription && (
                      <div>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', display: 'block' }}>Attire Profile</span>
                        <span style={{ color: 'var(--text-primary)' }}>{p.pedestrianDetails.clothingDescription}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==============================================================
          3. VISIBLE DAMAGE
          ============================================================== */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              03 / DAMAGE OBSERVATIONS
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Visible Damage
            </h2>
          </div>
          <EvidenceBadge type="OBSERVED" size="sm" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {caseData.participants.map((p) => {
            const damageList = p.damageObservations || [];
            return (
              <div key={p.id}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-text)', marginBottom: '0.65rem' }}>
                  {p.label}
                </h3>

                {damageList.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    No direct structural intrusion cataloged in initial evidence.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                    {damageList.map((dmg, dIdx) => (
                      <div
                        key={dIdx}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-canvas-subtle)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            {dmg.component}
                          </span>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: dmg.severity === 'Severe' ? 'var(--danger-bg)' : 'var(--tag-reported-bg)',
                              color: dmg.severity === 'Severe' ? 'var(--danger-text)' : 'var(--tag-reported-text)',
                              borderColor: 'transparent',
                              fontSize: '0.68rem'
                            }}
                          >
                            {dmg.severity} Impact
                          </span>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {dmg.description}
                        </p>

                        {dmg.evidenceRefIds && dmg.evidenceRefIds.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Photo:</span>
                            {dmg.evidenceRefIds.map((refId) => (
                              <button
                                key={refId}
                                type="button"
                                onClick={() => {
                                  const ev = caseData.evidenceFiles.find((f) => f.id === refId);
                                  if (ev) setSelectedEvidenceModal(ev);
                                }}
                                className="mono"
                                style={{
                                  fontSize: '0.68rem',
                                  color: 'var(--accent-text)',
                                  textDecoration: 'underline',
                                  cursor: 'pointer'
                                }}
                              >
                                #{refId}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==============================================================
          4. SCENE OBSERVATIONS
          ============================================================== */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
            04 / SCENE OBSERVATIONS
          </span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Scene Observations
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
            Direct physical markers, roadway surface friction, debris cones, and signal states.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {caseData.sceneObservations.map((so) => (
            <div
              key={so.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.75rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-canvas-subtle)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <span style={{ color: 'var(--accent-text)', fontSize: '0.9rem', lineHeight: 1.4 }}>•</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {so.observation}
                </p>
              </div>

              <EvidenceBadge type={so.classification} size="sm" />
            </div>
          ))}
        </div>
      </section>

      {/* ==============================================================
          5. POSSIBLE SEQUENCE OF EVENTS
          ============================================================== */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
            05 / SEQUENCE OF EVENTS
          </span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Possible Sequence of Events
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
            Chronological timeline derived by cross-correlating reported testimony and physical damage artifacts.
          </p>
        </div>

        <Timeline steps={caseData.sequenceOfEvents} />
      </section>

      {/* ==============================================================
          6. PARTICIPANT ACTIONS & POSSIBLE CONTRIBUTING FACTORS
          ============================================================== */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
            06 / PARTICIPANT ACTIONS
          </span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Participant Actions & Possible Contributing Factors
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
            Objective evidentiary assessment of actions. Strictly avoids judicial fault attribution.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {caseData.participantActions.map((action) => (
            <div
              key={action.participantId}
              style={{
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-canvas-subtle)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {action.participantLabel}
                </h3>
                <ConfidenceBadge level={action.confidenceLevel} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                {/* Reported Action */}
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Reported Action
                    </span>
                    <EvidenceBadge type="REPORTED" size="sm" />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {action.reportedAction}
                  </p>
                </div>

                {/* Observed Action */}
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Observed Action
                    </span>
                    <EvidenceBadge type="OBSERVED" size="sm" />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {action.observedAction}
                  </p>
                </div>
              </div>

              {/* Possible Contributing Action */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--bg-surface)',
                  borderLeft: '3px solid var(--accent-primary)',
                  borderTop: '1px solid var(--border-subtle)',
                  borderRight: '1px solid var(--border-subtle)',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  Possible Contributing Action
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {action.possibleContributingAction}
                </p>
              </div>

              {/* Uncertainty / Caveat */}
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={12} style={{ flexShrink: 0 }} />
                <span>Forensic Uncertainty: {action.uncertaintyNotes}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==============================================================
          7. EVIDENCE CLASSIFICATION
          ============================================================== */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
            07 / EVIDENCE CLASSIFICATION
          </span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Evidence Classification
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
            The 4-tier evidentiary division separating physical proof from inferences and unknowns.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-observed-bg)', border: '1px solid var(--tag-observed-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="badge badge-observed" style={{ fontSize: '0.68rem' }}>OBSERVED</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--tag-observed-text)' }}>
                {caseData.sceneObservations.filter((s) => s.classification === 'OBSERVED').length + caseData.evidenceFiles.length} items
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Damage contact zones, paint transference, tire scrub patterns, and debris fields documented in supplied photographs.
            </p>
          </div>

          <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-reported-bg)', border: '1px solid var(--tag-reported-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="badge badge-reported" style={{ fontSize: '0.68rem' }}>REPORTED</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--tag-reported-text)' }}>
                {caseData.sceneObservations.filter((s) => s.classification === 'REPORTED').length + 1} items
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Driver intentions, perceived signal phases, travel speeds, and witness testimonies.
            </p>
          </div>

          <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-inferred-bg)', border: '1px solid var(--tag-inferred-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="badge badge-inferred" style={{ fontSize: '0.68rem' }}>INFERRED</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--tag-inferred-text)' }}>
                {caseData.sceneObservations.filter((s) => s.classification === 'INFERRED').length + 2} items
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Kinematic trajectory vectors, relative contact angles, and deceleration onset points modeled by AI.
            </p>
          </div>

          <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-unknown-bg)', border: '1px solid var(--tag-unknown-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="badge badge-unknown" style={{ fontSize: '0.68rem' }}>UNKNOWN</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--tag-unknown-text)' }}>
                {caseData.evidenceLimitations.length} items
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Exact millisecond-level traffic light states, EDR vehicle black box telemetry, and post-impact pedestrian eye-line.
            </p>
          </div>
        </div>
      </section>

      {/* ==============================================================
          8. SCENE RECONSTRUCTION (Preview & Launch)
          ============================================================== */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              08 / SCENE RECONSTRUCTION
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Scene Reconstruction
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
              Evidence-based kinematic visualization. Not a definitive forensic or judicial reconstruction.
            </p>
          </div>

          <Link
            to={`/cases/${caseData.id}/reconstruction`}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Maximize2 size={13} />
            <span>Open Dedicated 2D Reconstruction</span>
          </Link>
        </div>

        <div style={{ height: '340px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <SceneReconstructionView
            data={caseData.reconstruction}
            currentStep={2}
            showVectors={true}
            showDebris={true}
          />
        </div>
      </section>

      {/* ==============================================================
          9. EVIDENCE LIMITATIONS
          ============================================================== */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
            09 / EVIDENCE LIMITATIONS
          </span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Evidence Limitations
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
            Forensic boundaries detailing what cannot be established from the supplied evidence files.
          </p>
        </div>

        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {caseData.evidenceLimitations.map((lim, idx) => (
            <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {lim}
            </li>
          ))}
        </ul>
      </section>

      {/* Evidence Lightbox Modal */}
      {selectedEvidenceModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEvidenceModal(null)}
          title={selectedEvidenceModal.fileName}
          subtitle={`Classification: ${selectedEvidenceModal.classification} • ${selectedEvidenceModal.fileSize}`}
          footer={
            <button
              onClick={() => setSelectedEvidenceModal(null)}
              className="btn btn-secondary btn-sm"
            >
              Close Inspection
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '100%', height: '280px', backgroundColor: '#090d16', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={selectedEvidenceModal.thumbnailUrl}
                alt={selectedEvidenceModal.fileName}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div>
                <strong>Evidentiary Classification: </strong>
                <EvidenceBadge type={selectedEvidenceModal.classification} size="sm" />
              </div>
              <div>
                <strong>Perspective: </strong> {selectedEvidenceModal.perspective || 'Standard Police Scene Capture'}
              </div>
              {selectedEvidenceModal.notes && (
                <div>
                  <strong>Forensic Notes: </strong> {selectedEvidenceModal.notes}
                </div>
              )}
              {selectedEvidenceModal.tags && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {selectedEvidenceModal.tags.map((t) => (
                    <span key={t} className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
