import React, { useState, useEffect } from 'react';
import type { Phrase } from '../api/client';
import { X, Sparkles } from 'lucide-react';

interface PhraseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    phraseText: string;
    meaning: string;
    context?: string;
    tags?: string;
    notes?: string;
    isPublic: boolean;
  }) => Promise<void>;
  initialData?: Phrase | null;
}

export const PhraseModal: React.FC<PhraseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [phraseText, setPhraseText] = useState('');
  const [meaning, setMeaning] = useState('');
  const [context, setContext] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setPhraseText(initialData.phraseText);
      setMeaning(initialData.meaning);
      setContext(initialData.context || '');
      setTags(initialData.tags || '');
      setNotes(initialData.notes || '');
      setIsPublic(initialData.isPublic);
    } else {
      setPhraseText('');
      setMeaning('');
      setContext('');
      setTags('');
      setNotes('');
      setIsPublic(true);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phraseText.trim()) {
      setError('Please enter the phrase / idiom text.');
      return;
    }
    if (!meaning.trim()) {
      setError('Please provide the phrase meaning.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        phraseText: phraseText.trim(),
        meaning: meaning.trim(),
        context: context.trim() || undefined,
        tags: tags.trim() || undefined,
        notes: notes.trim() || undefined,
        isPublic,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save phrase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 12, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16,
    }}>
      <div className="glass-panel animate-slide-down" style={{
        maxWidth: 550,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px 32px',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
                {initialData ? 'Edit Phrase / Idiom' : 'Catalog New Phrase'}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Alphabetically indexed automatically in your personal phrases collection
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" title="Close">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: '#fb7185',
            fontSize: 13,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Phrase Text */}
          <div className="form-group">
            <label className="form-label">Phrase / Idiom *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bite the bullet"
              value={phraseText}
              onChange={(e) => setPhraseText(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Meaning */}
          <div className="form-group">
            <label className="form-label">Meaning / Explanation *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Explain the figurative or metaphorical meaning..."
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
            />
          </div>

          {/* Context / Dialogue */}
          <div className="form-group">
            <label className="form-label">Real-world Context / Usage Dialogue</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. I hated doing taxes, but decided to bite the bullet..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. idioms, business, casual, determination"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Historical Origins / Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Historical military medical practice before anesthesia"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Visibility */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
            cursor: 'pointer',
          }} onClick={() => setIsPublic(!isPublic)}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
                Share to Community Explorer
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Allow fellow language enthusiasts to discover this phrase in your library
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : initialData ? 'Update Phrase' : 'Add to Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
