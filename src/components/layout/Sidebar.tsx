import React from 'react';
import { useProject } from '../../context/ProjectContext';
import type { ViewType } from '../../types';
import { getCurrencySymbol } from '../../types';
import { ESTLogo } from '../common/ESTLogo';
import { UserAvatar } from '../common/UserAvatar';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Info, 
  Plus, 
  ShieldCheck, 
  RotateCcw,
  LogOut,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  onOpenAddProject: () => void;
  onOpenEmailSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddProject }) => {
  const { 
    currentView, 
    setCurrentView, 
    currentUser,
    logout,
    resetToDemoData,
    visibleProjects,
    users
  } = useProject();

  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const openProjectsCount = visibleProjects.filter(p => p.status === 'Open').length;
  const totalBudget = visibleProjects.reduce((acc, p) => acc + p.budget, 0);
  const primaryCurrency = visibleProjects.length > 0 ? (visibleProjects[0]?.currency || 'INR') : 'INR';
  const currencySymbol = getCurrencySymbol(primaryCurrency);

  // Build navigation items based on current role
  const navItems: { id: ViewType; label: string; icon: React.ComponentType<{ size?: number }>; badge?: string | number }[] = [
    { id: 'dashboard', label: isSuperAdmin ? 'Master Dashboard' : 'My Projects Dashboard', icon: LayoutDashboard, badge: visibleProjects.length },
    { id: 'inside_project', label: 'Inside Project Workspace', icon: FolderKanban },
  ];

  // Super Admin exclusive User & Credential Management tab
  if (isSuperAdmin) {
    navItems.push({
      id: 'user_management',
      label: 'Admin Accounts & Vault',
      icon: Users,
      badge: users.filter(u => u.role === 'Admin').length
    });
  }

  navItems.push({
    id: 'overview',
    label: 'Platform Specifications',
    icon: Info
  });

  return (
    <aside className="app-sidebar">
      {/* Brand Logo Header */}
      <div className="sidebar-brand" onClick={() => setCurrentView('dashboard')}>
        <ESTLogo height={44} />
      </div>

      {/* Primary Action Button */}
      <div style={{ padding: '0 18px 16px' }}>
        <button 
          className="btn-primary" 
          onClick={onOpenAddProject}
          style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: '0.88rem' }}
          id="sidebar-add-project-btn"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav" aria-label="Sidebar Navigation">
        <div style={{ 
          fontSize: '0.7rem', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          padding: '0 22px 8px'
        }}>
          {isSuperAdmin ? 'Executive Workspace' : 'Admin Workspace'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
              id={`sidebar-nav-${item.id}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="sidebar-badge">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mini Workspace Summary Card */}
      <div style={{ padding: '16px 18px', marginTop: 'auto' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <span>{isSuperAdmin ? 'GLOBAL SPRINTS' : 'MY ACTIVE SPRINTS'}</span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>{openProjectsCount} Open</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <span>{isSuperAdmin ? 'COMPANY PIPELINE' : 'MANAGED BUDGET'}</span>
            <span style={{ color: '#60a5fa', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{currencySymbol}{(totalBudget / 1000).toFixed(0)}k</span>
          </div>
        </div>
      </div>

      {/* Authenticated User Profile & Logout Box */}
      <div className="sidebar-footer">
        <div style={{
          background: isSuperAdmin ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          border: `1px solid ${isSuperAdmin ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserAvatar 
              name={currentUser?.name} 
              avatarUrl={currentUser?.avatar} 
              size={34} 
              fontSize="0.85rem"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
            />
            <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.name || 'Guest User'}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: isSuperAdmin ? '#fbbf24' : '#60a5fa',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                {isSuperAdmin ? <ShieldCheck size={12} /> : <Briefcase size={12} />}
                <span>{currentUser?.role || 'Admin'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn-danger"
              onClick={logout}
              title="Sign Out of Portal"
              style={{ flex: 1, justifyContent: 'center', padding: '6px 10px', fontSize: '0.76rem', borderRadius: '6px' }}
              id="sidebar-logout-btn"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>

            <button
              className="btn-ghost"
              onClick={resetToDemoData}
              title="Reset Demo Data"
              style={{ padding: '6px 8px', fontSize: '0.76rem', borderRadius: '6px' }}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

