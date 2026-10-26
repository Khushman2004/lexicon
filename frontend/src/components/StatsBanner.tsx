import React from 'react';
import type { LibrarySummary } from '../api/client';
import { BookOpen, Sparkles, TrendingUp, Tag } from 'lucide-react';

interface StatsBannerProps {
  summary: LibrarySummary | null;
  username?: string;
  isOtherUser?: boolean;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ summary, username, isOtherUser }) => {
  if (!summary) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16,
      marginBottom: 24,
    }}>
      {/* Total Words Card */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#818cf8',
        }}>
          <BookOpen size={22} />
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {summary.totalWords}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {isOtherUser ? `${username}'s Words` : 'Total Words Cataloged'}
          </div>
        </div>
      </div>

      {/* Total Phrases Card */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#34d399',
        }}>
          <Sparkles size={22} />
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {summary.totalPhrases}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {isOtherUser ? `${username}'s Phrases` : 'Total Phrases & Idioms'}
          </div>
        </div>
      </div>

      {/* Weekly Velocity */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fbbf24',
        }}>
          <TrendingUp size={22} />
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            +{summary.wordsAddedThisWeek + summary.phrasesAddedThisWeek}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Added This Week
          </div>
        </div>
      </div>

      {/* Top Tags or Recent Activity */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
          <Tag size={13} color="#a5b4fc" />
          <span>Curated Disciplines & Tags</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {summary.topTags && summary.topTags.length > 0 ? (
            summary.topTags.map((tag) => (
              <span key={tag} className="badge badge-default" style={{ fontSize: 11, padding: '2px 8px' }}>
                #{tag}
              </span>
            ))
          ) : (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No tags yet</span>
          )}
        </div>
      </div>
    </div>
  );
};
