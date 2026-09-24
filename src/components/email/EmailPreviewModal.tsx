import React from 'react';
import type { SentEmailLog } from '../../types/email';
import { generateInvitationHtml } from '../../services/mailService';
import { X, Mail, ExternalLink, Copy, Check } from 'lucide-react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailLog: SentEmailLog | null;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  emailLog,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !emailLog) return null;

  const previewHtml = generateInvitationHtml({
    recipientName: emailLog.recipientName,
    recipientEmail: emailLog.recipientEmail,
    recipientRole: emailLog.role as any,
    recipientDepartment: 'Operations & Strategy',
    inviterName: 'Vikram Malhotra',
    inviterRole: 'Super Admin',
    inviteLink: emailLog.inviteLink,
    expiresInHours: 48,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(emailLog.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '8px', 
              background: 'rgba(16, 185, 129, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#10b981' 
            }}>
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>
                Invitation Email Preview
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sent to {emailLog.recipientEmail} ({emailLog.sentAt})
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '16px' }}>
          {/* Metadata bar */}
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '0.8rem',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Subject: </span>
              <strong style={{ color: '#fff' }}>{emailLog.subject}</strong>
            </div>
            <button 
              className="btn-ghost" 
              onClick={handleCopyLink}
              style={{ fontSize: '0.74rem', padding: '3px 8px' }}
            >
              {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copied ? 'Link Copied' : 'Copy Direct Invite Link'}</span>
            </button>
          </div>

          {/* Rendered HTML */}
          <div style={{ 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 'var(--radius-md)', 
            overflow: 'hidden',
            maxHeight: '420px',
            overflowY: 'auto'
          }}>
            <iframe
              srcDoc={previewHtml}
              title="Invitation Email Render"
              style={{ width: '100%', height: '380px', border: 'none', background: '#0f172a' }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close Preview
          </button>
          <a
            href={emailLog.inviteLink}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <span>Open Acceptance Page</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
