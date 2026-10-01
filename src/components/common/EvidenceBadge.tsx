import React from 'react';
import { Eye, MessageSquare, Cpu, HelpCircle } from 'lucide-react';
import { EvidenceClassification } from '../../types';

interface EvidenceBadgeProps {
  type: EvidenceClassification;
  showIcon?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  type,
  showIcon = true,
  size = 'md'
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'OBSERVED':
        return {
          label: 'Observed',
          className: 'badge-observed',
          icon: Eye,
          title: 'Directly visible in supplied photographic or physical evidence'
        };
      case 'REPORTED':
        return {
          label: 'Reported',
          className: 'badge-reported',
          icon: MessageSquare,
          title: 'Provided by participant, witness, or user testimony'
        };
      case 'INFERRED':
        return {
          label: 'Inferred',
          className: 'badge-inferred',
          icon: Cpu,
          title: 'AI model interpretation derived from available evidence'
        };
      case 'UNKNOWN':
      default:
        return {
          label: 'Unknown',
          className: 'badge-unknown',
          icon: HelpCircle,
          title: 'Cannot be definitively established from available evidence'
        };
    }
  };

  const { label, className, icon: Icon, title } = getBadgeConfig();

  return (
    <span
      className={`badge ${className}`}
      title={title}
      style={{
        fontSize: size === 'sm' ? '0.68rem' : '0.75rem',
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.22rem 0.65rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        cursor: 'help'
      }}
    >
      {showIcon && <Icon size={size === 'sm' ? 10 : 12} />}
      <span>{label}</span>
    </span>
  );
};

export const ConfidenceBadge: React.FC<{
  level: 'High' | 'Moderate' | 'Limited' | 'Indeterminate';
}> = ({ level }) => {
  const getColors = () => {
    switch (level) {
      case 'High':
        return {
          bg: 'var(--tag-observed-bg)',
          border: 'var(--tag-observed-border)',
          text: 'var(--tag-observed-text)'
        };
      case 'Moderate':
        return {
          bg: 'var(--accent-surface)',
          border: 'var(--accent-border)',
          text: 'var(--accent-text)'
        };
      case 'Limited':
        return {
          bg: 'var(--tag-reported-bg)',
          border: 'var(--tag-reported-border)',
          text: 'var(--tag-reported-text)'
        };
      case 'Indeterminate':
      default:
        return {
          bg: 'var(--tag-unknown-bg)',
          border: 'var(--tag-unknown-border)',
          text: 'var(--tag-unknown-text)'
        };
    }
  };

  const c = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        borderRadius: 'var(--radius-xs)',
        fontSize: '0.72rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        textTransform: 'uppercase'
      }}
      title={`Certainty Assessment: ${level}`}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: c.text
        }}
      />
      {level} Certainty
    </span>
  );
};
