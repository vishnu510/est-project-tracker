import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import type { AppUser } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  Copy, 
  Check,
  ShieldCheck
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: AppUser | null;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  targetUser,
}) => {
  const { currentUser, users, updateUser, showToast } = useProject();

  const userToEdit = targetUser || currentUser || users[0];

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setIsSaved(false);
      setCopied(false);
    }
  }, [isOpen, userToEdit?.id]);

  if (!isOpen || !userToEdit) return null;

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = 'EST#';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setConfirmPassword(pass);
    setErrorMsg('');
  };

  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Empty', color: '#94a3b8' };
    if (pass.length < 6) return { score: 1, text: 'Too Short', color: '#dc2626' };
    let score = 1;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score >= 4) return { score: 4, text: 'Very Strong', color: '#059669' };
    if (score === 3) return { score: 3, text: 'Strong', color: 'var(--brand-cerulean)' };
    if (score === 2) return { score: 2, text: 'Medium', color: '#d97706' };
    return { score: 1, text: 'Weak', color: '#dc2626' };
  };

  const strength = calculateStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPass = newPassword.trim();
    if (!cleanPass) {
      setErrorMsg('Please enter a new password.');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    // Update in Context (which also syncs to Supabase Cloud & LocalStorage)
    updateUser(userToEdit.id, { password: cleanPass });
    setIsSaved(true);
    showToast('Password Updated', `Updated password for ${userToEdit.name} (${userToEdit.email})`, 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    showToast('Copied', 'Password copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '92%', borderRadius: '18px', padding: '0', overflow: 'hidden' }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'rgba(22, 46, 74, 0.08)',
              color: 'var(--brand-navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(22, 46, 74, 0.2)',
            }}>
              <KeyRound size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                {userToEdit.role === 'Super Admin' ? 'Super Admin Password' : 'Change User Password'}
              </h2>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Manage Master Access & Cloud Credentials
              </div>
            </div>
          </div>

          <button 
            className="btn-ghost" 
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Target User Card */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserAvatar name={userToEdit.name} avatarUrl={userToEdit.avatar} size={38} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {userToEdit.name}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {userToEdit.email}
                </div>
              </div>
            </div>

            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              background: userToEdit.role === 'Super Admin' ? 'rgba(22, 46, 74, 0.08)' : 'rgba(58, 156, 185, 0.12)',
              color: userToEdit.role === 'Super Admin' ? 'var(--brand-navy)' : 'var(--brand-cerulean)',
              border: `1px solid ${userToEdit.role === 'Super Admin' ? 'rgba(22, 46, 74, 0.2)' : 'rgba(58, 156, 185, 0.25)'}`,
            }}>
              {userToEdit.role}
            </span>
          </div>

          {isSaved ? (
            <div style={{
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              borderRadius: '12px',
              padding: '24px 20px',
              textAlign: 'center',
            }}>
              <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ color: 'var(--brand-navy)', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Password Updated Successfully!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: 6 }}>
                The new password has been synced live to your Supabase PostgreSQL cloud database.
              </p>

              <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#059669', fontWeight: 800 }}>
                  {newPassword}
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCopy}
                  style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                >
                  {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={onClose}
                style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {errorMsg && (
                <div style={{
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid rgba(220, 38, 38, 0.25)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#dc2626',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Current Password display hint */}
              <div style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                background: '#f8fafc',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Current Active Password:</span>
                <code style={{ color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {userToEdit.password || 'EST#Super2024'}
                </code>
              </div>

              {/* New Password Field */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', margin: 0 }}>
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-cerulean)',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                      fontWeight: 700,
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Generate Strong</span>
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      paddingLeft: '38px',
                      paddingRight: '38px',
                      fontSize: '0.9rem',
                    }}
                    autoFocus
                    required
                  />
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      flex: 1,
                      height: 4,
                      background: '#e2e8f0',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${(strength.score / 4) * 100}%`,
                        height: '100%',
                        background: strength.color,
                        transition: 'width 0.3s ease, background-color 0.3s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 700 }}>
                      {strength.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      paddingLeft: '38px',
                      fontSize: '0.9rem',
                      borderColor: confirmPassword && confirmPassword !== newPassword ? '#dc2626' : undefined,
                    }}
                    required
                  />
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  {confirmPassword && confirmPassword === newPassword && (
                    <Check
                      size={16}
                      color="#059669"
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Save Password</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
