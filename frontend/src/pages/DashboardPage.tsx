import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plus,
  FolderKanban,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { StatCard } from '../components/common/StatCard';
import { CaseCard } from '../components/cases/CaseCard';
import { EmptyState } from '../components/common/EmptyState';
import { deleteAccidentCase } from '../lib/caseService';
import { AccidentCase } from '../types';

export const DashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cases, refreshCases, resetToDefault } = useCases();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Delete modal & feedback states
  const [caseToDelete, setCaseToDelete] = useState<AccidentCase | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Check for success message from navigation redirects (e.g. edit / create case)
  useEffect(() => {
    if (location.state && (location.state as any).message) {
      setActionSuccess((location.state as any).message);
      navigate(location.pathname, { replace: true, state: {} });
      const timer = setTimeout(() => {
        setActionSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  const handleInitiateDelete = (c: AccidentCase) => {
    setCaseToDelete(c);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!caseToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteAccidentCase(caseToDelete.dbId || caseToDelete.id);
      await refreshCases();
      setActionSuccess(`Case ${caseToDelete.caseNumber || caseToDelete.id} and associated evidence were deleted successfully.`);
      setCaseToDelete(null);
      setTimeout(() => {
        setActionSuccess(null);
      }, 5000);
    } catch (err: unknown) {
      console.error('Delete error:', err);
      const msg = err instanceof Error ? err.message : 'Unable to delete case.';
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Compute Statistics per police platform specifications
  const activeCases = cases.length;
  const completedReports = cases.filter(
    (c) => c.status === 'Analysis Complete' || c.status === 'Analyzed'
  ).length;
  const pendingAnalysis = cases.filter(
    (c) =>
      c.status === 'active' ||
      c.status === 'Pending Review' ||
      c.status === 'Draft' ||
      c.status === 'Active Investigation'
  ).length;
  const totalEvidence = cases.reduce(
    (acc, c) => acc + (c.evidenceFiles ? c.evidenceFiles.length : 0),
    0
  );

  // Filter cases based on active tab
  const filteredCases = cases.filter((c) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'vehicle_vs_vehicle') return c.accidentType === 'vehicle_vs_vehicle';
    if (activeFilter === 'vehicle_vs_pedestrian') return c.accidentType === 'vehicle_vs_pedestrian';
    if (activeFilter === 'multiple') return c.accidentType === 'vehicle_vs_multiple' || c.accidentType === 'complex';
    if (activeFilter === 'pending') return c.status !== 'Analysis Complete' && c.status !== 'Analyzed';
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All Cases' },
    { id: 'vehicle_vs_vehicle', label: 'Vehicle vs Vehicle' },
    { id: 'vehicle_vs_pedestrian', label: 'Vehicle vs Pedestrian' },
    { id: 'multiple', label: 'Multi-Participant' },
    { id: 'pending', label: 'Pending Review' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
      {/* Clean Dashboard Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              TELANGANA POLICE
            </span>
            <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              ACCIDENT INVESTIGATION UNIT
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Investigation Dashboard
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Review and manage authorized accident investigation cases.
          </p>
        </div>

        {/* Primary CTA - ONE Single New Case Action */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.45rem' }}>
          <Link to="/cases/new" className="btn btn-primary" style={{ gap: '0.45rem', padding: '0.65rem 1.25rem' }}>
            <Plus size={16} />
            <span>New Accident Case</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={refreshCases}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', padding: '0.15rem 0.35rem' }}
              title="Refresh investigation cases"
            >
              <RotateCcw size={11} style={{ marginRight: '0.25rem' }} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#16a34a',
            fontSize: '0.88rem',
            fontWeight: 500
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Clean Statistics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <StatCard
          label="Active Cases"
          value={activeCases}
          icon={FolderKanban}
          subtext="Authorized investigation files"
          color="var(--accent-text)"
        />
        <StatCard
          label="Completed Reports"
          value={completedReports}
          icon={CheckCircle2}
          subtext="Dossiers with kinematic analysis"
          color="var(--tag-observed-text)"
        />
        <StatCard
          label="Pending Analysis"
          value={pendingAnalysis}
          icon={Clock}
          subtext="Evidence queue & reviews"
          color="var(--tag-reported-text)"
        />
        <StatCard
          label="Evidence Files"
          value={totalEvidence}
          icon={ImageIcon}
          subtext="Cataloged crash captures"
          color="var(--accent-text)"
        />
      </div>

      {/* Recent Investigations - Main Focus */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {/* Section Header & Lightweight Filter Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Investigations
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Logged incident records and forensic investigation files
            </p>
          </div>

          {/* Lightweight Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            {filterTabs.map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 500,
                    backgroundColor: isSelected ? 'var(--accent-surface)' : 'transparent',
                    color: isSelected ? 'var(--accent-text)' : 'var(--text-secondary)',
                    border: `1px solid ${isSelected ? 'var(--accent-border)' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Investigation Cases Display */}
        {filteredCases.length === 0 ? (
          <EmptyState
            title="No investigation cases match this filter"
            description="There are currently no active investigation files matching the selected criteria. You can create a new investigation or restore default cases."
            actionText="New Accident Case"
            actionHref="/cases/new"
            onReset={resetToDefault}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-investigations-table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.65rem 1rem' }}>Case ID</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Incident & Location</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Type</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Officer</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Participants</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((c) => (
                    <CaseCard key={c.id} caseData={c} viewMode="table" onDelete={handleInitiateDelete} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Narrow Screen List */}
            <div className="mobile-investigations-list" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredCases.map((c) => (
                <CaseCard key={c.id} caseData={c} viewMode="grid" onDelete={handleInitiateDelete} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {caseToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444'
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 id="delete-dialog-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Delete this accident case?
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Permanent forensic dossier purge
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setCaseToDelete(null)}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--text-tertiary)', padding: '0.25rem' }}
                disabled={isDeleting}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Case Particulars */}
            <div
              style={{
                backgroundColor: 'var(--bg-canvas-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-text)' }}>
                  {caseToDelete.caseNumber || caseToDelete.id}
                </span>
                <span style={{ color: 'var(--border-strong)', fontSize: '0.8rem' }}>•</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {caseToDelete.incidentDate}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {caseToDelete.title}
              </div>
            </div>

            {/* Warning Details per requirements */}
            <div
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem'
              }}
            >
              <strong>Important Notice:</strong> Deleting this case will permanently remove this case record, along with all associated photographic & multimedia evidence from storage, as well as any generated AI analysis and reconstruction results. This action cannot be undone.
            </div>

            {deleteError && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-xs)'
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCaseToDelete(null)}
                disabled={isDeleting}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="btn btn-primary"
                style={{
                  fontSize: '0.85rem',
                  padding: '0.55rem 1.15rem',
                  backgroundColor: '#dc2626',
                  borderColor: '#dc2626',
                  color: '#ffffff',
                  gap: '0.45rem'
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Deleting Case...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .investigation-table-row:hover {
          background-color: var(--bg-surface-hover);
        }
        @media (max-width: 820px) {
          .desktop-investigations-table {
            display: none !important;
          }
          .mobile-investigations-list {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
