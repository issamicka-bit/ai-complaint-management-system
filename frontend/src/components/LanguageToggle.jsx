// src/components/LanguageToggle.jsx
function LanguageToggle({ lang, onChange }) {
  return (
    <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: '999px', overflow: 'hidden' }}>
      <button
        onClick={() => onChange('en')}
        style={{
          border: 'none',
          padding: '6px 12px',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
          background: lang === 'en' ? 'var(--teal)' : 'transparent',
          color: lang === 'en' ? '#fff' : 'var(--ink-soft)',
        }}
      >
        EN
      </button>
      <button
        onClick={() => onChange('sw')}
        style={{
          border: 'none',
          padding: '6px 12px',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
          background: lang === 'sw' ? 'var(--teal)' : 'transparent',
          color: lang === 'sw' ? '#fff' : 'var(--ink-soft)',
        }}
      >
        SW
      </button>
    </div>
  );
}

export default LanguageToggle;
