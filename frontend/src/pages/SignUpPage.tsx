import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowLeft, Building, HelpCircle } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { TelanganaPoliceLogo } from '../components/common/TelanganaPoliceLogo';

export const SignUpPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--bg-canvas)', padding: '2rem 1.5rem' }}>
      {/* Top Header */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TelanganaPoliceLogo size={30} />
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              TELANGANA POLICE
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              ACCIDENT<span style={{ color: 'var(--accent-text)' }}>IQ</span>
            </span>
          </div>
        </Link>

        <ThemeToggle compact={true} />
      </div>

      {/* Main Restricted Access Notice Card */}
      <div style={{ maxWidth: '480px', width: '100%', margin: '2rem auto' }}>
        <div style={{ padding: '2.5rem 2.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-surface)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-text)',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <Lock size={22} />
          </div>

          <span
            className="badge badge-neutral"
            style={{ marginBottom: '1rem', fontSize: '0.72rem' }}
          >
            RESTRICTED ACCESS PLATFORM
          </span>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Public Registration Disabled
          </h1>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            AccidentIQ is a restricted police accident investigation & evidence analysis platform. Self-registration is not permitted.
          </p>

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-canvas-subtle)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'left',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem'
            }}
          >
            <Building size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Officer Account Provisioning:</strong>
              <p style={{ marginTop: '0.25rem' }}>
                Contact your system administrator or Collision Investigation Unit coordinator to provision an authorized agency login.
              </p>
            </div>
          </div>

          <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', gap: '0.45rem' }}>
            <ArrowLeft size={16} />
            <span>Return to Secure Police Login</span>
          </Link>
        </div>
      </div>

      {/* Footer with Prototype Disclaimer */}
      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldAlert size={13} />
          <span>Restricted police system • Telangana Police Collision Investigation Unit</span>
        </div>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
          Prototype interface — not an official Telangana Police system.
        </span>
      </div>
    </div>
  );
};
