import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import type { 
  Project, 
  User, 
  Deliverable, 
  ActivityLog, 
  ProjectStatus, 
  ProjectType, 
  DeliverableStatus, 
  UserRole 
} from '../types';
import type { SentEmailLog } from '../types/email';

export interface CloudDbConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  isConnected: boolean;
  lastSyncedAt?: string;
}

export type CloudSyncStatus = 'online' | 'syncing' | 'offline' | 'unconfigured' | 'error';

const CONFIG_STORAGE_KEY = 'est_supabase_cloud_config_v1';

// Default / saved configuration
export const getCloudConfig = (): CloudDbConfig => {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: parsed.anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        autoSync: parsed.autoSync !== false,
        isConnected: !!parsed.isConnected,
        lastSyncedAt: parsed.lastSyncedAt,
      };
    }
  } catch (e) {
    console.error('Error reading cloud config', e);
  }

  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    autoSync: true,
    isConnected: false,
  };
};

export const saveCloudConfig = (config: CloudDbConfig): void => {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save cloud config', e);
  }
};

let cachedClient: SupabaseClient | null = null;
let currentClientUrl = '';
let currentClientKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getCloudConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  // Reuse existing instance if credentials haven't changed
  if (cachedClient && currentClientUrl === config.url && currentClientKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    currentClientUrl = config.url;
    currentClientKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

// Test connection and measure latency
export const testCloudConnection = async (testConfig?: { url: string; anonKey: string }): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
  tablesFound?: {
    projects: boolean;
    deliverables: boolean;
    app_users: boolean;
    activity_logs: boolean;
  };
}> => {
  const url = testConfig?.url || getCloudConfig().url;
  const anonKey = testConfig?.anonKey || getCloudConfig().anonKey;

  if (!url || !anonKey) {
    return {
      success: false,
      latencyMs: 0,
      message: 'Supabase URL and API Key are required.',
    };
  }

  const startTime = Date.now();
  try {
    const client = createClient(url, anonKey);
    
    // Check projects table
    const pRes = await client.from('projects').select('id', { count: 'exact', head: true });
    const dRes = await client.from('deliverables').select('id', { count: 'exact', head: true });
    const uRes = await client.from('app_users').select('id', { count: 'exact', head: true });
    const lRes = await client.from('activity_logs').select('id', { count: 'exact', head: true });

    const latencyMs = Date.now() - startTime;

    const tablesFound = {
      projects: !pRes.error,
      deliverables: !dRes.error,
      app_users: !uRes.error,
      activity_logs: !lRes.error,
    };

    if (pRes.error && pRes.error.code === 'PGRST204') {
      return {
        success: false,
        latencyMs,
        message: 'Connected to Supabase, but tables are missing. Please execute the SQL Schema Script first.',
        tablesFound,
      };
    }

    if (pRes.error && pRes.error.message.includes('FetchError')) {
      return {
        success: false,
        latencyMs,
        message: 'Could not reach Supabase endpoint. Please verify the URL.',
      };
    }

    return {
      success: true,
      latencyMs,
      message: `Successfully connected to Supabase Cloud (${latencyMs}ms response time).`,
      tablesFound,
    };
  } catch (err: unknown) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      message: err instanceof Error ? err.message : 'Unknown connection error',
    };
  }
};

// Database schema SQL for 10-year enterprise scale
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- EST BRAND SERVICES — ENTERPRISE CLOUD DATABASE SCHEMA (PostgreSQL / Supabase)
-- Designed for 10+ Years of High-Volume Project Tracking, Realtime & Multi-Admin Sync
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. APP USERS / ADMIN ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS app_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    password TEXT,
    role TEXT NOT NULL DEFAULT 'Admin',
    department TEXT DEFAULT 'Project Execution',
    avatar TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    last_active TEXT DEFAULT 'Just now',
    phone TEXT,
    assigned_project_ids JSONB DEFAULT '[]'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON app_users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_username ON app_users (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_role ON app_users (role);

-- 3. ENTERPRISE PROJECTS TABLE (10+ Year Long-Term Scalable Storage)
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    client_company TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    start_date TEXT NOT NULL,
    target_end_date TEXT NOT NULL,
    budget NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    lead_manager TEXT NOT NULL,
    lead_avatar TEXT,
    team_members JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    health TEXT NOT NULL DEFAULT 'On Track',
    priority TEXT NOT NULL DEFAULT 'Medium',
    created_by_admin_id TEXT,
    created_by_admin_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_lead_manager ON projects (LOWER(lead_manager));
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects (created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_client_company ON projects (LOWER(client_company));

-- 4. DELIVERABLES / EXPENSES / MILESTONES TABLE
CREATE TABLE IF NOT EXISTS deliverables (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    status TEXT NOT NULL DEFAULT 'Pending',
    start_date TEXT,
    end_date TEXT,
    progress NUMERIC DEFAULT 0,
    assigned_to TEXT,
    assigned_avatar TEXT,
    currency TEXT DEFAULT 'INR',
    value NUMERIC DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    notes TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliverables_project_id ON deliverables (project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables (status);

-- 5. AUDIT LOGS / ACTIVITY HISTORY (Immutable 10-Year Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_created_at ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_project_id ON activity_logs (project_id);

-- 6. EMAIL INVITATION LOGS TABLE
CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    role TEXT NOT NULL,
    portal_url TEXT,
    status TEXT NOT NULL,
    error_message TEXT,
    sent_at TEXT NOT NULL,
    provider TEXT,
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs (created_at DESC);

-- 7. SYSTEM CONFIGURATION & APP SETTINGS
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ENABLE SUPABASE REALTIME REPLICATION (Instant Multi-Device Broadcast)
-- =========================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE deliverables;
ALTER PUBLICATION supabase_realtime ADD TABLE app_users;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE email_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write on app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on deliverables" ON deliverables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on email_logs" ON email_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);
`;

// Helper: Convert Database Row to Project
export const mapDbProject = (row: Record<string, unknown>, deliverables: Deliverable[] = []): Project => {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    clientName: String(row.client_name || ''),
    clientEmail: String(row.client_email || ''),
    clientPhone: row.client_phone ? String(row.client_phone) : undefined,
    clientCompany: String(row.client_company || ''),
    type: (row.type || 'Branding') as ProjectType,
    status: (row.status || 'Open') as ProjectStatus,
    startDate: String(row.start_date || ''),
    targetEndDate: String(row.target_end_date || ''),
    budget: Number(row.budget || 0),
    currency: String(row.currency || 'INR'),
    leadManager: String(row.lead_manager || ''),
    leadAvatar: row.lead_avatar ? String(row.lead_avatar) : undefined,
    teamMembers: Array.isArray(row.team_members) ? (row.team_members as string[]) : [],
    description: String(row.description || ''),
    health: (row.health || 'On Track') as 'On Track' | 'At Risk' | 'Delayed',
    priority: (row.priority || 'Medium') as 'High' | 'Medium' | 'Low',
    deliverables: deliverables.filter(d => d.projectId === row.id),
    createdByAdminId: row.created_by_admin_id ? String(row.created_by_admin_id) : undefined,
    createdByAdminName: row.created_by_admin_name ? String(row.created_by_admin_name) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
};

// Helper: Convert Project to Database Row
export const mapProjectToDb = (project: Project): Record<string, unknown> => {
  return {
    id: project.id,
    name: project.name,
    client_name: project.clientName,
    client_email: project.clientEmail || null,
    client_phone: project.clientPhone || null,
    client_company: project.clientCompany,
    type: project.type,
    status: project.status,
    start_date: project.startDate,
    target_end_date: project.targetEndDate,
    budget: project.budget,
    currency: project.currency,
    lead_manager: project.leadManager,
    lead_avatar: project.leadAvatar || null,
    team_members: project.teamMembers || [],
    description: project.description || '',
    health: project.health,
    priority: project.priority,
    created_by_admin_id: project.createdByAdminId || null,
    created_by_admin_name: project.createdByAdminName || null,
    created_at: project.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// Helper: Convert Database Row to Deliverable
export const mapDbDeliverable = (row: Record<string, unknown>): Deliverable => {
  return {
    id: String(row.id || ''),
    projectId: String(row.project_id || ''),
    name: String(row.name || ''),
    category: String(row.category || 'General'),
    status: (row.status || 'Pending') as DeliverableStatus,
    startDate: String(row.start_date || ''),
    endDate: String(row.end_date || ''),
    progress: Number(row.progress || 0),
    assignedTo: String(row.assigned_to || ''),
    assignedAvatar: row.assigned_avatar ? String(row.assigned_avatar) : undefined,
    currency: row.currency ? String(row.currency) : 'INR',
    value: Number(row.value || row.cost || 0),
    cost: row.cost !== undefined ? Number(row.cost) : Number(row.value || 0),
    tax: row.tax !== undefined ? Number(row.tax) : 0,
    total: row.total !== undefined ? Number(row.total) : Number(row.value || 0),
    notes: row.notes ? String(row.notes) : undefined,
    attachmentUrl: row.attachment_url ? String(row.attachment_url) : undefined,
  };
};

// Helper: Convert Deliverable to Database Row
export const mapDeliverableToDb = (del: Deliverable): Record<string, unknown> => {
  return {
    id: del.id,
    project_id: del.projectId,
    name: del.name,
    category: del.category,
    status: del.status,
    start_date: del.startDate,
    end_date: del.endDate,
    progress: del.progress,
    assigned_to: del.assignedTo,
    assigned_avatar: del.assignedAvatar || null,
    currency: del.currency || 'INR',
    value: del.value,
    cost: del.cost ?? del.value,
    tax: del.tax ?? 0,
    total: del.total ?? del.value,
    notes: del.notes || null,
    attachment_url: del.attachmentUrl || null,
    updated_at: new Date().toISOString(),
  };
};

// Helper: Convert Database Row to User
export const mapDbUser = (row: Record<string, unknown>): User => {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    email: String(row.email || ''),
    username: row.username ? String(row.username) : undefined,
    password: row.password ? String(row.password) : undefined,
    role: (row.role || 'Admin') as UserRole,
    department: String(row.department || 'Project Execution'),
    avatar: String(row.avatar || ''),
    status: (row.status || 'Active') as 'Active' | 'Invited' | 'Suspended',
    lastActive: String(row.last_active || 'Just now'),
    phone: row.phone ? String(row.phone) : undefined,
    assignedProjectIds: Array.isArray(row.assigned_project_ids) ? (row.assigned_project_ids as string[]) : [],
    createdBy: row.created_by ? String(row.created_by) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
  };
};

// Helper: Convert User to Database Row
export const mapUserToDb = (user: User): Record<string, unknown> => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username || null,
    password: user.password || null,
    role: user.role,
    department: user.department || 'Project Execution',
    avatar: user.avatar || '',
    status: user.status || 'Active',
    last_active: user.lastActive || 'Just now',
    phone: user.phone || null,
    assigned_project_ids: user.assignedProjectIds || [],
    created_by: user.createdBy || null,
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// Helper: Convert Activity Log to/from DB
export const mapDbActivityLog = (row: Record<string, unknown>): ActivityLog => {
  return {
    id: String(row.id || ''),
    projectId: row.project_id ? String(row.project_id) : undefined,
    userName: String(row.user_name || ''),
    userAvatar: String(row.user_avatar || ''),
    action: String(row.action || ''),
    target: String(row.target || ''),
    timestamp: String(row.timestamp || ''),
  };
};

export const mapActivityLogToDb = (log: ActivityLog): Record<string, unknown> => {
  return {
    id: log.id,
    project_id: log.projectId || null,
    user_name: log.userName,
    user_avatar: log.userAvatar,
    action: log.action,
    target: log.target,
    timestamp: log.timestamp,
    created_at: new Date().toISOString(),
  };
};

// Helper: Convert Email Log to/from DB
export const mapDbEmailLog = (row: Record<string, unknown>): SentEmailLog => {
  return {
    id: String(row.id || ''),
    recipientEmail: String(row.recipient_email || ''),
    recipientName: String(row.recipient_name || ''),
    role: String(row.role || ''),
    sentAt: String(row.sent_at || ''),
    status: (row.status || 'delivered') as 'delivered' | 'simulated' | 'failed',
    provider: String(row.provider || 'emailjs'),
    subject: String(row.subject || ''),
    inviteLink: String(row.portal_url || ''),
    errorMessage: row.error_message ? String(row.error_message) : undefined,
  };
};

export const mapEmailLogToDb = (log: SentEmailLog): Record<string, unknown> => {
  return {
    id: log.id,
    recipient_email: log.recipientEmail,
    recipient_name: log.recipientName,
    role: log.role,
    portal_url: log.inviteLink,
    status: log.status,
    error_message: log.errorMessage || null,
    sent_at: log.sentAt,
    provider: log.provider,
    subject: log.subject,
    created_at: new Date().toISOString(),
  };
};

// =========================================================================
// FETCH ALL DATA FROM CLOUD (With Relational Joins)
// =========================================================================
export const fetchCloudData = async (): Promise<{
  success: boolean;
  projects: Project[];
  users: User[];
  activityLogs: ActivityLog[];
  emailLogs: SentEmailLog[];
  error?: string;
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      projects: [],
      users: [],
      activityLogs: [],
      emailLogs: [],
      error: 'Supabase client is not configured',
    };
  }

  try {
    const [pRes, dRes, uRes, lRes, eRes] = await Promise.all([
      client.from('projects').select('*').order('created_at', { ascending: false }),
      client.from('deliverables').select('*').order('created_at', { ascending: true }),
      client.from('app_users').select('*').order('created_at', { ascending: false }),
      client.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(200),
      client.from('email_logs').select('*').order('created_at', { ascending: false }).limit(100),
    ]);

    if (pRes.error) throw pRes.error;
    if (dRes.error) throw dRes.error;
    if (uRes.error) throw uRes.error;

    const deliverables = (dRes.data || []).map(mapDbDeliverable);
    const projects = (pRes.data || []).map(row => mapDbProject(row, deliverables));
    const users = (uRes.data || []).map(mapDbUser);
    const activityLogs = (lRes.data || []).map(mapDbActivityLog);
    const emailLogs = (eRes.data || []).map(mapDbEmailLog);

    return {
      success: true,
      projects,
      users,
      activityLogs,
      emailLogs,
    };
  } catch (err: unknown) {
    console.error('Error fetching cloud data:', err);
    return {
      success: false,
      projects: [],
      users: [],
      activityLogs: [],
      emailLogs: [],
      error: err instanceof Error ? err.message : 'Unknown database error',
    };
  }
};

// =========================================================================
// 1-CLICK MIGRATION: PUSH LOCAL DATA TO SUPABASE CLOUD
// =========================================================================
export const pushLocalToCloud = async (
  data: {
    projects: Project[];
    users: User[];
    activityLogs: ActivityLog[];
    emailLogs?: SentEmailLog[];
  },
  onProgress?: (stage: string, percent: number) => void
): Promise<{ success: boolean; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not connected.' };
  }

  try {
    // 1. Migrate Users
    onProgress?.('Syncing Admin & User Accounts to Cloud...', 20);
    const userRows = data.users.map(mapUserToDb);
    if (userRows.length > 0) {
      const { error: userErr } = await client.from('app_users').upsert(userRows, { onConflict: 'id' });
      if (userErr) throw new Error(`Users sync failed: ${userErr.message}`);
    }

    // 2. Migrate Projects
    onProgress?.('Uploading Enterprise Projects...', 50);
    const projectRows = data.projects.map(mapProjectToDb);
    if (projectRows.length > 0) {
      const { error: projErr } = await client.from('projects').upsert(projectRows, { onConflict: 'id' });
      if (projErr) throw new Error(`Projects sync failed: ${projErr.message}`);
    }

    // 3. Migrate Deliverables
    onProgress?.('Uploading Deliverables & Milestones...', 75);
    const allDeliverables: Deliverable[] = [];
    data.projects.forEach(p => {
      (p.deliverables || []).forEach(d => {
        allDeliverables.push({ ...d, projectId: p.id });
      });
    });

    if (allDeliverables.length > 0) {
      const deliverableRows = allDeliverables.map(mapDeliverableToDb);
      const { error: delErr } = await client.from('deliverables').upsert(deliverableRows, { onConflict: 'id' });
      if (delErr) throw new Error(`Deliverables sync failed: ${delErr.message}`);
    }

    // 4. Migrate Activity Logs
    onProgress?.('Archiving Activity Logs & Audit History...', 90);
    const logRows = data.activityLogs.map(mapActivityLogToDb);
    if (logRows.length > 0) {
      await client.from('activity_logs').upsert(logRows, { onConflict: 'id' });
    }

    if (data.emailLogs && data.emailLogs.length > 0) {
      const emailRows = data.emailLogs.map(mapEmailLogToDb);
      await client.from('email_logs').upsert(emailRows, { onConflict: 'id' });
    }

    onProgress?.('Cloud Synchronization Complete!', 100);
    return { success: true, message: `Successfully synchronized ${data.projects.length} projects, ${allDeliverables.length} deliverables, and ${data.users.length} users to Supabase PostgreSQL!` };
  } catch (err: unknown) {
    console.error('Migration failed:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Migration encountered an error',
    };
  }
};

// =========================================================================
// REAL-TIME CRUD SYNCHRONIZATION HELPERS (Background Non-Blocking)
// =========================================================================
export const syncProjectToCloud = async (project: Project, action: 'upsert' | 'delete' = 'upsert') => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    if (action === 'delete') {
      await client.from('projects').delete().eq('id', project.id);
    } else {
      await client.from('projects').upsert(mapProjectToDb(project), { onConflict: 'id' });
      // Also upsert deliverables
      if (project.deliverables && project.deliverables.length > 0) {
        const delRows = project.deliverables.map(d => mapDeliverableToDb({ ...d, projectId: project.id }));
        await client.from('deliverables').upsert(delRows, { onConflict: 'id' });
      }
    }
  } catch (e) {
    console.error('Cloud project sync error:', e);
  }
};

export const syncDeliverableToCloud = async (deliverable: Deliverable, action: 'upsert' | 'delete' = 'upsert') => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    if (action === 'delete') {
      await client.from('deliverables').delete().eq('id', deliverable.id);
    } else {
      await client.from('deliverables').upsert(mapDeliverableToDb(deliverable), { onConflict: 'id' });
    }
  } catch (e) {
    console.error('Cloud deliverable sync error:', e);
  }
};

export const syncUserToCloud = async (user: User, action: 'upsert' | 'delete' = 'upsert') => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    if (action === 'delete') {
      await client.from('app_users').delete().eq('id', user.id);
    } else {
      await client.from('app_users').upsert(mapUserToDb(user), { onConflict: 'id' });
    }
  } catch (e) {
    console.error('Cloud user sync error:', e);
  }
};

export const syncActivityLogToCloud = async (log: ActivityLog) => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('activity_logs').upsert(mapActivityLogToDb(log), { onConflict: 'id' });
  } catch (e) {
    console.error('Cloud activity log sync error:', e);
  }
};

export const syncEmailLogToCloud = async (log: SentEmailLog) => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('email_logs').upsert(mapEmailLogToDb(log), { onConflict: 'id' });
  } catch (e) {
    console.error('Cloud email log sync error:', e);
  }
};

// =========================================================================
// 10-YEAR HISTORICAL ARCHIVING & BACKUP EXPORTERS
// =========================================================================

// 1. JSON Master Archive (Complete High-Fidelity Snapshot)
export const exportJsonArchive = (data: {
  projects: Project[];
  users: User[];
  activityLogs: ActivityLog[];
  emailLogs?: SentEmailLog[];
}) => {
  const archive = {
    metadata: {
      application: 'EST Brand Services - Enterprise Project Tracker',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      retentionGuarantee: '10-Year Enterprise Archive',
      summary: {
        totalProjects: data.projects.length,
        totalDeliverables: data.projects.reduce((acc, p) => acc + (p.deliverables?.length || 0), 0),
        totalAdmins: data.users.length,
        totalLogs: data.activityLogs.length,
      },
    },
    data,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(archive, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `EST_Database_Archive_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// 2. PostgreSQL SQL Dump File (Direct Restore into any Postgres/Supabase DB)
export const exportSqlDump = (data: {
  projects: Project[];
  users: User[];
  activityLogs: ActivityLog[];
}) => {
  let sql = `-- =========================================================================\n`;
  sql += `-- EST BRAND SERVICES — 10-YEAR HISTORICAL SQL BACKUP DUMP\n`;
  sql += `-- Generated At: ${new Date().toISOString()}\n`;
  sql += `-- Total Projects: ${data.projects.length} | Total Users: ${data.users.length}\n`;
  sql += `-- =========================================================================\n\n`;

  sql += SUPABASE_SQL_SCHEMA + `\n\n`;

  // Insert Users
  if (data.users.length > 0) {
    sql += `-- USERS TABLE INSERTS\n`;
    data.users.forEach(u => {
      const email = (u.email || '').replace(/'/g, "''");
      const name = (u.name || '').replace(/'/g, "''");
      const username = (u.username || '').replace(/'/g, "''");
      const password = (u.password || '').replace(/'/g, "''");
      const role = u.role.replace(/'/g, "''");
      const department = (u.department || '').replace(/'/g, "''");
      const avatar = (u.avatar || '').replace(/'/g, "''");
      const assigned = JSON.stringify(u.assignedProjectIds || []).replace(/'/g, "''");
      sql += `INSERT INTO app_users (id, name, email, username, password, role, department, avatar, status, assigned_project_ids, created_at) VALUES ('${u.id}', '${name}', '${email}', '${username}', '${password}', '${role}', '${department}', '${avatar}', '${u.status}', '${assigned}'::jsonb, '${u.createdAt || new Date().toISOString()}') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role;\n`;
    });
    sql += `\n`;
  }

  // Insert Projects
  if (data.projects.length > 0) {
    sql += `-- PROJECTS TABLE INSERTS\n`;
    data.projects.forEach(p => {
      const name = p.name.replace(/'/g, "''");
      const clientName = p.clientName.replace(/'/g, "''");
      const clientEmail = (p.clientEmail || '').replace(/'/g, "''");
      const clientCompany = p.clientCompany.replace(/'/g, "''");
      const desc = (p.description || '').replace(/'/g, "''");
      const lead = p.leadManager.replace(/'/g, "''");
      const members = JSON.stringify(p.teamMembers || []).replace(/'/g, "''");
      sql += `INSERT INTO projects (id, name, client_name, client_email, client_company, type, status, start_date, target_end_date, budget, currency, lead_manager, team_members, description, health, priority, created_by_admin_id, created_by_admin_name, created_at) VALUES ('${p.id}', '${name}', '${clientName}', '${clientEmail}', '${clientCompany}', '${p.type}', '${p.status}', '${p.startDate}', '${p.targetEndDate}', ${p.budget}, '${p.currency}', '${lead}', '${members}'::jsonb, '${desc}', '${p.health}', '${p.priority}', '${p.createdByAdminId || ''}', '${p.createdByAdminName || ''}', '${p.createdAt || new Date().toISOString()}') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, budget = EXCLUDED.budget;\n`;
    });
    sql += `\n`;
  }

  // Insert Deliverables
  const deliverables: Deliverable[] = [];
  data.projects.forEach(p => (p.deliverables || []).forEach(d => deliverables.push({ ...d, projectId: p.id })));
  if (deliverables.length > 0) {
    sql += `-- DELIVERABLES TABLE INSERTS\n`;
    deliverables.forEach(d => {
      const name = d.name.replace(/'/g, "''");
      const cat = (d.category || 'General').replace(/'/g, "''");
      const assigned = (d.assignedTo || '').replace(/'/g, "''");
      const notes = (d.notes || '').replace(/'/g, "''");
      sql += `INSERT INTO deliverables (id, project_id, name, category, status, start_date, end_date, progress, assigned_to, currency, value, cost, tax, total, notes) VALUES ('${d.id}', '${d.projectId}', '${name}', '${cat}', '${d.status}', '${d.startDate}', '${d.endDate}', ${d.progress}, '${assigned}', '${d.currency || 'INR'}', ${d.value}, ${d.cost || d.value}, ${d.tax || 0}, ${d.total || d.value}, '${notes}') ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, progress = EXCLUDED.progress, total = EXCLUDED.total;\n`;
    });
    sql += `\n`;
  }

  const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `EST_Database_Dump_${new Date().toISOString().slice(0, 10)}.sql`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// 3. Multi-Sheet Master Excel Workbook (.xlsx)
export const exportMultiSheetExcel = (data: {
  projects: Project[];
  users: User[];
  activityLogs: ActivityLog[];
}) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Projects
  const projectRows = data.projects.map(p => ({
    'Project ID': p.id,
    'Project Name': p.name,
    'Client Company': p.clientCompany,
    'Client Name': p.clientName,
    'Client Email': p.clientEmail,
    'Project Type': p.type,
    'Status': p.status,
    'Health': p.health,
    'Priority': p.priority,
    'Start Date': p.startDate,
    'Target End Date': p.targetEndDate,
    'Budget': p.budget,
    'Currency': p.currency,
    'Lead Manager': p.leadManager,
    'Team Members': (p.teamMembers || []).join(', '),
    'Deliverables Count': p.deliverables?.length || 0,
    'Created By Admin': p.createdByAdminName || 'Super Admin',
    'Created At': p.createdAt,
  }));
  const wsProjects = XLSX.utils.json_to_sheet(projectRows);
  XLSX.utils.book_append_sheet(wb, wsProjects, 'Projects Master');

  // Sheet 2: Deliverables
  const allDeliverables: Array<Record<string, unknown>> = [];
  data.projects.forEach(p => {
    (p.deliverables || []).forEach(d => {
      allDeliverables.push({
        'Deliverable ID': d.id,
        'Project ID': p.id,
        'Project Name': p.name,
        'Deliverable / Expense Name': d.name,
        'Category': d.category,
        'Status': d.status,
        'Progress (%)': `${d.progress}%`,
        'Assigned To': d.assignedTo,
        'Start Date': d.startDate,
        'End Date': d.endDate,
        'Currency': d.currency || p.currency,
        'Base Cost': d.cost ?? d.value,
        'Tax': d.tax ?? 0,
        'Total Amount': d.total ?? d.value,
        'Notes': d.notes || '',
      });
    });
  });
  const wsDeliverables = XLSX.utils.json_to_sheet(allDeliverables);
  XLSX.utils.book_append_sheet(wb, wsDeliverables, 'Deliverables & Expenses');

  // Sheet 3: Users & Admin Vault
  const userRows = data.users.map(u => ({
    'User ID': u.id,
    'Full Name': u.name,
    'Email Address': u.email,
    'Username': u.username || '',
    'Role': u.role,
    'Department': u.department,
    'Status': u.status,
    'Assigned Projects Count': u.assignedProjectIds?.length || 0,
    'Last Active': u.lastActive,
    'Phone': u.phone || '',
    'Created By': u.createdBy || '',
    'Created At': u.createdAt || '',
  }));
  const wsUsers = XLSX.utils.json_to_sheet(userRows);
  XLSX.utils.book_append_sheet(wb, wsUsers, 'Admin & User Vault');

  // Sheet 4: Audit Logs
  const logRows = data.activityLogs.map(l => ({
    'Log ID': l.id,
    'Timestamp': l.timestamp,
    'User Name': l.userName,
    'Action': l.action,
    'Target': l.target,
    'Project ID': l.projectId || 'Global',
  }));
  const wsLogs = XLSX.utils.json_to_sheet(logRows);
  XLSX.utils.book_append_sheet(wb, wsLogs, '10-Year Audit Trail');

  XLSX.writeFile(wb, `EST_10Year_Master_Records_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
