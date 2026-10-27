import React from 'react';
import type { LibrarySummary } from '../api/client';
import { BookOpen, Sparkles, TrendingUp, Tag, CheckCircle2 } from 'lucide-react';

interface StatsBannerProps {
  summary: LibrarySummary | null;
  username?: string;
  isOtherUser?: boolean;
  activeFilter: 'all' | 'words' | 'phrases';
  onFilterChange: (filter: 'all' | 'words' | 'phrases') => void;
  onSelectTag?: (tag: string) => void;
  onWeeklyFilter?: () => void;
  isWeeklyActive?: boolean;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  summary,
  username,
  isOtherUser,
  activeFilter,
  onFilterChange,
  onSelectTag,
  onWeeklyFilter,
  isWeeklyActive = false,
}) => {
  if (!summary) return null;

  const isWordsActive = activeFilter === 'words';
  const isPhrasesActive = activeFilter === 'phrases';

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Clickable Stat Boxes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 16,
      }}>
        {/* Total Words Card - Clickable Filter */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onFilterChange(isWordsActive ? 'all' : 'words')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFilterChange(isWordsActive ? 'all' : 'words'); }}
          className="glass-panel"
          style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            border: isWordsActive ? '1.5px solid var(--primary-500)' : '1px solid var(--border-glass)',
            background: isWordsActive
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(15, 23, 42, 0.85) 100%)'
              : undefined,
            boxShadow: isWordsActive ? '0 0 25px rgba(99, 102, 241, 0.35)' : undefined,
            transform: isWordsActive ? 'translateY(-2px)' : undefined,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}>
              <BookOpen size={20} />
            </div>

            {isWordsActive ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                color: '#c7d2fe',
                background: 'rgba(99, 102, 241, 0.3)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(99, 102, 241, 0.5)',
              }}>
                <CheckCircle2 size={12} color="#818cf8" /> Filter Active
              </span>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Click to filter
              </span>
            )}
          </div>

          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
              {summary.totalWords}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: isWordsActive ? '#c7d2fe' : 'var(--text-secondary)', marginTop: 4 }}>
              {isOtherUser ? `${username}'s Words` : 'Words Catalog'}
            </div>
          </div>
        </div>

        {/* Total Phrases Card - Clickable Filter */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onFilterChange(isPhrasesActive ? 'all' : 'phrases')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFilterChange(isPhrasesActive ? 'all' : 'phrases'); }}
          className="glass-panel"
          style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            border: isPhrasesActive ? '1.5px solid var(--accent-emerald)' : '1px solid var(--border-glass)',
            background: isPhrasesActive
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(15, 23, 42, 0.85) 100%)'
              : undefined,
            boxShadow: isPhrasesActive ? '0 0 25px rgba(16, 185, 129, 0.35)' : undefined,
            transform: isPhrasesActive ? 'translateY(-2px)' : undefined,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
            }}>
              <Sparkles size={20} />
            </div>

            {isPhrasesActive ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                color: '#a7f3d0',
                background: 'rgba(16, 185, 129, 0.3)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
              }}>
                <CheckCircle2 size={12} color="#34d399" /> Filter Active
              </span>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Click to filter
              </span>
            )}
          </div>

          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
              {summary.totalPhrases}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: isPhrasesActive ? '#a7f3d0' : 'var(--text-secondary)', marginTop: 4 }}>
              {isOtherUser ? `${username}'s Phrases` : 'Phrases & Idioms'}
            </div>
          </div>
        </div>

        {/* Weekly Velocity Card - Clickable Filter for This Week's Words & Phrases */}
        <div
          role={onWeeklyFilter ? 'button' : undefined}
          tabIndex={onWeeklyFilter ? 0 : undefined}
          onClick={onWeeklyFilter}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onWeeklyFilter) onWeeklyFilter(); }}
          className="glass-panel"
          style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: onWeeklyFilter ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden',
            border: isWeeklyActive ? '1.5px solid #f59e0b' : '1px solid var(--border-glass)',
            background: isWeeklyActive
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(15, 23, 42, 0.85) 100%)'
              : undefined,
            boxShadow: isWeeklyActive ? '0 0 25px rgba(245, 158, 11, 0.35)' : undefined,
            transform: isWeeklyActive ? 'translateY(-2px)' : undefined,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
            }}>
              <TrendingUp size={20} />
            </div>

            {isWeeklyActive ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                color: '#fef3c7',
                background: 'rgba(245, 158, 11, 0.3)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
              }}>
                <CheckCircle2 size={12} color="#fbbf24" /> Filter Active
              </span>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Click to filter
              </span>
            )}
          </div>

          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
              +{summary.wordsAddedThisWeek + summary.phrasesAddedThisWeek}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: isWeeklyActive ? '#fef3c7' : 'var(--text-secondary)', marginTop: 4 }}>
              Added This Week ({summary.wordsAddedThisWeek}w + {summary.phrasesAddedThisWeek}p)
            </div>
          </div>
        </div>

        {/* Disciplines & Tags Card */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
              <Tag size={13} color="#a5b4fc" />
              <span>Curated Disciplines & Tags</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {summary.topTags && summary.topTags.length > 0 ? (
                summary.topTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onSelectTag?.(tag)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: '#c7d2fe',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      borderRadius: 4,
                      fontSize: 11,
                      padding: '2px 8px',
                      cursor: onSelectTag ? 'pointer' : 'default',
                    }}
                  >
                    #{tag}
                  </button>
                ))
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No tags yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
