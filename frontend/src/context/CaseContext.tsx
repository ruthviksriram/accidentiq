import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AccidentCase, AccidentType, EvidenceFile } from '../types';
import { supabase } from '../lib/supabase';

interface CaseContextType {
  cases: AccidentCase[];
  loading: boolean;
  error: string | null;
  refreshCases: () => Promise<void>;
  getCaseById: (id: string) => AccidentCase | undefined;
  addCase: (newCase: AccidentCase) => void;
  deleteCase: (id: string) => void;
  resetToDefault: () => void;
  clearAllForEmptyState: () => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

// Helper function to map a Supabase accident_cases row to frontend AccidentCase
export function mapRowToCase(
  row: {
    id: string;
    case_number: string;
    title?: string | null;
    accident_type?: string | null;
    location?: string | null;
    incident_date?: string | null;
    description?: string | null;
    assigned_officer_id?: string | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    evidence?: Array<{
      id: string;
      case_id: string;
      evidence_type: string;
      file_name: string;
      file_path: string;
      file_size?: number | null;
      mime_type?: string | null;
      created_at?: string | null;
    }> | null;
    analysis_results?: Array<{
      id: string;
      result: any;
      created_at?: string;
    }> | null;
  },
  officerName?: string,
  badgeNum?: string
): AccidentCase {
  const caseId = row.case_number || row.id;
  const status = row.status || 'active';
  const isAnalyzed = status === 'Analysis Complete' || status === 'Analyzed';

  const latestAnalysis = Array.isArray(row.analysis_results) && row.analysis_results.length > 0
    ? row.analysis_results[0]?.result
    : undefined;

  const mappedEvidence: EvidenceFile[] = Array.isArray(row.evidence)
    ? row.evidence.map((ev) => {
        const sizeMb = ev.file_size ? (Number(ev.file_size) / (1024 * 1024)).toFixed(1) : '1.0';
        const typeLabel = ev.evidence_type ? ev.evidence_type.replace(/_/g, ' ') : 'Evidence';
        return {
          id: ev.id,
          caseId: ev.case_id,
          evidenceType: (ev.evidence_type as any) || 'photo',
          fileName: ev.file_name,
          filePath: ev.file_path,
          fileSize: `${sizeMb} MB`,
          rawSize: ev.file_size || undefined,
          mimeType: ev.mime_type || undefined,
          uploadedAt: ev.created_at
            ? new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Recent',
          thumbnailUrl: '',
          classification: 'OBSERVED',
          tags: [typeLabel.toUpperCase()],
          perspective: '',
          notes: ''
        };
      })
    : [];

  return {
    id: caseId,
    dbId: row.id,
    caseNumber: row.case_number,
    title: row.title || 'Collision Investigation',
    accidentType: (row.accident_type as AccidentType) || 'vehicle_vs_vehicle',
    status: status,
    rawStatus: status,
    assignedOfficer: officerName || 'Investigating Officer',
    badgeNumber: badgeNum || 'CIU-OFFICER',
    createdAt: row.created_at ? new Date(row.created_at).toISOString().replace('T', ' ').substring(0, 16) : '',
    incidentDate: row.incident_date || '',
    incidentTime: '12:00',
    location: row.location || 'Incident Location',
    weatherConditions: 'Clear daylight, dry road surface',
    roadConditions: 'Standard paved roadway',
    userNarrative: row.description || '',
    participants: [],
    evidenceFiles: mappedEvidence,
    analysisResult: latestAnalysis,
    overviewSummary: latestAnalysis?.summary || (isAnalyzed
      ? `Completed investigation report for ${row.accident_type?.replace(/_/g, ' ') || 'traffic collision'}.`
      : ''),
    sceneObservations: row.description
      ? [{ id: `so-${row.id}`, observation: row.description, classification: 'REPORTED' }]
      : [],
    sequenceOfEvents: [],
    participantActions: [],
    evidenceLimitations: [],
    reconstruction: {
      scenarioTitle: `${row.location || 'Incident'} Kinematic Layout`,
      roadType: row.accident_type === 'vehicle_vs_pedestrian' ? 'two_lane_crosswalk' : 'four_way_intersection',
      actors: [],
      impactPoint: {
        x: 300,
        y: 250,
        label: 'Reported Point of Impact',
        description: row.location || 'Incident location point of contact'
      },
      summaryData: {
        vehicleAMovement: 'Pending kinematic verification',
        vehicleBMovement: 'Pending kinematic verification',
        possibleImpactArea: row.location || 'Roadway sector',
        supportingEvidence: 'Initial scene filing particulars',
        uncertaintyAssessment: 'Awaiting forensic telemetry verification'
      }
    }
  };
}

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<AccidentCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCasesForUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Attempt to fetch officer profile details if available
      let officerName = 'Investigating Officer';
      let badgeNum = 'CIU-OFFICER';

      try {
        const { data: profile } = await supabase
          .from('police_profiles')
          .select('full_name, police_id, rank')
          .eq('user_id', userId)
          .maybeSingle();

        if (profile) {
          if (profile.full_name) {
            officerName = profile.rank ? `${profile.rank} ${profile.full_name}` : profile.full_name;
          }
          if (profile.police_id) {
            badgeNum = profile.police_id;
          }
        }
      } catch (err) {
        console.warn('Could not retrieve police profile details:', err);
      }

      // Query real accident cases belonging to current authenticated user
      // Join with evidence and analysis_results tables if available, with graceful fallback
      let data: any[] | null = null;
      const { data: withAll, error: allErr } = await supabase
        .from('accident_cases')
        .select('*, evidence(*), analysis_results(*)')
        .eq('assigned_officer_id', userId)
        .order('created_at', { ascending: false });

      if (!allErr && withAll) {
        data = withAll;
      } else {
        const { data: withEvidence, error: joinErr } = await supabase
          .from('accident_cases')
          .select('*, evidence(*)')
          .eq('assigned_officer_id', userId)
          .order('created_at', { ascending: false });

        if (!joinErr && withEvidence) {
          data = withEvidence;
        } else {
          const { data: simpleData, error: fetchErr } = await supabase
            .from('accident_cases')
            .select('*')
            .eq('assigned_officer_id', userId)
            .order('created_at', { ascending: false });

          if (fetchErr) {
            console.error('Error fetching accident cases:', fetchErr);
            setError('Unable to load investigation cases from database.');
            setCases([]);
            return;
          }
          data = simpleData;
        }
      }

      if (data) {
        const mappedCases = data.map((row) => mapRowToCase(row, officerName, badgeNum));
        setCases(mappedCases);
      }
    } catch (err: unknown) {
      console.error('Unexpected error loading cases:', err);
      setError('An unexpected error occurred while loading cases.');
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCases = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchCasesForUser(user.id);
      } else {
        setCases([]);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error during case refresh:', err);
      setLoading(false);
    }
  }, [fetchCasesForUser]);

  useEffect(() => {
    // Initial fetch on mount
    refreshCases();

    // Listen to Supabase auth events (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchCasesForUser(session.user.id);
      } else {
        setCases([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCasesForUser, refreshCases]);

  const getCaseById = (id: string): AccidentCase | undefined => {
    if (!id) return undefined;
    const normalized = id.toLowerCase().trim();
    return cases.find(
      (c) =>
        c.id.toLowerCase() === normalized ||
        c.caseNumber?.toLowerCase() === normalized ||
        c.dbId?.toLowerCase() === normalized
    );
  };

  const addCase = (newCase: AccidentCase) => {
    setCases((prev) => [newCase, ...prev]);
  };

  const deleteCase = (id: string) => {
    setCases((prev) => prev.filter((c) => c.id !== id && c.dbId !== id));
  };

  const resetToDefault = () => {
    refreshCases();
  };

  const clearAllForEmptyState = () => {
    setCases([]);
  };

  return (
    <CaseContext.Provider
      value={{
        cases,
        loading,
        error,
        refreshCases,
        getCaseById,
        addCase,
        deleteCase,
        resetToDefault,
        clearAllForEmptyState
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCases = (): CaseContextType => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCases must be used within a CaseProvider');
  }
  return context;
};
