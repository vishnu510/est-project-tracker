-- =========================================================================
-- EST BRAND SERVICES — ENTERPRISE CLOUD DATABASE SCHEMA (PostgreSQL / Supabase)
-- Designed for Multi-Device Realtime Sync across Windows Desktop .exe & Web Portal
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

-- 3. ENTERPRISE PROJECTS TABLE
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

-- 5. AUDIT LOGS / ACTIVITY HISTORY
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
