import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { CreateAdminModal } from './CreateAdminModal';
import { UserAvatar } from '../common/UserAvatar';
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Briefcase, 
  Building2, 
  Lock, 
  ArrowRight
} from 'lucide-react';


export const UserManagementView: React.FC = () => {
  const { 
    users, 
    projects,
    currentUser, 
    setCurrentView,
    deleteUser, 
    updateUser, 
    showToast 
  } = useProject();

  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // If non-Super Admin tries to access
  if (currentUser?.role !== 'Super Admin') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}>
          <Lock size={28} />
        </div>
        <h2 style={{ color: '#fff', fontSize: '1.4rem' }}>Super Admin Authority Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.92rem' }}>
          User creation and credential administration is reserved exclusively for the <strong>Super Admin</strong>.
          As a Project Admin, you have full authority to create and manage your assigned projects.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <button 
            className="btn-primary" 
            onClick={() => setCurrentView('dashboard')}
          >
            <span>Back to My Dashboard</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  const toggleReveal = (userId: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const copyUserCredentials = (u: (typeof users)[0]) => {
    const text = `EST Brand Services Login Credentials\nName: ${u.name}\nRole: ${u.role}\nEmail: ${u.email}\nUsername: ${u.username || u.email.split('@')[0]}\nPassword: ${u.password || 'Admin@123'}\nDepartment: ${u.department}\nURL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    showToast('Credentials Copied', `Copied login details for ${u.name}`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetPassword = (userId: string, userName: string) => {
    const newPass = `Admin#${Math.floor(1000 + Math.random() * 9000)}`;
    updateUser(userId, { password: newPass });
    showToast('Password Reset', `New password for ${userName}: ${newPass}`, 'success');
  };

  const adminUsers = users.filter((u) => u.role === 'Admin');
  const superAdminCount = users.filter((u) => u.role === 'Super Admin').length;

  return (
    <div className="user-management-container" style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Title Header */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
              Admin Accounts & Credential Vault
            </h1>
            <span style={{ 
              background: 'rgba(245, 158, 11, 0.15)', 
              color: '#fbbf24', 
              fontSize: '0.74rem', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '999px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              SUPER ADMIN GOVERNANCE
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Create project admins, issue secure ID/passwords, assign execution workspaces, and audit access credentials
          </p>
        </div>

        <button 
          className="btn-primary" 
          onClick={() => setIsCreateAdminOpen(true)}
          id="create-admin-btn"
          style={{ padding: '9px 18px' }}
        >
          <UserPlus size={16} />
          <span>+ Create Project Admin</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '18px 20px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 42, 
              height: 42, 
              borderRadius: '10px', 
              background: 'rgba(245, 158, 11, 0.15)', 
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Super Admin Governance
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: 2 }}>
                {superAdminCount} Master Lead
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 42, 
              height: 42, 
              borderRadius: '10px', 
              background: 'rgba(59, 130, 246, 0.15)', 
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Briefcase size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Active Project Admins
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: 2 }}>
                {adminUsers.length} Domain Leads
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 42, 
              height: 42, 
              borderRadius: '10px', 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Company Projects
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: 2 }}>
                {projects.length} Workspaces
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roster & Credential Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>
              Personnel Directory & Credential Registry
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Admins have strict isolated visibility to only their assigned/created projects
            </div>
          </div>

          <button 
            className="btn-secondary" 
            onClick={() => setIsCreateAdminOpen(true)}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            <UserPlus size={14} />
            <span>+ Add Admin</span>
          </button>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ minWidth: '220px' }}>User / Admin</th>
                <th style={{ minWidth: '130px' }}>Role</th>
                <th style={{ minWidth: '200px' }}>Login Email / ID</th>
                <th style={{ minWidth: '220px' }}>Assigned Password</th>
                <th style={{ minWidth: '160px' }}>Managed Projects</th>
                <th style={{ minWidth: '110px' }}>Status</th>
                <th style={{ textAlign: 'right', minWidth: '110px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isRevealed = !!revealedPasswords[u.id];
                const passwordVal = u.password || (u.role === 'Super Admin' ? 'EST#Super2024' : 'Admin@123');
                
                // Projects managed by this user
                const userProjects = projects.filter(
                  (p) =>
                    p.createdByAdminId === u.id ||
                    p.leadManager.toLowerCase() === u.name.toLowerCase() ||
                    (u.assignedProjectIds || []).includes(p.id)
                );

                return (
                  <tr key={u.id}>
                    {/* User */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <UserAvatar name={u.name} avatarUrl={u.avatar} size={34} fontSize="0.82rem" />
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {u.department}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: u.role === 'Super Admin' 
                          ? 'rgba(245, 158, 11, 0.15)' 
                          : (u.role === 'Admin' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)'),
                        color: u.role === 'Super Admin' ? '#fbbf24' : (u.role === 'Admin' ? '#60a5fa' : '#c084fc'),
                        border: u.role === 'Super Admin' 
                          ? '1px solid rgba(245, 158, 11, 0.3)' 
                          : (u.role === 'Admin' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)')
                      }}>
                        {u.role === 'Super Admin' && '👑 '}
                        {u.role}
                      </span>
                    </td>

                    {/* Email / Username */}
                    <td>
                      <div>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
                          {u.email}
                        </span>
                        {u.username && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ID: @{u.username}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Password */}
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontSize: '0.85rem', 
                          color: isRevealed ? '#34d399' : '#94a3b8',
                          background: 'rgba(0,0,0,0.3)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          minWidth: '100px'
                        }}>
                          {isRevealed ? passwordVal : '••••••••••'}
                        </span>
                        <button
                          className="btn-ghost"
                          onClick={() => toggleReveal(u.id)}
                          title={isRevealed ? 'Hide password' : 'Show password'}
                          style={{ padding: '3px 5px', color: 'var(--text-muted)' }}
                        >
                          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => copyUserCredentials(u)}
                          title="Copy full credentials"
                          style={{ padding: '3px 5px', color: copiedId === u.id ? '#10b981' : '#60a5fa' }}
                        >
                          {copiedId === u.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>

                    {/* Managed Projects */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ 
                          fontSize: '0.76rem', 
                          fontWeight: 700, 
                          color: userProjects.length > 0 ? '#34d399' : 'var(--text-muted)' 
                        }}>
                          {u.role === 'Super Admin' ? 'All (Company-wide)' : `${userProjects.length} Projects`}
                        </span>
                        {u.role !== 'Super Admin' && userProjects.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {userProjects.slice(0, 3).map((p) => (
                              <span key={p.id} style={{ 
                                fontSize: '0.68rem', 
                                fontFamily: 'var(--font-mono)', 
                                padding: '1px 5px', 
                                borderRadius: '3px',
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: '#60a5fa' 
                              }}>
                                {p.id}
                              </span>
                            ))}
                            {userProjects.length > 3 && (
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                +{userProjects.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <select
                        value={u.status}
                        onChange={(e) => updateUser(u.id, { status: e.target.value as any })}
                        style={{
                          background: u.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: u.status === 'Active' ? '#34d399' : '#f87171',
                          border: `1px solid ${u.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          borderRadius: '999px',
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="Active" style={{ background: '#1e293b', color: '#10b981' }}>● Active</option>
                        <option value="Suspended" style={{ background: '#1e293b', color: '#ef4444' }}>● Suspended</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          className="btn-ghost"
                          onClick={() => handleResetPassword(u.id, u.name)}
                          title="Generate & Reset Password"
                          style={{ padding: '4px 6px', color: '#fbbf24' }}
                        >
                          <KeyRound size={14} />
                        </button>
                        {u.role !== 'Super Admin' && (
                          <button
                            className="btn-ghost"
                            onClick={() => deleteUser(u.id)}
                            title="Delete User Account"
                            style={{ padding: '4px 6px', color: '#f87171' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
      />
    </div>
  );
};
