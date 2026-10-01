import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Car,
  User,
  Users,
  AlertOctagon,
  AlertTriangle,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CloudSun,
  Shield,
  Loader2,
  Sparkles,
  FileText,
  BadgeCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { supabase } from '../lib/supabase';
import {
  AccidentType,
  Participant,
  EvidenceFile,
  AccidentCase
} from '../types';
import { ParticipantCard } from '../components/cases/ParticipantCard';
import { EvidenceUploader } from '../components/cases/EvidenceUploader';

export const NewCasePage: React.FC = () => {
  const navigate = useNavigate();
  const { id: editCaseId } = useParams<{ id?: string }>();
  const isEditMode = Boolean(editCaseId);
  const { refreshCases } = useCases();

  const [isLoadingCase, setIsLoadingCase] = useState<boolean>(isEditMode);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);

  // Form State
  const [caseId, setCaseId] = useState('ACC-2026-001');
  const [title, setTitle] = useState('Grand Avenue Collision Investigation');
  const [status, setStatus] = useState('active');
  const [accidentType, setAccidentType] = useState<AccidentType>('vehicle_vs_vehicle');
  const [incidentDate, setIncidentDate] = useState('2026-10-01');
  const [incidentTime, setIncidentTime] = useState('14:30');
  const [location, setLocation] = useState('Grand Avenue at 8th Street Intersection');
  const [weatherConditions, setWeatherConditions] = useState('Clear daylight, dry asphalt surface');
  const [userNarrative, setUserNarrative] = useState(
    'Investigating Officer On-Scene Log: Responding patrol units noted Vehicle A was travelling northbound along Grand Avenue. Vehicle B entered intersection from 8th Street without coming to a complete stop, resulting in front-quarter impact with Vehicle A.'
  );

  // Dynamic Participants State
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'p-new-1',
      label: 'Vehicle A — Silver Sedan',
      type: 'vehicle',
      role: 'driver',
      vehicleDetails: {
        registrationNumber: '6WKD-219',
        vehicleType: 'Sedan',
        makeModel: '2022 Hyundai Elantra',
        driverName: 'Jonathan Davis',
        ownerName: 'Jonathan Davis'
      }
    },
    {
      id: 'p-new-2',
      label: 'Vehicle B — Black SUV',
      type: 'vehicle',
      role: 'driver',
      vehicleDetails: {
        registrationNumber: '8PLM-402',
        vehicleType: 'Compact SUV',
        makeModel: '2020 Jeep Cherokee',
        driverName: 'Rebecca Thorne'
      }
    }
  ]);

  // Evidence Files State & Database Case Anchor
  const [evidenceList, setEvidenceList] = useState<EvidenceFile[]>([]);
  const [caseDbId, setCaseDbId] = useState<string | undefined>(undefined);

  // Load existing case in edit mode, or generate next unique case number for new case
  useEffect(() => {
    if (isEditMode && editCaseId) {
      async function loadExistingCase() {
        try {
          setIsLoadingCase(true);
          setErrorMessage(null);

          const { data: { user }, error: authErr } = await supabase.auth.getUser();
          if (authErr || !user) {
            navigate('/login');
            return;
          }

          const { data: caseRow, error: fetchErr } = await supabase
            .from('accident_cases')
            .select('*, evidence(*)')
            .or(`id.eq.${editCaseId},case_number.eq.${editCaseId}`)
            .maybeSingle();

          if (fetchErr || !caseRow) {
            console.error('Case lookup error:', fetchErr);
            setErrorMessage('Investigation case not found or has been removed.');
            setIsAuthorized(false);
            return;
          }

          // Verify assigned_officer_id authorization
          if (caseRow.assigned_officer_id && caseRow.assigned_officer_id !== user.id) {
            setErrorMessage('Access denied. Only the assigned investigating officer can edit this case.');
            setIsAuthorized(false);
            return;
          }

          setCaseDbId(caseRow.id);
          setCaseId(caseRow.case_number);
          setTitle(caseRow.title || '');
          setAccidentType((caseRow.accident_type as AccidentType) || 'vehicle_vs_vehicle');
          setLocation(caseRow.location || '');
          setIncidentDate(caseRow.incident_date || '');
          setUserNarrative(caseRow.description || '');
          setStatus(caseRow.status || 'active');

          if (Array.isArray(caseRow.evidence) && caseRow.evidence.length > 0) {
            const mappedEv: EvidenceFile[] = caseRow.evidence.map((ev: any) => {
              const sizeMb = ev.file_size ? (Number(ev.file_size) / (1024 * 1024)).toFixed(1) : '1.0';
              return {
                id: ev.id,
                caseId: ev.case_id,
                evidenceType: ev.evidence_type || 'photo',
                fileName: ev.file_name,
                filePath: ev.file_path,
                fileSize: `${sizeMb} MB`,
                mimeType: ev.mime_type,
                rawSize: ev.file_size,
                uploadedAt: ev.created_at ? new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved',
                thumbnailUrl: '',
                classification: ev.evidence_type === 'voice_statement' ? 'REPORTED' : 'OBSERVED',
                tags: [(ev.evidence_type || 'Evidence').replace(/_/g, ' ').toUpperCase()],
                perspective: '',
                notes: ''
              };
            });
            setEvidenceList(mappedEv);
          }
        } catch (err: unknown) {
          console.error('Error loading case for edit:', err);
          setErrorMessage('An unexpected error occurred while loading this case.');
          setIsAuthorized(false);
        } finally {
          setIsLoadingCase(false);
        }
      }

      loadExistingCase();
    } else {
      async function initCaseNumber() {
        try {
          const currentYear = new Date().getFullYear();
          const prefix = `ACC-${currentYear}-`;
          const { data, error } = await supabase
            .from('accident_cases')
            .select('case_number')
            .ilike('case_number', `${prefix}%`);

          if (!error && data) {
            let maxNum = 0;
            data.forEach((row) => {
              if (row.case_number) {
                const parts = row.case_number.split('-');
                const num = parseInt(parts[parts.length - 1], 10);
                if (!isNaN(num) && num > maxNum) {
                  maxNum = num;
                }
              }
            });
            setCaseId(`${prefix}${String(maxNum + 1).padStart(3, '0')}`);
          }
        } catch (err) {
          console.warn('Could not auto-generate case sequence number:', err);
        }
      }
      initCaseNumber();
    }
  }, [editCaseId, isEditMode, navigate]);

  // Ensure an accident_cases database record exists so evidence foreign key succeeds
  const handleEnsureCaseDbId = async (): Promise<string> => {
    if (caseDbId) return caseDbId;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required. Please sign in to upload evidence.');
    }

    const caseTitle = location.trim()
      ? `${location.split(',')[0].trim()} Collision Investigation`
      : 'Collision Investigation';

    const { data, error } = await supabase
      .from('accident_cases')
      .insert({
        case_number: caseId,
        title: caseTitle,
        accident_type: accidentType,
        location: location.trim(),
        incident_date: incidentDate,
        description: userNarrative.trim(),
        assigned_officer_id: user.id,
        status: 'active'
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Failed to pre-create case anchor for evidence:', error);
      throw new Error('Unable to create case anchor for evidence. Please try again.');
    }

    setCaseDbId(data.id);
    return data.id;
  };

  // Handle participant type presets when accident type changes
  const handleAccidentTypeSelect = (type: AccidentType) => {
    setAccidentType(type);
    if (type === 'vehicle_vs_pedestrian') {
      setParticipants([
        {
          id: 'p-new-1',
          label: 'Vehicle 1 — Patrol / Civilian Vehicle',
          type: 'vehicle',
          role: 'driver',
          vehicleDetails: {
            vehicleType: 'Sedan',
            registrationNumber: '5XYZ-123'
          }
        },
        {
          id: 'p-new-2',
          label: 'Participant 2 — Pedestrian',
          type: 'pedestrian',
          role: 'pedestrian',
          pedestrianDetails: {
            reportedActivity: 'Crossing at designated crosswalk'
          }
        }
      ]);
    } else if (type === 'vehicle_vs_object') {
      setParticipants([
        {
          id: 'p-new-1',
          label: 'Vehicle 1',
          type: 'vehicle',
          role: 'driver',
          vehicleDetails: {
            vehicleType: 'Passenger Vehicle'
          }
        },
        {
          id: 'p-new-2',
          label: 'Fixed Obstacle — Road Fixture',
          type: 'other',
          role: 'other',
          otherDetails: {
            description: 'Guardrail / Concrete barrier / Utility pole'
          }
        }
      ]);
    }
  };

  const handleAddParticipant = () => {
    const newId = `p-new-${Date.now()}`;
    const newParticipant: Participant = {
      id: newId,
      label: `Participant ${participants.length + 1}`,
      type: 'vehicle',
      role: 'driver',
      vehicleDetails: {
        vehicleType: 'Vehicle'
      }
    };
    setParticipants([...participants, newParticipant]);
  };

  const handleUpdateParticipant = (updated: Participant) => {
    setParticipants(participants.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleAddEvidenceFiles = (files: EvidenceFile[]) => {
    setEvidenceList((prev) => [...prev, ...files]);
  };

  const handleRemoveEvidenceFile = (id: string) => {
    setEvidenceList((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdateEvidenceFile = (updated: EvidenceFile) => {
    setEvidenceList((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleAddSamplePhotos = () => {
    const samples: EvidenceFile[] = [
      {
        id: `ev-sample-${Date.now()}-1`,
        evidenceType: 'photo',
        fileName: 'POLICE_SCENE_001_Overview.jpg',
        fileSize: '3.9 MB',
        uploadedAt: 'Just now',
        thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="140">
            <rect width="200" height="140" fill="#1e293b"/>
            <rect x="20" y="40" width="160" height="60" rx="4" fill="#0f172a" stroke="#475569"/>
            <path d="M40 90 L80 50 L120 80 Z" fill="#ef4444" opacity="0.6"/>
            <circle cx="100" cy="70" r="14" fill="none" stroke="#f59e0b" stroke-width="2"/>
            <rect x="0" y="115" width="200" height="25" fill="#090d16" opacity="0.85"/>
            <text x="10" y="132" fill="#e2e8f0" font-size="10" font-family="sans-serif">DAMAGE PROFILE A</text>
          </svg>
        `)}`,
        classification: 'OBSERVED',
        tags: ['Quarter Panel', 'Crush Contour'],
        perspective: 'Front Right 45°'
      },
      {
        id: `ev-sample-${Date.now()}-2`,
        evidenceType: 'photo',
        fileName: 'POLICE_SCENE_002_Tire_Scrub.jpg',
        fileSize: '4.4 MB',
        uploadedAt: 'Just now',
        thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="140">
            <rect width="200" height="140" fill="#0f172a"/>
            <line x1="20" y1="70" x2="180" y2="70" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 4"/>
            <circle cx="100" cy="70" r="16" fill="#ef4444" opacity="0.4"/>
            <rect x="0" y="115" width="200" height="25" fill="#090d16" opacity="0.85"/>
            <text x="10" y="132" fill="#e2e8f0" font-size="10" font-family="sans-serif">TIRE SCRUB & IMPACT BOX</text>
          </svg>
        `)}`,
        classification: 'OBSERVED',
        tags: ['Tire Scrub', 'Debris Cone'],
        perspective: 'Roadway Top-Down'
      }
    ];
    setEvidenceList((prev) => [...prev, ...samples]);
  };

  // Save and Error State
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // 1. Authenticated user verification
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setErrorMessage('Authentication required. Please sign in to file or update an investigation case.');
        setIsSaving(false);
        return;
      }

      // Title formatting
      const finalTitle = title.trim() || (location.trim()
        ? `${location.split(',')[0].trim()} Collision Investigation`
        : 'Collision Investigation');

      // 2. Handle EDIT MODE vs NEW CASE
      if (isEditMode && caseDbId) {
        // Strict assigned_officer_id verification in Supabase update query
        const { error: updateError } = await supabase
          .from('accident_cases')
          .update({
            title: finalTitle,
            accident_type: accidentType,
            location: location.trim(),
            incident_date: incidentDate,
            description: userNarrative.trim(),
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', caseDbId)
          .eq('assigned_officer_id', user.id);

        if (updateError) {
          console.error('Failed to update accident case in Supabase:', updateError);
          setErrorMessage(updateError.message || 'Unable to save case changes. Please verify permissions and try again.');
          setIsSaving(false);
          return;
        }

        setSuccessMessage(`Case ${caseId} updated successfully.`);
        await refreshCases();

        setTimeout(() => {
          navigate('/dashboard', { state: { message: `Case ${caseId} updated successfully.` } });
        }, 600);
        return;
      }

      // 3. NEW CASE CREATION FLOW
      const currentYear = new Date().getFullYear();
      const prefix = `ACC-${currentYear}-`;
      const { data: existingCases } = await supabase
        .from('accident_cases')
        .select('case_number')
        .ilike('case_number', `${prefix}%`);

      let maxNum = 0;
      const existingSet = new Set<string>();

      if (existingCases) {
        existingCases.forEach((row) => {
          if (row.case_number) {
            existingSet.add(row.case_number);
            const parts = row.case_number.split('-');
            const num = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        });
      }

      let finalCaseNumber = caseId;
      if (existingSet.has(finalCaseNumber) || !finalCaseNumber) {
        finalCaseNumber = `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
        setCaseId(finalCaseNumber);
      }

      if (caseDbId) {
        // Case anchor was already pre-created when uploading evidence
        const { error: updateError } = await supabase
          .from('accident_cases')
          .update({
            case_number: finalCaseNumber,
            title: finalTitle,
            accident_type: accidentType,
            location: location.trim(),
            incident_date: incidentDate,
            description: userNarrative.trim(),
            status: status || 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', caseDbId);

        if (updateError) {
          console.error('Failed to update accident case anchor in Supabase:', updateError);
          setErrorMessage('Unable to save the case right now. Please check your network connection and try again.');
          setIsSaving(false);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from('accident_cases')
          .insert({
            case_number: finalCaseNumber,
            title: finalTitle,
            accident_type: accidentType,
            location: location.trim(),
            incident_date: incidentDate,
            description: userNarrative.trim(),
            assigned_officer_id: user.id,
            status: status || 'active'
          });

        if (insertError) {
          console.error('Failed to save accident case to Supabase:', insertError);
          setErrorMessage('Unable to save the case right now. Please check your network connection and try again.');
          setIsSaving(false);
          return;
        }
      }

      // Success handling
      setSuccessMessage(`Case ${finalCaseNumber} saved successfully.`);
      await refreshCases();

      setTimeout(() => {
        navigate('/dashboard', { state: { message: `Case ${finalCaseNumber} created successfully.` } });
      }, 700);
    } catch (err: unknown) {
      console.error('Unexpected error submitting case:', err);
      setErrorMessage('A network error occurred while submitting the case. Please try again.');
      setIsSaving(false);
    }
  };

  const accidentTypeOptions = [
    { id: 'vehicle_vs_vehicle', label: 'Vehicle vs Vehicle', icon: Car, desc: 'Collision between two passenger or commercial vehicles' },
    { id: 'vehicle_vs_pedestrian', label: 'Vehicle vs Pedestrian', icon: User, desc: 'Incident involving vehicle and pedestrian or runner' },
    { id: 'vehicle_vs_multiple', label: 'Multiple Participants', icon: Users, desc: 'Chain collision or multi-car expressway pileup' },
    { id: 'vehicle_vs_object', label: 'Vehicle vs Object', icon: AlertOctagon, desc: 'Impact with guardrail, tree, pole, or barrier' },
    { id: 'complex', label: 'Complex Accident', icon: AlertTriangle, desc: 'Intersection pileup with multiple vehicle categories' }
  ] as const;

  if (isLoadingCase) {
    return (
      <div style={{ maxWidth: '920px', margin: '4rem auto', textAlign: 'center', padding: '3rem' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Loading Investigation Case...
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Retrieving case records, incident information, and evidence.
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div
        style={{
          maxWidth: '580px',
          margin: '4rem auto',
          padding: '2.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}
        >
          <AlertCircle size={24} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Access Denied
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          {errorMessage || 'You are not authorized to edit this case. Only the assigned investigating officer can edit case records.'}
        </p>
        <Link to="/dashboard" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title & Header */}
      <div>
        {isEditMode && (
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--accent-text)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            {isEditMode ? 'EDIT CASE RECORD' : 'OFFICIAL POLICE FILING'}
          </span>
          <span style={{ color: 'var(--border-strong)' }}>•</span>
          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Case Ref: {caseId}
          </span>
        </div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          {isEditMode ? 'Edit Accident Case' : 'New Accident Investigation'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isEditMode
            ? 'Update investigation particulars, status, narrative, and attached evidence.'
            : 'Record participants, incident information, and available evidence.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* ==============================================================
            SECTION 1 — ACCIDENT TYPE
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div>
              <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
                01 / ACCIDENT TYPE
              </span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                Incident Classification
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Select collision configuration
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.75rem'
            }}
          >
            {accidentTypeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = accidentType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleAccidentTypeSelect(opt.id as AccidentType)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    backgroundColor: isSelected ? 'var(--accent-surface)' : 'var(--bg-canvas-subtle)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: isSelected ? 'var(--accent-text)' : 'var(--text-primary)', marginBottom: '0.15rem' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', lineHeight: 1.35 }}>
                      {opt.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ==============================================================
            SECTION 2 — PARTICIPANTS
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>
                02 / PARTICIPANTS
              </span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                Participants Involved
              </h2>
            </div>

            <button
              type="button"
              onClick={handleAddParticipant}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <Plus size={14} />
              <span>Add Participant</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {participants.map((p, index) => (
              <ParticipantCard
                key={p.id}
                participant={p}
                index={index}
                onUpdate={handleUpdateParticipant}
                onRemove={handleRemoveParticipant}
                canRemove={participants.length > 1}
              />
            ))}
          </div>
        </section>

        {/* ==============================================================
            SECTION 3 — ACCIDENT INFORMATION
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
              03 / ACCIDENT INFORMATION
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Accident Information & Conditions
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="case-id-display">
                <span>Case ID (Assigned)</span>
              </label>
              <input
                id="case-id-display"
                type="text"
                readOnly
                className="form-input mono"
                value={caseId}
                style={{ backgroundColor: 'var(--bg-canvas-subtle)', opacity: 0.9 }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="case-status">
                <span>Investigation Status *</span>
              </label>
              <select
                id="case-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active Investigation</option>
                <option value="pending_review">Pending Review</option>
                <option value="completed">Completed / Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="incident-date">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} /> Accident Date *
                </span>
              </label>
              <input
                id="incident-date"
                type="date"
                required
                className="form-input"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="incident-time">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={13} /> Accident Time *
                </span>
              </label>
              <input
                id="incident-time"
                type="time"
                required
                className="form-input"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="case-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={13} /> Investigation Title *
                </span>
              </label>
              <input
                id="case-title"
                type="text"
                required
                placeholder="e.g. Grand Avenue Collision Investigation"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="incident-location">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} /> Location / Intersection *
                </span>
              </label>
              <input
                id="incident-location"
                type="text"
                required
                placeholder="e.g. Intersection of 4th Ave & Market St, Metro District"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="weather-conditions">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CloudSun size={13} /> Road & Environmental Conditions (optional)
                </span>
              </label>
              <input
                id="weather-conditions"
                type="text"
                placeholder="e.g. Twilight drizzle, wet asphalt, overhead municipal streetlights active"
                className="form-input"
                value={weatherConditions}
                onChange={(e) => setWeatherConditions(e.target.value)}
              />
            </div>
          </div>

          {/* Narrative textarea */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="incident-narrative">
              <span>What happened? *</span>
            </label>
            <textarea
              id="incident-narrative"
              required
              rows={4}
              className="form-textarea"
              placeholder="Describe what occurred before, during, and after the accident. Include travel vectors, driver statements, and physical point of rest."
              value={userNarrative}
              onChange={(e) => setUserNarrative(e.target.value)}
            />
            <span className="form-helper" style={{ marginTop: '0.35rem', color: 'var(--text-tertiary)' }}>
              Record the reported sequence of events as described by the officer or available evidence.
            </span>
          </div>
        </section>

        {/* ==============================================================
            SECTION 4 — EVIDENCE
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
              04 / EVIDENCE
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Photographic Scene Evidence
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
              Upload multi-angle police scene captures, vehicle crush close-ups, and tire marks.
            </p>
          </div>

          <EvidenceUploader
            evidenceList={evidenceList}
            onAddFiles={handleAddEvidenceFiles}
            onRemoveFile={handleRemoveEvidenceFile}
            onAddSamplePhotos={handleAddSamplePhotos}
            onUpdateFile={handleUpdateEvidenceFile}
            caseId={caseId}
            caseDbId={caseDbId}
            onEnsureCaseDbId={handleEnsureCaseDbId}
          />
        </section>

        {/* ==============================================================
            SECTION 5 — ANALYSIS
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
              05 / ANALYSIS
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Forensic Evidence Analysis & Filing
            </h2>
          </div>

          <div className="ai-notice-banner">
            <Shield size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Police Evidentiary Classification Notice: </strong>
              The system organizes and analyzes supplied evidence into the strict 4-pillar model (OBSERVED, REPORTED, INFERRED, UNKNOWN).
              It is an investigation aid and does not constitute a judicial legal finding.
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                lineHeight: 1.45
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="alert"
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                lineHeight: 1.45
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary btn-lg"
            style={{ padding: '0.9rem', width: '100%', fontSize: '1rem', fontWeight: 700, gap: '0.65rem' }}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{isEditMode ? 'Updating case...' : 'Saving case...'}</span>
              </>
            ) : (
              <>
                <Shield size={16} />
                <span>{isEditMode ? 'Update Accident Case' : 'Save Case'}</span>
              </>
            )}
          </button>
        </section>
      </form>
    </div>
  );
};
