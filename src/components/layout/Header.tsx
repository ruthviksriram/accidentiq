import React from 'react';
import { Menu, Search } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* Left: Mobile Menu Toggle & Search Bar (NO duplicate branding, NO breadcrumb) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleMobileMenu}
          className="btn btn-ghost mobile-menu-btn"
          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div
          className="header-search"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search cases or plate #..."
            style={{
              padding: '0.42rem 0.75rem 0.42rem 2.2rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              backgroundColor: 'var(--bg-canvas-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              width: '240px',
              outline: 'none',
              transition: 'border-color var(--transition-fast)'
            }}
            className="header-search-input"
          />
        </div>
      </div>

      {/* Right: Theme Toggle & Officer Clearance Chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div className="header-theme-toggle" title="Toggle Light/Dark Theme">
          <ThemeToggle compact={true} />
        </div>

        {/* Officer Clearance Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.7rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-canvas-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}
          className="header-officer-chip"
          title="Authorized Telangana Police Investigator"
        >
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--tag-observed-text)'
            }}
          />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>CIU-4921 • Telangana Police</span>
        </div>
      </div>

      <style>{`
        @media (min-width: 901px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .header-search {
            display: none !important;
          }
          .header-officer-chip span {
            font-size: 0.7rem;
          }
        }
        .header-search-input:focus {
          border-color: var(--accent-primary) !important;
        }
      `}</style>
    </header>
  );
};
