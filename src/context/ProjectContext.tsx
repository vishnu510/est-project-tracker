import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  Project, 
  User, 
  Deliverable, 
  UserRole, 
  ViewType, 
  ToastMessage, 
  ActivityLog, 
  ProjectStatus 
} from '../types';
import type { EmailServiceConfig, SentEmailLog } from '../types/email';
import { 
  INITIAL_PROJECTS, 
  INITIAL_USERS, 
  INITIAL_ACTIVITY_LOGS 
} from '../data/mockData';
import { 
  loadEmailConfig, 
  saveEmailConfig, 
  loadEmailLogs, 
  sendInvitationEmail 
} from '../services/mailService';

import confetti from 'canvas-confetti';

interface ProjectContextType {
  projects: Project[];
  visibleProjects: Project[];
  users: User[];
  activityLogs: ActivityLog[];
  currentUser: User | null;
  activeRole: UserRole;
  currentView: ViewType;
  selectedProjectId: string;
  searchQuery: string;
  toasts: ToastMessage[];
  emailConfig: EmailServiceConfig;
  emailLogs: SentEmailLog[];
  
  // Auth methods
  login: (identifier: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  createAdminUser: (data: {
    name: string;
    email: string;
    username?: string;
    password?: string;
    department: string;
    phone?: string;
    assignedProjectIds?: string[];
  }) => User;

  // Project methods
  addProject: (project: Omit<Project, 'createdAt' | 'updatedAt' | 'deliverables'> & { initialDeliverables?: string[] }) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addDeliverable: (projectId: string, deliverable: Omit<Deliverable, 'id' | 'projectId'>) => void;
  updateDeliverable: (projectId: string, deliverableId: string, updates: Partial<Deliverable>) => void;
  deleteDeliverable: (projectId: string, deliverableId: string) => void;
  
  // User methods
  addUser: (userData: Omit<User, 'id' | 'assignedProjectIds'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Settings & Navigation
  updateEmailConfig: (updates: Partial<EmailServiceConfig>) => void;
  resendInvitationEmail: (logId: string) => Promise<void>;
  setCurrentView: (view: ViewType) => void;
  setSelectedProjectId: (id: string) => void;
  setActiveRole: (role: UserRole) => void;
  setSearchQuery: (query: string) => void;
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  resetToDemoData: () => void;
  getNextProjectId: () => string;
  selectedProject: Project | undefined;
  triggerCelebration: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROJECTS: 'est_tracker_projects_v2',
  USERS: 'est_tracker_users_v2',
  LOGS: 'est_tracker_logs_v2',
  ROLE: 'est_tracker_role_v2',
  SELECTED_PROJ: 'est_tracker_selected_proj_v2',
  AUTH_USER: 'est_auth_current_user_v2',
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  });

  // Auth User State - Require explicit login by default for fresh sessions/links
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    if (currentUser) return currentUser.role;
    return 'Super Admin';
  });

  const [emailConfig, setEmailConfigState] = useState<EmailServiceConfig>(() => loadEmailConfig());
  const [emailLogs, setEmailLogsState] = useState<SentEmailLog[]>(() => loadEmailLogs());
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  const [selectedProjectId, setSelectedProjectIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_PROJ);
      return saved || 'EST2024-1';
    } catch {
      return 'EST2024-1';
    }
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
    } catch (e) {
      console.error('Failed to save logs', e);
    }
  }, [activityLogs]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
        setActiveRoleState(currentUser.role);
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
  }, [currentUser]);

  // Project Isolation & Scoping
  const visibleProjects = projects.filter((p) => {
    if (!currentUser) return false;
    // Super Admin sees ALL projects
    if (currentUser.role === 'Super Admin') return true;
    
    // Project Admin strictly sees their own assigned/created projects
    const isOwner = p.createdByAdminId === currentUser.id;
    const isLead = p.leadManager?.toLowerCase() === currentUser.name?.toLowerCase();
    const isMember = (p.teamMembers || []).some(
      (m) => m.toLowerCase() === currentUser.name?.toLowerCase()
    );
    const isAssigned = (currentUser.assignedProjectIds || []).includes(p.id);

    return isOwner || isLead || isMember || isAssigned;
  });

  // Selected project resolution
  const selectedProject = visibleProjects.find((p) => p.id === selectedProjectId) || visibleProjects[0] || projects[0];

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
      });
    } catch {
      // ignore
    }
  };

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setSelectedProjectId = (id: string) => {
    setSelectedProjectIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PROJ, id);
    } catch {
      // ignore
    }
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
    } catch {
      // ignore
    }
  };

  const updateEmailConfig = (updates: Partial<EmailServiceConfig>) => {
    const updated = { ...emailConfig, ...updates };
    setEmailConfigState(updated);
    saveEmailConfig(updated);
    showToast('Email Settings Saved', 'Service configuration updated', 'success');
  };

  // Login Method
  const login = (identifier: string, password: string): { success: boolean; message: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.username && u.username.toLowerCase() === cleanId) ||
        u.name.toLowerCase() === cleanId
    );

    if (!matchedUser) {
      return { success: false, message: 'No account found with this email / username.' };
    }

    if (matchedUser.password && matchedUser.password !== cleanPass) {
      return { success: false, message: 'Invalid password. Please verify your credentials.' };
    }

    if (matchedUser.status === 'Suspended') {
      return { success: false, message: 'This account has been suspended by Super Admin.' };
    }

    // Update last active
    const updatedUser: User = {
      ...matchedUser,
      lastActive: 'Just now',
    };

    setUsers((prev) => prev.map((u) => (u.id === matchedUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setActiveRoleState(updatedUser.role);
    setCurrentView('dashboard');

    showToast('Welcome Back', `Signed in as ${updatedUser.name} (${updatedUser.role})`, 'success');
    return { success: true, message: `Welcome, ${updatedUser.name}!` };
  };

  // Logout Method
  const logout = () => {
    setCurrentUser(null);
    showToast('Signed Out', 'You have been safely logged out.', 'info');
  };

  // Create Admin User (Super Admin only)
  const createAdminUser = (data: {
    name: string;
    email: string;
    username?: string;
    password?: string;
    department: string;
    phone?: string;
    assignedProjectIds?: string[];
  }): User => {
    const newId = `usr-admin-${Date.now()}`;
    const autoUsername = data.username?.trim() || data.name.toLowerCase().replace(/\s+/g, '.');
    const autoPassword = data.password?.trim() || `Admin#${Math.floor(1000 + Math.random() * 9000)}`;

    const newAdmin: User = {
      id: newId,
      name: data.name.trim(),
      email: data.email.trim(),
      username: autoUsername,
      password: autoPassword,
      role: 'Admin',
      department: data.department || 'Project Execution',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 50000000000)}?w=150&auto=format&fit=crop&q=80`,
      status: 'Active',
      lastActive: 'Never (Newly Created)',
      phone: data.phone || '+1 (555) 000-0000',
      assignedProjectIds: data.assignedProjectIds || [],
      createdBy: currentUser?.name || 'Executive Super Admin',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newAdmin, ...prev]);

    // Update assigned projects lead manager
    if (data.assignedProjectIds && data.assignedProjectIds.length > 0) {
      setProjects((prev) =>
        prev.map((p) => {
          if (data.assignedProjectIds!.includes(p.id)) {
            return {
              ...p,
              leadManager: newAdmin.name,
              leadAvatar: newAdmin.avatar,
              teamMembers: Array.from(new Set([...(p.teamMembers || []), newAdmin.name])),
            };
          }
          return p;
        })
      );
    }

    // Log Activity
    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      userName: currentUser?.name || 'Super Admin',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      action: 'created project admin credentials for',
      target: `${newAdmin.name} (${newAdmin.email})`,
      timestamp: 'Just now'
    };
    setActivityLogs((prev) => [log, ...prev]);

    showToast('Admin Created', `Credentials ready for ${newAdmin.name}`, 'success');
    return newAdmin;
  };

  const getNextProjectId = (): string => {
    const year = new Date().getFullYear();
    const prefix = `EST${year}-`;
    const yearProjects = projects.filter((p) => p.id.startsWith(prefix));
    
    let highestNum = 0;
    yearProjects.forEach((p) => {
      const numPart = parseInt(p.id.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > highestNum) {
        highestNum = numPart;
      }
    });

    return `${prefix}${highestNum + 1}`;
  };

  const addProject = (
    projectData: Omit<Project, 'createdAt' | 'updatedAt' | 'deliverables'> & { initialDeliverables?: string[] }
  ): Project => {
    const now = new Date().toISOString();
    const count = projectData.initialDeliverables?.length || 1;
    const baseCost = Math.round(projectData.budget / count);
    const taxAmount = Math.round(baseCost * 0.18);
    const initialDels: Deliverable[] = (projectData.initialDeliverables || []).map((name, idx) => ({
      id: `del-${Date.now()}-${idx}`,
      projectId: projectData.id,
      name: name.trim(),
      category: 'General',
      status: 'Pending',
      startDate: projectData.startDate,
      endDate: projectData.targetEndDate,
      progress: 0,
      assignedTo: projectData.leadManager || currentUser?.name || 'Admin',
      currency: projectData.currency || 'INR',
      value: baseCost,
      cost: baseCost,
      tax: taxAmount,
      total: baseCost + taxAmount,
    }));

    const assignedUser = users.find(
      (u) => u.name.toLowerCase() === (projectData.leadManager || '').toLowerCase()
    );
    const leadMgr = projectData.leadManager || currentUser?.name || 'Executive Super Admin';
    const leadAvatar = projectData.leadAvatar || assignedUser?.avatar || currentUser?.avatar;

    const newProject: Project = {
      ...projectData,
      currency: projectData.currency || 'INR',
      leadManager: leadMgr,
      leadAvatar: leadAvatar,
      createdByAdminId: currentUser?.id || 'usr-super',
      createdByAdminName: currentUser?.name || 'Super Admin',
      deliverables: initialDels,
      createdAt: now,
      updatedAt: now,
    };

    setProjects((prev) => [newProject, ...prev]);

    // If current user is Admin, attach project to their assignedProjectIds
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        assignedProjectIds: Array.from(new Set([...(currentUser.assignedProjectIds || []), newProject.id])),
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    }

    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      projectId: newProject.id,
      userName: currentUser?.name || 'Admin',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      action: 'created new project workspace',
      target: `${newProject.id} — ${newProject.name}`,
      timestamp: 'Just now'
    };
    setActivityLogs((prev) => [log, ...prev]);

    showToast('Project Created', `Successfully initialized ${newProject.id}`, 'success');
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updatedDeliverables = updates.currency
            ? p.deliverables.map((d) => ({ ...d, currency: updates.currency }))
            : p.deliverables;

          const updated = {
            ...p,
            ...updates,
            deliverables: updatedDeliverables,
            updatedAt: new Date().toISOString()
          };
          if (updates.status === 'Completed' && p.status !== 'Completed') {
            triggerCelebration();
          }
          return updated;
        }
        return p;
      })
    );

    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      projectId: id,
      userName: currentUser?.name || 'Admin',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      action: 'updated project settings on',
      target: id,
      timestamp: 'Just now'
    };
    setActivityLogs((prev) => [log, ...prev]);

    showToast('Project Updated', `Changes saved for ${id}`, 'info');
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProjectId === id) {
      const remaining = projects.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setSelectedProjectId(remaining[0].id);
      }
    }
    showToast('Project Deleted', `Removed project ${id}`, 'warning');
  };

  const addDeliverable = (projectId: string, deliverableData: Omit<Deliverable, 'id' | 'projectId'>) => {
    const cost = deliverableData.cost !== undefined ? deliverableData.cost : (deliverableData.value || 0);
    const tax = deliverableData.tax !== undefined ? deliverableData.tax : Math.round(cost * 0.18);
    const total = deliverableData.total !== undefined ? deliverableData.total : (cost + tax);

    const newDeliverable: Deliverable = {
      ...deliverableData,
      id: `del-${Date.now()}`,
      projectId,
      value: cost,
      cost,
      tax,
      total,
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            deliverables: [...p.deliverables, newDeliverable],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      projectId,
      userName: currentUser?.name || 'Admin',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      action: 'added new expense item',
      target: `${newDeliverable.name} to ${projectId}`,
      timestamp: 'Just now'
    };
    setActivityLogs((prev) => [log, ...prev]);

    showToast('Expense Added', `Added "${newDeliverable.name}"`, 'success');
  };

  const updateDeliverable = (projectId: string, deliverableId: string, updates: Partial<Deliverable>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedDeliverables = p.deliverables.map((d) => {
            if (d.id === deliverableId) {
              const updated = { ...d, ...updates };
              const cost = updated.cost !== undefined ? updated.cost : (updated.value || 0);
              const tax = updated.tax !== undefined ? updated.tax : Math.round(cost * 0.18);
              const total = updated.total !== undefined ? updated.total : (cost + tax);
              updated.cost = cost;
              updated.value = cost;
              updated.tax = tax;
              updated.total = total;

              if (updates.status === 'Completed' && d.status !== 'Completed') {
                triggerCelebration();
              }
              return updated;
            }
            return d;
          });

          const allCompleted = updatedDeliverables.length > 0 && updatedDeliverables.every((d) => d.status === 'Completed');
          const newStatus: ProjectStatus = allCompleted ? 'Completed' : p.status;

          return {
            ...p,
            status: newStatus,
            deliverables: updatedDeliverables,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    showToast('Expense Updated', 'Expense details updated', 'info');
  };

  const deleteDeliverable = (projectId: string, deliverableId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            deliverables: p.deliverables.filter((d) => d.id !== deliverableId),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    showToast('Deliverable Removed', 'Removed item from project scope', 'warning');
  };

  const addUser = async (userData: Omit<User, 'id' | 'assignedProjectIds'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      assignedProjectIds: [],
    };
    setUsers((prev) => [...prev, newUser]);
    showToast('User Added', `Created account for ${newUser.name}`, 'success');
  };

  const resendInvitationEmail = async (logId: string) => {
    const existingLog = emailLogs.find((l) => l.id === logId);
    if (!existingLog) return;

    try {
      const result = await sendInvitationEmail(emailConfig, {
        recipientName: existingLog.recipientName,
        recipientEmail: existingLog.recipientEmail,
        recipientRole: existingLog.role as any,
        recipientDepartment: 'Operations',
        inviterName: currentUser?.name || 'Super Admin',
        inviterRole: currentUser?.role || 'Super Admin',
        inviteLink: existingLog.inviteLink,
        expiresInHours: 48,
      });

      setEmailLogsState((prev) => [result.log, ...prev.filter((l) => l.id !== logId)]);
      showToast('Invitation Resent', `Email re-sent to ${existingLog.recipientEmail}`, 'success');
    } catch {
      showToast('Dispatch Error', 'Could not resend invitation email', 'error');
    }
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser && currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    if (updates.assignedProjectIds) {
      const targetUser = users.find((u) => u.id === id);
      const adminName = updates.name || targetUser?.name;
      const adminAvatar = updates.avatar || targetUser?.avatar;

      if (adminName) {
        setProjects((prev) =>
          prev.map((p) => {
            if (updates.assignedProjectIds!.includes(p.id)) {
              return {
                ...p,
                leadManager: adminName,
                leadAvatar: adminAvatar || p.leadAvatar,
                teamMembers: Array.from(new Set([...(p.teamMembers || []), adminName])),
              };
            }
            return p;
          })
        );
      }
    }

    showToast('User Updated', 'Account credentials modified', 'info');
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('User Removed', 'Account has been deleted', 'warning');
  };

  const resetToDemoData = () => {
    setProjects(INITIAL_PROJECTS);
    setUsers(INITIAL_USERS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setCurrentUser(INITIAL_USERS[0]);
    setSelectedProjectId('EST2024-1');
    localStorage.clear();
    showToast('Workspace Reset', 'Restored default Super Admin & Multi-Admin workspace', 'info');
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        visibleProjects,
        users,
        activityLogs,
        currentUser,
        activeRole,
        currentView,
        selectedProjectId,
        searchQuery,
        toasts,
        emailConfig,
        emailLogs,
        login,
        logout,
        createAdminUser,
        addProject,
        updateProject,
        deleteProject,
        addDeliverable,
        updateDeliverable,
        deleteDeliverable,
        addUser,
        updateUser,
        deleteUser,
        updateEmailConfig,
        resendInvitationEmail,
        setCurrentView,
        setSelectedProjectId,
        setActiveRole,
        setSearchQuery,
        showToast,
        removeToast,
        resetToDemoData,
        getNextProjectId,
        selectedProject,
        triggerCelebration,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
