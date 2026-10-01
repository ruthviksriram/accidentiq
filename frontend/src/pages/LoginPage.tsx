import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Lock, BadgeCheck, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { TelanganaPoliceLogo } from '../components/common/TelanganaPoliceLogo';
import { supabase } from '../lib/supabase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let email = officerId.trim();
    // Support format "CIU-4921 / a.sharma@police.gov" or direct email "officer@police.gov"
    if (email.includes('/')) {
      const parts = email.split('/');
      email = parts[parts.length - 1].trim();
    }

    if (!email || !password) {
      setErrorMessage('Invalid email or password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Strict validation: Require NO error AND a valid authenticated session & user
      if (error || !data || !data.session || !data.user) {
        setErrorMessage('Invalid email or password.');
        setLoading(false);
        return;
      }

      // Successful login with valid Supabase session
      navigate('/dashboard');
    } catch {
      setErrorMessage('Invalid email or password.');
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setOfficerId('a.sharma@police.gov');
    setPassword('AuthPoliceKey2026!');
    setErrorMessage(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Left Form Area */}
      <div
        style={{
          flex: '1 1 500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2.5rem 3rem'
        }}
        className="auth-form-container"
      >
        {/* Top Header with Official Telangana Police Brand & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TelanganaPoliceLogo size={30} />
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                TELANGANA POLICE
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                ACCIDENT<span style={{ color: 'var(--accent-text)' }}>IQ</span>
              </span>
            </div>
          </Link>

          <ThemeToggle compact={true} />
        </div>

        {/* Center: Secure Police Login Form */}
        <div style={{ maxWidth: '420px', width: '100%', margin: '2rem auto' }}>
          {/* Security Indicator */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.28rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--accent-surface)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent-text)',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1.25rem'
            }}
          >
            <Lock size={12} />
            <span>🔒 Restricted Police Investigation System</span>
          </div>

          {/* Form Header with Emblem & Hierarchy */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <TelanganaPoliceLogo size={36} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  TELANGANA POLICE
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  ACCIDENT<span style={{ color: 'var(--accent-text)' }}>IQ</span>
                </div>
              </div>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              Secure Police Access
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Authorized personnel only. Sign in with your authorized police credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <div
                role="alert"
                style={{
                  marginBottom: '1.25rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  lineHeight: 1.45
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="police-id-input">
                <span>Official Police ID / Official Email</span>
              </label>
              <div style={{ position: 'relative' }}>
                <BadgeCheck size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  id="police-id-input"
                  type="text"
                  required
                  disabled={loading}
                  className="form-input mono"
                  value={officerId}
                  onChange={(e) => {
                    setOfficerId(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  style={{ paddingLeft: '2.3rem' }}
                  placeholder="CIU-XXXX or officer@police.gov"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="password-input" style={{ margin: 0 }}>
                  Password / Authentication Key
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  className="form-input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  style={{ paddingLeft: '2.3rem', paddingRight: '2.5rem' }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                    padding: '0.2rem'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: loading ? 'not-allowed' : 'pointer' }}>
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                Keep session active on this workstation
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem',
                gap: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                opacity: loading ? 0.8 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Secure Login</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Hackathon Evaluators */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-canvas-subtle)',
              border: '1px dashed var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Police Officer Demo Session:
            </span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.72rem', color: 'var(--accent-text)', gap: '0.35rem' }}
            >
              <Sparkles size={12} /> Auto-fill Officer Credentials
            </button>
          </div>

          {/* Mandatory Administrator Access Notice per user prompt */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem',
              lineHeight: 1.45
            }}
          >
            <AlertCircle size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Access Provisioning Notice:</strong>
              <p style={{ color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Contact your system administrator for access. Public user registration is disabled for this platform.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom subtle compliance note with prototype disclaimer */}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={13} style={{ color: 'var(--accent-text)' }} />
            <span>Telangana Police Collision Investigation Division • Authorized Personnel Access</span>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
            Prototype interface — not an official Telangana Police system.
          </span>
        </div>
      </div>

      {/* Right Visual Panel (Restricted Police Investigation) */}
      <div
        style={{
          flex: '1 1 500px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderLeft: '1px solid var(--border-subtle)',
          padding: '3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="auth-visual-panel"
      >
        <div style={{ maxWidth: '440px', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--accent-surface)',
              color: 'var(--accent-text)',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '1.5rem'
            }}
          >
            Collision Investigation Division
          </div>

          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              lineHeight: 1.25,
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em'
            }}
          >
            Restricted Police Accident Investigation & Evidence Analysis Platform
          </h2>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            AccidentIQ equips authorized police traffic investigation units to catalog photographic evidence, cross-examine driver statements, construct 2D kinematic trajectory models, and maintain verifiable investigation dossiers.
          </p>

          {/* Institutional Evidentiary Standards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span className="badge badge-observed" style={{ minWidth: '85px', textAlign: 'center' }}>OBSERVED</span>
              <span>Photographic evidence, crush profiles & physical marks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span className="badge badge-reported" style={{ minWidth: '85px', textAlign: 'center' }}>REPORTED</span>
              <span>Officer on-scene logs & participant statements</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span className="badge badge-inferred" style={{ minWidth: '85px', textAlign: 'center' }}>INFERRED</span>
              <span>2D Kinematic trajectory models & speed differentials</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 900px) {
          .auth-visual-panel {
            display: none !important;
          }
          .auth-form-container {
            padding: 2rem 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};
