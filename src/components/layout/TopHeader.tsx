import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { CloudStatusBadge } from '../database/CloudStatusBadge';
import { ChangePasswordModal } from '../users/ChangePasswordModal';
import { 
  Search, 
  Plus, 
  ShieldCheck, 
  Briefcase,
  Download,
  KeyRound
} from 'lucide-react';

interface TopHeaderProps {
  onOpenAddProject: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenAddProject }) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { 
    currentView, 
    searchQuery, 
    setSearchQuery, 
    currentUser,
    selectedProject,
    cloudStatus,
    setIsCloudDbModalOpen
  } = useProject();

  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return { 
          title: isSuperAdmin ? 'Executive Master Dashboard' : `${currentUser?.name?.split(' ')[0]}'s Project Dashboard`, 
          subtitle: isSuperAdmin ? 'Global Portfolio & Admin Operational Status' : 'Assigned Deliverables & Sprints' 
        };
      case 'inside_project':
        return { 
          title: selectedProject?.name || 'Inside Project Workspace', 
          subtitle: `${selectedProject?.id || 'EST'} • ${selectedProject?.clientCompany || 'Client Scope'}` 
        };
      case 'user_management':
        return { 
          title: 'Admin Accounts & Credential Vault', 
          subtitle: 'Super Admin Provisioning & Security Governance' 
        };
      case 'overview':
        return { 
          title: 'Platform Specifications & Architecture', 
          subtitle: 'Role Matrix & Workflow Standards' 
        };
      default:
        return { 
          title: 'EST Brand Services', 
          subtitle: 'Enterprise Project Tracker' 
        };
    }
  };

  const info = getViewTitle();

  return (
    <header className="app-topbar">
      {/* Current View Title */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
          {info.title}
        </h2>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          {info.subtitle}
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Real-time Cloud DB Status Badge */}
        <CloudStatusBadge
          status={cloudStatus}
          onClick={() => setIsCloudDbModalOpen(true)}
        />

        {/* Search Bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={isSuperAdmin ? "Search all projects, admins, clients..." : "Search my projects..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-full)',
              padding: '7px 14px 7px 36px',
              fontSize: '0.84rem',
              color: 'var(--text-primary)',
              width: '220px',
              outline: 'none',
              transition: 'width 0.2s ease, border-color 0.2s ease',
            }}
            onFocus={(e) => (e.target.style.width = '280px')}
            onBlur={(e) => (e.target.style.width = '220px')}
          />
        </div>

        {/* Add Project CTA - Brand Coral Red */}
        <button 
          className="btn-primary" 
          onClick={onOpenAddProject}
          style={{ padding: '8px 15px', fontSize: '0.84rem' }}
          id="topbar-add-project-btn"
        >
          <Plus size={15} />
          <span>New Project</span>
        </button>

        {/* Download Windows App (.EXE) */}
        <a
          href="https://github.com/vishnu510/est-project-tracker/releases"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
          style={{ 
            padding: '8px 13px', 
            fontSize: '0.84rem', 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6,
            background: 'rgba(58, 156, 185, 0.08)',
            borderColor: 'rgba(58, 156, 185, 0.25)',
            color: 'var(--brand-cerulean)'
          }}
          title="Download Desktop Windows App (.exe)"
          id="topbar-download-exe-btn"
        >
          <Download size={14} />
          <span>.EXE</span>
        </a>

        {/* Persona Pill with Change Password Trigger */}
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          title="Click to Change Account Password"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: isSuperAdmin ? 'rgba(217, 119, 6, 0.08)' : 'rgba(22, 46, 74, 0.06)',
            border: `1px solid ${isSuperAdmin ? 'rgba(217, 119, 6, 0.25)' : 'rgba(22, 46, 74, 0.15)'}`,
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            color: isSuperAdmin ? '#d97706' : 'var(--brand-navy)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isSuperAdmin ? <ShieldCheck size={14} color="#d97706" /> : <Briefcase size={14} color="var(--brand-navy)" />}
          <span style={{ fontWeight: 700 }}>
            {currentUser?.name || 'EST Super Admin'}
          </span>
          <span style={{ 
            fontSize: '0.7rem', 
            background: isSuperAdmin ? 'rgba(217, 119, 6, 0.15)' : 'rgba(22, 46, 74, 0.1)', 
            padding: '2px 6px', 
            borderRadius: '4px',
            color: isSuperAdmin ? '#b45309' : 'var(--brand-navy)' 
          }}>
            {currentUser?.role || 'Super Admin'}
          </span>
          <KeyRound size={12} style={{ opacity: 0.7 }} />
        </button>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        targetUser={currentUser}
      />
    </header>
  );
};
