import { supabase } from './supabase';
import { EvidenceFile, EvidenceType, CctvMetadata } from '../types';

export const EVIDENCE_STORAGE_BUCKET = 'accident-evidence';

// File size limits in bytes
export const FILE_LIMITS = {
  photo: 25 * 1024 * 1024, // 25 MB
  dashcam_video: 100 * 1024 * 1024, // 100 MB
  cctv_video: 100 * 1024 * 1024, // 100 MB
  voice_statement: 25 * 1024 * 1024 // 25 MB
};

// Friendly format bytes helper
export function formatBytes(bytes?: number | bigint | null): string {
  if (!bytes || Number(bytes) === 0) return '0 B';
  const num = Number(bytes);
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return `${parseFloat((num / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Generate predictable, unique storage path: cases/{case_id}/{unique-file-name}
export function generateEvidenceStoragePath(caseId: string, originalFileName: string): string {
  const sanitized = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueTimestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `cases/${caseId}/${uniqueTimestamp}_${randomSuffix}_${sanitized}`;
}

export interface UploadEvidenceParams {
  file: File;
  caseId: string;
  evidenceType: 'photo' | 'dashcam_video' | 'cctv_video' | 'voice_statement';
  metadata?: CctvMetadata | Record<string, unknown>;
  perspective?: string;
  notes?: string;
}

/**
 * Upload an evidence file to Supabase Storage and record its metadata in the evidence table.
 * All errors return friendly human-readable messages without exposing internal stack traces.
 */
export async function uploadEvidenceFile(params: UploadEvidenceParams): Promise<EvidenceFile> {
  const { file, caseId, evidenceType, metadata, perspective, notes } = params;

  // 1. Verify authenticated officer
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    throw new Error('Authentication required. Please sign in to upload evidence.');
  }

  if (!caseId) {
    throw new Error('Valid case reference is required to attach evidence.');
  }

  // 2. Validate file size
  const limit = FILE_LIMITS[evidenceType] || 50 * 1024 * 1024;
  if (file.size > limit) {
    const limitMb = Math.round(limit / (1024 * 1024));
    throw new Error(`File exceeds the allowed ${limitMb}MB limit for this evidence category.`);
  }

  // 3. Generate unique storage path
  const storagePath = generateEvidenceStoragePath(caseId, file.name);

  // 4. Upload binary to Supabase Storage bucket
  const { error: uploadError } = await supabase.storage
    .from(EVIDENCE_STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream'
    });

  if (uploadError) {
    console.error('Supabase Storage upload failed:', uploadError);
    throw new Error('Unable to upload this evidence. Please try again.');
  }

  // 5. Insert row into evidence database table
  const { data: insertedRow, error: dbError } = await supabase
    .from('evidence')
    .insert({
      case_id: caseId,
      uploaded_by: user.id,
      evidence_type: evidenceType,
      file_name: file.name,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream'
    })
    .select()
    .single();

  if (dbError || !insertedRow) {
    console.error('Failed to create evidence table record:', dbError);
    // Cleanup orphaned storage object
    try {
      await supabase.storage.from(EVIDENCE_STORAGE_BUCKET).remove([storagePath]);
    } catch (cleanupErr) {
      console.warn('Could not remove orphaned storage object:', cleanupErr);
    }
    throw new Error('Unable to upload this evidence. Please try again.');
  }

  // 6. Generate secure signed URL for photo thumbnail if photo
  let previewUrl = '';
  if (evidenceType === 'photo') {
    try {
      const { data: signed } = await supabase.storage
        .from(EVIDENCE_STORAGE_BUCKET)
        .createSignedUrl(storagePath, 3600);
      previewUrl = signed?.signedUrl || URL.createObjectURL(file);
    } catch {
      previewUrl = URL.createObjectURL(file);
    }
  }

  const tagsByType: Record<string, string[]> = {
    photo: ['Scene Photo', 'Photographic Evidence'],
    dashcam_video: ['Dashcam', 'Vehicle Video', 'Vehicle Stream'],
    cctv_video: ['CCTV', 'Surveillance Video', 'External Stream'],
    voice_statement: ['Voice Statement', 'Audio Recording']
  };

  return {
    id: insertedRow.id,
    caseId: insertedRow.case_id,
    evidenceType,
    fileName: insertedRow.file_name,
    fileSize: formatBytes(insertedRow.file_size),
    uploadedAt: new Date(insertedRow.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    thumbnailUrl: previewUrl,
    classification: evidenceType === 'voice_statement' ? 'REPORTED' : 'OBSERVED',
    tags: tagsByType[evidenceType] || ['Evidence'],
    perspective: perspective || (evidenceType === 'photo' ? 'Scene viewpoint' : 'Evidence feed'),
    notes: notes || `${file.name} uploaded to case record`,
    filePath: insertedRow.file_path,
    mimeType: insertedRow.mime_type,
    rawSize: Number(insertedRow.file_size),
    fileObject: file,
    metadata
  };
}

/**
 * Remove evidence from both Supabase Storage and the evidence database table.
 */
export async function deleteEvidenceFile(evidenceId: string, filePath?: string): Promise<void> {
  // Delete database record
  const { error: dbErr } = await supabase
    .from('evidence')
    .delete()
    .eq('id', evidenceId);

  if (dbErr) {
    console.error('Failed to delete evidence record:', dbErr);
    throw new Error('Unable to remove evidence record. Please try again.');
  }

  // Delete from storage if file path exists
  if (filePath) {
    try {
      await supabase.storage.from(EVIDENCE_STORAGE_BUCKET).remove([filePath]);
    } catch (err) {
      console.warn('Could not delete storage file:', err);
    }
  }
}

/**
 * Fetch all evidence rows for a given accident case and generate secure signed URLs.
 */
export async function fetchEvidenceForCase(caseId: string): Promise<EvidenceFile[]> {
  const { data, error } = await supabase
    .from('evidence')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true });

  if (error || !data) {
    console.warn('Could not fetch evidence records for case:', error);
    return [];
  }

  const results: EvidenceFile[] = [];

  for (const row of data) {
    let previewUrl = '';
    if (row.evidence_type === 'photo' && row.file_path) {
      try {
        const { data: signed } = await supabase.storage
          .from(EVIDENCE_STORAGE_BUCKET)
          .createSignedUrl(row.file_path, 3600);
        previewUrl = signed?.signedUrl || '';
      } catch {
        previewUrl = '';
      }
    }

    const tagsByType: Record<string, string[]> = {
      photo: ['Scene Photo', 'Photographic Evidence'],
      dashcam_video: ['Dashcam', 'Vehicle Video'],
      cctv_video: ['CCTV', 'Surveillance'],
      voice_statement: ['Voice Statement', 'Audio Recording']
    };

    results.push({
      id: row.id,
      caseId: row.case_id,
      evidenceType: row.evidence_type as EvidenceType,
      fileName: row.file_name,
      fileSize: formatBytes(row.file_size),
      uploadedAt: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thumbnailUrl: previewUrl,
      classification: row.evidence_type === 'voice_statement' ? 'REPORTED' : 'OBSERVED',
      tags: tagsByType[row.evidence_type] || ['Evidence'],
      perspective: row.evidence_type === 'photo' ? 'Scene viewpoint' : 'Cataloged feed',
      filePath: row.file_path,
      mimeType: row.mime_type,
      rawSize: Number(row.file_size)
    });
  }

  return results;
}
