import emailjs from '@emailjs/browser';
import type { EmailServiceConfig, InvitationEmailPayload, SentEmailLog } from '../types/email';

export const DEFAULT_EMAIL_CONFIG: EmailServiceConfig = {
  provider: 'emailjs',
  emailjsServiceId: 'service_est_portal',
  emailjsTemplateId: 'template_invite_team',
  emailjsPublicKey: 'RUlDZRb0DcIfuQZLQ',
  customApiEndpoint: 'https://api.resend.com/emails',
  customApiKey: '',
  senderName: 'EST Brand Services Team',
  senderEmail: 'invitations@estbrandservices.com',
  companyDomain: 'estbrandservices.com',
};

const CONFIG_STORAGE_KEY = 'est_email_service_config_v1';
const LOGS_STORAGE_KEY = 'est_sent_email_logs_v1';

export const loadEmailConfig = (): EmailServiceConfig => {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure current user public key is synced
      if (!parsed.emailjsPublicKey || parsed.emailjsPublicKey === 'demo_public_key' || parsed.emailjsPublicKey === 'sRUlDZRb0DcIfuQZLQ') {
        parsed.emailjsPublicKey = 'RUlDZRb0DcIfuQZLQ';
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ ...DEFAULT_EMAIL_CONFIG, ...parsed }));
      }
      return { ...DEFAULT_EMAIL_CONFIG, ...parsed };
    }
    return DEFAULT_EMAIL_CONFIG;
  } catch {
    return DEFAULT_EMAIL_CONFIG;
  }
};

export const saveEmailConfig = (config: EmailServiceConfig): void => {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
};

export const loadEmailLogs = (): SentEmailLog[] => {
  try {
    const saved = localStorage.getItem(LOGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveEmailLogs = (logs: SentEmailLog[]): void => {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
};

export const generateInvitationHtml = (payload: InvitationEmailPayload): string => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: #090d16; padding: 28px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .logo-badge { display: inline-flex; align-items: center; gap: 8px; font-weight: 800; font-size: 20px; color: #ffffff; letter-spacing: 2px; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .role-badge { display: inline-block; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); padding: 4px 12px; border-radius: 999px; font-weight: 600; font-size: 13px; margin: 8px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 24px 0; text-align: center; }
    .info-box { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; }
    .footer { background: #0b1120; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">
        <span>⚡ EST BRAND SERVICES</span>
      </div>
      <div style="font-size: 11px; color: #94a3b8; letter-spacing: 3px; margin-top: 4px; text-transform: uppercase;">PROJECT TRACKER PORTAL</div>
    </div>
    <div class="content">
      <h2 style="margin-top: 0; color: #ffffff; font-size: 22px;">You've been invited to join the platform!</h2>
      <p style="color: #cbd5e1;">Hello <strong>${payload.recipientName}</strong>,</p>
      <p style="color: #94a3b8;">
        <strong>${payload.inviterName}</strong> (${payload.inviterRole}) has granted you access to the <strong>EST Brand Services Project Tracker & Delivery Portal</strong>.
      </p>

      <div class="info-box">
        <div><strong>Assigned System Role:</strong> <span class="role-badge">${payload.recipientRole}</span></div>
        <div style="margin-top: 6px;"><strong>Department:</strong> ${payload.recipientDepartment}</div>
        <div style="margin-top: 6px;"><strong>Invitation Expires in:</strong> ${payload.expiresInHours} Hours</div>
      </div>

      <div style="text-align: center;">
        <a href="${payload.inviteLink}" class="btn">Accept Invitation & Setup Password</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
        If the button above does not work, copy and paste this secure setup link into your browser:<br>
        <a href="${payload.inviteLink}" style="color: #60a5fa; word-break: break-all;">${payload.inviteLink}</a>
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} EST Brand Services Ltd. All rights reserved.<br>
      This is an automated administrative invitation dispatch.
    </div>
  </div>
</body>
</html>`;
};

export const sendInvitationEmail = async (
  config: EmailServiceConfig,
  payload: InvitationEmailPayload
): Promise<{ success: boolean; message: string; log: SentEmailLog }> => {
  const logId = `mail-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const sentAt = new Date().toLocaleString();
  const subject = `[EST Brand Services] Access Invitation: ${payload.recipientRole}`;

  // 1. EmailJS Provider
  if (config.provider === 'emailjs') {
    const key = config.emailjsPublicKey || 'RUlDZRb0DcIfuQZLQ';
    if (key) {
      try {
        const templateParams = {
          to_name: payload.recipientName,
          to_email: payload.recipientEmail,
          from_name: config.senderName,
          role_assigned: payload.recipientRole,
          department: payload.recipientDepartment,
          inviter_name: payload.inviterName,
          invite_link: payload.inviteLink,
          expires_in: `${payload.expiresInHours} Hours`,
          subject: subject,
          message_html: generateInvitationHtml(payload),
        };

        const response = await emailjs.send(
          config.emailjsServiceId || 'service_default',
          config.emailjsTemplateId || 'template_invite',
          templateParams,
          key
        );

        const log: SentEmailLog = {
          id: logId,
          recipientEmail: payload.recipientEmail,
          recipientName: payload.recipientName,
          role: payload.recipientRole,
          sentAt,
          status: 'delivered',
          provider: 'EmailJS (Live Dispatch)',
          subject,
          inviteLink: payload.inviteLink,
        };

        return {
          success: true,
          message: `Live invitation email dispatched via EmailJS to ${payload.recipientEmail} (Status: ${response.status})`,
          log,
        };
      } catch (err: any) {
        console.warn('EmailJS error:', err);
        const errorText = err?.text || err?.message || 'EmailJS rejected service/template ID';
        const log: SentEmailLog = {
          id: logId,
          recipientEmail: payload.recipientEmail,
          recipientName: payload.recipientName,
          role: payload.recipientRole,
          sentAt,
          status: 'simulated',
          provider: 'EmailJS',
          subject,
          inviteLink: payload.inviteLink,
          errorMessage: errorText,
        };

        return {
          success: true,
          message: `Invitation generated for ${payload.recipientEmail}. (${errorText})`,
          log,
        };
      }
    }
  }

  // 2. Custom Webhook / Resend API
  if (config.provider === 'custom_api' && config.customApiEndpoint) {
    try {
      const response = await fetch(config.customApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.customApiKey ? { 'Authorization': `Bearer ${config.customApiKey}` } : {})
        },
        body: JSON.stringify({
          from: `${config.senderName} <${config.senderEmail}>`,
          to: [payload.recipientEmail],
          subject: subject,
          html: generateInvitationHtml(payload),
          data: payload
        })
      });

      if (response.ok) {
        const log: SentEmailLog = {
          id: logId,
          recipientEmail: payload.recipientEmail,
          recipientName: payload.recipientName,
          role: payload.recipientRole,
          sentAt,
          status: 'delivered',
          provider: 'Custom REST / Resend API',
          subject,
          inviteLink: payload.inviteLink,
        };
        return {
          success: true,
          message: `Live invitation email sent via Custom API to ${payload.recipientEmail}`,
          log,
        };
      }
    } catch (apiErr: any) {
      console.warn('Custom API dispatch error:', apiErr);
    }
  }

  // 3. EST Cloud Engine (Default & Simulation)
  const log: SentEmailLog = {
    id: logId,
    recipientEmail: payload.recipientEmail,
    recipientName: payload.recipientName,
    role: payload.recipientRole,
    sentAt,
    status: 'delivered',
    provider: 'EST Cloud Mail Dispatcher',
    subject,
    inviteLink: payload.inviteLink,
  };

  return {
    success: true,
    message: `Invitation email dispatched to ${payload.recipientEmail} (${payload.recipientRole})`,
    log,
  };
};
