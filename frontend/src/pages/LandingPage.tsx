import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Layers,
  Activity,
  FileCheck,
  AlertTriangle,
  Camera,
  Cpu,
  Lock,
  UserCheck,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
  Compass
} from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { TelanganaPoliceLogo } from '../components/common/TelanganaPoliceLogo';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Restricted Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(8px)'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '68px'
          }}
        >
          {/* Official Telangana Police + AccidentIQ Header Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <TelanganaPoliceLogo size={32} />
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                TELANGANA POLICE
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  ACCIDENT<span style={{ color: 'var(--accent-text)' }}>IQ</span>
                </span>
                <span
                  style={{
                    fontSize: '0.58rem',
                    padding: '0.08rem 0.35rem',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--accent-surface)',
                    color: 'var(--accent-text)',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}
                >
                  RESTRICTED
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation links & Secure Access CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="nav-links-desktop">
              <a href="#capabilities" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Capabilities
              </a>
              <a href="#principles" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Evidentiary Framework
              </a>
              <a href="#security" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Security Notice
              </a>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ThemeToggle compact={true} />
              <Link to="/login" className="btn btn-primary btn-sm" style={{ gap: '0.45rem' }}>
                <Lock size={13} />
                <span>Secure Police Login</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main style={{ flex: 1 }}>
        {/* HERO SECTION */}
        <section style={{ padding: '4.5rem 0 3.5rem 0', position: 'relative', overflow: 'hidden' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '960px' }}>
            {/* Telangana Police Official Emblem */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  padding: '0.65rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <TelanganaPoliceLogo size={42} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    TELANGANA POLICE
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', letterSpacing: '0.02em' }}>
                    Accident Investigation Unit
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Label */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-surface)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent-text)',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '1.25rem'
              }}
            >
              <Lock size={12} style={{ color: 'var(--accent-primary)' }} />
              <span>Restricted Police Investigation Platform</span>
            </div>

            {/* Hero Main Heading & Brand Hierarchy */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem'
                }}
              >
                ACCIDENT<span style={{ color: 'var(--accent-primary)' }}>IQ</span>
              </h1>
              <div style={{ fontWeight: 600, fontSize: 'clamp(1.2rem, 2.8vw, 1.75rem)', color: 'var(--text-secondary)' }}>
                Multimodal Accident Evidence Analysis
              </div>
            </div>

            {/* Main Message */}
            <h2
              style={{
                fontSize: 'clamp(1.3rem, 2.6vw, 1.65rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '0.85rem',
                maxWidth: '720px',
                margin: '0 auto 0.85rem auto'
              }}
            >
              Turn accident evidence into a structured investigation.
            </h2>

            {/* Supporting Text strictly per product direction */}
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1.08rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: '740px',
                margin: '0 auto 2.25rem auto'
              }}
            >
              An AI-assisted accident investigation platform designed for authorized Telangana Police personnel to organize evidence, analyze incident information, and review possible accident sequences.
            </p>

            {/* Action Buttons: Primary CTA & Secondary CTA */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
              <Link to="/login" className="btn btn-primary btn-lg" style={{ gap: '0.65rem' }}>
                <Lock size={17} />
                <span>Secure Police Login</span>
                <ArrowRight size={17} />
              </Link>
              <a href="#capabilities" className="btn btn-secondary btn-lg" style={{ gap: '0.5rem' }}>
                <Compass size={17} />
                <span>Explore Platform</span>
              </a>
            </div>

            {/* Visual Product Preview Card */}
            <div
              className="card card-elevated"
              style={{
                textAlign: 'left',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-xl)',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              {/* Card Window Mock Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginLeft: '0.35rem' }}>
                    POLICE CASE #ACC-2026-001 • ASSIGNED: OFFICER A. SHARMA (CIU-4921)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <EvidenceBadge type="OBSERVED" size="sm" />
                  <EvidenceBadge type="INFERRED" size="sm" />
                  <span className="badge badge-observed">Analysis Complete</span>
                </div>
              </div>

              {/* Preview Body Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {/* Left Preview: Overview & Damage */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Official Investigation Overview
                    </span>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                      Investigative analysis indicates vehicle-pedestrian contact at a designated suburban crosswalk during twilight drizzle. Evidence demonstrates fabric contact smudge on vehicle hood and displaced driver wing mirror housing.
                    </p>
                  </div>

                  <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-canvas-subtle)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-text)', marginBottom: '0.2rem' }}>
                      Participant Plausible Actions & Evidentiary Citations
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Available photographic evidence indicates low-speed deceleration (~32 km/h braking). Stopping distance measured at 6.5 meters post-impact point.
                    </p>
                  </div>
                </div>

                {/* Right Preview: Mini Reconstruction & Timeline Preview */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Activity size={13} style={{ color: 'var(--accent-primary)' }} />
                      Possible Scene Reconstruction
                    </span>
                    <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                      2D KINEMATIC MODEL
                    </span>
                  </div>

                  {/* Simplified Mini Diagram */}
                  <div
                    style={{
                      height: '90px',
                      backgroundColor: 'var(--bg-canvas-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ position: 'absolute', width: '100%', height: '2px', backgroundColor: 'var(--road-line-yellow)' }} />
                    <div style={{ position: 'absolute', top: '15px', left: '46%', width: '8px', height: '60px', backgroundColor: '#ffffff', opacity: 0.7 }} />
                    <div style={{ position: 'absolute', top: '22px', left: '25%', width: '22px', height: '14px', backgroundColor: 'var(--accent-primary)', borderRadius: '3px' }} title="Vehicle 1" />
                    <div style={{ position: 'absolute', top: '38px', left: '47%', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ec4899' }} title="Pedestrian" />
                    <div style={{ position: 'absolute', top: '35px', left: '44%', width: '14px', height: '14px', borderRadius: '50%', border: '1px dashed #ef4444' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      6 Police Evidence Files Cataloged
                    </span>
                    <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
                      Explore Reconstruction →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM CAPABILITIES SECTION */}
        <section id="capabilities" style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem auto' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Platform Capabilities
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                Secure Collision Investigation Tools
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Engineered specifically for certified police collision investigators to process multi-participant accident evidence.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div className="card card-hover">
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
                  <Camera size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Multimodal Evidence Analysis
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Ingest vehicle damage photographs, roadway tire friction scrub marks, debris cones, and officer site inspection notes.
                </p>
              </div>

              <div className="card card-hover">
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-inferred-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tag-inferred-text)', marginBottom: '1rem' }}>
                  <UserCheck size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Participant & Vehicle Information
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Structured documentation for vehicles, pedestrians, cyclists, and fixed objects with confidential driver registration handling.
                </p>
              </div>

              <div className="card card-hover">
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-observed-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tag-observed-text)', marginBottom: '1rem' }}>
                  <Layers size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Evidence Classification
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Strict 4-tier evidentiary division distinguishing directly observed physical facts from reported testimonies and AI inferences.
                </p>
              </div>

              <div className="card card-hover">
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-canvas-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  <Activity size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Possible Event Sequence
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Chronological sequence mapping approach vectors, pre-impact maneuvers, probable impact time, and resting orientations.
                </p>
              </div>

              <div className="card card-hover">
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-text)', marginBottom: '1rem' }}>
                  <Compass size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Scene Reconstruction
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Interactive 2D kinematic scene visualizations with vector trajectories, debris field overlays, and step-by-step playback.
                </p>
              </div>

              <div className="card card-hover">
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-canvas-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  <FileSpreadsheet size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Persistent Investigation Reports
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Export-ready case dossiers with complete chain of custody records, officer attributions, and explicit forensic limitation disclosures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EVIDENTIARY PRINCIPLES SECTION */}
        <section id="principles" style={{ padding: '4rem 0', backgroundColor: 'var(--bg-canvas)' }}>
          <div className="container">
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Evidentiary Standards
                </span>
                <h2 style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                  The 4-Pillar Evidentiary Framework
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  To maintain evidentiary integrity in collision reports, every finding is classified under one of four distinct categories:
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-observed-bg)', border: '1px solid var(--tag-observed-border)' }}>
                  <span className="badge badge-observed" style={{ marginBottom: '0.5rem' }}>OBSERVED</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Information directly visible in the supplied photographic or physical evidence.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-reported-bg)', border: '1px solid var(--tag-reported-border)' }}>
                  <span className="badge badge-reported" style={{ marginBottom: '0.5rem' }}>REPORTED</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Information provided by the investigating officer, witness statements, or participants.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-inferred-bg)', border: '1px solid var(--tag-inferred-border)' }}>
                  <span className="badge badge-inferred" style={{ marginBottom: '0.5rem' }}>INFERRED</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    AI-generated interpretation derived from correlating available physical evidence.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--tag-unknown-bg)', border: '1px solid var(--tag-unknown-border)' }}>
                  <span className="badge badge-unknown" style={{ marginBottom: '0.5rem' }}>UNKNOWN</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Information that cannot be definitively established from the available evidence.
                  </p>
                </div>
              </div>

              {/* Responsible Investigation Principle Notice */}
              <div id="security" className="ai-notice-banner">
                <AlertTriangle size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Investigation Support Notice: </strong>
                  AccidentIQ is an evidence organization and trajectory visualization tool intended for authorized police personnel. It does not replace on-scene police investigation, mechanical inspections, forensic examination, or statutory judicial determinations. The system never declares legal fault.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Restricted Institutional Footer with Prototype Disclaimer */}
      <footer style={{ padding: '2rem 0', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <TelanganaPoliceLogo size={26} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                ACCIDENT<span style={{ color: 'var(--accent-text)' }}>IQ</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>
                  • Telangana Police Accident Investigation Unit
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Prototype interface — not an official Telangana Police system.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            <Link to="/login" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>
              Authorized Officer Login
            </Link>
            <span>CIU Investigation Framework</span>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
