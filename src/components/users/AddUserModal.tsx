import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import type { UserRole } from '../../types';
import { X, UserPlus, Send } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEmailSettings?: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenEmailSettings 
}) => {
  const { addUser, emailConfig } = useProject();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Admin');
  const [department, setDepartment] = useState('Creative & Strategy');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Active' | 'Invited'>('Invited');
  const [sendInviteMail, setSendInviteMail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await addUser({
        name: name.trim(),
        email: email.trim(),
        role,
        department,
        phone: phone.trim() || '+1 (555) 000-0000',
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
        status,
        lastActive: status === 'Invited' ? 'Pending First Login' : 'Just now',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments = [
    'Executive Leadership',
    'Project Management',
    'Creative & Strategy',
    'Design & Visuals',
    'Production & Film',
    'Growth & Marketing',
    'Client Representative'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '8px', 
              background: 'rgba(59, 130, 246, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#3b82f6' 
            }}>
              <UserPlus size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem' }}>
                Invite / Add Team Member
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Assign RBAC role and dispatch email onboarding invitation
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Maya Lin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Email Address (Invitation Destination) *</label>
              <input
                type="email"
                className="form-input"
                placeholder="recipient@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">System Role (RBAC)</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Team Member">Team Member</option>
                  <option value="Client">Client</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Invited')}
                >
                  <option value="Invited">Invited (Awaiting Email Setup)</option>
                  <option value="Active">Active Immediate</option>
                </select>
              </div>
            </div>

            {/* Email Dispatch Notice & Options */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginTop: 6
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, color: '#93c5fd' }}>
                <input
                  type="checkbox"
                  checked={sendInviteMail}
                  onChange={(e) => setSendInviteMail(e.target.checked)}
                />
                <span>Automatically send invitation email with setup link</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                <span>Provider: <strong>{emailConfig.provider.toUpperCase()}</strong></span>
                {onOpenEmailSettings && (
                  <button
                    type="button"
                    onClick={onOpenEmailSettings}
                    style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Configure Mail Keys
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Dispatching Email...</span>
              ) : (
                <>
                  <Send size={15} />
                  <span>Send Invitation & Add</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
