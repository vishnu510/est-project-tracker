import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ESTLogo } from '../common/ESTLogo';
import { CloudStatusBadge } from '../database/CloudStatusBadge';
import { CloudDatabaseModal } from '../database/CloudDatabaseModal';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Database 
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, cloudStatus, isCloudDbModalOpen, setIsCloudDbModalOpen } = useProject();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter both email/username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(identifier, password);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Authentication request failed. Please check credentials or network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      backgroundImage: `
        radial-gradient(circle at 15% 15%, rgba(58, 156, 185, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(224, 67, 54, 0.07) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(22, 46, 74, 0.04) 0%, transparent 60%)
      `,
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Bar Cloud Status Pill */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 24,
        zIndex: 20,
      }}>
        <CloudStatusBadge
          status={cloudStatus}
          onClick={() => setIsCloudDbModalOpen(true)}
        />
      </div>

      <div style={{
        width: '100%',
        maxWidth: '460px',
        zIndex: 10,
        animation: 'fadeIn 0.3s ease',
      }}>
        {/* Main Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '38px 34px',
          boxShadow: '0 20px 45px -12px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(15, 23, 42, 0.03)',
        }}>
          {/* Brand Header with Official EST Logo */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '14px' }}>
              <ESTLogo height={48} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--brand-navy)',
              margin: '6px 0 4px 0',
              letterSpacing: '-0.02em',
            }}>
              Project Tracker Portal
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Sign in to access your scoped project workspace & executive controls
            </p>
          </div>

          {/* Error notification */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '18px',
              color: '#dc2626',
              fontSize: '0.84rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: errorMsg.includes('password') ? 6 : 0 }}>
                <AlertCircle size={17} style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>{errorMsg}</span>
              </div>
              {errorMsg.includes('password') && (
                <div style={{ fontSize: '0.78rem', color: '#64748b', paddingLeft: 27, lineHeight: 1.4 }}>
                  Default offline password is <code style={{ color: 'var(--brand-navy)', background: 'rgba(22, 46, 74, 0.08)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>Admin#4625</code> (or <code style={{ color: '#64748b' }}>Admin@123</code>).
                  If you created a new password on another device, connect your <button type="button" onClick={() => setIsCloudDbModalOpen(true)} style={{ color: 'var(--brand-cerulean)', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Cloud Database</button> to sync it.
                </div>
              )}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: 6 }}>
                Email / Login Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{
                    paddingLeft: '38px',
                    fontSize: '0.9rem',
                  }}
                  autoFocus
                  required
                />
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', margin: 0 }}>
                  Password
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Enterprise RBAC Protected
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    paddingLeft: '38px',
                    paddingRight: '38px',
                    fontSize: '0.9rem',
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
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{
                marginTop: 8,
                padding: '12px',
                fontSize: '0.92rem',
                fontWeight: 700,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {isSubmitting ? (
                <span>Authenticating with Cloud DB...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Cloud Database Setup Link on Login Card */}
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
          }}>
            <button
              type="button"
              onClick={() => setIsCloudDbModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--brand-cerulean)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
              }}
            >
              <Database size={13} />
              <span>Configure 10-Year Cloud Database & Sync</span>
            </button>
          </div>

          {/* Info footer */}
          <div style={{
            marginTop: '18px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
          }}>
            <CheckCircle2 size={14} color="#059669" />
            <span>10-Year Cloud Data Retention & Realtime Multi-Device Sync.</span>
          </div>
        </div>
      </div>

      {/* Cloud Database Manager Modal */}
      <CloudDatabaseModal
        isOpen={isCloudDbModalOpen}
        onClose={() => setIsCloudDbModalOpen(false)}
      />
    </div>
  );
};
