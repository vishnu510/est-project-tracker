import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { UserAvatar } from '../common/UserAvatar';
import type { User } from '../../types';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Check, 
  Copy, 
  ShieldCheck, 
  Sparkles, 
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  targetUser
}) => {
  const { currentUser, users, updateUser, showToast } = useProject();

  const userToEdit = targetUser || users.find(u => u.role === 'Super Admin') || currentUser;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setIsSaved(false);
      setCopied(false);
    }
  }, [isOpen, userToEdit]);

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

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'None', color: 'transparent' };
    if (pass.length < 6) return { score: 1, text: 'Too Short', color: '#ef4444' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score >= 4) return { score: 4, text: 'Very Strong', color: '#10b981' };
    if (score === 3) return { score: 3, text: 'Strong', color: '#3b82f6' };
    if (score === 2) return { score: 2, text: 'Medium', color: '#f59e0b' };
    return { score: 1, text: 'Weak', color: '#ef4444' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPass = newPassword.trim();
    if (!cleanPass) {
      setErrorMsg('Password cannot be empty.');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setErrorMsg('New Password and Confirm Password do not match.');
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
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '92%', borderRadius: '18px', padding: '0', overflow: 'hidden' }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
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
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(245, 158, 11, 0.35)',
            }}>
              <KeyRound size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
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
            background: 'rgba(15, 23, 42, 0.75)',
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
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
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
              background: userToEdit.role === 'Super Admin' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: userToEdit.role === 'Super Admin' ? '#fbbf24' : '#60a5fa',
              border: `1px solid ${userToEdit.role === 'Super Admin' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            }}>
              {userToEdit.role}
            </span>
          </div>

          {isSaved ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '24px 20px',
              textAlign: 'center',
            }}>
              <CheckCircle2 size={36} color="#34d399" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Password Updated Successfully!
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 6 }}>
                The new password has been synced live to your Supabase PostgreSQL cloud database.
              </p>

              <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#34d399', fontWeight: 700 }}>
                  {newPassword}
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCopy}
                  style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                >
                  {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
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
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#f87171',
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
                background: 'rgba(255,255,255,0.03)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Current Active Password:</span>
                <code style={{ color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
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
                      color: '#60a5fa',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                      fontWeight: 600,
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
                      background: 'rgba(255,255,255,0.1)',
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
                      borderColor: confirmPassword && confirmPassword !== newPassword ? '#ef4444' : undefined,
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
                      color="#10b981"
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
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderColor: '#f59e0b',
                    color: '#000',
                    fontWeight: 700,
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
