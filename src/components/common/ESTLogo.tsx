import React from 'react';
import estLogo from '../../assets/est-logo.png';

interface ESTLogoProps {
  height?: number | string;
  showText?: boolean;
  className?: string;
  textColor?: string;
  variant?: 'full' | 'icon-only';
  withBadge?: boolean;
}

export const ESTLogo: React.FC<ESTLogoProps> = ({
  height = 36,
  className = '',
  withBadge = true,
}) => {
  if (withBadge) {
    return (
      <div 
        className={`est-brand-logo-badge ${className}`} 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#ffffff',
          padding: '4px 10px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'transform 0.2s ease',
        }}
      >
        <img
          src={estLogo}
          alt="EST Brand Services"
          style={{
            height: typeof height === 'number' ? `${height}px` : height,
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    );
  }

  return (
    <div className={`est-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <img
        src={estLogo}
        alt="EST Brand Services"
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
};
