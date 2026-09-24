import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import type { UserRole } from '../../types';
import { ESTLogo } from '../common/ESTLogo';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Info, 
  Plus, 
  ChevronDown, 
  ShieldCheck, 
  UserCheck, 
  RotateCcw,
  Search,
  Mail,
  Briefcase
} from 'lucide-react';


interface NavbarProps {
  onOpenAddProject: () => void;
  onOpenEmailSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddProject, onOpenEmailSettings }) => {
  const { 
    currentView, 
    setCurrentView, 
    activeRole, 
    setActiveRole, 
    resetToDemoData,
    searchQuery,
    setSearchQuery,
    projects
  } = useProject();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { role: UserRole; desc: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
    { role: 'Super Admin', desc: 'Full platform & project governance', icon: ShieldCheck },
    { role: 'Admin', desc: 'Active project & task management', icon: UserCheck },
    { role: 'Team Member', desc: 'Assigned deliverables executor', icon: Users },
    { role: 'Client', desc: 'Milestone progress observer', icon: Briefcase },
  ];


  return (
    <header className="header-wrapper">
      <div className="header-inner">
        {/* Brand with Official EST Logo */}
        <div 
          className="brand-section" 
          onClick={() => setCurrentView('dashboard')}
          title="Go to Project Dashboard"
        >
          <ESTLogo height={38} showText={true} />
        </div>

        {/* Center Nav Tabs */}
        <nav className="nav-tabs" aria-label="Portal Navigation">
          <button
            className={`nav-tab-btn ${currentView === 'overview' ? 'active' : ''}`}
            onClick={() => setCurrentView('overview')}
            id="nav-tab-overview"
          >
            <Info size={16} />
            <span>What is this portal?</span>
          </button>
          
          <button
            className={`nav-tab-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
            id="nav-tab-dashboard"
          >
            <LayoutDashboard size={16} />
            <span>Project Dashboard</span>
            <span style={{ 
              background: currentView === 'dashboard' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', 
              padding: '1px 6px', 
              borderRadius: '10px', 
              fontSize: '0.72rem' 
            }}>
              {projects.length}
            </span>
          </button>

          <button
            className={`nav-tab-btn ${currentView === 'inside_project' ? 'active' : ''}`}
            onClick={() => setCurrentView('inside_project')}
            id="nav-tab-inside-project"
          >
            <FolderKanban size={16} />
            <span>Inside a Project</span>
          </button>

          <button
            className={`nav-tab-btn ${currentView === 'user_management' ? 'active' : ''}`}
            onClick={() => setCurrentView('user_management')}
            id="nav-tab-user-management"
          >
            <Users size={16} />
            <span>User Management</span>
          </button>
        </nav>

        {/* Right Actions & Role Switcher */}
        <div className="header-actions">
          {/* Quick Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 12px 6px 32px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                width: '140px',
                outline: 'none',
                transition: 'width 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.width = '180px')}
              onBlur={(e) => (e.target.style.width = '140px')}
            />
          </div>

          {/* Email Settings CTA */}
          <button
            className="btn-secondary"
            onClick={onOpenEmailSettings}
            title="Configure Live Email Service Settings"
            style={{ padding: '7px 12px', fontSize: '0.82rem' }}
            id="header-email-settings-btn"
          >
            <Mail size={15} color="#60a5fa" />
            <span>Mail Service</span>
          </button>

          {/* Role Persona Switcher */}
          <div className="role-switcher-container" ref={dropdownRef}>
            <button
              className="role-pill-btn"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              title="Switch simulated user role"
              id="role-switcher-btn"
            >
              <ShieldCheck size={15} color="#3b82f6" />
              <span>{activeRole}</span>
              <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </button>

            {roleMenuOpen && (
              <div className="role-dropdown-menu">
                <div style={{ 
                  padding: '6px 10px 8px', 
                  fontSize: '0.72rem', 
                  color: 'var(--text-muted)', 
                  textTransform: 'uppercase', 
                  fontWeight: 600,
                  borderBottom: '1px solid var(--border-subtle)' 
                }}>
                  Simulate Role Persona
                </div>
                {roles.map(({ role, desc, icon: Icon }) => (
                  <button
                    key={role}
                    className={`role-dropdown-item ${activeRole === role ? 'active' : ''}`}
                    onClick={() => {
                      setActiveRole(role);
                      setRoleMenuOpen(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={15} />
                      <div>
                        <div>{role}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Project CTA */}
          <button 
            className="btn-primary" 
            onClick={onOpenAddProject}
            id="header-add-project-btn"
          >
            <Plus size={16} />
            <span>Add Project</span>
          </button>

          {/* Reset Demo Data */}
          <button
            className="btn-ghost"
            onClick={resetToDemoData}
            title="Reset Workspace to Wireframe Defaults"
            style={{ padding: '8px', borderRadius: 'var(--radius-full)' }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
