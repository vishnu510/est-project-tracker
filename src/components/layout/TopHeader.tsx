import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Search, 
  Plus, 
  ShieldCheck,
  Briefcase,
  Download
} from 'lucide-react';

interface TopHeaderProps {
  onOpenAddProject: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenAddProject }) => {
  const { 
    currentView, 
    searchQuery, 
    setSearchQuery, 
    currentUser,
    selectedProject 
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
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
          {info.title}
        </h2>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          {info.subtitle}
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
              width: '240px',
              outline: 'none',
              transition: 'width 0.2s ease, border-color 0.2s ease',
            }}
            onFocus={(e) => (e.target.style.width = '300px')}
            onBlur={(e) => (e.target.style.width = '240px')}
          />
        </div>

        {/* Add Project CTA */}
        <button 
          className="btn-primary" 
          onClick={onOpenAddProject}
          style={{ padding: '8px 16px', fontSize: '0.84rem' }}
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
            padding: '8px 14px', 
            fontSize: '0.84rem', 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6,
            background: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            color: '#60a5fa'
          }}
          title="Download Desktop Windows App (.exe)"
          id="topbar-download-exe-btn"
        >
          <Download size={14} />
          <span>Download .EXE</span>
        </a>

        {/* Persona Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: isSuperAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
          border: `1px solid ${isSuperAdmin ? 'rgba(245, 158, 11, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          color: isSuperAdmin ? '#fbbf24' : '#60a5fa'
        }}>
          {isSuperAdmin ? <ShieldCheck size={14} color="#fbbf24" /> : <Briefcase size={14} color="#60a5fa" />}
          <span style={{ fontWeight: 700 }}>
            {currentUser?.name || 'Super Admin'}
          </span>
          <span style={{ 
            fontSize: '0.7rem', 
            background: 'rgba(0,0,0,0.3)', 
            padding: '2px 6px', 
            borderRadius: '4px',
            color: '#fff' 
          }}>
            {currentUser?.role || 'Super Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};

