import React from 'react';

export const ReconstructionLegend: React.FC = () => {
  const legendItems = [
    { label: 'Vehicle A Trajectory', color: '#5FA6A0', type: 'line' },
    { label: 'Vehicle B / Pedestrian', color: '#f59e0b', type: 'line' },
    { label: 'Possible Impact Area', color: '#ef4444', type: 'circle' },
    { label: 'Debris & Glass Scatter', color: '#94a3b8', type: 'dashed' },
    { label: 'Approximate Heading', color: '#ffffff', type: 'arrow' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '0.65rem 1rem',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        flexWrap: 'wrap'
      }}
    >
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Scene Legend:
      </span>

      {legendItems.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {item.type === 'circle' && (
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: item.color,
                border: '1px solid #ffffff'
              }}
            />
          )}
          {item.type === 'line' && (
            <div
              style={{
                width: '16px',
                height: '3px',
                backgroundColor: item.color,
                borderRadius: '2px'
              }}
            />
          )}
          {item.type === 'dashed' && (
            <div
              style={{
                width: '16px',
                height: '0px',
                borderTop: `2px dashed ${item.color}`
              }}
            />
          )}
          {item.type === 'arrow' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: item.color,
                fontSize: '11px'
              }}
            >
              ➔
            </div>
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
