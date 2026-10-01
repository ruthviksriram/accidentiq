import { AccidentCase } from '../types';

// Helper to generate crisp SVG data URLs for mock police evidence photographs
const createEvidenceSvg = (title: string, color: string, iconType: 'damage' | 'intersection' | 'debris' | 'crosswalk') => {
  let graphic = '';
  if (iconType === 'damage') {
    graphic = `<rect x="50" y="45" width="100" height="50" rx="8" fill="#334155" stroke="#94A3B8" stroke-width="2"/>
    <path d="M110 45 L130 95 L95 70 Z" fill="#EF4444" opacity="0.6"/>
    <circle cx="120" cy="65" r="16" fill="none" stroke="#F59E0B" stroke-dasharray="3 3" stroke-width="2"/>
    <text x="120" y="115" text-anchor="middle" fill="#CBD5E1" font-size="10" font-family="monospace">IMPACT ZONE</text>`;
  } else if (iconType === 'intersection') {
    graphic = `<rect x="80" y="10" width="40" height="120" fill="#1E293B"/>
    <rect x="10" y="50" width="180" height="40" fill="#1E293B"/>
    <line x1="100" y1="10" x2="100" y2="130" stroke="#F59E0B" stroke-width="2" stroke-dasharray="4 4"/>
    <line x1="10" y1="70" x2="190" y2="70" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4"/>
    <circle cx="100" cy="70" r="12" fill="#EF4444" opacity="0.4"/>`;
  } else if (iconType === 'crosswalk') {
    graphic = `<rect x="20" y="20" width="160" height="100" fill="#1E293B"/>
    <line x1="40" y1="35" x2="40" y2="105" stroke="#F8FAFC" stroke-width="8"/>
    <line x1="70" y1="35" x2="70" y2="105" stroke="#F8FAFC" stroke-width="8"/>
    <line x1="100" y1="35" x2="100" y2="105" stroke="#F8FAFC" stroke-width="8"/>
    <line x1="130" y1="35" x2="130" y2="105" stroke="#F8FAFC" stroke-width="8"/>
    <line x1="160" y1="35" x2="160" y2="105" stroke="#F8FAFC" stroke-width="8"/>
    <circle cx="100" cy="70" r="6" fill="#5FA6A0"/>`;
  } else {
    graphic = `<rect x="30" y="30" width="140" height="80" rx="4" fill="#0F172A" stroke="#475569"/>
    <path d="M50 85 L70 55 L90 85 Z" fill="#94A3B8"/>
    <circle cx="120" cy="65" r="14" fill="#F59E0B" opacity="0.5"/>
    <path d="M40 90 L160 90" stroke="#EF4444" stroke-width="2" stroke-dasharray="2 2"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140">
    <rect width="200" height="140" fill="${color}"/>
    ${graphic}
    <rect x="0" y="115" width="200" height="25" fill="#090D16" opacity="0.85"/>
    <text x="10" y="132" fill="#E2E8F0" font-size="10" font-family="-apple-system, sans-serif" font-weight="600">${title}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const MOCK_CASES: AccidentCase[] = [
  {
    id: 'ACC-2026-001',
    title: 'Pine St Crosswalk Pedestrian Incident',
    accidentType: 'vehicle_vs_pedestrian',
    status: 'Analysis Complete',
    assignedOfficer: 'Officer A. Sharma',
    badgeNumber: 'CIU-4921',
    createdAt: '2026-09-29 18:10',
    incidentDate: '2026-09-29',
    incidentTime: '6:35 PM',
    location: 'Pine St at Oak Boulevard, Mid-block Pedestrian Crossing',
    weatherConditions: 'Dusk / Twilight, light drizzle, wet asphalt',
    roadConditions: 'Two-lane suburban arterial, marked crosswalk with overhead pedestrian beacon',
    userNarrative:
      'Investigating Officer Report: Responding unit arrived at 18:42 hours. A commercial delivery van was travelling westbound on Pine St. An adult pedestrian entered the marked crosswalk from the north sidewalk. Glancing contact occurred near the center divider line. Officer noted active yellow crossing flashers were reported by pedestrian.',
    overviewSummary:
      'Multimodal analysis indicates an incident involving a commercial delivery vehicle and an adult pedestrian at a marked mid-block crosswalk. Physical evidence and damage to the vehicle\'s driver-side mirror and hood edge appear consistent with low-speed contact near the lane divider line. Ambient lighting at dusk with wet roadway conditions likely affected visual contrast.',
    participants: [
      {
        id: 'p-001-1',
        label: 'Vehicle 1 — Commercial Delivery Van',
        type: 'vehicle',
        role: 'driver',
        vehicleDetails: {
          registrationNumber: '9BFR-104',
          vehicleType: 'High-Roof Cargo Van',
          makeModel: '2022 Ford Transit',
          color: 'Solid White',
          driverName: 'Jerome Castillo',
          ownerName: 'QuickDrop Logistics Inc.',
          driverLicense: 'DL-7721094-NY'
        },
        damageObservations: [
          {
            component: 'Driver Side Exterior Mirror Assembly',
            description: 'Housing sheared rearward with fractured reflective glass; scuff marks on outer plastic bezel.',
            severity: 'Minor',
            evidenceRefIds: ['ev-001-01']
          },
          {
            component: 'Front Hood Leading Edge (Driver Side)',
            description: 'Fabric smudge mark and surface dust wipe visible 35cm from center badge.',
            severity: 'Minor',
            evidenceRefIds: ['ev-001-01']
          }
        ]
      },
      {
        id: 'p-001-2',
        label: 'Participant 2 — Pedestrian',
        type: 'pedestrian',
        role: 'pedestrian',
        pedestrianDetails: {
          name: 'Sarah Lindqvist (Confidential Record)',
          age: 34,
          reportedActivity: 'Crossing southwards within painted zebra markings',
          clothingDescription: 'Dark charcoal hooded parka, blue jeans, dark footwear'
        },
        damageObservations: [
          {
            component: 'Reported Bodily Injury',
            description: 'Right shoulder contusion and lateral hip abrasion reported by attending EMT unit #4.',
            severity: 'Moderate',
            evidenceRefIds: ['ev-001-02']
          }
        ]
      }
    ],
    evidenceFiles: [
      {
        id: 'ev-001-01',
        fileName: 'POLICE_EVID_001_Mirror_Scuff.jpg',
        fileSize: '3.6 MB',
        uploadedAt: '2026-09-29 18:40',
        thumbnailUrl: createEvidenceSvg('VAN MIRROR & HOOD SMUDGE', '#1e293b', 'damage'),
        classification: 'OBSERVED',
        tags: ['Mirror Displaced', 'Hood Contact Smudge'],
        perspective: 'Left side front 3/4 view',
        notes: 'Driver side wing mirror pushed backwards against door pillar.'
      },
      {
        id: 'ev-001-02',
        fileName: 'POLICE_EVID_002_Crosswalk_Dusk.jpg',
        fileSize: '4.8 MB',
        uploadedAt: '2026-09-29 18:42',
        thumbnailUrl: createEvidenceSvg('MARKED CROSSWALK AT DUSK', '#0f172a', 'crosswalk'),
        classification: 'OBSERVED',
        tags: ['Wet Pavement', 'Reflective Beacon', 'Crosswalk'],
        perspective: 'Westbound vehicle driver eye-level',
        notes: 'Overhead amber beacon visible; reflections on wet asphalt surface.'
      },
      {
        id: 'ev-001-03',
        fileName: 'POLICE_EVID_003_Personal_Items.jpg',
        fileSize: '2.9 MB',
        uploadedAt: '2026-09-29 18:45',
        thumbnailUrl: createEvidenceSvg('PEDESTRIAN PERSONAL ITEMS', '#0f172a', 'debris'),
        classification: 'OBSERVED',
        tags: ['Umbrella Rest Position', 'Lane Centerline'],
        perspective: 'Top-down ground view',
        notes: 'Compact umbrella located 2.1 meters west of crosswalk border in westbound lane.'
      },
      {
        id: 'ev-001-04',
        fileName: 'POLICE_EVID_004_Van_Final_Rest.jpg',
        fileSize: '4.1 MB',
        uploadedAt: '2026-09-29 18:50',
        thumbnailUrl: createEvidenceSvg('VEHICLE REST POSITION', '#1e293b', 'intersection'),
        classification: 'OBSERVED',
        tags: ['Final Rest', 'Stopping Distance'],
        perspective: 'Westbound roadway profile',
        notes: 'Van positioned 6.5m past crosswalk line.'
      },
      {
        id: 'ev-001-05',
        fileName: 'POLICE_EVID_005_Streetlight_Luminance.jpg',
        fileSize: '3.2 MB',
        uploadedAt: '2026-09-29 18:55',
        thumbnailUrl: createEvidenceSvg('LIGHTING SURVEY', '#0f172a', 'intersection'),
        classification: 'OBSERVED',
        tags: ['Ambient Lighting', 'Glare Profile'],
        perspective: 'Approaching motorist sightline'
      },
      {
        id: 'ev-001-06',
        fileName: 'POLICE_EVID_006_Flasher_Controller.jpg',
        fileSize: '2.5 MB',
        uploadedAt: '2026-09-29 19:02',
        thumbnailUrl: createEvidenceSvg('BEACON CONTROLLER BOX', '#0f172a', 'debris'),
        classification: 'OBSERVED',
        tags: ['Signal Hardware', 'Inspection Log']
      }
    ],
    sceneObservations: [
      {
        id: 'so-001-1',
        observation: 'Fabric wipe mark on vehicle hood and displaced mirror match the approximate shoulder height of an adult pedestrian (~140cm).',
        classification: 'OBSERVED',
        evidenceRefId: 'ev-001-01'
      },
      {
        id: 'so-001-2',
        observation: 'The incident occurred during twilight/dusk (18:35 hours) under overcast skies with active drizzle creating wet roadway glare.',
        classification: 'OBSERVED',
        evidenceRefId: 'ev-001-02'
      },
      {
        id: 'so-001-3',
        observation: 'Pedestrian reported activating the push-button flashing yellow pedestrian beacon prior to stepping into roadway.',
        classification: 'REPORTED'
      },
      {
        id: 'so-001-4',
        observation: 'Driver reported limited visibility due to opposing headlight glare and wet asphalt light scattering.',
        classification: 'REPORTED'
      },
      {
        id: 'so-001-5',
        observation: 'Vehicle speed at moment of contact appears to have been low (< 25 km/h) based on minimal hood deformation and short stopping distance.',
        classification: 'INFERRED'
      }
    ],
    sequenceOfEvents: [
      {
        stepNumber: 1,
        timeReference: 'T - 4.0s',
        title: 'Pedestrian Enters Crossing',
        description: 'Pedestrian stepped off northern sidewalk into marked crosswalk moving southbound.',
        classification: 'REPORTED',
        evidenceRefIds: []
      },
      {
        stepNumber: 2,
        timeReference: 'T - 1.5s',
        title: 'Vehicle Approach',
        description: 'Commercial delivery van was travelling westbound on Pine St. Wet pavement conditions reduced available tire braking grip.',
        classification: 'OBSERVED',
        evidenceRefIds: ['ev-001-02']
      },
      {
        stepNumber: 3,
        timeReference: 'T - 0.0s',
        title: 'Glancing Contact',
        description: 'The driver-side front corner and side mirror of the van made contact with the pedestrian near the westbound lane center.',
        classification: 'OBSERVED',
        evidenceRefIds: ['ev-001-01', 'ev-001-03']
      },
      {
        stepNumber: 4,
        timeReference: 'T + 1.0s',
        title: 'Vehicle Comes to Stop',
        description: 'Vehicle came to a complete stop approximately 6.5 meters beyond the crosswalk markings.',
        classification: 'INFERRED',
        evidenceRefIds: ['ev-001-04']
      }
    ],
    participantActions: [
      {
        participantId: 'p-001-1',
        participantLabel: 'Vehicle 1 Driver (Jerome Castillo)',
        reportedAction: 'Driving westbound at approximately 35 km/h, saw pedestrian late due to darkness and drizzle.',
        observedAction: 'Braking and slight rightward steering adjustment.',
        possibleContributingAction: 'Possible delay in recognizing pedestrian within marked crossing area under reduced visibility conditions.',
        evidenceCitations: ['POLICE_EVID_001', 'POLICE_EVID_002'],
        confidenceLevel: 'Moderate',
        uncertaintyNotes: 'Whether the overhead beacon was flashing at the moment of approach could not be independently confirmed from physical photographs alone.'
      },
      {
        participantId: 'p-001-2',
        participantLabel: 'Pedestrian (Sarah Lindqvist)',
        reportedAction: 'Checked left, pressed crossing signal, walked at normal pace.',
        observedAction: 'Traversed approximately 3.8 meters into roadway before contact.',
        possibleContributingAction: 'Wearing non-reflective dark clothing during twilight drizzle conditions with low contrast against roadway backdrop.',
        evidenceCitations: ['POLICE_EVID_002', 'POLICE_EVID_003'],
        confidenceLevel: 'Limited',
        uncertaintyNotes: 'Exact walking speed and gaze direction prior to contact cannot be determined without video recording.'
      }
    ],
    evidenceLimitations: [
      'No video evidence was available to verify pedestrian beacon flashing status at the exact time of crossing.',
      'Wet pavement prevented distinct tire mark analysis; braking deceleration rates are theoretical approximations.',
      'Lighting contrast measurements at driver eye-level were not recorded at the exact moment of incident.'
    ],
    reconstruction: {
      scenarioTitle: 'Vehicle vs Pedestrian: Mid-Block Marked Crosswalk',
      roadType: 'two_lane_crosswalk',
      actors: [
        {
          id: 'actor-van',
          label: 'Delivery Van',
          type: 'vehicle',
          color: '#5FA6A0',
          startPos: { x: 550, y: 190, angle: -90 },
          preImpactPos: { x: 390, y: 190, angle: -90 },
          impactPos: { x: 290, y: 190, angle: -85 },
          finalRestPos: { x: 210, y: 180, angle: -85 },
          movementVector: 'Westbound on Pine St (~32 km/h braking)'
        },
        {
          id: 'actor-pedestrian',
          label: 'Pedestrian',
          type: 'pedestrian',
          color: '#EC4899',
          startPos: { x: 290, y: 70, angle: 180 },
          preImpactPos: { x: 290, y: 130, angle: 180 },
          impactPos: { x: 290, y: 180, angle: 180 },
          finalRestPos: { x: 275, y: 205, angle: 210 },
          movementVector: 'Southbound across crosswalk (~4 km/h walking)'
        }
      ],
      impactPoint: {
        x: 290,
        y: 185,
        label: 'Possible Contact Point',
        description: 'Estimated contact area within the westbound lane near crosswalk center line.'
      },
      summaryData: {
        vehicleAMovement: 'Westbound on Pine St; braked and stopped within 6.5m post-impact.',
        vehicleBMovement: 'Southbound pedestrian crossing along designated zebra stripe markers.',
        possibleImpactArea: 'Approx 1.8m north of roadway centerline in the westbound traffic lane.',
        supportingEvidence: 'Fabric smudge on hood, displaced left wing mirror, umbrella resting location.',
        uncertaintyAssessment: 'Exact pedestrian transit timing relative to vehicle approach cannot be established without video.'
      }
    }
  },
  {
    id: 'ACC-2026-002',
    title: '4th & Market St Intersection Collision',
    accidentType: 'vehicle_vs_vehicle',
    status: 'Analysis Complete',
    assignedOfficer: 'Officer D. Vance',
    badgeNumber: 'CIU-3180',
    createdAt: '2026-09-28 14:22',
    incidentDate: '2026-09-28',
    incidentTime: '11:45 AM',
    location: 'Intersection of 4th Ave & Market St, Metro District',
    weatherConditions: 'Clear, dry pavement, ambient temp 21°C',
    roadConditions: 'Signalized 4-way intersection, speed limit 50 km/h, dry asphalt',
    userNarrative:
      'Investigating Officer Report: Units dispatched to two-vehicle collision at 4th Ave and Market St. Vehicle A was travelling northbound along 4th Ave. Vehicle B was travelling westbound on Market St. Collision occurred in the northeast quadrant box. Driver of Vehicle B stated they entered on late yellow light.',
    overviewSummary:
      'Multimodal analysis indicates an angled collision between two passenger vehicles at a four-way signalized intersection. Evidence demonstrates primary impact concentrated on Vehicle A\'s front right passenger quarter panel and Vehicle B\'s front left bumper assembly. Debris distribution and tire scrub marks indicate impact occurred within the northeast quadrant of the intersection box.',
    participants: [
      {
        id: 'p-002-1',
        label: 'Vehicle A — Silver Sedan',
        type: 'vehicle',
        role: 'driver',
        vehicleDetails: {
          registrationNumber: '7KXR-491',
          vehicleType: 'Sedan',
          makeModel: '2023 Honda Civic',
          color: 'Lunar Silver',
          driverName: 'Marcus Bennett',
          ownerName: 'Marcus Bennett',
          driverLicense: 'DL-9382104-CA'
        },
        damageObservations: [
          {
            component: 'Front Passenger Bumper & Right Fender',
            description: 'Severe structural crush with inward deformation (~18cm depth). Right headlight assembly shattered. Dark blue clearcoat transfer observed on quarter seam.',
            severity: 'Severe',
            evidenceRefIds: ['ev-002-01', 'ev-002-03']
          },
          {
            component: 'Right Front Wheel Assembly',
            description: 'Suspension tierod bent outward, tire deflated with bead separation from rim.',
            severity: 'Moderate',
            evidenceRefIds: ['ev-002-03']
          }
        ]
      },
      {
        id: 'p-002-2',
        label: 'Vehicle B — Navy Blue SUV',
        type: 'vehicle',
        role: 'driver',
        vehicleDetails: {
          registrationNumber: '3TVM-882',
          vehicleType: 'Midsize SUV',
          makeModel: '2021 Toyota RAV4',
          color: 'Blueprint Navy',
          driverName: 'Elena Rostova',
          ownerName: 'Apex Logistics LLC',
          driverLicense: 'DL-4481902-CA'
        },
        damageObservations: [
          {
            component: 'Front Driver Side Bumper & Grille',
            description: 'Direct crumple damage focused on left front fascia. Radiator support fractured. Silver paint abrasion matching Vehicle A.',
            severity: 'Moderate',
            evidenceRefIds: ['ev-002-02', 'ev-002-04']
          },
          {
            component: 'Airbag Deployment Module',
            description: 'Front dual-stage steering and curtain airbags deployed upon impact.',
            severity: 'Severe',
            evidenceRefIds: ['ev-002-02']
          }
        ]
      }
    ],
    evidenceFiles: [
      {
        id: 'ev-002-01',
        fileName: 'POLICE_CRIME_002_VehicleA_Crush.jpg',
        fileSize: '4.2 MB',
        uploadedAt: '2026-09-28 14:23',
        thumbnailUrl: createEvidenceSvg('VEHICLE A — CRUSH PROFILE', '#1e293b', 'damage'),
        classification: 'OBSERVED',
        tags: ['Point of Impact', 'Crush Depth', 'Paint Transfer'],
        perspective: 'Vehicle A right 45° offset',
        notes: 'Distinct crumple zone displacement with paint scratch markers.'
      },
      {
        id: 'ev-002-02',
        fileName: 'POLICE_CRIME_002_VehicleB_Front.jpg',
        fileSize: '3.8 MB',
        uploadedAt: '2026-09-28 14:24',
        thumbnailUrl: createEvidenceSvg('VEHICLE B — FASCIA DAMAGE', '#1e293b', 'damage'),
        classification: 'OBSERVED',
        tags: ['Bumper Dislodged', 'Airbag Deployment'],
        perspective: 'Vehicle B head-on angled view',
        notes: 'Grille fractured with leftward displacement.'
      },
      {
        id: 'ev-002-03',
        fileName: 'POLICE_CRIME_002_Debris_Field.jpg',
        fileSize: '5.1 MB',
        uploadedAt: '2026-09-28 14:25',
        thumbnailUrl: createEvidenceSvg('INTERSECTION DEBRIS FIELD', '#0f172a', 'intersection'),
        classification: 'OBSERVED',
        tags: ['Debris Cone', 'Gouges', 'Glass Scatter'],
        perspective: 'Northeast intersection overview',
        notes: 'Polycarbonate headlight glass scattered in 6-meter fan pattern.'
      },
      {
        id: 'ev-002-04',
        fileName: 'POLICE_CRIME_002_Tire_Scrub.jpg',
        fileSize: '3.4 MB',
        uploadedAt: '2026-09-28 14:26',
        thumbnailUrl: createEvidenceSvg('PRE-IMPACT TIRE SCRUB', '#0f172a', 'debris'),
        classification: 'OBSERVED',
        tags: ['Tire Scrub', 'Pre-braking vector'],
        perspective: 'Market St westbound approach',
        notes: 'Intermittent 8.4m tire scrub marks leading into intersection box.'
      }
    ],
    sceneObservations: [
      {
        id: 'so-2-1',
        observation: 'Front bumper crush pattern on Vehicle A aligns in height and contour with Vehicle B bumper height (~48cm above ground).',
        classification: 'OBSERVED',
        evidenceRefId: 'ev-002-01'
      },
      {
        id: 'so-2-2',
        observation: 'Tire scrub marks (~8.4 meters) on Market Street westbound approach indicate pre-impact braking effort by Vehicle B.',
        classification: 'OBSERVED',
        evidenceRefId: 'ev-002-04'
      },
      {
        id: 'so-2-3',
        observation: 'Intersection asphalt was dry with no visible oil slick, gravel accumulation, or road surface degradation.',
        classification: 'OBSERVED',
        evidenceRefId: 'ev-002-03'
      },
      {
        id: 'so-2-4',
        observation: 'Vehicle A driver reports proceeding through steady green signal on 4th Avenue.',
        classification: 'REPORTED'
      },
      {
        id: 'so-2-5',
        observation: 'Vehicle B driver reports entering intersection during amber transition phase.',
        classification: 'REPORTED'
      },
      {
        id: 'so-2-6',
        observation: 'Geometric angles of deformation suggest collision velocity differential between 28 km/h and 38 km/h at moment of contact.',
        classification: 'INFERRED'
      }
    ],
    sequenceOfEvents: [
      {
        stepNumber: 1,
        timeReference: 'T - 3.5s',
        title: 'Approach to Intersection',
        description: 'Vehicle A was reportedly travelling northbound along 4th Ave approaching Market St. Vehicle B was westbound on Market St.',
        classification: 'REPORTED',
        evidenceRefIds: []
      },
      {
        stepNumber: 2,
        timeReference: 'T - 1.2s',
        title: 'Intersection Entry & Pre-Impact Maneuver',
        description: 'Vehicle B appears to have entered the intersection perimeter while Vehicle A was completing entry into the center lane. Observed tire scrub marks indicate pre-impact deceleration.',
        classification: 'INFERRED',
        evidenceRefIds: ['ev-002-04']
      },
      {
        stepNumber: 3,
        timeReference: 'T - 0.0s',
        title: 'Initial Physical Contact',
        description: 'Available evidence indicates initial contact between Vehicle B\'s front left assembly and Vehicle A\'s front right fender at approximately 75° relative angle.',
        classification: 'OBSERVED',
        evidenceRefIds: ['ev-002-01', 'ev-002-02', 'ev-002-03']
      },
      {
        stepNumber: 4,
        timeReference: 'T + 1.8s',
        title: 'Secondary Rotation & Final Rest',
        description: 'Visible damage and debris scatter are consistent with post-impact counter-clockwise rotation of Vehicle A before coming to rest near northeast curb line.',
        classification: 'INFERRED',
        evidenceRefIds: ['ev-002-03']
      }
    ],
    participantActions: [
      {
        participantId: 'p-002-1',
        participantLabel: 'Vehicle A (Marcus Bennett)',
        reportedAction: 'Proceeded straight through intersection on green signal at approx 45 km/h.',
        observedAction: 'Forward momentum along northbound lane with sudden lateral deflection.',
        possibleContributingAction: 'Available evidence does not demonstrate pre-impact evasive steering maneuvers prior to intersection crossing.',
        evidenceCitations: ['POLICE_CRIME_002_VehicleA_Crush', 'POLICE_CRIME_002_Debris_Field'],
        confidenceLevel: 'Moderate',
        uncertaintyNotes: 'Signal phase timing at exact millisecond of cross-line transit cannot be verified without municipal SCATS/traffic controller logs.'
      },
      {
        participantId: 'p-002-2',
        participantLabel: 'Vehicle B (Elena Rostova)',
        reportedAction: 'Attempted to clear intersection during yellow signal phase.',
        observedAction: 'Braking scrub marks (8.4m) prior to intersection box indicating late reaction.',
        possibleContributingAction: 'Possible entry into intersection without sufficient clearance time before conflicting traffic movement commenced.',
        evidenceCitations: ['POLICE_CRIME_002_VehicleB_Front', 'POLICE_CRIME_002_Tire_Scrub'],
        confidenceLevel: 'Moderate',
        uncertaintyNotes: 'Dashcam video or municipal telematics unavailable; amber clearance duration at this intersection is estimated at 3.6 seconds.'
      }
    ],
    evidenceLimitations: [
      'No dashcam or CCTV footage was provided for this case; signal phase states rely on participant statements and physical trajectory correlations.',
      'Electronic Data Recorder (EDR / Black Box) telemetry was not retrieved from either vehicle.',
      'Optical evidence was captured approximately 30 minutes post-incident; minor pedestrian foot traffic may have disturbed smaller plastic fragments in debris field.',
      'Speed estimations are geometric approximations based on crush depth profiles and do not represent definitive kinetic energy balance equations.'
    ],
    reconstruction: {
      scenarioTitle: 'Vehicle vs Vehicle: 4-Way Signalized Intersection Collision',
      roadType: 'four_way_intersection',
      actors: [
        {
          id: 'actor-a',
          label: 'Vehicle A (Civic)',
          type: 'vehicle',
          color: '#5FA6A0',
          startPos: { x: 300, y: 460, angle: 0 },
          preImpactPos: { x: 300, y: 350, angle: 0 },
          impactPos: { x: 300, y: 250, angle: 10 },
          finalRestPos: { x: 325, y: 175, angle: 35 },
          movementVector: 'Northbound on 4th Ave (~45 km/h est.)'
        },
        {
          id: 'actor-b',
          label: 'Vehicle B (RAV4)',
          type: 'vehicle',
          color: '#F59E0B',
          startPos: { x: 550, y: 250, angle: -90 },
          preImpactPos: { x: 420, y: 250, angle: -90 },
          impactPos: { x: 320, y: 250, angle: -85 },
          finalRestPos: { x: 260, y: 240, angle: -70 },
          movementVector: 'Westbound on Market St (~38 km/h decelerating)'
        }
      ],
      impactPoint: {
        x: 310,
        y: 250,
        label: 'Possible Impact Area',
        description: 'Estimated point of contact inside northeast quadrant box based on debris centroid.'
      },
      summaryData: {
        vehicleAMovement: 'Northbound trajectory on 4th Ave, maintaining lane alignment until contact.',
        vehicleBMovement: 'Westbound trajectory on Market St with evidence of late pre-impact deceleration.',
        possibleImpactArea: 'Northeast intersection quadrant, approx 4.2m north of Market St center line.',
        supportingEvidence: '8.4m tire scrub marks, front-right to front-left paint transfer, glass dispersal cone.',
        uncertaintyAssessment: 'Signal timing interval and exact brake application onset point cannot be definitively proven without EDR telemetry.'
      }
    }
  },
  {
    id: 'ACC-2026-003',
    title: 'Expressway 101 Multi-Vehicle Chain Collision',
    accidentType: 'vehicle_vs_multiple',
    status: 'Active Investigation',
    assignedOfficer: 'Det. M. Reynolds',
    badgeNumber: 'CIU-1044',
    createdAt: '2026-09-25 09:15',
    incidentDate: '2026-09-25',
    incidentTime: '08:20 AM',
    location: 'Hwy 101 Northbound, Milepost 44.2',
    weatherConditions: 'Dense morning fog, visibility < 50m, damp roadway',
    roadConditions: 'Three-lane divided highway, 100 km/h posted limit',
    userNarrative:
      'Investigating Officer Report: Highway Patrol units on scene for three-vehicle accordion-style collision during heavy localized fog. Vehicle 1 performed emergency stop. Vehicle 2 stopped or slowed immediately behind. Vehicle 3 (Commercial Box Truck) struck Vehicle 2 pushing it into Vehicle 1.',
    overviewSummary:
      'Preliminary multi-participant evidence indicates a three-vehicle accordion-style chain reaction during dense morning fog conditions. Available photographs show rear-end crush on Vehicle 1, sandwich intrusion on Vehicle 2, and front bumper crumple on Vehicle 3.',
    participants: [
      {
        id: 'p-003-1',
        label: 'Vehicle 1 — Lead Crossover',
        type: 'vehicle',
        role: 'driver',
        vehicleDetails: {
          registrationNumber: '5YYZ-991',
          vehicleType: 'Compact SUV',
          makeModel: 'Subaru Forester',
          color: 'Crystal White',
          driverName: 'David Cho'
        }
      },
      {
        id: 'p-003-2',
        label: 'Vehicle 2 — Midsize Sedan',
        type: 'vehicle',
        role: 'driver',
        vehicleDetails: {
          registrationNumber: '8QAA-112',
          vehicleType: 'Sedan',
          makeModel: 'Nissan Altima',
          color: 'Gunmetal Gray',
          driverName: 'Robert Vance'
        }
      },
      {
        id: 'p-003-3',
        label: 'Vehicle 3 — Box Delivery Truck',
        type: 'vehicle',
        role: 'driver',
        vehicleDetails: {
          registrationNumber: 'COMM-4912',
          vehicleType: 'Medium Duty Box Truck',
          makeModel: 'Freightliner M2',
          color: 'Industrial Blue',
          driverName: 'Carlos Gomez'
        }
      }
    ],
    evidenceFiles: [
      {
        id: 'ev-003-01',
        fileName: 'POLICE_HWY_003_RearCrush.jpg',
        fileSize: '4.9 MB',
        uploadedAt: '2026-09-25 09:20',
        thumbnailUrl: createEvidenceSvg('MULTI-VEHICLE SANDWICH CRUSH', '#1e293b', 'damage'),
        classification: 'OBSERVED',
        tags: ['Accordion Impact', 'Rear Intrusion']
      },
      {
        id: 'ev-003-02',
        fileName: 'POLICE_HWY_003_Fog_Visibility.jpg',
        fileSize: '3.7 MB',
        uploadedAt: '2026-09-25 09:25',
        thumbnailUrl: createEvidenceSvg('HIGHWAY FOG HORIZON', '#0f172a', 'intersection'),
        classification: 'OBSERVED',
        tags: ['Atmospheric Visibility', 'Highway Fog']
      },
      {
        id: 'ev-003-03',
        fileName: 'POLICE_HWY_003_Truck_Fascia.jpg',
        fileSize: '4.5 MB',
        uploadedAt: '2026-09-25 09:30',
        thumbnailUrl: createEvidenceSvg('COMMERCIAL TRUCK GRILL', '#1e293b', 'damage'),
        classification: 'OBSERVED',
        tags: ['Commercial Bumper', 'Underride Bar']
      }
    ],
    sceneObservations: [
      {
        id: 'so-003-1',
        observation: 'Visibility at scene was measured below 50 meters due to localized coastal fog bank.',
        classification: 'OBSERVED'
      },
      {
        id: 'so-003-2',
        observation: 'Vehicle 2 sustained concurrent front and rear structural crumple consistent with multi-impact chain.',
        classification: 'OBSERVED',
        evidenceRefId: 'ev-003-01'
      }
    ],
    sequenceOfEvents: [
      {
        stepNumber: 1,
        timeReference: 'T - 6.0s',
        title: 'Highway Speed Degradation',
        description: 'Lead vehicle reportedly slowed abruptly due to stopped queue in fog.',
        classification: 'REPORTED',
        evidenceRefIds: []
      },
      {
        stepNumber: 2,
        timeReference: 'T - 2.0s',
        title: 'Initial Rear Contact',
        description: 'Available evidence suggests Vehicle 2 made contact with rear of Vehicle 1.',
        classification: 'INFERRED',
        evidenceRefIds: ['ev-003-01']
      },
      {
        stepNumber: 3,
        timeReference: 'T - 0.0s',
        title: 'Secondary Heavy Contact',
        description: 'Vehicle 3 made contact with rear of Vehicle 2 pushing it into Vehicle 1.',
        classification: 'INFERRED',
        evidenceRefIds: ['ev-003-01']
      }
    ],
    participantActions: [
      {
        participantId: 'p-003-2',
        participantLabel: 'Vehicle 2 (Robert Vance)',
        reportedAction: 'Braked behind Vehicle 1, stopped in time before being struck from behind.',
        observedAction: 'Front and rear deformation present.',
        possibleContributingAction: 'Insufficient evidence to determine whether Vehicle 2 struck Vehicle 1 prior to Vehicle 3 impact.',
        evidenceCitations: ['POLICE_HWY_003_RearCrush.jpg'],
        confidenceLevel: 'Indeterminate',
        uncertaintyNotes: 'Requires comparative paint transfer forensic examination.'
      }
    ],
    evidenceLimitations: [
      'Preliminary case pending additional evidence uploads from highway patrol telemetry.',
      'Sequential impact timing (whether 2 struck 1 before 3 struck 2) cannot be definitively isolated without EDR download.'
    ],
    reconstruction: {
      scenarioTitle: 'Complex / Multiple Vehicle: 3-Vehicle Expressway Chain',
      roadType: 'highway_curve',
      actors: [
        {
          id: 'v1',
          label: 'Vehicle 1 (Lead)',
          type: 'vehicle',
          color: '#34D399',
          startPos: { x: 200, y: 200, angle: 90 },
          preImpactPos: { x: 260, y: 200, angle: 90 },
          impactPos: { x: 280, y: 200, angle: 90 },
          finalRestPos: { x: 300, y: 200, angle: 90 },
          movementVector: 'Northbound Lane 2 (Stopped/Slowed)'
        },
        {
          id: 'v2',
          label: 'Vehicle 2 (Mid)',
          type: 'vehicle',
          color: '#5FA6A0',
          startPos: { x: 340, y: 200, angle: 90 },
          preImpactPos: { x: 310, y: 200, angle: 90 },
          impactPos: { x: 290, y: 200, angle: 90 },
          finalRestPos: { x: 290, y: 200, angle: 90 },
          movementVector: 'Northbound Lane 2 (Braking)'
        },
        {
          id: 'v3',
          label: 'Vehicle 3 (Truck)',
          type: 'vehicle',
          color: '#F59E0B',
          startPos: { x: 480, y: 200, angle: 90 },
          preImpactPos: { x: 380, y: 200, angle: 90 },
          impactPos: { x: 305, y: 200, angle: 90 },
          finalRestPos: { x: 305, y: 200, angle: 90 },
          movementVector: 'Northbound Lane 2 (Heavy Deceleration)'
        }
      ],
      impactPoint: {
        x: 290,
        y: 200,
        label: 'Chain Collision Zone',
        description: 'Accordion impact zone along center highway lane.'
      },
      summaryData: {
        vehicleAMovement: 'Vehicle 1 braked to sudden stop in dense fog bank.',
        vehicleBMovement: 'Vehicle 2 and 3 closed headway with insufficient reaction margins.',
        possibleImpactArea: 'Lane 2 of Northbound Hwy 101, Milepost 44.2.',
        supportingEvidence: 'Sandwich crush geometry, rear tailgate penetration, front radiator collapse.',
        uncertaintyAssessment: 'Relative timing between first impact and second impact cannot be isolated without black box time-stamps.'
      }
    }
  },
  {
    id: 'ACC-2026-004',
    title: 'Canyon Road Guardrail Impact',
    accidentType: 'vehicle_vs_object',
    status: 'Analysis Complete',
    assignedOfficer: 'Officer T. Chen',
    badgeNumber: 'CIU-8821',
    createdAt: '2026-09-20 16:40',
    incidentDate: '2026-09-20',
    incidentTime: '03:15 PM',
    location: 'Canyon Crest Road, Curve 14, Mile 8',
    weatherConditions: 'Intermittent heavy rain, standing surface water',
    roadConditions: 'Reverse curve, 7% downgrade, steel W-beam guardrail on outer shoulder',
    userNarrative:
      'Investigating Officer Report: Responded to single vehicle off roadway incident. Vehicle lost lateral tire traction negotiating downhill left curve during heavy rainstorm, resulting in passenger-side contact with outer barrier.',
    overviewSummary:
      'Single vehicle fixed-object incident. Physical evidence indicates passenger-side lateral scraping against steel W-beam barrier following loss of directional stability on wet asphalt downgrade.',
    participants: [
      {
        id: 'p-004-1',
        label: 'Vehicle 1 — Electric Sedan',
        type: 'vehicle',
        role: 'driver',
        vehicleDetails: {
          registrationNumber: 'EV-8849',
          vehicleType: 'Sedan',
          makeModel: 'Tesla Model 3',
          color: 'Midnight Silver Metallic',
          driverName: 'Allison Ward'
        },
        damageObservations: [
          {
            component: 'Passenger Side Doors & Quarter Panel',
            description: 'Continuous horizontal furrow and paint striation matching 55cm guardrail ribbon height.',
            severity: 'Moderate',
            evidenceRefIds: ['ev-004-01']
          }
        ]
      },
      {
        id: 'p-004-2',
        label: 'Fixed Object — W-Beam Guardrail',
        type: 'other',
        role: 'other',
        otherDetails: {
          description: 'Caltrans Type 11 galvanized steel W-beam guardrail post assembly'
        },
        damageObservations: [
          {
            component: 'Guardrail Beam Post 12-14',
            description: 'Two posts deflected 12° outwards, horizontal galvanized rail scraped over 6.8m run.',
            severity: 'Minor',
            evidenceRefIds: ['ev-004-01']
          }
        ]
      }
    ],
    evidenceFiles: [
      {
        id: 'ev-004-01',
        fileName: 'POLICE_ROADS_004_Guardrail_Scratch.jpg',
        fileSize: '3.1 MB',
        uploadedAt: '2026-09-20 16:45',
        thumbnailUrl: createEvidenceSvg('GUARDRAIL CONTACT STRIATION', '#1e293b', 'damage'),
        classification: 'OBSERVED',
        tags: ['W-Beam Deformation', 'Paint Transfer']
      },
      {
        id: 'ev-004-02',
        fileName: 'POLICE_ROADS_004_Standing_Water.jpg',
        fileSize: '2.8 MB',
        uploadedAt: '2026-09-20 16:50',
        thumbnailUrl: createEvidenceSvg('ROADWAY PONDING SURVEY', '#0f172a', 'debris'),
        classification: 'OBSERVED',
        tags: ['Standing Water', 'Hydroplane Risk']
      }
    ],
    sceneObservations: [
      {
        id: 'so-004-1',
        observation: 'Continuous horizontal scratch pattern at 55cm elevation across passenger doors matches guardrail top edge.',
        classification: 'OBSERVED',
        evidenceRefId: 'ev-004-01'
      },
      {
        id: 'so-004-2',
        observation: 'Standing sheet water observed across apex of curve 14 during post-storm site inspection.',
        classification: 'OBSERVED'
      }
    ],
    sequenceOfEvents: [
      {
        stepNumber: 1,
        timeReference: 'T - 3.0s',
        title: 'Entry into Curve',
        description: 'Vehicle entered downhill left curve in heavy precipitation.',
        classification: 'REPORTED',
        evidenceRefIds: []
      },
      {
        stepNumber: 2,
        timeReference: 'T - 1.0s',
        title: 'Hydroplaning & Drift',
        description: 'Available evidence suggests loss of lateral tire traction across standing surface water pooling.',
        classification: 'INFERRED',
        evidenceRefIds: []
      },
      {
        stepNumber: 3,
        timeReference: 'T - 0.0s',
        title: 'Barrier Engagement',
        description: 'Passenger side contacted and was guided along outer guardrail ribbon.',
        classification: 'OBSERVED',
        evidenceRefIds: ['ev-004-01']
      }
    ],
    participantActions: [
      {
        participantId: 'p-004-1',
        participantLabel: 'Vehicle 1 Driver (Allison Ward)',
        reportedAction: 'Driving at 40 km/h, experienced sudden steering disconnect.',
        observedAction: 'Lateral slip without severe rollover or frontal crumple.',
        possibleContributingAction: 'Possible driving speed inconsistent with standing water depth and reduced wet pavement friction threshold.',
        evidenceCitations: ['POLICE_ROADS_004_Guardrail_Scratch.jpg'],
        confidenceLevel: 'Moderate',
        uncertaintyNotes: 'Tire tread depth at time of incident was not documented in available evidence.'
      }
    ],
    evidenceLimitations: [
      'No dashcam or telemetry data was provided.',
      'Road surface water depth at precise time of incident is unmeasured.'
    ],
    reconstruction: {
      scenarioTitle: 'Vehicle vs Fixed Object: Wet Curve Guardrail Redirection',
      roadType: 'highway_curve',
      actors: [
        {
          id: 'v-tesla',
          label: 'Vehicle 1',
          type: 'vehicle',
          color: '#5FA6A0',
          startPos: { x: 100, y: 150, angle: 45 },
          preImpactPos: { x: 220, y: 220, angle: 30 },
          impactPos: { x: 320, y: 260, angle: 15 },
          finalRestPos: { x: 420, y: 280, angle: 10 },
          movementVector: 'Downhill curve descent (~40 km/h loss of friction)'
        },
        {
          id: 'obj-guardrail',
          label: 'Guardrail Barrier',
          type: 'object',
          color: '#94A3B8',
          startPos: { x: 320, y: 275, angle: 15 },
          preImpactPos: { x: 320, y: 275, angle: 15 },
          impactPos: { x: 320, y: 275, angle: 15 },
          finalRestPos: { x: 320, y: 275, angle: 15 },
          movementVector: 'Fixed barrier assembly along shoulder'
        }
      ],
      impactPoint: {
        x: 320,
        y: 270,
        label: 'Glancing Barrier Contact',
        description: 'Outer shoulder guardrail engagement zone.'
      },
      summaryData: {
        vehicleAMovement: 'Drifted laterally toward outer radius shoulder upon loss of wet surface grip.',
        vehicleBMovement: 'Passive redirection along 6.8m galvanized steel beam segment.',
        possibleImpactArea: 'Milepost 8.2 outer curve boundary.',
        supportingEvidence: 'Continuous 55cm horizontal striation on passenger body panels matching barrier height.',
        uncertaintyAssessment: 'Exact hydroplaning speed threshold cannot be verified without tire pressure and tread depth data.'
      }
    }
  }
];
