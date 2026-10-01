import React from 'react';
import { FolderSearch, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No accident cases found',
  description = 'No active investigation records match your selected filter criteria. You can create a new case or reset to default mock cases.',
  actionText = 'New Accident Case',
  actionHref = '/cases/new',
  onReset
}) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        border: '1.5px dashed var(--border-medium)',
        backgroundColor: 'var(--bg-canvas-subtle)'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
          marginBottom: '1.25rem'
        }}
      >
        <FolderSearch size={26} />
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        {description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionHref && (
          <Link to={actionHref} className="btn btn-primary">
            <PlusCircle size={16} />
            <span>{actionText}</span>
          </Link>
        )}
        {onReset && (
          <button onClick={onReset} className="btn btn-secondary">
            Restore Sample Cases
          </button>
        )}
      </div>
    </div>
  );
};
