import React, { useState } from 'react';
import { Search, Calendar, ArrowUpDown, X } from 'lucide-react';

export interface FilterState {
  search: string;
  datePreset: 'all' | 'today' | '7days' | '30days' | 'custom';
  fromDate: string;
  toDate: string;
  sortOrder: 'alpha-asc' | 'alpha-desc' | 'date-desc' | 'date-asc';
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalCount: number;
  itemType: 'words' | 'phrases' | 'entries';
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, totalCount, itemType }) => {
  const [showCustomDate, setShowCustomDate] = useState(filters.datePreset === 'custom');

  const handleDatePresetChange = (preset: FilterState['datePreset']) => {
    const now = new Date();
    let fromDate = '';
    let toDate = '';

    if (preset === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      fromDate = today.toISOString();
      toDate = new Date().toISOString();
    } else if (preset === '7days') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      fromDate = past7.toISOString();
      toDate = '';
    } else if (preset === '30days') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      fromDate = past30.toISOString();
      toDate = '';
    }

    setShowCustomDate(preset === 'custom');
    onChange({
      ...filters,
      datePreset: preset,
      fromDate: preset === 'custom' ? filters.fromDate : fromDate,
      toDate: preset === 'custom' ? filters.toDate : toDate,
    });
  };

  const handleCustomDateChange = (field: 'fromDate' | 'toDate', val: string) => {
    const isoVal = val ? new Date(val).toISOString() : '';
    onChange({
      ...filters,
      [field]: isoVal,
    });
  };

  const clearFilters = () => {
    setShowCustomDate(false);
    onChange({
      search: '',
      datePreset: 'all',
      fromDate: '',
      toDate: '',
      sortOrder: 'alpha-asc',
    });
  };

  const hasActiveFilters = filters.search || filters.datePreset !== 'all' || filters.sortOrder !== 'alpha-asc';

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
      }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          flex: '1 1 260px',
          minWidth: 220,
        }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 36, paddingRight: 32, fontSize: 13 }}
            placeholder={`Search ${itemType} by title, definition, tags...`}
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Datetime Filter Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, marginRight: 2 }}>
            <Calendar size={15} color="#818cf8" />
            <span>Date Filter:</span>
          </div>

          <select
            className="form-select"
            value={filters.datePreset}
            onChange={(e) => handleDatePresetChange(e.target.value as FilterState['datePreset'])}
            style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }}
          >
            <option value="all">All Dates</option>
            <option value="today">Added Today</option>
            <option value="7days">Past 7 Days</option>
            <option value="30days">Past 30 Days</option>
            <option value="custom">Custom Date Range...</option>
          </select>
        </div>

        {/* Sort Order Selector (Defaults to Automatic Alphabetical A-Z) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
            <ArrowUpDown size={15} color="#34d399" />
            <span>Sort:</span>
          </div>
          <select
            className="form-select"
            value={filters.sortOrder}
            onChange={(e) => onChange({ ...filters, sortOrder: e.target.value as FilterState['sortOrder'] })}
            style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }}
          >
            <option value="alpha-asc">Alphabetical (A &rarr; Z) [Default]</option>
            <option value="alpha-desc">Alphabetical (Z &rarr; A)</option>
            <option value="date-desc">Newest Added First</option>
            <option value="date-asc">Oldest Added First</option>
          </select>
        </div>

        {/* Clear Filters & Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Showing <strong>{totalCount}</strong> {itemType}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                color: '#fb7185',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <X size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Picker (Conditional) */}
      {showCustomDate && (
        <div style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc' }}>
            Custom Datetime Window:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>From:</label>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }}
              value={filters.fromDate ? filters.fromDate.substring(0, 10) : ''}
              onChange={(e) => handleCustomDateChange('fromDate', e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>To:</label>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }}
              value={filters.toDate ? filters.toDate.substring(0, 10) : ''}
              onChange={(e) => handleCustomDateChange('toDate', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
