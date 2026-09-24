import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import type { Project, ProjectStatus, ProjectType } from '../../types';
import { getCurrencySymbol } from '../../types';
import { 
  FolderKanban, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight, 
  Sparkles,
  Trash2,
  Calendar,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { ExportButton } from '../common/ExportButton';
import { UserAvatar } from '../common/UserAvatar';
import { 
  exportProjectsToExcel, 
  exportProjectsToCSV, 
  exportProjectsBoth 
} from '../../services/exportService';

interface DashboardViewProps {
  onOpenAddProject: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddProject }) => {
  const { 
    visibleProjects, 
    updateProject, 
    deleteProject, 
    setSelectedProjectId, 
    setCurrentView,
    searchQuery,
    currentUser,
    users,
    showToast
  } = useProject();

  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedAdminFilter, setSelectedAdminFilter] = useState<string>('All');

  // Filter projects based on search and selected filters
  const filteredProjects = visibleProjects.filter((p) => {
    const matchesSearch = 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.leadManager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'All' || p.status === selectedStatusFilter;
    const matchesCategory = selectedCategoryFilter === 'All' || p.type === selectedCategoryFilter;
    
    const matchesAdmin = 
      selectedAdminFilter === 'All' || 
      p.leadManager.toLowerCase() === selectedAdminFilter.toLowerCase() ||
      p.createdByAdminName?.toLowerCase() === selectedAdminFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory && matchesAdmin;
  });

  // KPI Calculations using visibleProjects
  const totalProjects = visibleProjects.length;
  const openProjects = visibleProjects.filter((p) => p.status === 'Open').length;
  const onHoldProjects = visibleProjects.filter((p) => p.status === 'On Hold').length;
  const completedProjects = visibleProjects.filter((p) => p.status === 'Completed').length;
  const totalBudget = visibleProjects.reduce((acc, p) => acc + p.budget, 0);
  const primaryCurrency = visibleProjects.length > 0 ? (visibleProjects[0]?.currency || 'INR') : 'INR';
  const pipelineCurrencySymbol = getCurrencySymbol(primaryCurrency);

  const handleOpenProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView('inside_project');
  };

  const handleExportExcel = () => {
    exportProjectsToExcel(filteredProjects);
    showToast('Excel Downloaded', `Exported ${filteredProjects.length} projects to .xlsx`, 'success');
  };

  const handleExportCSV = () => {
    exportProjectsToCSV(filteredProjects);
    showToast('CSV Downloaded', `Exported ${filteredProjects.length} projects to .csv`, 'success');
  };

  const handleExportBoth = () => {
    exportProjectsBoth(filteredProjects);
    showToast('Dual Export Ready', `Downloaded Excel (.xlsx) and CSV (.csv)`, 'success');
  };


  const getStatusClass = (status: ProjectStatus) => {
    switch (status) {
      case 'Open': return 'status-open';
      case 'On Hold': return 'status-hold';
      case 'Cancelled': return 'status-cancelled';
      case 'Completed': return 'status-completed';
      case 'Under Review': return 'status-review';
      default: return 'status-open';
    }
  };

  const getCategoryClass = (type: ProjectType) => {
    switch (type) {
      case 'Branding': return 'category-branding';
      case 'Digital Marketing': return 'category-marketing';
      case 'Events': return 'category-events';
      case 'Production': return 'category-production';
      case 'Web Development': return 'category-web';
      case 'PR & Media': return 'category-pr';
      default: return 'category-branding';
    }
  };

  const calculateProgress = (project: Project) => {
    if (!project.deliverables || project.deliverables.length === 0) {
      return project.status === 'Completed' ? 100 : 0;
    }
    const completed = project.deliverables.filter(d => d.status === 'Completed').length;
    return Math.round((completed / project.deliverables.length) * 100);
  };

  // List of all admins for Super Admin filter
  const adminUsers = users.filter(u => u.role === 'Admin');

  return (
    <div className="dashboard-container" style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Top Title Banner */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '1.9rem', 
              fontWeight: 800, 
              color: '#fff',
              letterSpacing: '-0.02em'
            }}>
              {isSuperAdmin ? 'Master Project Dashboard' : `${currentUser?.name}'s Projects`}
            </h1>
            <span style={{ 
              background: isSuperAdmin 
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))', 
              border: `1px solid ${isSuperAdmin ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`, 
              color: isSuperAdmin ? '#fbbf24' : '#60a5fa', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '999px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              {isSuperAdmin ? <ShieldCheck size={12} /> : <Briefcase size={12} />}
              <span>{isSuperAdmin ? 'SUPER ADMIN OVERVIEW (ALL DATA)' : 'ISOLATED ADMIN WORKSPACE'}</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            {isSuperAdmin 
              ? 'Complete organization pipeline, active deliverables, admin accountability, and company-wide financials'
              : `Managing ${visibleProjects.length} projects under ${currentUser?.department || 'Project Execution'}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ExportButton
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onExportBoth={handleExportBoth}
            label="Export Report"
          />
          <button className="btn-primary" onClick={onOpenAddProject} id="dashboard-add-project-btn">
            <Plus size={16} />
            <span>Add New Project</span>
          </button>
        </div>

      </div>

      {/* KPI Metric Strip */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">{isSuperAdmin ? 'Total Company Projects' : 'My Active Projects'}</span>
            <span className="kpi-value">{totalProjects}</span>
            <span className="kpi-subtext">{isSuperAdmin ? 'Across all project admins' : 'Under your management'}</span>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <FolderKanban size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Open / In Progress</span>
            <span className="kpi-value" style={{ color: '#34d399' }}>{openProjects}</span>
            <span className="kpi-subtext">Active delivery sprints</span>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Activity size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">On Hold</span>
            <span className="kpi-value" style={{ color: '#fbbf24' }}>{onHoldProjects}</span>
            <span className="kpi-subtext">Pending client inputs</span>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Completed</span>
            <span className="kpi-value" style={{ color: '#c084fc' }}>{completedProjects}</span>
            <span className="kpi-subtext">Shipped & Archived</span>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">{isSuperAdmin ? 'Total Pipeline Value' : 'My Project Pipeline'}</span>
            <span className="kpi-value" style={{ color: '#38bdf8' }}>{pipelineCurrencySymbol}{(totalBudget / 1000).toFixed(0)}k</span>
            <span className="kpi-subtext">Active contracted value</span>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', fontWeight: 700, fontSize: '1.2rem' }}>
            {pipelineCurrencySymbol.trim()}
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14
        }}
      >
        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: 4 }}>
            STATUS:
          </span>
          {['All', 'Open', 'On Hold', 'Under Review', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              style={{
                background: selectedStatusFilter === st ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: selectedStatusFilter === st ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
                color: selectedStatusFilter === st ? '#60a5fa' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category & Admin Lead Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              CATEGORY:
            </span>
            <select
              className="form-select"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              style={{ width: '150px', padding: '6px 10px', fontSize: '0.82rem' }}
            >
              <option value="All">All Categories</option>
              <option value="Branding">Branding</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Events">Events</option>
              <option value="Production">Production</option>
              <option value="Web Development">Web Development</option>
              <option value="PR & Media">PR & Media</option>
            </select>
          </div>

          {/* Super Admin: Filter by Specific Admin Lead */}
          {isSuperAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>
                ADMIN LEAD:
              </span>
              <select
                className="form-select"
                value={selectedAdminFilter}
                onChange={(e) => setSelectedAdminFilter(e.target.value)}
                style={{ 
                  width: '160px', 
                  padding: '6px 10px', 
                  fontSize: '0.82rem',
                  borderColor: 'rgba(245, 158, 11, 0.4)',
                  color: '#fbbf24'
                }}
              >
                <option value="All">All Admins</option>
                {adminUsers.map((adm) => (
                  <option key={adm.id} value={adm.name}>{adm.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Project Matrix Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name & Client</th>
                <th>Project Type</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Timeline</th>
                <th>Budget</th>
                <th>Assigned Admin</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                    <FolderKanban size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      No projects found
                    </div>
                    <div style={{ fontSize: '0.82rem', marginTop: 4 }}>
                      {isSuperAdmin 
                        ? 'Try adjusting your filters or search query above.' 
                        : 'You can create your first project using the "+ Add New Project" button above.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const progress = calculateProgress(project);
                  const assignedAdminUser = users.find(u => (u.assignedProjectIds || []).includes(project.id) && (u.role === 'Admin' || u.role === 'Super Admin'))
                    || users.find(u => u.name.toLowerCase() === project.leadManager?.toLowerCase());
                  const effectiveLeadManager = assignedAdminUser?.name || project.leadManager;
                  const effectiveLeadAvatar = assignedAdminUser?.avatar || project.leadAvatar;

                  return (
                    <tr key={project.id}>
                      {/* Project ID */}
                      <td>
                        <button
                          className="project-id-badge"
                          onClick={() => handleOpenProject(project.id)}
                          title="Open inside project workspace"
                        >
                          <span>{project.id}</span>
                          <ArrowUpRight size={13} />
                        </button>
                      </td>

                      {/* Name & Client */}
                      <td>
                        <div 
                          style={{ fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                          onClick={() => handleOpenProject(project.id)}
                        >
                          {project.name}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          {project.clientCompany} • {project.clientName}
                        </div>
                      </td>

                      {/* Project Type */}
                      <td>
                        <span className={`category-badge ${getCategoryClass(project.type)}`}>
                          {project.type}
                        </span>
                      </td>

                      {/* Interactive Status Selector */}
                      <td>
                        <select
                          className={`status-pill ${getStatusClass(project.status)}`}
                          value={project.status}
                          onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}
                          style={{
                            border: 'none',
                            outline: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            background: 'transparent'
                          }}
                        >
                          <option value="Open" style={{ background: '#1e293b', color: '#10b981' }}>● Open</option>
                          <option value="On Hold" style={{ background: '#1e293b', color: '#f59e0b' }}>● On Hold</option>
                          <option value="Under Review" style={{ background: '#1e293b', color: '#06b6d4' }}>● Under Review</option>
                          <option value="Completed" style={{ background: '#1e293b', color: '#a855f7' }}>● Completed</option>
                          <option value="Cancelled" style={{ background: '#1e293b', color: '#ef4444' }}>● Cancelled</option>
                        </select>
                      </td>

                      {/* Progress Bar */}
                      <td>
                        <div className="progress-bar-container">
                          <div className="progress-track">
                            <div 
                              className={`progress-fill ${project.status === 'Completed' ? 'completed' : project.status === 'Cancelled' ? 'cancelled' : ''}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="progress-text">{progress}%</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {project.deliverables.filter(d => d.status === 'Completed').length}/{project.deliverables.length} Deliverables
                        </div>
                      </td>

                      {/* Timeline */}
                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Calendar size={13} color="var(--text-muted)" />
                          <span>{project.targetEndDate}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          Started {project.startDate}
                        </div>
                      </td>

                      {/* Budget */}
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f8fafc' }}>
                          {getCurrencySymbol(project.currency)}{project.budget.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 600 }}>
                          {project.currency || 'USD'}
                        </div>
                      </td>

                      {/* Lead Admin */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <UserAvatar name={effectiveLeadManager} avatarUrl={effectiveLeadAvatar} size={26} />
                          <div>
                            <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 500 }}>
                              {effectiveLeadManager}
                            </div>
                            {project.createdByAdminName && project.createdByAdminName.toLowerCase() !== effectiveLeadManager.toLowerCase() && (
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                By {project.createdByAdminName.split(' ')[0]}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                            onClick={() => handleOpenProject(project.id)}
                            title="Inside Project Workspace"
                          >
                            <span>Inside</span>
                            <ArrowUpRight size={13} />
                          </button>

                          {(isSuperAdmin || project.createdByAdminId === currentUser?.id) && (
                            <button
                              className="btn-danger"
                              style={{ padding: '5px 8px' }}
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete project ${project.id}?`)) {
                                  deleteProject(project.id);
                                }
                              }}
                              title="Delete project"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wireframe Add New Project Quick Banner */}
      <div 
        style={{
          marginTop: '28px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(59, 130, 246, 0.08))',
          border: '1px dashed rgba(139, 92, 246, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 18
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ 
            width: 44, 
            height: 44, 
            borderRadius: '12px', 
            background: 'rgba(139, 92, 246, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#c084fc' 
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
              Add New Project Workspace
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Auto-generate next ID, define client scope, allocate budget, and track deliverable expenses
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={onOpenAddProject}>
          <Plus size={16} />
          <span>Launch Project Setup Wizard</span>
        </button>
      </div>
    </div>
  );
};

