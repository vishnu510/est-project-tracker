import React, { useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ToastContainer } from './components/layout/Toast';
import { OverviewView } from './components/overview/OverviewView';
import { DashboardView } from './components/dashboard/DashboardView';
import { InsideProjectView } from './components/project/InsideProjectView';
import { UserManagementView } from './components/users/UserManagementView';
import { AddProjectModal } from './components/dashboard/AddProjectModal';
import { LoginView } from './components/auth/LoginView';

const AppContent: React.FC = () => {
  const { currentView, currentUser } = useProject();
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  // If no user is logged in, show Executive Login Portal
  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="app-layout">
      {/* Vertical Left Navigation Sidebar */}
      <Sidebar 
        onOpenAddProject={() => setIsAddProjectModalOpen(true)} 
      />

      {/* Main Content Area on Right */}
      <div className="app-main-wrapper">
        {/* Top Contextual Header Bar */}
        <TopHeader onOpenAddProject={() => setIsAddProjectModalOpen(true)} />

        {/* Dynamic Views */}
        <main className="main-content">
          {currentView === 'overview' && <OverviewView />}
          {currentView === 'dashboard' && <DashboardView onOpenAddProject={() => setIsAddProjectModalOpen(true)} />}
          {currentView === 'inside_project' && <InsideProjectView />}
          {currentView === 'user_management' && <UserManagementView />}
        </main>

        {/* Executive Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(9, 14, 26, 0.95)',
          padding: '18px 32px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          marginTop: 'auto'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <strong>EST Brand Services</strong> &copy; {new Date().getFullYear()} — Enterprise Project Tracker Portal
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span>Super Admin Governance</span>
              <span>Project Isolation RBAC</span>
              <span>Logged in as: <strong style={{ color: '#fff' }}>{currentUser.name}</strong> ({currentUser.role})</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Add Project Modal */}
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

