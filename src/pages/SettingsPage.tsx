import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Laptop,
  User,
  Shield,
  Sliders,
  Database,
  Lock,
  CheckCircle2,
  Save
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeSelector } from '../components/common/ThemeSelector';
import { TelanganaPoliceLogo } from '../components/common/TelanganaPoliceLogo';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  // Settings State - Official Police Credentials & Profile
  const [officerName, setOfficerName] = useState('Officer A. Sharma');
  const [officialEmail, setOfficialEmail] = useState('a.sharma@police.gov');
  const [policeId, setPoliceId] = useState('CIU-4921');
  const [division, setDivision] = useState('Major Collision Investigation Unit');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [aiConfidence, setAiConfidence] = useState<'conservative' | 'standard' | 'comprehensive'>('standard');
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Settings & Preferences
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Manage your authorized officer credentials, interface theme, kinematic measurement units, and security parameters.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* ==============================================================
            0. INSTITUTIONAL ORGANIZATION DETAILS (Telangana Police)
            ============================================================== */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
                INSTITUTIONAL AFFILIATION
              </span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', marginBottom: '0.2rem' }}>
                Telangana Police Administration
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Designated police organization and active jurisdictional deployment unit.
              </p>
            </div>
            <TelanganaPoliceLogo size={36} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Organization
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px' }}>
                Telangana Police
              </div>
            </div>

            <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Unit
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px' }}>
                Accident Investigation Unit
              </div>
            </div>

            <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Access Clearance
              </span>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-text)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Shield size={13} />
                <span>Authorized Personnel</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-canvas-subtle)', border: '1px dashed var(--border-medium)', fontSize: '0.74rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Prototype interface — not an official Telangana Police system.
          </div>
        </section>
        {/* ==============================================================
            1. APPEARANCE (Light, Dark, System)
            ============================================================== */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              01 / APPEARANCE
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', marginBottom: '0.2rem' }}>
              Interface Theme
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Choose your theme presentation (Light, Dark, or System default). Your selection is persisted securely in local storage.
            </p>
          </div>

          <ThemeSelector />
        </section>

        {/* ==============================================================
            2. ACCOUNT (Officer Name, Official Email, Police ID)
            ============================================================== */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              02 / CREDENTIALS
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', marginBottom: '0.2rem' }}>
              Officer Account Information
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Authorized law enforcement credentials stamped onto official collision dossiers and exported reports.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">Officer Name</label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-email">Official Email</label>
              <input
                id="settings-email"
                type="email"
                className="form-input"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-badge">Police ID</label>
              <input
                id="settings-badge"
                type="text"
                className="form-input mono"
                value={policeId}
                onChange={(e) => setPoliceId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-dept">Division / Unit</label>
              <input
                id="settings-dept"
                type="text"
                className="form-input"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ==============================================================
            3. SECURITY & ACCESS LEVEL (Session info, Last login, Access level)
            ============================================================== */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              03 / SECURITY
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', marginBottom: '0.2rem' }}>
              Security & Access Level
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Police workstation session state, authentication audit logs, and evidentiary clearance level.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
            {/* Session Info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Session Information</div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                  Session ID: <span style={{ color: 'var(--accent-text)' }}>POL-AUTH-84920-SECURE</span> (Encrypted local session)
                </div>
              </div>
              <span className="badge badge-observed" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Shield size={12} /> Active & Authenticated
              </span>
            </div>

            {/* Last Login (Mock) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Last Login (Mock)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                  Terminal ID #POL-WS-849 • 2026-10-01 08:42:15 IST (Police Intranet)
                </div>
              </div>
              <span className="badge badge-neutral">Audited</span>
            </div>

            {/* Access Level */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Access Level</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                  Clearance: Tier 2 Certified Collision Investigator (Full Case Dossier & Reconstruction Authorization)
                </div>
              </div>
              <span className="badge badge-inferred">Restricted Tier 2</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>System Administrator Notice: </span>
            Role assignments, multi-factor credential revoking, and badge reallocations must be authorized through your department's designated system administrator. Self-provisioning of higher security clearance is restricted.
          </div>
        </section>

        {/* ==============================================================
            4. KINEMATIC & INVESTIGATION PREFERENCES
            ============================================================== */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
              04 / KINEMATICS
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', marginBottom: '0.2rem' }}>
              Kinematic Preferences
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Configure unit system and evidentiary inference sensitivity for 2D scene visualizations.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Speed & Distance Units */}
            <div>
              <label className="form-label">Measurement System</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setUnits('metric')}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.825rem',
                    fontWeight: units === 'metric' ? 600 : 500,
                    backgroundColor: units === 'metric' ? 'var(--accent-surface)' : 'var(--bg-canvas-subtle)',
                    color: units === 'metric' ? 'var(--accent-text)' : 'var(--text-secondary)',
                    border: `1.5px solid ${units === 'metric' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer'
                  }}
                >
                  Metric (km/h, meters)
                </button>
                <button
                  type="button"
                  onClick={() => setUnits('imperial')}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.825rem',
                    fontWeight: units === 'imperial' ? 600 : 500,
                    backgroundColor: units === 'imperial' ? 'var(--accent-surface)' : 'var(--bg-canvas-subtle)',
                    color: units === 'imperial' ? 'var(--accent-text)' : 'var(--text-secondary)',
                    border: `1.5px solid ${units === 'imperial' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer'
                  }}
                >
                  Imperial (mph, feet)
                </button>
              </div>
            </div>

            {/* AI Confidence Mode */}
            <div>
              <label className="form-label">Inference Threshold</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.35rem' }}>
                {[
                  { id: 'conservative', label: 'Conservative', desc: 'Strict classification; requires high photographic certainty' },
                  { id: 'standard', label: 'Standard (Recommended)', desc: 'Balanced triangulation with standard uncertainty tolerances' },
                  { id: 'comprehensive', label: 'Comprehensive', desc: 'Broader hypothesis modeling for complex multi-car collisions' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setAiConfidence(mode.id as any)}
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: aiConfidence === mode.id ? 'var(--accent-surface)' : 'var(--bg-canvas-subtle)',
                      border: `1.5px solid ${aiConfidence === mode.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: aiConfidence === mode.id ? 'var(--accent-text)' : 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {mode.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>
                      {mode.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Save Changes Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
          {saveToast && (
            <span style={{ fontSize: '0.825rem', color: 'var(--tag-observed-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} /> Preferences Saved Successfully
            </span>
          )}
          <button type="submit" className="btn btn-primary" style={{ gap: '0.5rem', padding: '0.75rem 1.75rem' }}>
            <Save size={16} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
