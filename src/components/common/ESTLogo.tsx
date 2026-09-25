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
          padding: '5px 12px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15)',
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
