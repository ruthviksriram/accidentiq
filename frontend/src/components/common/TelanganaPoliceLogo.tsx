import React, { useState } from 'react';

interface TelanganaPoliceLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  showWordmark?: boolean;
}

/**
 * Official Telangana Police Logo Emblem component.
 * Uses official public emblem asset from /assets/telangana-police-logo.png
 * without distortion, recoloring, or cropping.
 */
export const TelanganaPoliceLogo: React.FC<TelanganaPoliceLogoProps> = ({
  size = 36,
  className = '',
  style = {},
  showWordmark = false
}) => {
  const [imageError, setImageError] = useState(false);

  // Maintain official 290:342 (~1:1.18) aspect ratio of the emblem
  const width = size;
  const height = Math.round(size * 1.18);

  return (
    <div
      className={`telangana-police-logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        ...style
      }}
    >
      {!imageError ? (
        <img
          src="/assets/telangana-police-logo.png"
          alt="Telangana Police Official Emblem"
          width={width}
          height={height}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            objectFit: 'contain',
            display: 'block',
            flexShrink: 0
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        /* Graceful vector fallback if image is missing */
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            borderRadius: '4px',
            backgroundColor: 'var(--accent-surface)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-text)',
            fontSize: `${Math.max(10, Math.round(size * 0.28))}px`,
            fontWeight: 800,
            fontFamily: 'var(--font-mono)'
          }}
          title="Telangana Police (Emblem: /assets/telangana-police-logo.png)"
        >
          TP
        </div>
      )}

      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Telangana Police
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', letterSpacing: '0.02em' }}>
            Accident Investigation Unit
          </span>
        </div>
      )}
    </div>
  );
};
