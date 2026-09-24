import React, { useState } from 'react';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: number;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  avatarUrl,
  size = 26,
  fontSize = '0.72rem',
  className = '',
  style = {},
}) => {
  const [hasError, setHasError] = useState(false);
  const initial = (name || 'U').trim().charAt(0).toUpperCase();

  const colorIndex = (name || 'A').charCodeAt(0) % AVATAR_COLORS.length;
  const bgColor = AVATAR_COLORS[colorIndex];

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          ...style,
        }}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fontSize,
        color: '#ffffff',
        fontWeight: 700,
        flexShrink: 0,
        userSelect: 'none',
        ...style,
      }}
      title={name}
    >
      {initial}
    </div>
  );
};
