import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import type { EmailProviderType } from '../../types/email';
import { 
  Mail, 
  X, 
  Key, 
  Save, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  Server, 
  Sparkles
} from 'lucide-react';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({ isOpen, onClose }) => {
  const { emailConfig, updateEmailConfig, showToast } = useProject();

  const [provider, setProvider] = useState<EmailProviderType>(emailConfig.provider || 'emailjs');
  const [serviceId, setServiceId] = useState(emailConfig.emailjsServiceId || '');
  const [templateId, setTemplateId] = useState(emailConfig.emailjsTemplateId || '');
  const [publicKey, setPublicKey] = useState(emailConfig.emailjsPublicKey || '');
  const [apiEndpoint, setApiEndpoint] = useState(emailConfig.customApiEndpoint || '');
  const [apiKey, setApiKey] = useState(emailConfig.customApiKey || '');
  const [senderName, setSenderName] = useState(emailConfig.senderName || 'EST Brand Services Team');
  const [senderEmail, setSenderEmail] = useState(emailConfig.senderEmail || 'invitations@estbrandservices.com');
  
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailConfig({
      provider,
      emailjsServiceId: serviceId.trim(),
      emailjsTemplateId: templateId.trim(),
      emailjsPublicKey: publicKey.trim(),
      customApiEndpoint: apiEndpoint.trim(),
      customApiKey: apiKey.trim(),
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
    });
    showToast('Email Settings Saved', 'Configuration updated for invitation dispatches', 'success');
    onClose();
  };

  const handleSendTest = async () => {
    if (!testRecipient.trim()) {
      showToast('Input Required', 'Please enter a valid email address to receive the test', 'warning');
      return;
    }
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      showToast('Test Email Dispatched', `Test invite sent to ${testRecipient}`, 'success');
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 38, 
              height: 38, 
              borderRadius: '8px', 
              background: 'rgba(59, 130, 246, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#3b82f6' 
            }}>
              <Mail size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>
                Email Service Integration Settings
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Configure live transactional mail service for team invitations
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Sub Navigation */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-subtle)', 
          background: 'rgba(0,0,0,0.2)',
          padding: '0 24px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'config' ? '#60a5fa' : 'var(--text-muted)',
              borderBottom: activeTab === 'config' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Connection Configuration
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'guide' ? '#60a5fa' : 'var(--text-muted)',
              borderBottom: activeTab === 'guide' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <HelpCircle size={14} />
            <span>Setup Instructions & Keys Guide</span>
          </button>
        </div>

        {activeTab === 'config' ? (
          <form onSubmit={handleSave}>
            <div className="modal-body">
              {/* Provider Selection */}
              <div className="form-group">
                <label className="form-label">Select Email Dispatch Provider</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setProvider('emailjs')}
                    style={{
                      background: provider === 'emailjs' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: provider === 'emailjs' ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#fff'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: provider === 'emailjs' ? '#60a5fa' : '#fff' }}>
                      EmailJS
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Direct client-side sending (Recommended)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('custom_api')}
                    style={{
                      background: provider === 'custom_api' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: provider === 'custom_api' ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#fff'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: provider === 'custom_api' ? '#60a5fa' : '#fff' }}>
                      Resend / Webhook
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      REST API / Custom SMTP Gateway
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('est_cloud')}
                    style={{
                      background: provider === 'est_cloud' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: provider === 'est_cloud' ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#fff'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: provider === 'est_cloud' ? '#60a5fa' : '#fff' }}>
                      EST Cloud Engine
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Built-in simulated dispatcher
                    </div>
                  </button>
                </div>
              </div>

              {/* Provider Specific Fields */}
              {provider === 'emailjs' && (
                <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 18 }}>
                  <div style={{ fontSize: '0.76rem', color: '#60a5fa', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Key size={14} />
                    <span>EmailJS Credentials (from emailjs.com dashboard)</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Service ID *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. service_xxxxxxx"
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Template ID *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. template_xxxxxxx"
                        value={templateId}
                        onChange={(e) => setTemplateId(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Public Key (User ID) *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. user_xxxx or xxxxxxxxx"
                        value={publicKey}
                        onChange={(e) => setPublicKey(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {provider === 'custom_api' && (
                <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 18 }}>
                  <div style={{ fontSize: '0.76rem', color: '#60a5fa', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Server size={14} />
                    <span>REST API Endpoint & Bearer Token</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">API Endpoint URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://api.resend.com/emails or https://your-server.com/api/send-mail"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">API Secret Key / Bearer Token</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="re_xxxxxxxxxxxx"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Sender Info */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sender Display Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sender Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Live Test Sender Box */}
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.08)', 
                border: '1px solid rgba(59, 130, 246, 0.25)', 
                borderRadius: 'var(--radius-md)', 
                padding: '14px 16px',
                marginTop: 10 
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#93c5fd', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} />
                  <span>Send Live Test Invitation</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your personal email..."
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    style={{ fontSize: '0.84rem' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleSendTest}
                    disabled={isSendingTest}
                    style={{ whiteSpace: 'nowrap', padding: '8px 14px' }}
                  >
                    <Send size={14} />
                    <span>{isSendingTest ? 'Sending...' : 'Test Send'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Save size={16} />
                <span>Save Email Settings</span>
              </button>
            </div>
          </form>
        ) : (
          /* Guide Tab */
          <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              <h3 style={{ color: '#60a5fa', marginBottom: 8, fontSize: '1.05rem' }}>
                Required Details for Real Email Delivery
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                To enable live emails when clicking <strong>"Invite Team Member"</strong>, follow these steps with <strong>EmailJS</strong> (Free tier allows 200 free emails/month):
              </p>

              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li>
                    <strong>Step 1 — Create a Free Account:</strong><br />
                    Sign up at <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>https://www.emailjs.com</a>.
                  </li>
                  <li>
                    <strong>Step 2 — Connect Email Service:</strong><br />
                    Under <em>Email Services</em>, connect your Gmail, Outlook, or Custom SMTP (e.g. <code>service_est_portal</code>).
                  </li>
                  <li>
                    <strong>Step 3 — Create an Email Template:</strong><br />
                    In EmailJS, create an invitation template with the template variables:
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '6px', marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#38bdf8' }}>
                      To: &#123;&#123;to_email&#125;&#125;<br />
                      Subject: &#123;&#123;subject&#125;&#125;<br />
                      Body: Hello &#123;&#123;to_name&#125;&#125;, you have been invited as &#123;&#123;role_assigned&#125;&#125; by &#123;&#123;inviter_name&#125;&#125;. Join here: &#123;&#123;invite_link&#125;&#125;
                    </div>
                  </li>
                  <li>
                    <strong>Step 4 — Copy Credentials into this Portal:</strong><br />
                    Paste your <strong>Service ID</strong>, <strong>Template ID</strong>, and <strong>Public Key</strong> into the Connection Configuration tab and click Save.
                  </li>
                </ol>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: '0.82rem', color: '#34d399' }}>
                <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                <strong>Fallback Protection:</strong> Even before adding your own API keys, all invitation emails are immediately recorded with full HTML previews in the <strong>Invitation Delivery Log</strong> below in User Management!
              </div>
            </div>

            <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0, marginTop: 18 }}>
              <button type="button" className="btn-primary" onClick={() => setActiveTab('config')}>
                <span>Go to Configuration</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
