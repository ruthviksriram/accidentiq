import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  Sparkles,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { SceneReconstructionView } from '../components/reconstruction/SceneReconstructionView';
import { ReconstructionPanel } from '../components/reconstruction/ReconstructionPanel';
import { ReconstructionLegend } from '../components/reconstruction/ReconstructionLegend';

export const SceneReconstructionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCaseById, cases } = useCases();

  const caseData = id ? getCaseById(id) : cases[0];

  // Timeline Step State: 0 (Approach), 1 (Pre-impact), 2 (Impact), 3 (Rest)
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showDebris, setShowDebris] = useState<boolean>(true);

  // Auto-play animation timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev >= 3 ? 0 : prev + 1));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!caseData || !caseData.reconstruction) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Reconstruction Model Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          This case does not yet contain 2D vector coordinates.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1360px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <Link to={`/cases/${caseData.id}/analysis`} className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
              <ArrowLeft size={15} /> Case Dossier
            </Link>
            <span style={{ color: 'var(--border-strong)' }}>/</span>
            <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-text)' }}>
              {caseData.id}
            </span>
            <span className="badge badge-accent">
              {caseData.accidentType.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Mandatory Titles from prompt */}
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Possible Scene Reconstruction
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Evidence-based visualization — not a definitive forensic or legal reconstruction.
          </p>
        </div>

        {/* Case Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Quick Scenario Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              Scenario:
            </span>
            <select
              className="form-select"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', width: 'auto' }}
              value={caseData.id}
              onChange={(e) => {
                navigate(`/cases/${e.target.value}/reconstruction`);
              }}
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}: {c.accidentType.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <Link to={`/cases/${caseData.id}/report`} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <FileSpreadsheet size={14} />
            <span>Full Report</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Responsible AI Subtitle Banner */}
      <div className="ai-notice-banner" style={{ padding: '0.7rem 1rem' }}>
        <AlertTriangle size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.78rem' }}>
          <strong>Kinematic Disclaimer: </strong>
          This 2D model illustrates approximate spatial relationships and plausible trajectory paths based on available photographic debris and reported statements. It does not constitute a rigid body dynamic collision reconstruction.
        </div>
      </div>

      {/* Main Reconstruction Workspace: Left 2D Canvas + Right Data Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.45fr 1fr',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}
        className="reconstruction-layout"
      >
        {/* Left Column: Interactive 2D Canvas & Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SceneReconstructionView
            data={caseData.reconstruction}
            currentStep={currentStep}
            showVectors={showVectors}
            showDebris={showDebris}
          />

          <ReconstructionLegend />
        </div>

        {/* Right Column: Reconstruction Data & Timeline Controls */}
        <div>
          <ReconstructionPanel
            data={caseData.reconstruction}
            currentStep={currentStep}
            onStepChange={(step) => {
              setCurrentStep(step);
              setIsPlaying(false);
            }}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => {
              setCurrentStep(0);
              setIsPlaying(false);
            }}
            showVectors={showVectors}
            onToggleVectors={() => setShowVectors(!showVectors)}
            showDebris={showDebris}
            onToggleDebris={() => setShowDebris(!showDebris)}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .reconstruction-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
