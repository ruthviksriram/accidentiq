export type ThemeMode = 'light' | 'dark' | 'system';

export type AccidentType =
  | 'vehicle_vs_vehicle'
  | 'vehicle_vs_pedestrian'
  | 'vehicle_vs_multiple'
  | 'vehicle_vs_object'
  | 'complex';

export type ParticipantType = 'vehicle' | 'pedestrian' | 'bicycle' | 'other';

export type ParticipantRole = 'driver' | 'pedestrian' | 'passenger' | 'cyclist' | 'other';

export type EvidenceClassification = 'OBSERVED' | 'REPORTED' | 'INFERRED' | 'UNKNOWN';

export interface VehicleDetails {
  registrationNumber?: string;
  vehicleType: string; // e.g. Sedan, SUV, Commercial Van, Pickup Truck
  makeModel?: string; // e.g. Honda Civic, Toyota RAV4
  color?: string;
  ownerName?: string;
  driverName?: string;
  driverLicense?: string;
}

export interface PedestrianDetails {
  name?: string;
  age?: number | string;
  reportedActivity?: string; // e.g., Crossing marked crosswalk, standing on curb
  clothingDescription?: string;
}

export interface BicycleDetails {
  bicycleType?: string;
  cyclistName?: string;
  helmetWorn?: boolean;
  lightingOrReflectors?: string;
}

export interface OtherParticipantDetails {
  description: string;
}

export interface DamageObservation {
  component: string; // e.g. "Front Passenger Bumper & Quarter Panel"
  description: string; // e.g. "Direct crumple with blue paint transfer, headlight shattered"
  severity: 'Minor' | 'Moderate' | 'Severe';
  evidenceRefIds: string[];
}

export interface Participant {
  id: string;
  label: string; // e.g. "Participant 1: Vehicle A"
  type: ParticipantType;
  role: ParticipantRole;
  vehicleDetails?: VehicleDetails;
  pedestrianDetails?: PedestrianDetails;
  bicycleDetails?: BicycleDetails;
  otherDetails?: OtherParticipantDetails;
  damageObservations?: DamageObservation[];
}

export type EvidenceType = 'photo' | 'dashcam_video' | 'cctv_video' | 'voice_statement' | string;

export interface CctvMetadata {
  cameraId?: string;
  cameraLocation?: string;
  capturedDate?: string;
  capturedTime?: string;
}

export interface EvidenceFile {
  id: string;
  evidenceType?: EvidenceType;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  thumbnailUrl: string;
  classification: EvidenceClassification;
  tags: string[];
  perspective?: string; // e.g. "Rear quarter impact angle", "Intersection bird-eye"
  notes?: string;
  fileObject?: File;
  metadata?: CctvMetadata | Record<string, unknown>;
  filePath?: string;
  mimeType?: string;
  caseId?: string;
  rawSize?: number;
}

export interface EventSequenceStep {
  stepNumber: number;
  timeReference: string; // e.g. "T - 3.2s", "T - 0.8s", "T - 0.0s (Impact)"
  title: string;
  description: string;
  classification: EvidenceClassification;
  evidenceRefIds: string[];
}

export interface ParticipantActionAnalysis {
  participantId: string;
  participantLabel: string;
  reportedAction: string;
  observedAction: string;
  possibleContributingAction: string;
  evidenceCitations: string[];
  confidenceLevel: 'High' | 'Moderate' | 'Limited' | 'Indeterminate';
  uncertaintyNotes: string;
}

export interface ReconstructionActor {
  id: string;
  label: string;
  type: 'vehicle' | 'pedestrian' | 'bicycle' | 'cyclist' | 'object' | 'other';
  color: string;
  startPos: { x: number; y: number; angle: number };
  preImpactPos: { x: number; y: number; angle: number };
  impactPos: { x: number; y: number; angle: number };
  finalRestPos: { x: number; y: number; angle: number };
  movementVector: string; // e.g. "Northbound on 4th Ave (~45 km/h est.)"
}

export interface ReconstructionData {
  scenarioTitle: string;
  roadType: 'four_way_intersection' | 'two_lane_crosswalk' | 'highway_curve';
  actors: ReconstructionActor[];
  impactPoint: {
    x: number;
    y: number;
    label: string;
    description: string;
  };
  summaryData: {
    vehicleAMovement: string;
    vehicleBMovement: string;
    possibleImpactArea: string;
    supportingEvidence: string;
    uncertaintyAssessment: string;
  };
}

export interface AccidentCase {
  id: string; // e.g. "ACC-2026-001"
  dbId?: string; // Supabase database UUID
  caseNumber?: string;
  title: string;
  accidentType: AccidentType;
  status: 'Analysis Complete' | 'Active Investigation' | 'Pending Review' | 'Draft' | 'Analyzed' | 'active' | string;
  rawStatus?: string;
  assignedOfficer?: string;
  badgeNumber?: string;
  createdAt: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  weatherConditions: string;
  roadConditions: string;
  userNarrative: string;
  participants: Participant[];
  evidenceFiles: EvidenceFile[];
  overviewSummary: string;
  sceneObservations: {
    id: string;
    observation: string;
    classification: EvidenceClassification;
    evidenceRefId?: string;
  }[];
  sequenceOfEvents: EventSequenceStep[];
  participantActions: ParticipantActionAnalysis[];
  evidenceLimitations: string[];
  reconstruction: ReconstructionData;
  analysisResult?: GeminiAnalysisOutput;
}

export interface GeminiObservedEvidence {
  text: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface GeminiSceneReconstructionElement {
  label: string;
  description: string;
  position: string;
}

export interface GeminiReconstructionParticipant {
  label: string;
  type: string;
  position: string;
  movement: string;
}

export interface GeminiSceneReconstruction {
  available: boolean;
  description: string;
  elements: GeminiSceneReconstructionElement[];
  limitations: string;
  title?: string;
  disclaimer?: string;
  participants?: GeminiReconstructionParticipant[];
}

export interface GeminiParticipant {
  id?: string;
  label: string;
  type?: string;
  evidence?: string;
  damage?: string;
}

export interface GeminiVisibleDamage {
  participantLabel: string;
  component: string;
  severity: 'Severe' | 'Moderate' | 'Minor';
  description: string;
}

export interface GeminiSceneObservation {
  observation: string;
  classification: 'OBSERVED' | 'REPORTED' | 'INFERRED' | 'UNKNOWN';
}

export interface GeminiParticipantAction {
  participantLabel: string;
  action: string;
  possibleContributingFactors: string[];
  classification: 'OBSERVED' | 'REPORTED' | 'INFERRED';
}

export interface GeminiEvidenceClassification {
  observedCount?: number;
  reportedCount?: number;
  inferredCount?: number;
  unknownCount?: number;
}

export interface GeminiAnalysisOutput {
  summary: string;
  participants?: GeminiParticipant[];
  visible_damage?: GeminiVisibleDamage[];
  scene_observations?: GeminiSceneObservation[];
  possible_sequence_of_events: string[];
  participant_actions?: GeminiParticipantAction[];
  observed_evidence?: GeminiObservedEvidence[];
  reported_information?: string[];
  possible_contributing_factors?: string[];
  evidence_limitations?: string[];
  evidence_classification?: GeminiEvidenceClassification;
  possible_scene_reconstruction: GeminiSceneReconstruction;
}

export interface AnalysisResultRecord {
  id: string;
  case_id: string;
  analyzed_by?: string;
  result: GeminiAnalysisOutput;
  created_at?: string;
  updated_at?: string;
}
