import React, { useState } from 'react';
import TSModal, { TSButton } from './TSModal';
import { useNotifications } from '../notifications';

const LEVELS = ['Primary School', 'High School', 'Undergraduate', 'Postgraduate'];

/**
 * Ask a Textbook -> "Create roadmap": a private roadmap built in the
 * background from this one uploaded PDF. Its modules and its quizzes use
 * only the book's text (backend: services/textbookRoadmap.js, textbookQuiz.js).
 */
export default function BookRoadmapModal({ book, onClose, onStarted }) {
  const { startRoadmap } = useNotifications();
  const [level, setLevel] = useState('High School');
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    try {
      await startRoadmap({ topic: book.title, levelOfLearning: level, source: 'textbook', bookId: book.id });
      onStarted?.();
      onClose();
    } catch {
      setBusy(false); // startRoadmap already showed the error
    }
  };

  return (
    <TSModal
      eyebrow="Ask a Textbook"
      title="Create a roadmap from this book"
      onClose={onClose}
      maxWidth={520}
      footerNote="Takes a few minutes. We'll notify you when it's ready."
      footer={
        <>
          <TSButton variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </TSButton>
          <TSButton onClick={start} busy={busy}>
            Create roadmap
          </TSButton>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Source</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{book.title}</div>
          <p style={{ fontSize: '12px', color: '#475569', margin: '6px 0 0 0', lineHeight: 1.5 }}>
            The modules, key concepts and quizzes are written only from this PDF and follow its chapters, with page
            references. Nothing is added from outside the book.
          </p>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1F2537', marginBottom: '8px' }}>Level of learning</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                aria-pressed={level === l}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: level === l ? '2px solid #243367' : '1px solid #E2E8F0',
                  background: level === l ? '#EEF2FF' : '#FFFFFF',
                  color: '#0F172A',
                  fontSize: '13px',
                  fontWeight: level === l ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </TSModal>
  );
}
