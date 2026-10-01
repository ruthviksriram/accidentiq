// ==============================================================================
// Gemini Accident Analysis Service
// Project: AccidentIQ
// Purpose: Secure frontend bridge to the Supabase Edge Function 'analyze-accident'
// Security: Never uses or stores GEMINI_API_KEY on the client. Calls authenticated Edge Function.
// ==============================================================================

import { supabase } from './supabase';
import { GeminiAnalysisOutput } from '../types';

export interface AnalysisResponse {
  success: boolean;
  data?: GeminiAnalysisOutput;
  error?: string;
}

/**
 * Triggers the Supabase Edge Function 'analyze-accident' for a specified case.
 * Validates session, handles Edge Function invocation, and friendly error transformation.
 */
export async function runGeminiAccidentAnalysis(caseId: string): Promise<GeminiAnalysisOutput> {
  // 1. Verify authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required. Please sign in to analyze evidence.');
  }

  try {
    // 2. Invoke Edge Function with authenticated session
    const { data, error } = await supabase.functions.invoke('analyze-accident', {
      body: { case_id: caseId }
    });

    if (error) {
      console.warn('Edge function returned error:', error);

      // Extract specific friendly errors if returned by Edge Function
      let message = 'Unable to analyze this evidence right now. Please try again.';
      
      try {
        // Some errors wrap the response body in error.context or error.message
        if (typeof error === 'object' && error !== null) {
          const anyErr = error as any;
          if (anyErr.context && typeof anyErr.context.json === 'function') {
            const body = await anyErr.context.json();
            if (body?.error) {
              message = body.error;
            }
          } else if (anyErr.message && anyErr.message.includes('Upload at least one accident photo')) {
            message = 'Upload at least one accident photo before running AI analysis.';
          }
        }
      } catch {
        // Fall back to friendly message
      }

      // Check if it's the specific photo required rule
      if (message.includes('Upload at least one accident photo')) {
        throw new Error('Upload at least one accident photo before running AI analysis.');
      }

      throw new Error('Unable to analyze this evidence right now. Please try again.');
    }

    if (!data) {
      throw new Error('Unable to analyze this evidence right now. Please try again.');
    }

    // Edge Function may return { error: ... } even on 200/400 depending on handling
    if (data.error) {
      if (data.error.includes('Upload at least one accident photo') || data.code === 'NO_PHOTOS_UPLOADED') {
        throw new Error('Upload at least one accident photo before running AI analysis.');
      }
      throw new Error('Unable to analyze this evidence right now. Please try again.');
    }

    if (data.data) {
      return data.data as GeminiAnalysisOutput;
    }

    return data as GeminiAnalysisOutput;
  } catch (err: unknown) {
    console.error('Error during accident analysis invocation:', err);
    if (err instanceof Error) {
      // Pass through specific friendly messages
      if (err.message.includes('Upload at least one accident photo')) {
        throw err;
      }
      if (err.message.includes('Authentication required')) {
        throw err;
      }
    }
    // Generic friendly error as required by prompt: "Unable to analyze this evidence right now. Please try again."
    throw new Error('Unable to analyze this evidence right now. Please try again.');
  }
}

/**
 * Retrieves previously saved analysis results for an accident case from the database.
 */
export async function fetchAnalysisResultForCase(caseId: string): Promise<GeminiAnalysisOutput | null> {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('result, created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch prior analysis result (table may be pending migration):', error.message);
      return null;
    }

    if (data && data.result) {
      return data.result as GeminiAnalysisOutput;
    }

    return null;
  } catch (err) {
    console.warn('Unexpected error reading analysis results:', err);
    return null;
  }
}
