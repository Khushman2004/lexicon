import { useState } from 'react';
import type { Word, Phrase } from '../api/client';
import { Volume2, Edit3, Trash2, Copy, Check, Calendar, Globe, Lock, BookOpen, Sparkles } from 'lucide-react';

export type DisplayItem =
  | { type: 'word'; item: Word }
  | { type: 'phrase'; item: Phrase };

interface TableViewProps {
  items: DisplayItem[];
  isOwner: boolean;
  onEditWord: (word: Word) => void;
  onDeleteWord: (id: string) => void;
  onEditPhrase: (phrase: Phrase) => void;
  onDeletePhrase: (id: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  items,
  isOwner,
  onEditWord,
  onDeleteWord,
  onEditPhrase,
  onDeletePhrase,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const speak = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  if (items.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: 18, color: '#ffffff', marginBottom: 6 }}>No records in this view</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Try clearing search filters or add entries to your personal library.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{
      overflowX: 'auto',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-glass)',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: 13,
      }}>
        <thead>
          <tr style={{
            background: 'rgba(15, 23, 42, 0.7)',
            borderBottom: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            <th style={{ padding: '14px 18px', fontWeight: 700 }}>Entry</th>
            <th style={{ padding: '14px 16px', fontWeight: 700 }}>Type</th>
            <th style={{ padding: '14px 18px', fontWeight: 700, minWidth: 220 }}>Definition / Meaning</th>
            <th style={{ padding: '14px 18px', fontWeight: 700, minWidth: 200 }}>Example / Context</th>
            <th style={{ padding: '14px 16px', fontWeight: 700 }}>Tags</th>
            <th style={{ padding: '14px 16px', fontWeight: 700, whiteSpace: 'nowrap' }}>Added</th>
            <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((entry, idx) => {
            const isWord = entry.type === 'word';
            const id = isWord ? entry.item.id : entry.item.id;
            const title = isWord ? entry.item.term : entry.item.phraseText;
            const definition = isWord ? entry.item.definition : entry.item.meaning;
            const example = isWord ? entry.item.exampleSentence : entry.item.context;
            const tags = entry.item.tags;
            const isPublic = entry.item.isPublic;
            const dateStr = new Date(entry.item.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <tr
                key={`${entry.type}-${id}-${idx}`}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99, 102, 241, 0.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent';
                }}
              >
                {/* Entry Title & Audio */}
                <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => speak(id, title)}
                      className="btn-icon"
                      title="Pronounce"
                      style={{
                        width: 28,
                        height: 28,
                        color: speakingId === id ? (isWord ? '#818cf8' : '#34d399') : 'var(--text-muted)',
                        borderColor: speakingId === id ? 'var(--primary-500)' : undefined,
                      }}
                    >
                      <Volume2 size={13} />
                    </button>
                    <div>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        {title}
                        {isPublic ? (
                          <span title="Public" style={{ display: 'inline-flex' }}>
                            <Globe size={11} color="#10b981" />
                          </span>
                        ) : (
                          <span title="Private" style={{ display: 'inline-flex' }}>
                            <Lock size={11} color="#f59e0b" />
                          </span>
                        )}
                      </div>
                      {isWord && entry.item.notes && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          Note: {entry.item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Type Badge */}
                <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                  {isWord ? (
                    <span className={entry.item.partOfSpeech ? `badge badge-${entry.item.partOfSpeech.toLowerCase()}` : 'badge badge-default'} style={{ fontSize: 11 }}>
                      <BookOpen size={10} />
                      {entry.item.partOfSpeech || 'Word'}
                    </span>
                  ) : (
                    <span className="badge badge-idiom" style={{ fontSize: 11 }}>
                      <Sparkles size={10} />
                      Phrase
                    </span>
                  )}
                </td>

                {/* Definition / Meaning */}
                <td style={{ padding: '14px 18px', verticalAlign: 'top', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {definition}
                </td>

                {/* Example / Context */}
                <td style={{ padding: '14px 18px', verticalAlign: 'top', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  {example ? (
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      padding: '6px 10px',
                      borderRadius: 6,
                      borderLeft: isWord ? '2px solid var(--primary-500)' : '2px solid var(--accent-emerald)',
                      fontSize: 12,
                    }}>
                      &ldquo;{example}&rdquo;
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                  )}
                </td>

                {/* Tags */}
                <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {tags ? (
                      tags.split(',').map((tag, tIdx) => (
                        <span key={tIdx} style={{
                          fontSize: 10,
                          color: '#a5b4fc',
                          background: 'rgba(99, 102, 241, 0.1)',
                          padding: '1px 6px',
                          borderRadius: 3,
                          whiteSpace: 'nowrap',
                        }}>
                          #{tag.trim()}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                    )}
                  </div>
                </td>

                {/* Date */}
                <td style={{ padding: '14px 16px', verticalAlign: 'top', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} />
                    <span>{dateStr}</span>
                  </div>
                </td>

                {/* Actions */}
                <td style={{ padding: '14px 18px', verticalAlign: 'top', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => copyText(id, `${title}: ${definition}`)}
                      className="btn-icon"
                      title="Copy"
                      style={{ width: 28, height: 28 }}
                    >
                      {copiedId === id ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    </button>

                    {isOwner && (
                      <>
                        <button
                          onClick={() => isWord ? onEditWord(entry.item) : onEditPhrase(entry.item)}
                          className="btn-icon"
                          title="Edit"
                          style={{ width: 28, height: 28 }}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => isWord ? onDeleteWord(entry.item.id) : onDeletePhrase(entry.item.id)}
                          className="btn-icon"
                          title="Delete"
                          style={{ width: 28, height: 28, color: '#fb7185' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
