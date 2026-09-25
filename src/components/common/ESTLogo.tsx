import React from 'react';
import estLogo from '../../assets/est-logo.png';

interface ESTLogoProps {
  height?: number | string;
  showText?: boolean;
  className?: string;
  textColor?: string;
  variant?: 'full' | 'icon-only';
}

export const ESTLogo: React.FC<ESTLogoProps> = ({
  height = 42,
  className = '',
}) => {
  return (
    <div className={`est-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <img
        src={estLogo}
        alt="EST Brand Services"
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.35))',
        }}
      />
    </div>
  );
};
