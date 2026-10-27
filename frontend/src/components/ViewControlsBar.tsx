import React from 'react';
import { LayoutGrid, Table, Check, Layers, BookOpen, Sparkles } from 'lucide-react';

interface ViewControlsBarProps {
  activeFilter: 'all' | 'words' | 'phrases';
  onFilterChange: (filter: 'all' | 'words' | 'phrases') => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  defaultView: 'cards' | 'table';
  onSetDefaultView: (mode: 'cards' | 'table') => void;
  totalWords: number;
  totalPhrases: number;
  totalVisible: number;
}

export const ViewControlsBar: React.FC<ViewControlsBarProps> = ({
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  defaultView,
  onSetDefaultView,
  totalWords,
  totalPhrases,
  totalVisible,
}) => {
  const isCurrentViewDefault = viewMode === defaultView;

  return (
    <div className="glass-panel" style={{
      padding: '12px 18px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      background: 'rgba(15, 23, 42, 0.55)',
    }}>
      {/* Left: Filter Selectors (View All, Words Only, Phrases Only) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>
          Display:
        </span>

        {/* View All Option */}
        <button
          onClick={() => onFilterChange('all')}
          style={{
            background: activeFilter === 'all'
              ? 'linear-gradient(135deg, var(--primary-500) 0%, #4338ca 100%)'
              : 'rgba(255, 255, 255, 0.04)',
            color: activeFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
            border: activeFilter === 'all' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-glass)',
            boxShadow: activeFilter === 'all' ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={14} />
          <span>View All Data ({totalWords + totalPhrases})</span>
        </button>

        {/* Words Only Option */}
        <button
          onClick={() => onFilterChange('words')}
          style={{
            background: activeFilter === 'words'
              ? 'rgba(99, 102, 241, 0.25)'
              : 'rgba(255, 255, 255, 0.04)',
            color: activeFilter === 'words' ? '#ffffff' : 'var(--text-secondary)',
            border: activeFilter === 'words' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-glass)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          <BookOpen size={13} color={activeFilter === 'words' ? '#818cf8' : undefined} />
          <span>Words Only ({totalWords})</span>
        </button>

        {/* Phrases Only Option */}
        <button
          onClick={() => onFilterChange('phrases')}
          style={{
            background: activeFilter === 'phrases'
              ? 'rgba(16, 185, 129, 0.25)'
              : 'rgba(255, 255, 255, 0.04)',
            color: activeFilter === 'phrases' ? '#ffffff' : 'var(--text-secondary)',
            border: activeFilter === 'phrases' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-glass)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={13} color={activeFilter === 'phrases' ? '#34d399' : undefined} />
          <span>Phrases Only ({totalPhrases})</span>
        </button>

        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>
          &bull; {totalVisible} showing
        </span>
      </div>

      {/* Right: View Mode Switcher (Cards vs Tabular) & Default Preference */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* View Switcher Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: 3,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glass)',
        }}>
          {/* Card Grid View */}
          <button
            onClick={() => onViewModeChange('cards')}
            title="Card Grid View"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: viewMode === 'cards' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: viewMode === 'cards' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <LayoutGrid size={14} />
            <span>Cards</span>
          </button>

          {/* Tabular View */}
          <button
            onClick={() => onViewModeChange('table')}
            title="Tabular Data Table View"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: viewMode === 'table' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: viewMode === 'table' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <Table size={14} />
            <span>Table</span>
          </button>
        </div>

        {/* Default View Preference Setting */}
        {isCurrentViewDefault ? (
          <span
            title="This view opens automatically whenever you visit Lexicon"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#34d399',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Check size={12} /> Default View ({viewMode === 'cards' ? 'Cards' : 'Table'})
          </span>
        ) : (
          <button
            onClick={() => onSetDefaultView(viewMode)}
            title={`Save ${viewMode === 'cards' ? 'Cards' : 'Table'} view as your default preference`}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#cbd5e1',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px dashed rgba(255, 255, 255, 0.25)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-400)';
              (e.currentTarget as HTMLElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.25)';
              (e.currentTarget as HTMLElement).style.color = '#cbd5e1';
            }}
          >
            Set as Default
          </button>
        )}
      </div>
    </div>
  );
};
