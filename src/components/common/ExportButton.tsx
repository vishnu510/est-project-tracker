import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText, Layers } from 'lucide-react';

interface ExportButtonProps {
  onExportExcel: () => void;
  onExportCSV: () => void;
  onExportBoth?: () => void;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExportExcel,
  onExportCSV,
  onExportBoth,
  label = 'Export',
  className = 'btn-secondary',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <button
        type="button"
        className={className}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: isSmall ? 6 : 8,
          padding: isSmall ? '5px 11px' : '8px 14px',
          fontSize: isSmall ? '0.78rem' : '0.84rem',
          fontWeight: 600,
        }}
        title="Download Data in Excel or CSV format"
      >
        <Download size={isSmall ? 13 : 15} />
        <span>{label}</span>
        <ChevronDown size={isSmall ? 12 : 14} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            minWidth: '210px',
            zIndex: 100,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease',
            padding: '4px',
          }}
        >
          <div style={{ padding: '6px 10px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Choose Export Format
          </div>

          <button
            type="button"
            onClick={() => handleSelect(onExportExcel)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.82rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 26,
              height: 26,
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileSpreadsheet size={15} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>Excel Spreadsheet</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Formatted .xlsx format</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelect(onExportCSV)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.82rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 26,
              height: 26,
              borderRadius: '6px',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText size={15} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>CSV Document</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Raw table .csv with UTF-8 BOM</div>
            </div>
          </button>

          {onExportBoth && (
            <button
              type="button"
              onClick={() => handleSelect(onExportBoth)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '4px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '6px',
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#c084fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Layers size={15} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>Download Both</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Excel (.xlsx) + CSV (.csv)</div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
