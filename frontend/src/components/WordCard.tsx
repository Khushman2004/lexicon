import React, { useState } from 'react';
import type { Word } from '../api/client';
import { Volume2, Edit3, Trash2, Copy, Check, Calendar, Globe, Lock } from 'lucide-react';

interface WordCardProps {
  word: Word;
  isOwner: boolean;
  onEdit: (word: Word) => void;
  onDelete: (id: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({ word, isOwner, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.term);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${word.term}: ${word.definition}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const formattedDate = new Date(word.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const partOfSpeechClass = word.partOfSpeech
    ? `badge badge-${word.partOfSpeech.toLowerCase()}`
    : 'badge badge-default';

  return (
    <div className="glass-panel glass-panel-hover" style={{
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
    }}>
      <div>
        {/* Header: Term, Pronounce, Badges & Actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h3 style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}>
                {word.term}
              </h3>

              <button
                onClick={speak}
                className="btn-icon"
                title="Pronounce word"
                style={{
                  color: isSpeaking ? '#818cf8' : 'var(--text-muted)',
                  borderColor: isSpeaking ? 'var(--primary-500)' : undefined,
                }}
              >
                <Volume2 size={16} />
              </button>

              {word.partOfSpeech && (
                <span className={partOfSpeechClass}>
                  {word.partOfSpeech}
                </span>
              )}

              {word.isPublic ? (
                <span title="Public in community explore" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                  <Globe size={12} color="#10b981" />
                </span>
              ) : (
                <span title="Private entry" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                  <Lock size={12} color="#f59e0b" />
                </span>
              )}
            </div>
          </div>

          {/* Top Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={copyToClipboard}
              className="btn-icon"
              title="Copy definition"
            >
              {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
            </button>

            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(word)}
                  className="btn-icon"
                  title="Edit word"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => onDelete(word.id)}
                  className="btn-icon"
                  title="Delete word"
                  style={{ color: '#fb7185' }}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Definition */}
        <p style={{
          fontSize: 15,
          color: 'var(--text-primary)',
          lineHeight: 1.6,
          marginBottom: 14,
        }}>
          {word.definition}
        </p>

        {/* Example Sentence */}
        {word.exampleSentence && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            borderLeft: '3px solid var(--primary-500)',
            padding: '10px 14px',
            borderRadius: '0 8px 8px 0',
            fontSize: 13,
            color: '#cbd5e1',
            fontStyle: 'italic',
            marginBottom: 14,
          }}>
            &ldquo;{word.exampleSentence}&rdquo;
          </div>
        )}

        {/* Notes / Etymology */}
        {word.notes && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Note: </strong> {word.notes}
          </div>
        )}
      </div>

      {/* Footer: Tags & Datetime */}
      <div style={{
        paddingTop: 12,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {word.tags ? (
            word.tags.split(',').map((tag, idx) => (
              <span key={idx} style={{
                fontSize: 11,
                color: '#a5b4fc',
                background: 'rgba(99, 102, 241, 0.1)',
                padding: '2px 8px',
                borderRadius: 4,
              }}>
                #{tag.trim()}
              </span>
            ))
          ) : (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vocabulary</span>
          )}
        </div>

        {/* Creation Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
          <Calendar size={12} />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};
