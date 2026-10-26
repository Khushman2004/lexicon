import React from 'react';

interface AlphabetBarProps {
  selectedLetter: string | null;
  onSelectLetter: (letter: string | null) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const AlphabetBar: React.FC<AlphabetBarProps> = ({ selectedLetter, onSelectLetter }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      overflowX: 'auto',
      padding: '8px 12px',
      background: 'rgba(15, 23, 42, 0.4)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-glass)',
      marginBottom: 20,
    }}>
      <button
        onClick={() => onSelectLetter(null)}
        style={{
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          fontWeight: 700,
          background: selectedLetter === null ? 'var(--primary-500)' : 'transparent',
          color: selectedLetter === null ? '#ffffff' : 'var(--text-muted)',
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
        }}
      >
        All (A-Z)
      </button>

      <div style={{ width: 1, height: 16, background: 'var(--border-subtle)', margin: '0 4px' }} />

      {ALPHABET.map((letter) => {
        const isSelected = selectedLetter === letter;
        return (
          <button
            key={letter}
            onClick={() => onSelectLetter(isSelected ? null : letter)}
            style={{
              minWidth: 28,
              height: 28,
              padding: '0 6px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isSelected ? 'var(--primary-500)' : 'rgba(255, 255, 255, 0.03)',
              color: isSelected ? '#ffffff' : 'var(--text-secondary)',
              border: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
};
