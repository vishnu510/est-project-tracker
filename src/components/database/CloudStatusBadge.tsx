import React from 'react';
import type { CloudSyncStatus } from '../../services/cloudDatabase';
import { 
  CloudOff, 
  RefreshCw, 
  Database,
  Radio
} from 'lucide-react';

interface CloudStatusBadgeProps {
  status: CloudSyncStatus;
  lastSyncedAt?: string;
  onClick: () => void;
  compact?: boolean;
}

export const CloudStatusBadge: React.FC<CloudStatusBadgeProps> = ({
  status,
  lastSyncedAt,
  onClick,
  compact = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: Radio,
          label: 'Cloud Realtime Synced',
          shortLabel: 'Cloud Live',
          bgColor: 'rgba(16, 185, 129, 0.12)',
          borderColor: 'rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          dotColor: '#10b981',
          pulse: true,
          tooltip: `Real-time synchronization active with Supabase Cloud. ${lastSyncedAt ? `Last synced: ${lastSyncedAt}` : ''}`,
        };
      case 'syncing':
        return {
          icon: RefreshCw,
          label: 'Syncing to Cloud...',
          shortLabel: 'Syncing...',
          bgColor: 'rgba(245, 158, 11, 0.15)',
          borderColor: 'rgba(245, 158, 11, 0.4)',
          color: '#fbbf24',
          dotColor: '#f59e0b',
          spin: true,
          tooltip: 'Transmitting database records to Supabase...',
        };
      case 'offline':
        return {
          icon: CloudOff,
          label: 'Offline (Local Cache)',
          shortLabel: 'Offline',
          bgColor: 'rgba(239, 68, 68, 0.12)',
          borderColor: 'rgba(239, 68, 68, 0.35)',
          color: '#f87171',
          dotColor: '#ef4444',
          pulse: false,
          tooltip: 'Internet connection unavailable. All edits cached safely locally.',
        };
      case 'unconfigured':
      default:
        return {
          icon: Database,
          label: 'Local Database (Connect Cloud)',
          shortLabel: 'Connect Cloud DB',
          bgColor: 'rgba(59, 130, 246, 0.12)',
          borderColor: 'rgba(59, 130, 246, 0.35)',
          color: '#60a5fa',
          dotColor: '#3b82f6',
          pulse: false,
          tooltip: 'Running in Local Storage mode. Click to link 10-Year Cloud PostgreSQL database.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="cloud-status-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: 'var(--radius-full)',
        padding: compact ? '4px 10px' : '6px 13px',
        fontSize: compact ? '0.74rem' : '0.78rem',
        fontWeight: 600,
        color: config.color,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: status === 'online' ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
      }}
      title={config.tooltip}
      id="cloud-db-status-pill"
    >
      {/* Live Pulsing Dot */}
      <span style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: config.dotColor,
        boxShadow: `0 0 6px ${config.dotColor}`,
        animation: config.pulse ? 'pulse 2s infinite' : 'none',
      }} />

      <Icon 
        size={13} 
        style={{ 
          animation: 'spin' in config && config.spin ? 'spin 1s linear infinite' : 'none' 
        }} 
      />

      <span>{compact ? config.shortLabel : config.label}</span>
    </button>
  );
};
