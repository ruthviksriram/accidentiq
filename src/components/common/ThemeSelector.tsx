import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options = [
    { id: 'light', label: 'Light', icon: Sun, desc: 'Clean high-contrast daylight palette' },
    { id: 'dark', label: 'Dark', icon: Moon, desc: 'Investigation-grade subdued dark canvas' },
    { id: 'system', label: 'System', icon: Laptop, desc: 'Follows operating system preference' }
  ] as const;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              gap: '0.4rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              backgroundColor: isSelected ? 'var(--accent-surface)' : 'var(--bg-surface)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)'
                }}
              >
                <Icon size={16} />
                <span>{opt.label}</span>
              </div>
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-medium)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isSelected && (
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-primary)'
                    }}
                  />
                )}
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>
              {opt.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
};
