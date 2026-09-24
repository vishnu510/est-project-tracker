import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ESTLogo } from '../common/ESTLogo';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useProject();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter both email/username and password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(identifier, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.98) 70%)',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'rgba(59, 130, 246, 0.12)',
        filter: 'blur(120px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '20%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.1)',
        filter: 'blur(120px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '460px',
        zIndex: 10,
        animation: 'fadeIn 0.3s ease',
      }}>
        {/* Main Card */}
        <div style={{
          background: 'rgba(23, 32, 51, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '18px',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.15)',
        }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '14px' }}>
              <ESTLogo height={44} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '6px 0 4px 0',
              letterSpacing: '-0.02em',
            }}>
              Project Tracker Portal
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Sign in to access your scoped project workspace & executive controls
            </p>
          </div>

          {/* Error notification */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#f87171',
              fontSize: '0.84rem',
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
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
                    background: 'rgba(15, 23, 42, 0.75)',
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
                    background: 'rgba(15, 23, 42, 0.75)',
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
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
              }}
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Info footer */}
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
          }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Strict project isolation: Authorized personnel only.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
