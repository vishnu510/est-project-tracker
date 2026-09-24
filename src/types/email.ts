import type { UserRole } from './index';

export type EmailProviderType = 'emailjs' | 'custom_api' | 'est_cloud';

export interface EmailServiceConfig {
  provider: EmailProviderType;
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
  customApiEndpoint: string;
  customApiKey: string;
  senderName: string;
  senderEmail: string;
  companyDomain: string;
}

export interface InvitationEmailPayload {
  recipientName: string;
  recipientEmail: string;
  recipientRole: UserRole;
  recipientDepartment: string;
  inviterName: string;
  inviterRole: string;
  inviteLink: string;
  expiresInHours: number;
  customMessage?: string;
  phone?: string;
}

export interface SentEmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  role: string;
  sentAt: string;
  status: 'delivered' | 'simulated' | 'failed';
  provider: string;
  subject: string;
  inviteLink: string;
  errorMessage?: string;
}
