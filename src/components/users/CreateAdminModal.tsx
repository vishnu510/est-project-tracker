import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  X, 
  UserPlus, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Copy, 
  Check 
} from 'lucide-react';


interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ isOpen, onClose }) => {
  const { createAdminUser, projects, showToast } = useProject();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(() => `Admin#${Math.floor(1000 + Math.random() * 9000)}`);
  const [department, setDepartment] = useState('Branding & Creative');
  const [phone, setPhone] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!username || username === name.toLowerCase().replace(/\s+/g, '.')) {
      setUsername(val.toLowerCase().replace(/\s+/g, '.'));
    }
  };

  const generateNewPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pass = 'Admin#';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    showToast('Password Generated', `New temporary password: ${pass}`, 'info');
  };

  const copyCredentials = () => {
    const text = `EST Brand Services - Admin Credentials\nName: ${name || 'Admin'}\nEmail: ${email}\nUsername: ${username}\nPassword: ${password}\nDepartment: ${department}\nLogin URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied', 'Admin login credentials copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleProject = (projId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projId) ? prev.filter((id) => id !== projId) : [...prev, projId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('Required Fields', 'Please complete Name, Email, and Password', 'warning');
      return;
    }

    createAdminUser({
      name: name.trim(),
      email: email.trim(),
      username: username.trim() || name.toLowerCase().replace(/\s+/g, '.'),
      password: password.trim(),
      department,
      phone: phone.trim() || undefined,
      assignedProjectIds: selectedProjects,
    });

    onClose();
  };

  const departments = [
    'Branding & Creative',
    'Digital Marketing & Growth',
    'Events & Experiential',
    'Video Production & Content',
    'Web & App Development',
    'Public Relations & Media',
    'Client Accounts Management'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 38, 
              height: 38, 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))', 
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fbbf24' 
            }}>
              <UserPlus size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>
                Create Project Admin Account
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Issue personalized credentials & assign project domains
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Full Name & Department */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Admin Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kavita Patel"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department / Specialty</label>
                <select
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email & Username */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Login Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="kavita.patel@estbrandservices.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Login Username (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="kavita.patel"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password Generator Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '12px',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60a5fa', fontSize: '0.82rem', fontWeight: 600 }}>
                  <KeyRound size={15} />
                  <span>Assigned Password & Credentials</span>
                </div>
                <button
                  type="button"
                  onClick={generateNewPassword}
                  className="btn-ghost"
                  style={{ fontSize: '0.74rem', padding: '3px 8px', color: '#34d399' }}
                >
                  <Sparkles size={13} />
                  <span>Generate Strong Password</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      paddingRight: '36px',
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={copyCredentials}
                  className="btn-secondary"
                  title="Copy full credentials"
                  style={{ padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Provide these credentials to the Admin. They will use them to sign into their isolated project environment.
              </div>
            </div>

            {/* Optional Phone */}
            <div className="form-group">
              <label className="form-label">Phone / Contact (Optional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Project Assignments */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Assign Initial Projects (Optional)
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Admin can also create their own new projects anytime
                </span>
              </div>
              
              <div style={{
                maxHeight: '130px',
                overflowY: 'auto',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                {projects.map((p) => (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: '0.82rem',
                      color: selectedProjects.includes(p.id) ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      background: selectedProjects.includes(p.id) ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(p.id)}
                      onChange={() => handleToggleProject(p.id)}
                      style={{ accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#60a5fa', fontWeight: 600 }}>{p.id}</span>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({p.type})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <UserPlus size={16} />
              <span>Create & Issue Admin Credentials</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
