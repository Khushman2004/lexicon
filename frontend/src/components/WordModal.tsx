import React, { useState, useEffect } from 'react';
import type { Word } from '../api/client';
import { X, BookOpen } from 'lucide-react';

interface WordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    term: string;
    definition: string;
    partOfSpeech?: string;
    exampleSentence?: string;
    tags?: string;
    notes?: string;
    isPublic: boolean;
  }) => Promise<void>;
  initialData?: Word | null;
}

export const WordModal: React.FC<WordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [exampleSentence, setExampleSentence] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTerm(initialData.term);
      setDefinition(initialData.definition);
      setPartOfSpeech(initialData.partOfSpeech || 'noun');
      setExampleSentence(initialData.exampleSentence || '');
      setTags(initialData.tags || '');
      setNotes(initialData.notes || '');
      setIsPublic(initialData.isPublic);
    } else {
      setTerm('');
      setDefinition('');
      setPartOfSpeech('noun');
      setExampleSentence('');
      setTags('');
      setNotes('');
      setIsPublic(true);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) {
      setError('Please enter the word / term.');
      return;
    }
    if (!definition.trim()) {
      setError('Please provide a definition.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        term: term.trim(),
        definition: definition.trim(),
        partOfSpeech,
        exampleSentence: exampleSentence.trim() || undefined,
        tags: tags.trim() || undefined,
        notes: notes.trim() || undefined,
        isPublic,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save word.');
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
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
                {initialData ? 'Edit Word Entry' : 'Catalog New Word'}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Alphabetically indexed automatically in your personal dictionary
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
          {/* Term & Part of Speech Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Word / Term *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ephemeral"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Part of Speech</label>
              <select
                className="form-select"
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
              >
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="idiom">Idiom</option>
                <option value="phrase">Phrase</option>
              </select>
            </div>
          </div>

          {/* Definition */}
          <div className="form-group">
            <label className="form-label">Definition *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Clear, memorable definition..."
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              required
            />
          </div>

          {/* Example Sentence */}
          <div className="form-group">
            <label className="form-label">Example Sentence</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. The beauty of twilight was ephemeral..."
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. literature, philosophy, favorites"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Etymology / Personal Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Coined by Horace Walpole in 1754"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Public / Community Visibility */}
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
                Allow fellow language enthusiasts to discover this word in your library
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
              {submitting ? 'Saving...' : initialData ? 'Update Word' : 'Add to Dictionary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
