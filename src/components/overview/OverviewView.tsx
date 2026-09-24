import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ESTLogo } from '../common/ESTLogo';
import { 
  Sparkles, 
  Hash, 
  Activity, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Copy, 
  Check,
  Layers,
  FileCheck,
  Lock
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { setCurrentView, showToast } = useProject();
  const [copiedId, setCopiedId] = useState(false);
  const [sandboxYear, setSandboxYear] = useState('2024');
  const [sandboxNum, setSandboxNum] = useState('7');

  const generatedSandboxId = `EST${sandboxYear}-${sandboxNum}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    showToast('Copied', `Project ID ${text} copied to clipboard`, 'success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const statuses = [
    {
      name: 'Open / In Progress',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      icon: Activity,
      desc: 'Active execution phase. Tasks, deliverables, and resource allocations are actively being worked on by the team.',
      nextStep: 'Deliverable completion & milestone reviews.'
    },
    {
      name: 'On Hold',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      icon: Clock,
      desc: 'Temporarily paused due to pending client feedback, missing brand assets, ad account access, or contractual signoffs.',
      nextStep: 'Resume to Open once client blockers are resolved.'
    },
    {
      name: 'Under Review',
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.3)',
      icon: FileCheck,
      desc: 'All core deliverables completed internally and submitted to client stakeholders for formal quality audit.',
      nextStep: 'Client sign-off or change requests.'
    },
    {
      name: 'Completed',
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.12)',
      border: 'rgba(168, 85, 247, 0.3)',
      icon: CheckCircle2,
      desc: 'Project successfully delivered, assets archived, final invoices processed, and outcomes documented.',
      nextStep: 'Post-launch support & case study documentation.'
    },
    {
      name: 'Cancelled',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.3)',
      icon: XCircle,
      desc: 'Terminated or retracted due to client budget realignment, event cancellation, or strategic pivot.',
      nextStep: 'Post-mortem review and asset vault storage.'
    }
  ];

  const roles = [
    {
      title: 'Super Admin',
      badgeColor: '#3b82f6',
      desc: 'Complete global authority over the EST Brand Services portal ecosystem.',
      responsibilities: [
        'Global project & budget oversight',
        'Create, edit, and deactivate Admins and Members',
        'Configure email transactional integration keys',
        'System settings & master database export/reset'
      ],
      icon: ShieldCheck
    },
    {
      title: 'Admin - Daily Use',
      badgeColor: '#10b981',
      desc: 'Operational leaders managing client sprints, budgets, and deliverable deadlines.',
      responsibilities: [
        'Create and configure new client projects',
        'Assign deliverables, milestones, and deadlines',
        'Send automatic email invitations to new team leads',
        'Direct client communication and milestone approval'
      ],
      icon: Layers
    },
    {
      title: 'Admin - First Login & Members',
      badgeColor: '#8b5cf6',
      desc: 'Guided initial onboarding and daily task execution workspace.',
      responsibilities: [
        'Step 1: Receive email invitation & set password',
        'Step 2: Review assigned project portfolio',
        'Log progress on assigned deliverables (0-100%)',
        'Submit attachments and proof links for QA review'
      ],
      icon: Users
    }
  ];

  return (
    <div className="overview-container" style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Hero Banner with Official EST Logo */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          marginBottom: '28px',
          padding: '32px 36px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ marginBottom: 16 }}>
              <ESTLogo height={46} showText={true} />
            </div>

            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6, 
              background: 'rgba(59, 130, 246, 0.15)', 
              color: '#60a5fa', 
              padding: '4px 12px', 
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginBottom: 12,
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <Sparkles size={14} />
              EST BRAND SERVICES SYSTEM SPECIFICATION & ARCHITECTURE
            </div>
            
            <h1 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '2rem', 
              fontWeight: 800, 
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: 10
            }}>
              What is this portal?
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              The <strong>EST Brand Services Project Tracker Portal</strong> is the centralized command center for tracking client branding campaigns, digital marketing sprints, event productions, automated team invitations, and creative deliverables from initiation to completion.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              className="btn-primary" 
              onClick={() => setCurrentView('dashboard')}
              style={{ padding: '12px 22px', fontSize: '0.95rem' }}
            >
              <span>Launch Project Dashboard</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 3 Core Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Card 1: Project ID Format */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title">
              <div style={{ 
                width: 34, 
                height: 34, 
                borderRadius: '8px', 
                background: 'rgba(59, 130, 246, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#60a5fa' 
              }}>
                <Hash size={18} />
              </div>
              <span>Project ID Format</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>STANDARDIZED</span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 18, lineHeight: 1.5 }}>
            Every project in EST Brand Services receives an immutable, human-readable ID adhering to the standard syntax:
          </p>

          <div style={{ 
            background: 'var(--bg-input)', 
            border: '1px solid var(--border-light)', 
            borderRadius: 'var(--radius-md)', 
            padding: '16px',
            marginBottom: '18px'
          }}>
            <div style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '1.35rem', 
              fontWeight: 700, 
              color: '#60a5fa', 
              textAlign: 'center',
              letterSpacing: '0.05em'
            }}>
              EST[YYYY]-[NUMBER]
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              marginTop: 10, 
              fontSize: '0.74rem', 
              color: 'var(--text-muted)',
              borderTop: '1px dashed var(--border-subtle)',
              paddingTop: 8
            }}>
              <span><strong>EST</strong>: Prefix</span>
              <span><strong>2024</strong>: Fiscal Year</span>
              <span><strong>1, 2, 3..</strong>: Sequence</span>
            </div>
          </div>

          {/* Interactive Generator Sandbox */}
          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 'var(--radius-md)', 
            padding: '14px',
            marginTop: 'auto'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
              Interactive ID Generator Sandbox:
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Year</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={sandboxYear} 
                  onChange={(e) => setSandboxYear(e.target.value)} 
                  style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sequence #</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={sandboxNum} 
                  onChange={(e) => setSandboxNum(e.target.value)} 
                  style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: 'var(--bg-input)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8', fontSize: '0.92rem' }}>
                {generatedSandboxId}
              </span>
              <button
                className="btn-ghost"
                onClick={() => handleCopy(generatedSandboxId)}
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                title="Copy ID"
              >
                {copiedId ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copiedId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Project Statuses */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title">
              <div style={{ 
                width: 34, 
                height: 34, 
                borderRadius: '8px', 
                background: 'rgba(16, 185, 129, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#10b981' 
              }}>
                <Activity size={18} />
              </div>
              <span>Project Statuses</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>5 STATES</span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 14 }}>
            Visual badges and lifecycle states used across all EST tracking views:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: '340px', paddingRight: '4px' }}>
            {statuses.map((st) => (
              <div 
                key={st.name}
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${st.border}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: st.color, 
                      boxShadow: `0 0 8px ${st.color}` 
                    }} />
                    <span style={{ fontWeight: 700, fontSize: '0.86rem', color: st.color }}>
                      {st.name}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {st.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: User Hierarchy */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title">
              <div style={{ 
                width: 34, 
                height: 34, 
                borderRadius: '8px', 
                background: 'rgba(139, 92, 246, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#a78bfa' 
              }}>
                <ShieldCheck size={18} />
              </div>
              <span>User Hierarchy</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RBAC</span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 14 }}>
            Multi-tier role-based access control with automated email invitation gating:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {roles.map((role) => (
              <div
                key={role.title}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <role.icon size={16} color={role.badgeColor} />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                    {role.title}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {role.desc}
                </div>
                <ul style={{ paddingLeft: 18, fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {role.responsibilities.slice(0, 2).map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 14 }}>
            <button 
              className="btn-secondary"
              onClick={() => setCurrentView('user_management')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>Open User Management</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Permissions Matrix Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Lock size={18} color="#3b82f6" />
            <span>Interactive Permissions & Role Governance Matrix</span>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Capability / Action</th>
                <th>Super Admin</th>
                <th>Admin - Daily Use</th>
                <th>Admin - First Login</th>
                <th>Team Member</th>
                <th>Client</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Create New Projects</td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Edit Budget & Financials</td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Dispatch Email Invitations</td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Add & Assign Deliverables</td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Update Deliverable Status & Progress</td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>User Management & RBAC</td>
                <td><CheckCircle2 size={16} color="#10b981" /></td>
                <td><span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>Team Only</span></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
