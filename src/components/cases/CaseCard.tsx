import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Car,
  User,
  Bike,
  HelpCircle,
  ArrowRight,
  Activity,
  Shield,
  Pencil,
  Trash2
} from 'lucide-react';
import { AccidentCase } from '../../types';

interface CaseCardProps {
  caseData: AccidentCase;
  viewMode?: 'grid' | 'table';
  onDelete?: (caseData: AccidentCase) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseData, viewMode = 'table', onDelete }) => {
  const getAccidentTypeLabel = (type: string) => {
    switch (type) {
      case 'vehicle_vs_vehicle':
        return 'Vehicle vs Vehicle';
      case 'vehicle_vs_pedestrian':
        return 'Vehicle vs Pedestrian';
      case 'vehicle_vs_multiple':
        return 'Multi-Participant';
      case 'vehicle_vs_object':
        return 'Vehicle vs Object';
      case 'complex':
        return 'Complex Collision';
      default:
        return type;
    }
  };

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

  const isCompleted = caseData.status === 'Analysis Complete' || caseData.status === 'Analyzed';

  if (viewMode === 'table') {
    return (
      <tr
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'background-color var(--transition-fast)'
        }}
        className="investigation-table-row"
      >
        {/* Case ID */}
        <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
          <span
            className="mono"
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-primary)'
            }}
          >
            {caseData.id}
          </span>
        </td>

        {/* Title & Short Location */}
        <td style={{ padding: '0.9rem 1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {caseData.title}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
            <MapPin size={11} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
              {caseData.location}
            </span>
          </div>
        </td>

        {/* Accident Type */}
        <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-canvas-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-xs)'
            }}
          >
            {getAccidentTypeLabel(caseData.accidentType)}
          </span>
        </td>

        {/* Date */}
        <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={12} style={{ color: 'var(--text-tertiary)' }} />
            <span>{caseData.incidentDate}</span>
          </div>
        </td>

        {/* Assigned Officer */}
        <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Shield size={12} style={{ color: 'var(--accent-text)' }} />
            <span>{caseData.assignedOfficer || 'Officer A. Sharma'}</span>
          </div>
        </td>

        {/* Participants */}
        <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {(caseData.participants || []).slice(0, 3).map((p) => {
              const Icon = getParticipantIcon(p.type);
              return (
                <div
                  key={p.id}
                  title={`${p.label} (${p.role})`}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-canvas-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Icon size={11} />
                </div>
              );
            })}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginLeft: '0.2rem' }}>
              {(caseData.participants || []).length}
            </span>
          </div>
        </td>

        {/* Status */}
        <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
          <span
            className={`badge ${isCompleted ? 'badge-observed' : 'badge-reported'}`}
            style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', textTransform: 'capitalize' }}
          >
            {caseData.status}
          </span>
        </td>

        {/* Actions */}
        <td style={{ padding: '0.9rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
            <Link
              to={`/cases/${caseData.id}/reconstruction`}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--text-secondary)' }}
              title="2D Scene Reconstruction"
            >
              <Activity size={13} />
              <span>Scene</span>
            </Link>
            <Link
              to={`/cases/${caseData.id}/analysis`}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', gap: '0.25rem' }}
            >
              <span>View</span>
              <ArrowRight size={12} />
            </Link>
            <Link
              to={`/cases/${caseData.dbId || caseData.id}/edit`}
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.45rem',
                color: 'var(--accent-text)',
                gap: '0.25rem'
              }}
              title="Edit Case"
              aria-label={`Edit Case ${caseData.id}`}
            >
              <Pencil size={12} />
              <span>Edit</span>
            </Link>
            <button
              type="button"
              onClick={() => onDelete?.(caseData)}
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.45rem',
                color: '#ef4444',
                gap: '0.25rem'
              }}
              title="Delete Case"
              aria-label={`Delete Case ${caseData.id}`}
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // Grid / Compact Card Mode
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'border-color var(--transition-fast)'
      }}
      className="investigation-card-clean"
    >
      <div>
        {/* Top: Case ID & Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {caseData.id}
          </span>
          <span
            className={`badge ${isCompleted ? 'badge-observed' : 'badge-reported'}`}
            style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
          >
            {caseData.status}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.35 }}>
          {caseData.title}
        </h3>

        {/* Metadata string */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          <span>{getAccidentTypeLabel(caseData.accidentType)}</span>
          <span style={{ margin: '0 0.35rem', color: 'var(--border-strong)' }}>•</span>
          <span>{caseData.assignedOfficer || 'Officer A. Sharma'}</span>
          <span style={{ margin: '0 0.35rem', color: 'var(--border-strong)' }}>•</span>
          <span>{caseData.incidentDate}</span>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
          <MapPin size={12} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {caseData.location}
          </span>
        </div>
      </div>

      {/* Footer with clean actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem'
        }}
      >
        <span style={{ color: 'var(--text-tertiary)' }}>
          {(caseData.evidenceFiles || []).length} Evidence files
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <Link
            to={`/cases/${caseData.id}/reconstruction`}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--text-secondary)' }}
            title="Scene Reconstruction"
          >
            <Activity size={13} />
            <span>Scene</span>
          </Link>
          <Link
            to={`/cases/${caseData.id}/analysis`}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', gap: '0.25rem' }}
          >
            <span>View</span>
            <ArrowRight size={12} />
          </Link>
          <Link
            to={`/cases/${caseData.dbId || caseData.id}/edit`}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.45rem', color: 'var(--accent-text)', gap: '0.25rem' }}
            title="Edit Case"
            aria-label={`Edit Case ${caseData.id}`}
          >
            <Pencil size={12} />
            <span>Edit</span>
          </Link>
          <button
            type="button"
            onClick={() => onDelete?.(caseData)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.45rem', color: '#ef4444', gap: '0.25rem' }}
            title="Delete Case"
            aria-label={`Delete Case ${caseData.id}`}
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
