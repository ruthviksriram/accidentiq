import React from 'react';
import { Trash2, Car, User, Bike, HelpCircle, ShieldAlert } from 'lucide-react';
import { Participant, ParticipantType, ParticipantRole } from '../../types';

interface ParticipantCardProps {
  participant: Participant;
  index: number;
  onUpdate: (updated: Participant) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  index,
  onUpdate,
  onRemove,
  canRemove
}) => {
  const handleTypeChange = (newType: ParticipantType) => {
    let defaultRole: ParticipantRole = 'other';
    if (newType === 'vehicle') defaultRole = 'driver';
    else if (newType === 'pedestrian') defaultRole = 'pedestrian';
    else if (newType === 'bicycle') defaultRole = 'cyclist';

    onUpdate({
      ...participant,
      type: newType,
      role: defaultRole,
      label: `Participant ${index + 1}: ${newType.charAt(0).toUpperCase() + newType.slice(1)}`
    });
  };

  const handleRoleChange = (newRole: ParticipantRole) => {
    onUpdate({
      ...participant,
      role: newRole
    });
  };

  const handleLabelChange = (newLabel: string) => {
    onUpdate({
      ...participant,
      label: newLabel
    });
  };

  const updateVehicleDetails = (field: string, value: string) => {
    onUpdate({
      ...participant,
      vehicleDetails: {
        vehicleType: 'Sedan',
        ...participant.vehicleDetails,
        [field]: value
      }
    });
  };

  const updatePedestrianDetails = (field: string, value: string) => {
    onUpdate({
      ...participant,
      pedestrianDetails: {
        ...participant.pedestrianDetails,
        [field]: value
      }
    });
  };

  const updateBicycleDetails = (field: string, value: any) => {
    onUpdate({
      ...participant,
      bicycleDetails: {
        ...participant.bicycleDetails,
        [field]: value
      }
    });
  };

  const updateOtherDetails = (field: string, value: string) => {
    onUpdate({
      ...participant,
      otherDetails: {
        description: '',
        ...participant.otherDetails,
        [field]: value
      }
    });
  };

  const typeIcons: Record<ParticipantType, any> = {
    vehicle: Car,
    pedestrian: User,
    bicycle: Bike,
    other: HelpCircle
  };

  const CurrentTypeIcon = typeIcons[participant.type] || HelpCircle;

  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-canvas-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginBottom: '1rem'
      }}
    >
      {/* Participant Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.85rem',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-surface)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-text)'
            }}
          >
            <CurrentTypeIcon size={16} />
          </div>
          <div>
            <input
              type="text"
              value={participant.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="e.g. Vehicle A — Blue Sedan"
              style={{
                fontWeight: 600,
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px dashed var(--border-medium)',
                padding: '0.1rem 0.2rem',
                minWidth: '220px'
              }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Identifier #{index + 1}
            </div>
          </div>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(participant.id)}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--danger-text)', padding: '0.35rem 0.6rem' }}
            title="Remove Participant"
          >
            <Trash2 size={14} />
            <span>Remove</span>
          </button>
        )}
      </div>

      {/* Participant Type & Role Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <label className="form-label">
            Participant Type *
          </label>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {(['vehicle', 'pedestrian', 'bicycle', 'other'] as ParticipantType[]).map((t) => {
              const Icon = typeIcons[t];
              const isSelected = participant.type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 500,
                    backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-canvas-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={13} />
                  <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="form-label">
            Assigned Role *
          </label>
          <select
            className="form-select"
            value={participant.role}
            onChange={(e) => handleRoleChange(e.target.value as ParticipantRole)}
          >
            <option value="driver">Driver</option>
            <option value="pedestrian">Pedestrian</option>
            <option value="passenger">Passenger</option>
            <option value="cyclist">Cyclist</option>
            <option value="other">Other / Unknown</option>
          </select>
        </div>
      </div>

      {/* Conditional Participant Fields */}
      {participant.type === 'vehicle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label className="form-label">Registration / Plate #</label>
              <input
                type="text"
                className="form-input mono"
                placeholder="e.g. 7KXR-491"
                value={participant.vehicleDetails?.registrationNumber || ''}
                onChange={(e) => updateVehicleDetails('registrationNumber', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Vehicle Type</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sedan, SUV, Van, Truck"
                value={participant.vehicleDetails?.vehicleType || ''}
                onChange={(e) => updateVehicleDetails('vehicleType', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Make & Model (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2023 Honda Civic"
                value={participant.vehicleDetails?.makeModel || ''}
                onChange={(e) => updateVehicleDetails('makeModel', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label className="form-label">Driver Name (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Full driver name"
                value={participant.vehicleDetails?.driverName || ''}
                onChange={(e) => updateVehicleDetails('driverName', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Owner Name (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Owner / Fleet organization"
                value={participant.vehicleDetails?.ownerName || ''}
                onChange={(e) => updateVehicleDetails('ownerName', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Driver License # (optional)</label>
              <input
                type="text"
                className="form-input mono"
                placeholder="DL-XXXXXXX"
                value={participant.vehicleDetails?.driverLicense || ''}
                onChange={(e) => updateVehicleDetails('driverLicense', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {participant.type === 'pedestrian' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <div>
            <label className="form-label">Pedestrian Name (optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sarah Lindqvist"
              value={participant.pedestrianDetails?.name || ''}
              onChange={(e) => updatePedestrianDetails('name', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Age (optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 34"
              value={participant.pedestrianDetails?.age || ''}
              onChange={(e) => updatePedestrianDetails('age', e.target.value)}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Reported Activity / Position</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Crossing southbound within marked zebra crosswalk"
              value={participant.pedestrianDetails?.reportedActivity || ''}
              onChange={(e) => updatePedestrianDetails('reportedActivity', e.target.value)}
            />
          </div>
        </div>
      )}

      {participant.type === 'bicycle' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <div>
            <label className="form-label">Cyclist Name (optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Full name"
              value={participant.bicycleDetails?.cyclistName || ''}
              onChange={(e) => updateBicycleDetails('cyclistName', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Bicycle Type / Model</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Road bike, Commuter E-bike"
              value={participant.bicycleDetails?.bicycleType || ''}
              onChange={(e) => updateBicycleDetails('bicycleType', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Safety Gear / Helmet</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Helmet worn, front white LED lamp"
              value={participant.bicycleDetails?.lightingOrReflectors || ''}
              onChange={(e) => updateBicycleDetails('lightingOrReflectors', e.target.value)}
            />
          </div>
        </div>
      )}

      {participant.type === 'other' && (
        <div>
          <label className="form-label">Participant / Object Description</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Describe the participant, fixed obstacle, guardrail, animal, or road fixture..."
            value={participant.otherDetails?.description || ''}
            onChange={(e) => updateOtherDetails('description', e.target.value)}
          />
        </div>
      )}

      {/* Security & Privacy Helper Notice */}
      <div
        style={{
          marginTop: '0.85rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--bg-canvas-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.72rem',
          color: 'var(--text-tertiary)'
        }}
      >
        <ShieldAlert size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <span>Personal information is evidentiary case data. Non-mandatory fields can be left blank if unknown or protected.</span>
      </div>
    </div>
  );
};
