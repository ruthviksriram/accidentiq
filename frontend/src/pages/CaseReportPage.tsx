import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  Activity,
  Shield,
  CheckCircle,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { ConfidenceBadge } from '../components/common/EvidenceBadge';
import { SceneReconstructionView } from '../components/reconstruction/SceneReconstructionView';
import { Timeline } from '../components/cases/Timeline';
import { TelanganaPoliceLogo } from '../components/common/TelanganaPoliceLogo';
import { GeminiAnalysisOutput } from '../types';
import { GeminiAnalysisDisplay } from '../components/analysis/GeminiAnalysisDisplay';
import { runGeminiAccidentAnalysis, fetchAnalysisResultForCase } from '../lib/geminiAnalysisService';

export const CaseReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCaseById, cases, refreshCases } = useCases();

  const caseData = id ? getCaseById(id) : cases[0];
  const [downloadSuccess, setDownloadSuccess] = useState(false);
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

    // Guard requirement: "If there is no uploaded image: show: 'Upload at least one accident photo before running AI analysis.'"
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
      <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <h2>Investigation Report Not Found</h2>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '980px', margin: '0 auto', width: '100%' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-sm" style={{ gap: '0.35rem' }}>
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </button>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-text)' }}>
            CASE #{caseData.id}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn btn-secondary btn-sm"
            style={{
              gap: '0.35rem',
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
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <Activity size={14} />
            <span>View Reconstruction</span>
          </Link>

          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownload}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            {downloadSuccess ? <CheckCircle size={14} /> : <Download size={14} />}
            <span>{downloadSuccess ? 'Exported' : 'Download Report'}</span>
          </button>
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

      {/* Official Digital Investigation Record Container */}
      <div
        style={{
          padding: '2.5rem 3rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.25rem'
        }}
      >
        {/* 1. Case Header */}
        <div
          style={{
            borderBottom: '2px solid var(--border-subtle)',
            paddingBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <TelanganaPoliceLogo size={36} />
            <div>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                TELANGANA POLICE • ACCIDENT INVESTIGATION UNIT
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-text)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '1px' }}>
                ACCIDENT<span style={{ color: 'var(--text-primary)' }}>IQ</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
                {caseData.title}
              </h1>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Forensic collision investigation and kinematic trajectory reconstruction dossier.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Forensic Case Dossier
            </span>
            <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-text)' }}>
              Case ID: {caseData.id}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
              Incident Date: {caseData.incidentDate} at {caseData.incidentTime}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--tag-observed-text)', fontWeight: 600 }}>
              {caseData.status}
            </span>
          </div>
        </div>

        {/* Header Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-canvas-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>Assigned Investigator</span>
            <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
              <Shield size={12} style={{ color: 'var(--accent-text)' }} />
              {caseData.assignedOfficer || 'Officer A. Sharma'}
            </strong>
            <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
              Badge #{caseData.badgeNumber || 'CIU-4921'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>Classification</span>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>
              {caseData.accidentType.replace(/_/g, ' ')}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>Scene Location</span>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>
              {caseData.location}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.7rem' }}>Environment Profile</span>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>
              {caseData.weatherConditions || 'Clear daylight'}
            </strong>
          </div>
        </div>

        {/* 2. Incident Summary */}
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
            Incident Summary
          </h2>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
              Officer On-Scene Narrative:
            </span>
            "{caseData.userNarrative}"
          </div>
        </div>

        {/* 3. Participants */}
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
            Participants Involved ({caseData.participants.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
            {caseData.participants.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-canvas-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {p.label}
                  </h3>
                  <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                    #{p.id}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div>Role: <span style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{p.role}</span></div>
                  {p.vehicleDetails && (
                    <>
                      <div>Plate: <span className="mono" style={{ color: 'var(--text-primary)' }}>{p.vehicleDetails.registrationNumber || 'Unregistered'}</span></div>
                      <div>Type: {p.vehicleDetails.makeModel || p.vehicleDetails.vehicleType}</div>
                      <div>Driver: {p.vehicleDetails.driverName || 'Reported on-scene'}</div>
                    </>
                  )}
                  {p.pedestrianDetails && (
                    <>
                      <div>Position: {p.pedestrianDetails.reportedActivity}</div>
                      <div>Attire: {p.pedestrianDetails.clothingDescription || 'Standard'}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Evidence */}
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
            Cataloged Evidence ({caseData.evidenceFiles.length} Items)
          </h2>
          {caseData.evidenceFiles && caseData.evidenceFiles.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {caseData.evidenceFiles.map((ev) => (
                <span
                  key={ev.id}
                  className="mono"
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.35rem 0.65rem',
                    backgroundColor: 'var(--bg-canvas-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.05rem 0.3rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--accent-surface)', color: 'var(--accent-text)' }}>
                    {ev.evidenceType ? ev.evidenceType.replace(/_/g, ' ').toUpperCase() : 'FILE'}
                  </span>
                  <span>{ev.fileName}</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>• {ev.fileSize}</span>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              No multimedia evidence cataloged for this case yet.
            </div>
          )}
        </div>

        {/* 5. Analysis */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Investigation Analysis
            </h2>
            {!analysisResult && (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Analyzing accident evidence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Analyze Evidence with AI</span>
                  </>
                )}
              </button>
            )}
          </div>

          {isAnalyzing ? (
            <div
              style={{
                padding: '2.5rem',
                backgroundColor: 'var(--bg-canvas-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.85rem',
                textAlign: 'center'
              }}
            >
              <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Analyzing accident evidence...
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                Gemini multimodal vision model is examining photographic scene evidence and kinematics metadata.
              </div>
            </div>
          ) : analysisResult ? (
            <GeminiAnalysisDisplay analysis={analysisResult} />
          ) : caseData.status === 'Analysis Complete' || caseData.status === 'Analyzed' ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.65, backgroundColor: 'var(--bg-canvas-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              {caseData.overviewSummary}
            </p>
          ) : (
            <div style={{ padding: '1.75rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                No analysis yet
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', maxWidth: '480px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
                Automated kinematic scene analysis and AI evidentiary classification have not been performed on this case.
              </p>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.45rem', margin: '0 auto' }}
              >
                <Sparkles size={14} />
                <span>Analyze Evidence with AI</span>
              </button>
            </div>
          )}
        </div>

        {/* 6. Possible Sequence */}
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Possible Sequence of Events
          </h2>
          {caseData.sequenceOfEvents && caseData.sequenceOfEvents.length > 0 ? (
            <Timeline steps={caseData.sequenceOfEvents} />
          ) : (
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              No analysis yet
            </div>
          )}
        </div>

        {/* 7. Participant Actions */}
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Participant Actions & Contributing Factors
          </h2>
          {caseData.participantActions && caseData.participantActions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {caseData.participantActions.map((act) => (
                <div
                  key={act.participantId}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-canvas-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {act.participantLabel}
                    </h3>
                    <ConfidenceBadge level={act.confidenceLevel} />
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    <strong>Possible Contributing Action: </strong>
                    {act.possibleContributingAction}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                    Uncertainty Factor: {act.uncertaintyNotes}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              No analysis yet
            </div>
          )}
        </div>

        {/* 8. Scene Reconstruction */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Scene Reconstruction Snapshot
            </h2>
            {caseData.reconstruction && caseData.reconstruction.actors && caseData.reconstruction.actors.length > 0 && (
              <Link to={`/cases/${caseData.id}/reconstruction`} className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-text)', fontSize: '0.74rem' }}>
                Full Interactive Scene →
              </Link>
            )}
          </div>
          {caseData.reconstruction && caseData.reconstruction.actors && caseData.reconstruction.actors.length > 0 ? (
            <div style={{ height: '340px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
              <SceneReconstructionView
                data={caseData.reconstruction}
                currentStep={2}
                showVectors={true}
                showDebris={true}
              />
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              No analysis yet
            </div>
          )}
        </div>

        {/* 9. Limitations */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Evidence Limitations
          </h2>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {caseData.evidenceLimitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>

        {/* Attestation Footer */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: 'var(--text-tertiary)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div>
            Official Investigation Record • <strong>Telangana Police Accident Investigation Unit</strong> • AccidentIQ Case #{caseData.id}
          </div>
          <div>
            Prototype interface — not an official Telangana Police system.
          </div>
        </div>
      </div>
    </div>
  );
};

// Cleaned up ReportsListPage for `/reports`
export const ReportsListPage: React.FC = () => {
  const { cases } = useCases();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Investigation Reports
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Access completed police investigation dossiers, printable reports, and 2D kinematic scene visualizations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {cases.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem 2rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              No investigation reports found
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              No accident cases have been filed yet. Create a new case from the dashboard to initiate an investigation.
            </p>
            <Link to="/cases/new" className="btn btn-primary btn-sm">
              New Accident Case
            </Link>
          </div>
        ) : (
          cases.map((c) => {
            const hasAnalysis = c.status === 'Analysis Complete' || c.status === 'Analyzed';
            return (
              <div
                key={c.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {c.id}
                    </span>
                    <span
                      className={`badge ${hasAnalysis ? 'badge-observed' : 'badge-reported'}`}
                      style={{ fontSize: '0.68rem' }}
                    >
                      {hasAnalysis ? c.status : 'No analysis yet'}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {c.title}
                  </h2>

                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-text)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Shield size={12} />
                    <span>Assigned: {c.assignedOfficer || 'Investigating Officer'}</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
                    {c.location} • {c.incidentDate}
                  </div>

                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: hasAnalysis ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                      fontStyle: hasAnalysis ? 'normal' : 'italic',
                      lineHeight: 1.45,
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {hasAnalysis ? c.overviewSummary : 'No analysis yet'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    {(c.evidenceFiles || []).length} Evidence files
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {hasAnalysis && (
                      <Link to={`/cases/${c.id}/reconstruction`} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Scene
                      </Link>
                    )}
                    <Link to={`/cases/${c.id}/report`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                      View Report
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
