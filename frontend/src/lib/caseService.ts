// ==============================================================================
// Accident Case Service
// Project: AccidentIQ
// Purpose: Manage case operations including secure update and deletion with storage cleanup
// Security: Row Level Security enforced. Restricted to assigned authenticated officer.
// ==============================================================================

import { supabase } from './supabase';
import { EVIDENCE_STORAGE_BUCKET } from './evidenceService';

export interface CaseUpdatePayload {
  title?: string;
  accident_type?: string;
  location?: string;
  incident_date?: string;
  description?: string;
  status?: string;
}

/**
 * Delete an accident case and all associated files from storage.
 * Foreign keys on evidence and analysis_results have ON DELETE CASCADE.
 */
export async function deleteAccidentCase(caseIdentifier: string): Promise<void> {
  // 1. Verify authenticated user
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    throw new Error('Authentication required. Please sign in to delete this investigation case.');
  }

  // 2. Resolve database UUID and verify officer assignment
  const { data: caseRow, error: fetchErr } = await supabase
    .from('accident_cases')
    .select('id, case_number, assigned_officer_id')
    .or(`id.eq.${caseIdentifier},case_number.eq.${caseIdentifier}`)
    .maybeSingle();

  if (fetchErr || !caseRow) {
    throw new Error('Case not found or already deleted.');
  }

  if (caseRow.assigned_officer_id && caseRow.assigned_officer_id !== user.id) {
    throw new Error('Access denied. Only the assigned officer may delete this accident case.');
  }

  const resolvedDbId = caseRow.id;

  // 3. Collect associated storage file paths from evidence records
  const { data: evidenceRows } = await supabase
    .from('evidence')
    .select('file_path')
    .eq('case_id', resolvedDbId);

  const filePathsToDelete = new Set<string>();

  if (evidenceRows) {
    evidenceRows.forEach((ev) => {
      if (ev.file_path) {
        filePathsToDelete.add(ev.file_path);
      }
    });
  }

  // Also query private bucket folder cases/{case_id} to ensure no orphaned files remain
  try {
    const { data: folderFiles } = await supabase.storage
      .from(EVIDENCE_STORAGE_BUCKET)
      .list(`cases/${resolvedDbId}`);

    if (folderFiles && folderFiles.length > 0) {
      folderFiles.forEach((f) => {
        if (f.name) {
          filePathsToDelete.add(`cases/${resolvedDbId}/${f.name}`);
        }
      });
    }
  } catch (storageListErr) {
    console.warn('Could not inspect storage folder for cleanup:', storageListErr);
  }

  // 4. Remove associated files from accident-evidence private storage bucket
  if (filePathsToDelete.size > 0) {
    try {
      const pathsArray = Array.from(filePathsToDelete);
      const { error: storageRemoveErr } = await supabase.storage
        .from(EVIDENCE_STORAGE_BUCKET)
        .remove(pathsArray);

      if (storageRemoveErr) {
        console.warn('Failed to remove some storage files during case deletion:', storageRemoveErr);
      }
    } catch (storageErr) {
      console.warn('Storage removal exception during case deletion:', storageErr);
    }
  }

  // 5. Delete the case record from accident_cases
  // RLS policy: USING (auth.uid() = assigned_officer_id)
  // ON DELETE CASCADE removes associated evidence and analysis_results
  const { error: deleteError } = await supabase
    .from('accident_cases')
    .delete()
    .eq('id', resolvedDbId)
    .eq('assigned_officer_id', user.id);

  if (deleteError) {
    console.error('Failed to delete case record from database:', deleteError);
    throw new Error('Unable to delete this case right now. Please try again.');
  }
}

/**
 * Fetch case details for editing with assigned officer verification.
 */
export async function getCaseForEdit(caseIdentifier: string) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    throw new Error('Authentication required. Please sign in.');
  }

  const { data, error } = await supabase
    .from('accident_cases')
    .select('*, evidence(*)')
    .or(`id.eq.${caseIdentifier},case_number.eq.${caseIdentifier}`)
    .single();

  if (error || !data) {
    throw new Error('Accident case not found.');
  }

  const isOwner = !data.assigned_officer_id || data.assigned_officer_id === user.id;

  return {
    caseRecord: data,
    isOwner,
    currentUserId: user.id
  };
}

/**
 * Update an existing accident case in Supabase.
 */
export async function updateAccidentCase(
  caseDbId: string,
  updates: CaseUpdatePayload
): Promise<void> {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    throw new Error('Authentication required. Please sign in to update this case.');
  }

  const { error } = await supabase
    .from('accident_cases')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', caseDbId)
    .eq('assigned_officer_id', user.id);

  if (error) {
    console.error('Failed to update accident case in Supabase:', error);
    throw new Error('Unable to update the case. Please try again.');
  }
}
