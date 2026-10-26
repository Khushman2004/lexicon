import React, { useState } from 'react';
import type { Phrase } from '../api/client';
import { Volume2, Edit3, Trash2, Copy, Check, Calendar, Globe, Lock, MessageSquare } from 'lucide-react';

interface PhraseCardProps {
  phrase: Phrase;
  isOwner: boolean;
  onEdit: (phrase: Phrase) => void;
  onDelete: (id: string) => void;
}

export const PhraseCard: React.FC<PhraseCardProps> = ({ phrase, isOwner, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase.phraseText);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`"${phrase.phraseText}": ${phrase.meaning}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const formattedDate = new Date(phrase.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="glass-panel glass-panel-hover" style={{
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
    }}>
      <div>
        {/* Header: Phrase Text & Actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h3 style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.01em',
              }}>
                &ldquo;{phrase.phraseText}&rdquo;
              </h3>

              <button
                onClick={speak}
                className="btn-icon"
                title="Pronounce phrase"
                style={{
                  color: isSpeaking ? '#34d399' : 'var(--text-muted)',
                  borderColor: isSpeaking ? 'var(--accent-emerald)' : undefined,
                }}
              >
                <Volume2 size={16} />
              </button>

              <span className="badge badge-idiom">
                Phrase / Idiom
              </span>

              {phrase.isPublic ? (
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

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={copyToClipboard}
              className="btn-icon"
              title="Copy phrase"
            >
              {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
            </button>

            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(phrase)}
                  className="btn-icon"
                  title="Edit phrase"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => onDelete(phrase.id)}
                  className="btn-icon"
                  title="Delete phrase"
                  style={{ color: '#fb7185' }}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Meaning */}
        <p style={{
          fontSize: 15,
          color: 'var(--text-primary)',
          lineHeight: 1.6,
          marginBottom: 14,
        }}>
          {phrase.meaning}
        </p>

        {/* Context / Dialogue */}
        {phrase.context && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.06)',
            borderLeft: '3px solid var(--accent-emerald)',
            padding: '10px 14px',
            borderRadius: '0 8px 8px 0',
            fontSize: 13,
            color: '#a7f3d0',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}>
            <MessageSquare size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: '#34d399', fontSize: 12 }}>Usage Context: </strong>
              <span>{phrase.context}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {phrase.notes && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Note: </strong> {phrase.notes}
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
          {phrase.tags ? (
            phrase.tags.split(',').map((tag, idx) => (
              <span key={idx} style={{
                fontSize: 11,
                color: '#6ee7b7',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '2px 8px',
                borderRadius: 4,
              }}>
                #{tag.trim()}
              </span>
            ))
          ) : (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Conversational</span>
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
