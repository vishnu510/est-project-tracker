import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ESTLogo } from '../common/ESTLogo';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';


export const LoginView: React.FC = () => {
  const { login, users } = useProject();
  
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

  const handleQuickLogin = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setErrorMsg('');
    setIsSubmitting(true);
    setTimeout(() => {
      login(email, pass);
      setIsSubmitting(false);
    }, 300);
  };

  // Demo accounts
  const superAdmin = users.find((u) => u.role === 'Super Admin') || {
    name: 'Executive Super Admin',
    email: 'superadmin@estbrandservices.com',
    password: 'EST#Super2024',
    department: 'Central Governance',
  };

  const adminAarav = users.find((u) => u.username === 'aarav' || u.name.includes('Aarav')) || {
    name: 'Aarav Sharma',
    email: 'aarav@estbrandservices.com',
    password: 'Admin@123',
    department: 'Branding & Web',
  };

  const adminElena = users.find((u) => u.username === 'elena' || u.name.includes('Elena')) || {
    name: 'Elena Rostova',
    email: 'elena@estbrandservices.com',
    password: 'Admin@123',
    department: 'Digital & Events',
  };

  const adminVikram = users.find((u) => u.username === 'vikram' || u.name.includes('Vikram')) || {
    name: 'Vikram Malhotra',
    email: 'vikram@estbrandservices.com',
    password: 'Admin@123',
    department: 'Production & PR',
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
        maxWidth: '480px',
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
                  placeholder="e.g. superadmin@estbrandservices.com or aarav"
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
                <span style={{ fontSize: '0.72rem', color: '#60a5fa' }}>
                  Managed by Super Admin
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
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

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '24px 0 18px 0',
            color: 'var(--text-muted)',
            fontSize: '0.74rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span>1-Click Demo Logins</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          {/* Quick Demo Credentials Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Super Admin CTA */}
            <button
              type="button"
              onClick={() => handleQuickLogin(superAdmin.email, superAdmin.password || 'EST#Super2024')}
              style={{
                gridColumn: '1 / -1',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fbbf24' }}>
                      Super Admin
                    </span>
                    <span style={{ fontSize: '0.68rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Full Access
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    superadmin@estbrandservices.com | <span style={{ color: '#fbbf24' }}>EST#Super2024</span>
                  </div>
                </div>
              </div>
              <KeyRound size={15} color="#fbbf24" />
            </button>

            {/* Admin Aarav */}
            <button
              type="button"
              onClick={() => handleQuickLogin(adminAarav.email, adminAarav.password || 'Admin@123')}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '8px',
                padding: '10px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.68rem',
                fontWeight: 700,
              }}>
                A
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>
                  Aarav Sharma
                </div>
                <div style={{ fontSize: '0.68rem', color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                  aarav | Admin@123
                </div>
              </div>
            </button>

            {/* Admin Elena */}
            <button
              type="button"
              onClick={() => handleQuickLogin(adminElena.email, adminElena.password || 'Admin@123')}
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: '8px',
                padding: '10px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.68rem',
                fontWeight: 700,
              }}>
                E
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>
                  Elena Rostova
                </div>
                <div style={{ fontSize: '0.68rem', color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>
                  elena | Admin@123
                </div>
              </div>
            </button>

            {/* Admin Vikram */}
            <button
              type="button"
              onClick={() => handleQuickLogin(adminVikram.email, adminVikram.password || 'Admin@123')}
              style={{
                gridColumn: '1 / -1',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                padding: '10px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.68rem',
                fontWeight: 700,
              }}>
                V
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>
                  Vikram Malhotra
                </div>
                <div style={{ fontSize: '0.68rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  vikram | Admin@123
                </div>
              </div>
            </button>
          </div>


          {/* Info footer */}
          <div style={{
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
          }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Strict project isolation: Admins only view their own workspaces.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
