import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  getCloudConfig, 
  saveCloudConfig, 
  testCloudConnection, 
  pushLocalToCloud, 
  exportJsonArchive, 
  exportSqlDump, 
  exportMultiSheetExcel,
  SUPABASE_SQL_SCHEMA,
  type CloudDbConfig 
} from '../../services/cloudDatabase';
import { 
  Database, 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  X, 
  FileSpreadsheet, 
  FileCode, 
  FileJson 
} from 'lucide-react';

interface CloudDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'status' | 'credentials' | 'migration' | 'schema' | 'backups';

export const CloudDatabaseModal: React.FC<CloudDatabaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    projects, 
    users, 
    activityLogs, 
    emailLogs, 
    cloudStatus, 
    syncCloudNow, 
    showToast,
    refreshCloudConnection
  } = useProject();

  const [activeTab, setActiveTab] = useState<TabType>('status');
  const [config, setConfig] = useState<CloudDbConfig>(() => getCloudConfig());
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    tablesFound?: { projects: boolean; deliverables: boolean; app_users: boolean; activity_logs: boolean };
  } | null>(null);

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStage, setMigrationStage] = useState('');
  const [migrationProgress, setMigrationProgress] = useState(0);

  const [copiedSql, setCopiedSql] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getCloudConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalDeliverablesCount = projects.reduce((acc, p) => acc + (p.deliverables?.length || 0), 0);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testCloudConnection({ url: config.url, anonKey: config.anonKey });
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSaveAndConnect = async () => {
    setIsTesting(true);
    const res = await testCloudConnection({ url: config.url, anonKey: config.anonKey });
    setIsTesting(false);

    if (res.success) {
      const updatedConfig: CloudDbConfig = {
        ...config,
        isConnected: true,
        lastSyncedAt: new Date().toLocaleTimeString(),
      };
      saveCloudConfig(updatedConfig);
      setConfig(updatedConfig);
      showToast('Cloud Database Connected', 'Realtime sync is now active with Supabase!', 'success');
      await refreshCloudConnection();
      setActiveTab('status');
    } else {
      setTestResult(res);
      showToast('Connection Failed', res.message, 'error');
    }
  };

  const handleDisconnect = async () => {
    const updatedConfig: CloudDbConfig = {
      ...config,
      isConnected: false,
    };
    saveCloudConfig(updatedConfig);
    setConfig(updatedConfig);
    await refreshCloudConnection();
    showToast('Switched to Local Mode', 'Data is now stored on this device only.', 'info');
  };

  const handleStartMigration = async () => {
    setIsMigrating(true);
    setMigrationStage('Preparing local records...');
    setMigrationProgress(10);

    const res = await pushLocalToCloud(
      {
        projects,
        users,
        activityLogs,
        emailLogs,
      },
      (stage, percent) => {
        setMigrationStage(stage);
        setMigrationProgress(percent);
      }
    );

    setIsMigrating(false);
    if (res.success) {
      showToast('Migration Complete', res.message, 'success');
      await refreshCloudConnection();
    } else {
      showToast('Migration Error', res.message, 'error');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    showToast('SQL Copied', 'Schema script copied to clipboard.', 'success');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await syncCloudNow();
    setIsManualSyncing(false);
    showToast('Synchronized', 'Latest data pulled and pushed to Supabase Cloud.', 'success');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.05)',
        overflow: 'hidden',
        animation: 'fadeIn 0.25s ease',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-cerulean) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(22, 46, 74, 0.2)',
            }}>
              <Database size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                  Enterprise Cloud Database & Sync
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: 'rgba(5, 150, 105, 0.1)',
                  color: '#059669',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(5, 150, 105, 0.25)',
                }}>
                  10-Year Retention Engine
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                PostgreSQL Cloud Persistence &bull; Real-time Multi-Device WebSockets &bull; Automated Archiving
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: 8, borderRadius: '50%', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: '#f8fafc',
          padding: '0 16px',
          overflowX: 'auto',
        }}>
          {[
            { id: 'status', label: 'Overview & Real-time Status', icon: Radio },
            { id: 'credentials', label: 'Cloud Credentials', icon: Key },
            { id: 'migration', label: '1-Click Cloud Migration', icon: Upload },
            { id: 'schema', label: 'SQL Schema & Setup Guide', icon: FileCode },
            { id: 'backups', label: '10-Year Backups & Export', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--brand-coral)' : '2px solid transparent',
                  color: isActive ? 'var(--brand-navy)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} color={isActive ? 'var(--brand-coral)' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: STATUS & REAL-TIME */}
          {activeTab === 'status' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Main Status Hero Card */}
              <div style={{
                background: cloudStatus === 'online' 
                  ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(248, 250, 252, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(58, 156, 185, 0.08) 0%, rgba(248, 250, 252, 0.9) 100%)',
                border: `1px solid ${cloudStatus === 'online' ? 'rgba(5, 150, 105, 0.25)' : 'rgba(58, 156, 185, 0.25)'}`,
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: cloudStatus === 'online' ? 'rgba(5, 150, 105, 0.12)' : 'rgba(58, 156, 185, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: cloudStatus === 'online' ? '#059669' : 'var(--brand-cerulean)',
                  }}>
                    {cloudStatus === 'online' ? <Radio size={24} /> : <Database size={24} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                        {cloudStatus === 'online' ? 'Supabase PostgreSQL Cloud Active' : 'Local Storage Mode Active'}
                      </h4>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: cloudStatus === 'online' ? '#059669' : 'var(--brand-cerulean)',
                        boxShadow: `0 0 6px ${cloudStatus === 'online' ? '#059669' : 'var(--brand-cerulean)'}`,
                      }} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      {cloudStatus === 'online' 
                        ? 'All changes are broadcast across all active admins in real-time via WebSockets.'
                        : 'Currently using local browser storage. Connect Supabase to sync data across devices.'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn-primary"
                    onClick={handleManualSync}
                    disabled={isManualSyncing}
                    style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                  >
                    <RefreshCw size={14} className={isManualSyncing ? 'spin' : ''} />
                    <span>{isManualSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>

                  {cloudStatus !== 'online' && (
                    <button
                      className="btn-secondary"
                      onClick={() => setActiveTab('credentials')}
                      style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                    >
                      <span>Connect Cloud DB</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Records Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Projects</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: 4 }}>{projects.length}</div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: 2, fontWeight: 600 }}>Permanent Cloud Store</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Deliverables & Tasks</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-cerulean)', marginTop: 4 }}>{totalDeliverablesCount}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--brand-cerulean)', marginTop: 2, fontWeight: 600 }}>Relational Foreign Keys</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Admins & Users</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', marginTop: 4 }}>{users.length}</div>
                  <div style={{ fontSize: '0.72rem', color: '#d97706', marginTop: 2, fontWeight: 600 }}>RBAC Scoped Accounts</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Audit Trail Logs</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>{activityLogs.length}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7c3aed', marginTop: 2, fontWeight: 600 }}>10-Year Immutable Log</div>
                </div>
              </div>

              {/* Realtime Features Featurette */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '18px 20px',
              }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="var(--brand-cerulean)" />
                  <span>Enterprise 10-Year Data Guarantees</span>
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span><strong>10+ Year Retention:</strong> PostgreSQL database hosted on resilient cloud infrastructure with automated snapshots.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span><strong>Real-time Multi-Device:</strong> Add a project on your laptop, and your team sees it update live instantly without refreshing.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span><strong>Offline Local Caching:</strong> If internet disconnects, the app runs smoothly offline and syncs as soon as connection returns.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span><strong>Universal Login:</strong> Admins can log in from any browser, office machine, or mobile device with full data intact.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS */}
          {activeTab === 'credentials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: 'rgba(58, 156, 185, 0.08)',
                border: '1px solid rgba(58, 156, 185, 0.25)',
                borderRadius: '10px',
                padding: '14px 18px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-cerulean)', marginBottom: 4 }}>
                  Connect Your Supabase PostgreSQL Project
                </div>
                You can get your free PostgreSQL database in 2 minutes at{' '}
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ color: 'var(--brand-cerulean)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                >
                  supabase.com <ExternalLink size={12} />
                </a>.
                Copy your <strong>Project URL</strong> and <strong>Anon Public API Key</strong> from Settings &rarr; API.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label">Supabase Project URL</label>
                  <input
                    type="text"
                    name="supabase_project_url"
                    autoComplete="off"
                    spellCheck="false"
                    className="form-input"
                    placeholder="https://your-project-id.supabase.co"
                    value={config.url}
                    onChange={(e) => setConfig({ ...config, url: e.target.value.trim() })}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Example: https://abcdefghijklm.supabase.co
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ margin: 0 }}>Supabase Anon / Public API Key</label>
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="btn-ghost"
                      style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                    >
                      {showKey ? 'Hide Key' : 'Reveal Key'}
                    </button>
                  </div>
                  <input
                    type={showKey ? 'text' : 'password'}
                    name="supabase_anon_key"
                    autoComplete="off"
                    spellCheck="false"
                    className="form-input"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={config.anonKey}
                    onChange={(e) => setConfig({ ...config, anonKey: e.target.value.trim() })}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Found in your Supabase Dashboard under <strong>Project Settings &rarr; API &rarr; Project API keys (anon public)</strong>.
                  </div>
                </div>

                {/* Test Feedback Box */}
                {testResult && (
                  <div style={{
                    background: testResult.success ? 'rgba(5, 150, 105, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                    border: `1px solid ${testResult.success ? 'rgba(5, 150, 105, 0.25)' : 'rgba(220, 38, 38, 0.25)'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: '0.82rem',
                    color: testResult.success ? '#059669' : '#dc2626',
                  }}>
                    {testResult.success ? <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> : <AlertCircle size={18} style={{ flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {testResult.success ? `Connected Successfully (${testResult.latencyMs}ms latency)` : 'Connection Failed'}
                      </div>
                      <div style={{ marginTop: 2, fontSize: '0.78rem' }}>{testResult.message}</div>
                      {testResult.tablesFound && (
                        <div style={{ marginTop: 6, display: 'flex', gap: 8, fontSize: '0.72rem', fontWeight: 600 }}>
                          <span>Projects Table: {testResult.tablesFound.projects ? '✅' : '❌'}</span>
                          <span>Deliverables: {testResult.tablesFound.deliverables ? '✅' : '❌'}</span>
                          <span>Users: {testResult.tablesFound.app_users ? '✅' : '❌'}</span>
                          <span>Logs: {testResult.tablesFound.activity_logs ? '✅' : '❌'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleTestConnection}
                    disabled={isTesting || !config.url || !config.anonKey}
                    style={{ padding: '9px 18px' }}
                  >
                    <RefreshCw size={14} className={isTesting ? 'spin' : ''} />
                    <span>{isTesting ? 'Testing Connection...' : 'Test Connection & Ping'}</span>
                  </button>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {config.isConnected && (
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={handleDisconnect}
                        style={{ padding: '9px 16px', fontSize: '0.82rem' }}
                      >
                        Disconnect Cloud
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSaveAndConnect}
                      disabled={isTesting || !config.url || !config.anonKey}
                      style={{ padding: '9px 20px' }}
                    >
                      <Sparkles size={15} />
                      <span>Save & Connect Cloud DB</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 1-CLICK MIGRATION */}
          {activeTab === 'migration' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: 'rgba(5, 150, 105, 0.08)',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                borderRadius: '10px',
                padding: '16px 20px',
              }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#059669', margin: '0 0 6px 0' }}>
                  1-Click Local to Cloud Database Migration
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Upload all current projects, deliverables, expenses, admin accounts, and audit history from your local machine directly into Supabase PostgreSQL Cloud. Once migrated, any admin can access the data from any browser anywhere in the world!
                </p>
              </div>

              {/* Summary table of local records */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Projects Ready:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)' }}>{projects.length} Records</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Deliverables:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-cerulean)' }}>{totalDeliverablesCount} Tasks</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Admin Accounts:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d97706' }}>{users.length} Users</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Audit Logs:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed' }}>{activityLogs.length} Entries</div>
                </div>
              </div>

              {/* Progress Bar */}
              {isMigrating && (
                <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8 }}>
                    <span style={{ color: 'var(--brand-navy)', fontWeight: 700 }}>{migrationStage}</span>
                    <span style={{ color: 'var(--brand-cerulean)', fontWeight: 800 }}>{migrationProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${migrationProgress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #e04336 0%, #059669 100%)',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              )}

              {/* Migration Action Button */}
              <div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleStartMigration}
                  disabled={isMigrating || !config.isConnected}
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.94rem' }}
                >
                  <Upload size={18} />
                  <span>{isMigrating ? 'Migrating Data to Cloud...' : 'Start 1-Click Cloud Migration'}</span>
                </button>
                {!config.isConnected && (
                  <div style={{ textAlign: 'center', fontSize: '0.74rem', color: '#dc2626', marginTop: 8, fontWeight: 600 }}>
                    Please connect your Supabase Cloud credentials in the "Cloud Credentials" tab first.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SQL SCHEMA & SETUP */}
          {activeTab === 'schema' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: 'rgba(58, 156, 185, 0.08)',
                border: '1px solid rgba(58, 156, 185, 0.25)',
                borderRadius: '10px',
                padding: '14px 18px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-cerulean)', marginBottom: 4 }}>
                  2-Minute Supabase Database Setup Guide:
                </div>
                <ol style={{ margin: '6px 0 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Go to <strong>supabase.com</strong> and create a free project.</li>
                  <li>Click <strong>SQL Editor</strong> &rarr; <strong>New Query</strong> in your Supabase dashboard sidebar.</li>
                  <li>Click <strong>"Copy SQL Schema Script"</strong> below, paste it into Supabase, and click <strong>Run</strong>.</li>
                  <li>Go to <strong>Project Settings &rarr; API</strong>, copy your URL & anon key into the <strong>Cloud Credentials</strong> tab.</li>
                </ol>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  PostgreSQL 10-Year Schema DDL & Realtime Script
                </span>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCopySql}
                  style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                >
                  {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema Script'}</span>
                </button>
              </div>

              <pre style={{
                background: '#0f172a',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
                color: '#93c5fd',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                maxHeight: '260px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}>
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}

          {/* TAB 5: 10-YEAR HISTORICAL BACKUPS */}
          {activeTab === 'backups' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: 'rgba(217, 119, 6, 0.08)',
                border: '1px solid rgba(217, 119, 6, 0.25)',
                borderRadius: '10px',
                padding: '14px 18px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}>
                <div style={{ fontWeight: 700, color: '#d97706', marginBottom: 4 }}>
                  10-Year Archiving & Disaster Recovery Export
                </div>
                Download complete snapshots of your enterprise project database. These files can be archived locally, stored in cold storage, or restored into any PostgreSQL/Supabase database at any point over the next 10+ years.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {/* Option 1: SQL Dump */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(22, 46, 74, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-navy)' }}>
                      <FileCode size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy)', fontSize: '0.88rem' }}>PostgreSQL SQL Dump</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>.SQL Database File</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0, flex: 1 }}>
                    Full SQL script with DDL table definitions and INSERT statements for direct import into any Postgres database.
                  </p>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      exportSqlDump({ projects, users, activityLogs });
                      showToast('SQL Dump Exported', 'Downloaded complete PostgreSQL .sql dump', 'success');
                    }}
                    style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    <Download size={14} />
                    <span>Download .SQL Dump</span>
                  </button>
                </div>

                {/* Option 2: JSON Archive */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                      <FileJson size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy)', fontSize: '0.88rem' }}>JSON Master Archive</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>.JSON Complete Snapshot</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0, flex: 1 }}>
                    High-fidelity JSON snapshot containing all project scopes, deliverables, admins, and audit timestamps.
                  </p>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      exportJsonArchive({ projects, users, activityLogs, emailLogs });
                      showToast('JSON Archive Exported', 'Downloaded timestamped .json snapshot', 'success');
                    }}
                    style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    <Download size={14} />
                    <span>Download .JSON Archive</span>
                  </button>
                </div>

                {/* Option 3: Excel Master Book */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy)', fontSize: '0.88rem' }}>Multi-Sheet Excel Book</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>.XLSX Master Workbook</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0, flex: 1 }}>
                    Formatted 4-sheet Excel workbook with Projects, Deliverables, Users, and Audit logs for executive reporting.
                  </p>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      exportMultiSheetExcel({ projects, users, activityLogs });
                      showToast('Excel Master Downloaded', 'Downloaded multi-sheet .xlsx workbook', 'success');
                    }}
                    style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    <Download size={14} />
                    <span>Download Master .XLSX</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="#059669" />
            <span>EST Enterprise Cloud Engine &bull; Version 2.3.0 (Live Cloud Connected)</span>
          </div>

          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '7px 18px', fontSize: '0.82rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
