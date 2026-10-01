import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileSpreadsheet,
  Settings,
  Shield,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { TelanganaPoliceLogo } from '../common/TelanganaPoliceLogo';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile
}) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Expanded if mouse hover or keyboard focus-within on desktop, or if opened on mobile drawer
  const isExpandedDesktop = isHovered || isFocused;

  const navItems = [
    { label: 'Investigation Dashboard', shortLabel: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Accident Case', shortLabel: 'New Case', path: '/cases/new', icon: PlusCircle },
    { label: 'Investigation Reports', shortLabel: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { label: 'Settings', shortLabel: 'Settings', path: '/settings', icon: Settings }
  ];

  const recentCases = [
    { id: 'ACC-2026-001', label: 'Crosswalk Incident', type: 'Pedestrian' },
    { id: 'ACC-2026-002', label: 'Highway 101 Collision', type: '2-Vehicle' },
    { id: 'ACC-2026-003', label: 'Commercial Freight Pier', type: 'Multi-Unit' }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 8, 9, 0.75)',
            backdropFilter: 'blur(3px)',
            zIndex: 40
          }}
          aria-hidden="true"
        />
      )}

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
          }
        }}
        style={{
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width var(--sidebar-transition), box-shadow var(--sidebar-transition), transform var(--transition-base)',
          overflowX: 'hidden',
          overflowY: 'auto'
        }}
        className={`hover-sidebar-container ${isOpenMobile ? 'mobile-open' : ''} ${
          isExpandedDesktop ? 'sidebar-expanded' : 'sidebar-collapsed'
        }`}
        aria-label="Main Navigation"
      >
        {/* Top: Official Telangana Police Institutional Branding & Header */}
        <div>
          {/* Entire Branding Block is Clickable and Navigates to / without full reload */}
          <Link
            to="/"
            onClick={onCloseMobile}
            title="Go to Home"
            aria-label="Go to Home"
            style={{
              padding: isExpandedDesktop ? '1.15rem 1.15rem 1rem 1.15rem' : '1.15rem 0.5rem 1rem 0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpandedDesktop ? 'flex-start' : 'center',
              gap: '0.75rem',
              minHeight: '68px',
              textDecoration: 'none',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              transition: 'background-color var(--transition-fast), padding var(--sidebar-transition)',
              width: '100%',
              boxSizing: 'border-box'
            }}
            className="sidebar-brand-block"
          >
            {/* Official Telangana Police Emblem (Undistorted, fixed 32px so no jumping) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <TelanganaPoliceLogo size={32} />
            </div>

            {/* Institutional Brand Text (Visible on Expanded) */}
            <div
              className="sidebar-text-expandable"
              style={{
                opacity: isExpandedDesktop ? 1 : 0,
                transform: isExpandedDesktop ? 'translateX(0)' : 'translateX(-6px)',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
                display: isExpandedDesktop ? 'block' : 'none',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              <div style={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                TELANGANA POLICE
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', lineHeight: 1.15, marginBottom: '2px' }}>
                Accident Investigation Unit
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.96rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  Accident<span style={{ color: 'var(--accent-text)' }}>IQ</span>
                </span>
                <span
                  style={{
                    fontSize: '0.58rem',
                    padding: '0.05rem 0.3rem',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--accent-surface)',
                    color: 'var(--accent-text)',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}
                >
                  POLICE
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav
            style={{
              padding: isExpandedDesktop ? '1rem 0.75rem' : '1rem 0.45rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              transition: 'padding var(--sidebar-transition)'
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  title={item.label}
                  aria-label={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpandedDesktop ? 'flex-start' : 'center',
                    gap: '0.75rem',
                    padding: isExpandedDesktop ? '0.6rem 0.85rem' : '0.65rem 0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--accent-surface)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--accent-border)' : 'transparent'}`,
                    transition: 'all var(--transition-fast)',
                    position: 'relative'
                  }}
                  className="sidebar-nav-item"
                >
                  <Icon
                    size={17}
                    style={{
                      color: isActive ? 'var(--accent-text)' : 'var(--text-tertiary)',
                      flexShrink: 0
                    }}
                  />
                  <span
                    className="sidebar-text-expandable"
                    style={{
                      opacity: isExpandedDesktop ? 1 : 0,
                      display: isExpandedDesktop ? 'inline' : 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'opacity 0.18s ease'
                    }}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}

            {/* Subtle Recent Investigations Section (Expanded Only) */}
            {isExpandedDesktop && (
              <div
                style={{
                  marginTop: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem',
                  animation: 'fadeIn 0.2s ease forwards'
                }}
              >
                <div
                  style={{
                    padding: '0 0.85rem 0.35rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--text-tertiary)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}
                >
                  Recent Investigations
                </div>

                {recentCases.map((rc) => {
                  const isCaseActive = location.pathname.includes(rc.id);
                  return (
                    <NavLink
                      key={rc.id}
                      to={`/cases/${rc.id}/analysis`}
                      onClick={onCloseMobile}
                      title={`${rc.id} — ${rc.label}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        color: isCaseActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        backgroundColor: isCaseActive ? 'var(--accent-surface)' : 'transparent',
                        border: `1px solid ${isCaseActive ? 'var(--accent-border)' : 'transparent'}`,
                        transition: 'all var(--transition-fast)'
                      }}
                      className="sidebar-recent-item"
                    >
                      <FolderOpen
                        size={13}
                        style={{ color: isCaseActive ? 'var(--accent-text)' : 'var(--text-tertiary)', flexShrink: 0 }}
                      />
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        <span className="mono" style={{ fontWeight: 600 }}>{rc.id}</span>
                        <span style={{ color: 'var(--text-tertiary)', marginLeft: '0.35rem' }}>• {rc.type}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Section: Officer Profile, Theme Control, Secure Logout */}
        <div
          style={{
            padding: isExpandedDesktop ? '0.85rem 0.85rem' : '0.85rem 0.45rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            transition: 'padding var(--sidebar-transition)'
          }}
        >
          {/* Officer Profile Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpandedDesktop ? 'flex-start' : 'center',
              gap: '0.65rem',
              padding: isExpandedDesktop ? '0.2rem 0.3rem' : '0.2rem 0'
            }}
            title="Officer A. Sharma • Telangana Police CIU-4921"
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-surface)',
                color: 'var(--accent-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid var(--accent-border)',
                flexShrink: 0
              }}
            >
              AS
            </div>

            {isExpandedDesktop && (
              <div style={{ overflow: 'hidden', flex: 1, whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  Officer A. Sharma
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Shield size={10} style={{ color: 'var(--accent-text)' }} /> CIU-4921 • Telangana Police
                </div>
              </div>
            )}
          </div>

          {/* Theme & Secure Logout Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpandedDesktop ? 'space-between' : 'center',
              flexDirection: isExpandedDesktop ? 'row' : 'column',
              gap: '0.45rem',
              paddingTop: '0.35rem',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <div title="Toggle Light/Dark Theme">
              <ThemeToggle compact={!isExpandedDesktop} />
            </div>

            <NavLink
              to="/login"
              className="btn btn-ghost btn-sm"
              style={{
                color: 'var(--text-tertiary)',
                padding: isExpandedDesktop ? '0.35rem 0.65rem' : '0.35rem',
                borderRadius: 'var(--radius-sm)',
                gap: '0.45rem',
                fontSize: '0.75rem',
                width: isExpandedDesktop ? 'auto' : '100%',
                justifyContent: 'center'
              }}
              title="Secure Logout"
              aria-label="Secure Police Logout"
              onClick={() => {
                void supabase.auth.signOut();
              }}
            >
              <LogOut size={15} />
              {isExpandedDesktop && <span>Logout</span>}
            </NavLink>
          </div>
        </div>
      </aside>

      <style>{`
        /* Desktop: Collapsed icon rail by default, expands as overlay on hover */
        @media (min-width: 901px) {
          .hover-sidebar-container.sidebar-collapsed {
            width: var(--sidebar-collapsed-width);
            box-shadow: none;
          }
          .hover-sidebar-container.sidebar-expanded {
            width: var(--sidebar-width);
            box-shadow: 6px 0 24px rgba(0, 0, 0, 0.45);
          }
        }

        /* Mobile & Tablet: Tap drawer toggle, full width drawer */
        @media (max-width: 900px) {
          .hover-sidebar-container {
            width: var(--sidebar-width) !important;
            transform: translateX(-100%) !important;
            box-shadow: 8px 0 32px rgba(0, 0, 0, 0.6) !important;
          }
          .hover-sidebar-container.mobile-open {
            transform: translateX(0) !important;
          }
          .hover-sidebar-container .sidebar-text-expandable {
            opacity: 1 !important;
            display: block !important;
            transform: none !important;
          }
        .sidebar-brand-block:hover {
          background-color: var(--bg-surface-hover) !important;
        }
        .sidebar-brand-block:focus-visible {
          outline: 2px solid var(--accent-primary);
          outline-offset: -2px;
        }
      `}</style>
    </>
  );
};
