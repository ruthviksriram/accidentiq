import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Video,
  Camera,
  Mic,
  Trash2,
  Plus,
  Sparkles,
  RefreshCw,
  FileVideo,
  FileAudio,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { EvidenceFile, CctvMetadata } from '../../types';
import { uploadEvidenceFile, deleteEvidenceFile, FILE_LIMITS } from '../../lib/evidenceService';

interface EvidenceUploaderProps {
  caseId?: string;
  caseDbId?: string;
  onEnsureCaseDbId?: () => Promise<string>;
  evidenceList: EvidenceFile[];
  onAddFiles: (files: EvidenceFile[]) => void;
  onRemoveFile: (id: string) => void;
  onAddSamplePhotos: () => void;
  onUpdateFile?: (file: EvidenceFile) => void;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  caseId,
  caseDbId,
  onEnsureCaseDbId,
  evidenceList,
  onAddFiles,
  onRemoveFile,
  onAddSamplePhotos,
  onUpdateFile
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const dashcamInputRef = useRef<HTMLInputElement>(null);
  const cctvInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  const [photoLoading, setPhotoLoading] = useState(false);
  const [dashcamLoading, setDashcamLoading] = useState(false);
  const [cctvLoading, setCctvLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [cctvMetadata, setCctvMetadata] = useState<CctvMetadata>({
    cameraId: '',
    cameraLocation: '',
    capturedDate: '',
    capturedTime: ''
  });

  // Filter evidence by structured type
  const photoFiles = evidenceList.filter((f) => !f.evidenceType || f.evidenceType === 'photo');
  const dashcamFile = evidenceList.find((f) => f.evidenceType === 'dashcam_video');
  const cctvFile = evidenceList.find((f) => f.evidenceType === 'cctv_video');
  const voiceFile = evidenceList.find((f) => f.evidenceType === 'voice_statement');

  // Helper to ensure target case UUID exists
  const getTargetCaseId = async (): Promise<string> => {
    if (caseDbId) return caseDbId;
    if (onEnsureCaseDbId) {
      return await onEnsureCaseDbId();
    }
    throw new Error('Case reference required for evidence upload.');
  };

  // Helper to safely remove evidence both locally and from storage/database
  const handleRemoveEvidenceItem = async (file: EvidenceFile) => {
    if (file.filePath) {
      try {
        await deleteEvidenceFile(file.id, file.filePath);
      } catch (err) {
        console.warn('Could not delete evidence file from storage/db:', err);
      }
    }
    onRemoveFile(file.id);
  };

  // Photo handlers
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || photoLoading) return;
    const files = Array.from(e.target.files);
    setUploadError(null);
    setPhotoLoading(true);

    try {
      const targetId = await getTargetCaseId();
      const uploadedItems: EvidenceFile[] = [];

      for (const file of files) {
        if (file.size > FILE_LIMITS.photo) {
          throw new Error('File exceeds the allowed 25MB limit for images.');
        }
        const item = await uploadEvidenceFile({
          file,
          caseId: targetId,
          evidenceType: 'photo'
        });
        uploadedItems.push(item);
      }
      onAddFiles(uploadedItems);
    } catch (err: unknown) {
      console.error('Photo upload failed:', err);
      const msg = err instanceof Error ? err.message : '';
      setUploadError(msg.includes('limit') ? msg : 'Unable to upload this evidence. Please try again.');
    } finally {
      setPhotoLoading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handlePhotoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0 || photoLoading) return;
    const files = Array.from(e.dataTransfer.files);
    setUploadError(null);
    setPhotoLoading(true);

    try {
      const targetId = await getTargetCaseId();
      const uploadedItems: EvidenceFile[] = [];

      for (const file of files) {
        if (file.size > FILE_LIMITS.photo) {
          throw new Error('File exceeds the allowed 25MB limit for images.');
        }
        const item = await uploadEvidenceFile({
          file,
          caseId: targetId,
          evidenceType: 'photo'
        });
        uploadedItems.push(item);
      }
      onAddFiles(uploadedItems);
    } catch (err: unknown) {
      console.error('Photo drop upload failed:', err);
      const msg = err instanceof Error ? err.message : '';
      setUploadError(msg.includes('limit') ? msg : 'Unable to upload this evidence. Please try again.');
    } finally {
      setPhotoLoading(false);
    }
  };

  // Dashcam Video handlers
  const handleDashcamChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || dashcamLoading) return;
    const file = e.target.files[0];
    setUploadError(null);
    setDashcamLoading(true);

    try {
      const targetId = await getTargetCaseId();

      if (file.size > FILE_LIMITS.dashcam_video) {
        throw new Error('File exceeds the allowed 100MB limit for dashcam videos.');
      }

      if (dashcamFile) {
        await handleRemoveEvidenceItem(dashcamFile);
      }

      const uploaded = await uploadEvidenceFile({
        file,
        caseId: targetId,
        evidenceType: 'dashcam_video'
      });
      onAddFiles([uploaded]);
    } catch (err: unknown) {
      console.error('Dashcam upload failed:', err);
      const msg = err instanceof Error ? err.message : '';
      setUploadError(msg.includes('limit') ? msg : 'Unable to upload this evidence. Please try again.');
    } finally {
      setDashcamLoading(false);
      if (dashcamInputRef.current) dashcamInputRef.current.value = '';
    }
  };

  const handleRemoveDashcam = async () => {
    if (dashcamFile) {
      await handleRemoveEvidenceItem(dashcamFile);
    }
    if (dashcamInputRef.current) {
      dashcamInputRef.current.value = '';
    }
  };

  const handleLoadSampleDashcam = () => {
    setDashcamLoading(true);
    setTimeout(() => {
      if (dashcamFile) {
        onRemoveFile(dashcamFile.id);
      }
      const sample: EvidenceFile = {
        id: `ev-dashcam-sample-${Date.now()}`,
        evidenceType: 'dashcam_video',
        fileName: 'DASHCAM_PATROL_4921_FORWARD.mp4',
        fileSize: '34.2 MB',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thumbnailUrl: '',
        classification: 'OBSERVED',
        tags: ['Dashcam', 'Forward Camera', 'Vehicle Video'],
        perspective: 'Vehicle Patrol Front Camera',
        notes: 'Cruiser mounted 1080p forward dashcam sequence'
      };
      onAddFiles([sample]);
      setDashcamLoading(false);
    }, 250);
  };

  // CCTV Video handlers
  const handleCctvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || cctvLoading) return;
    const file = e.target.files[0];
    setUploadError(null);
    setCctvLoading(true);

    try {
      const targetId = await getTargetCaseId();

      if (file.size > FILE_LIMITS.cctv_video) {
        throw new Error('File exceeds the allowed 100MB limit for CCTV videos.');
      }

      if (cctvFile) {
        await handleRemoveEvidenceItem(cctvFile);
      }

      const uploaded = await uploadEvidenceFile({
        file,
        caseId: targetId,
        evidenceType: 'cctv_video',
        metadata: { ...cctvMetadata }
      });
      onAddFiles([uploaded]);
    } catch (err: unknown) {
      console.error('CCTV upload failed:', err);
      const msg = err instanceof Error ? err.message : '';
      setUploadError(msg.includes('limit') ? msg : 'Unable to upload this evidence. Please try again.');
    } finally {
      setCctvLoading(false);
      if (cctvInputRef.current) cctvInputRef.current.value = '';
    }
  };

  const handleRemoveCctv = async () => {
    if (cctvFile) {
      await handleRemoveEvidenceItem(cctvFile);
    }
    if (cctvInputRef.current) {
      cctvInputRef.current.value = '';
    }
  };

  const handleLoadSampleCctv = () => {
    setCctvLoading(true);
    setTimeout(() => {
      if (cctvFile) {
        onRemoveFile(cctvFile.id);
      }
      const sampleMeta: CctvMetadata = {
        cameraId: 'CAM-402 (NW Quadrant)',
        cameraLocation: 'Intersection of 4th Ave & Main St',
        capturedDate: new Date().toISOString().substring(0, 10),
        capturedTime: '14:30'
      };
      setCctvMetadata(sampleMeta);

      const sample: EvidenceFile = {
        id: `ev-cctv-sample-${Date.now()}`,
        evidenceType: 'cctv_video',
        fileName: 'CCTV_TRAFFIC_CAM402_INTERSECTION.mp4',
        fileSize: '48.7 MB',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thumbnailUrl: '',
        classification: 'OBSERVED',
        tags: ['CCTV', 'Pole Mounted', 'Surveillance'],
        perspective: 'Northwest Quadrant Elevated Angle',
        notes: 'Municipal intersection surveillance feed',
        metadata: sampleMeta
      };
      onAddFiles([sample]);
      setCctvLoading(false);
    }, 250);
  };

  const handleCctvMetaChange = (field: keyof CctvMetadata, value: string) => {
    const updatedMeta = { ...cctvMetadata, [field]: value };
    setCctvMetadata(updatedMeta);
    if (cctvFile) {
      const updatedFile: EvidenceFile = {
        ...cctvFile,
        metadata: updatedMeta
      };
      if (onUpdateFile) {
        onUpdateFile(updatedFile);
      } else {
        onRemoveFile(cctvFile.id);
        onAddFiles([updatedFile]);
      }
    }
  };

  // Voice Statement handlers
  const handleVoiceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || voiceLoading) return;
    const file = e.target.files[0];
    setUploadError(null);
    setVoiceLoading(true);

    try {
      const targetId = await getTargetCaseId();

      if (file.size > FILE_LIMITS.voice_statement) {
        throw new Error('File exceeds the allowed 25MB limit for audio recordings.');
      }

      if (voiceFile) {
        await handleRemoveEvidenceItem(voiceFile);
      }

      const uploaded = await uploadEvidenceFile({
        file,
        caseId: targetId,
        evidenceType: 'voice_statement'
      });
      onAddFiles([uploaded]);
    } catch (err: unknown) {
      console.error('Voice statement upload failed:', err);
      const msg = err instanceof Error ? err.message : '';
      setUploadError(msg.includes('limit') ? msg : 'Unable to upload this evidence. Please try again.');
    } finally {
      setVoiceLoading(false);
      if (voiceInputRef.current) voiceInputRef.current.value = '';
    }
  };

  const handleRemoveVoice = async () => {
    if (voiceFile) {
      await handleRemoveEvidenceItem(voiceFile);
    }
    if (voiceInputRef.current) {
      voiceInputRef.current.value = '';
    }
  };

  const handleLoadSampleVoice = () => {
    setVoiceLoading(true);
    setTimeout(() => {
      if (voiceFile) {
        onRemoveFile(voiceFile.id);
      }
      const sample: EvidenceFile = {
        id: `ev-voice-sample-${Date.now()}`,
        evidenceType: 'voice_statement',
        fileName: 'OFFICER_ONSCENE_DICTATION_4921.m4a',
        fileSize: '4.8 MB',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thumbnailUrl: '',
        classification: 'REPORTED',
        tags: ['Voice Statement', 'Officer Dictation'],
        perspective: 'On-scene preliminary verbal memo',
        notes: 'Investigating officer immediate field summary dictation'
      };
      onAddFiles([sample]);
      setVoiceLoading(false);
    }, 250);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {uploadError && (
        <div
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            lineHeight: 1.45
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ==============================================================
          STREAM 1: ACCIDENT PHOTOS (DRAG & DROP ZONE)
          ============================================================== */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Accident Photos
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Upload multi-angle police captures, vehicle crush close-ups, and tire scrub marks.
            </p>
          </div>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handlePhotoDrop}
          onClick={() => {
            if (!photoLoading) photoInputRef.current?.click();
          }}
          style={{
            border: '2px dashed var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '2.25rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-canvas-subtle)',
            cursor: photoLoading ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-fast)',
            opacity: photoLoading ? 0.7 : 1
          }}
          className="upload-dropzone"
        >
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={photoLoading}
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />

          {photoLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', padding: '1rem 0' }}>
              <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>Uploading...</span>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-surface)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  margin: '0 auto 0.85rem auto'
                }}
              >
                <UploadCloud size={24} />
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                Drag and drop accident photographs here
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.9rem' }}>
                Supports high-resolution JPG, PNG, WEBP, and RAW camera captures up to 25MB each.
              </p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="btn btn-secondary btn-sm">
                  <Plus size={14} /> Browse Photo Files
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSamplePhotos();
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--accent-text)', border: '1px dashed var(--accent-border)' }}
                >
                  <Sparkles size={13} /> Load Sample Crash Photos
                </button>
              </div>
            </>
          )}
        </div>

        {/* Uploaded Photographs Gallery */}
        {photoFiles.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Ingested Photo Evidence ({photoFiles.length})
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--tag-observed-text)', fontWeight: 600 }}>
                All photographic files classified as OBSERVED
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '0.85rem'
              }}
            >
              {photoFiles.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      height: '110px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      backgroundColor: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.fileName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      className="badge badge-observed"
                      style={{ position: 'absolute', top: '6px', left: '6px', fontSize: '0.62rem' }}
                    >
                      OBSERVED
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.4rem' }}>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                        <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--accent-text)', fontWeight: 700 }}>
                          {item.id}
                        </span>
                        <span style={{ fontSize: '0.65rem', padding: '0.05rem 0.3rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-canvas-subtle)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }}>
                          {item.fileName.split('.').pop()?.toUpperCase() || 'JPG'}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={item.fileName}
                      >
                        {item.fileName}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                          {item.fileSize} • {item.uploadedAt}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--tag-observed-text)', fontWeight: 600 }}>
                          ● Ingested
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveEvidenceItem(item)}
                      className="btn btn-ghost"
                      style={{
                        padding: '0.3rem',
                        color: 'var(--danger-text)',
                        borderRadius: 'var(--radius-xs)',
                        flexShrink: 0
                      }}
                      title="Remove Evidence"
                      aria-label="Remove evidence photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==============================================================
          MULTIMODAL STREAMS: DASHCAM, CCTV, AND VOICE STATEMENT
          ============================================================== */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Additional Multimodal Evidence
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Ingest vehicle-mounted recordings, external municipal surveillance, and verbal witness statements.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {/* ==============================================================
              OPTION 2: DASHCAM / VEHICLE VIDEO
              ============================================================== */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: dashcamFile ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
              backgroundColor: dashcamFile ? 'var(--accent-surface-subtle)' : 'var(--bg-canvas-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: dashcamFile ? 'var(--accent-surface)' : 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: dashcamFile ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    flexShrink: 0
                  }}
                >
                  <Video size={19} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Dashcam / Vehicle Video
                    </h5>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.35rem',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--accent-surface)',
                        color: 'var(--accent-text)',
                        border: '1px solid var(--accent-border)'
                      }}
                    >
                      Vehicle-mounted footage
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Upload dashcam or vehicle-mounted accident footage.
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={dashcamInputRef}
                type="file"
                accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
                onChange={handleDashcamChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Dashcam Content / Selected State */}
            {dashcamLoading ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 0.85rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Uploading...</span>
              </div>
            ) : dashcamFile ? (
              <div
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                  <FileVideo size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={dashcamFile.fileName}
                    >
                      {dashcamFile.fileName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{dashcamFile.fileSize}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--tag-observed-text)', fontWeight: 600 }}>● Ingested</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => dashcamInputRef.current?.click()}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', color: 'var(--text-secondary)' }}
                  >
                    <RefreshCw size={12} /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveDashcam}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.25rem 0.4rem', color: 'var(--danger-text)' }}
                    title="Remove video"
                    aria-label="Remove dashcam video"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => dashcamInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem', fontSize: '0.78rem' }}
                >
                  <Plus size={14} /> Select Dashcam Video
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>MP4 • MOV • WEBM</span>
                  <button
                    type="button"
                    onClick={handleLoadSampleDashcam}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.7rem', color: 'var(--accent-text)', padding: '0.2rem 0.4rem' }}
                    title="Load sample patrol dashcam footage"
                  >
                    <Sparkles size={11} /> Sample
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ==============================================================
              OPTION 3: CCTV VIDEO (WITH OPTIONAL METADATA FIELDS)
              ============================================================== */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: cctvFile ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
              backgroundColor: cctvFile ? 'var(--accent-surface-subtle)' : 'var(--bg-canvas-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: cctvFile ? 'var(--accent-surface)' : 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: cctvFile ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    flexShrink: 0
                  }}
                >
                  <Camera size={19} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      CCTV Video
                    </h5>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.35rem',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--accent-surface)',
                        color: 'var(--tag-observed-text)',
                        border: '1px solid var(--accent-border)'
                      }}
                    >
                      External surveillance footage
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Upload surveillance footage from cameras near the accident scene.
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={cctvInputRef}
                type="file"
                accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
                onChange={handleCctvChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* CCTV Content / Selected State */}
            {cctvLoading ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 0.85rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Uploading...</span>
              </div>
            ) : cctvFile ? (
              <div
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                  <FileVideo size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={cctvFile.fileName}
                    >
                      {cctvFile.fileName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{cctvFile.fileSize}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--tag-observed-text)', fontWeight: 600 }}>● Ingested</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => cctvInputRef.current?.click()}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', color: 'var(--text-secondary)' }}
                  >
                    <RefreshCw size={12} /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCctv}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.25rem 0.4rem', color: 'var(--danger-text)' }}
                    title="Remove CCTV"
                    aria-label="Remove CCTV video"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => cctvInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem', fontSize: '0.78rem' }}
                >
                  <Plus size={14} /> Select CCTV Video
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>MP4 • MOV • WEBM</span>
                  <button
                    type="button"
                    onClick={handleLoadSampleCctv}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.7rem', color: 'var(--accent-text)', padding: '0.2rem 0.4rem' }}
                    title="Load sample intersection CCTV footage"
                  >
                    <Sparkles size={11} /> Sample
                  </button>
                </div>
              </div>
            )}

            {/* Optional CCTV Metadata Fields */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Camera Metadata (Optional)
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Surveillance Context</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.68rem', marginBottom: '0.2rem' }}>Camera / Source ID</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                    placeholder="e.g. CAM-402 (NW)"
                    value={cctvMetadata.cameraId || ''}
                    onChange={(e) => handleCctvMetaChange('cameraId', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.68rem', marginBottom: '0.2rem' }}>Camera Location</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                    placeholder="e.g. 4th Ave & Main St"
                    value={cctvMetadata.cameraLocation || ''}
                    onChange={(e) => handleCctvMetaChange('cameraLocation', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.68rem', marginBottom: '0.2rem' }}>Captured Date</label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                    value={cctvMetadata.capturedDate || ''}
                    onChange={(e) => handleCctvMetaChange('capturedDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.68rem', marginBottom: '0.2rem' }}>Captured Time</label>
                  <input
                    type="time"
                    className="form-input"
                    style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                    value={cctvMetadata.capturedTime || ''}
                    onChange={(e) => handleCctvMetaChange('capturedTime', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ==============================================================
              OPTION 4: VOICE STATEMENT / AUDIO
              ============================================================== */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: voiceFile ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
              backgroundColor: voiceFile ? 'var(--accent-surface-subtle)' : 'var(--bg-canvas-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: voiceFile ? 'var(--accent-surface)' : 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: voiceFile ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    flexShrink: 0
                  }}
                >
                  <Mic size={19} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Voice Statement
                    </h5>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.35rem',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--accent-surface)',
                        color: 'var(--tag-reported-text)',
                        border: '1px solid var(--accent-border)'
                      }}
                    >
                      Spoken Audio
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Upload an officer, witness, or participant audio statement.
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={voiceInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,.webm,audio/mp3,audio/wav,audio/m4a,audio/webm,audio/x-m4a,audio/*"
                onChange={handleVoiceChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Voice Content / Selected State */}
            {voiceLoading ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 0.85rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Uploading...</span>
              </div>
            ) : voiceFile ? (
              <div
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                  <FileAudio size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={voiceFile.fileName}
                    >
                      {voiceFile.fileName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{voiceFile.fileSize}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--tag-reported-text)', fontWeight: 600 }}>● Ingested</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => voiceInputRef.current?.click()}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', color: 'var(--text-secondary)' }}
                  >
                    <RefreshCw size={12} /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveVoice}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.25rem 0.4rem', color: 'var(--danger-text)' }}
                    title="Remove audio"
                    aria-label="Remove voice statement"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => voiceInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem', fontSize: '0.78rem' }}
                >
                  <Plus size={14} /> Select Voice Statement
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>MP3 • WAV • M4A • WEBM</span>
                  <button
                    type="button"
                    onClick={handleLoadSampleVoice}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.7rem', color: 'var(--accent-text)', padding: '0.2rem 0.4rem' }}
                    title="Load sample officer audio statement"
                  >
                    <Sparkles size={11} /> Sample
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
