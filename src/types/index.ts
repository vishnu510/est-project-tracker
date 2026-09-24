export type ProjectStatus = 'Open' | 'On Hold' | 'Cancelled' | 'Completed' | 'Under Review';

export type ProjectType = 
  | 'Branding'
  | 'Digital Marketing'
  | 'Events'
  | 'Production'
  | 'Web Development'
  | 'PR & Media'
  | 'Content Strategy';

export type DeliverableStatus = 'Pending' | 'In Progress' | 'Under Review' | 'Completed';

export type UserRole = 
  | 'Super Admin'
  | 'Admin'
  | 'Team Member'
  | 'Client';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'SGD';

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) — Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) — US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) — Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) — British Pound' },
  { code: 'AED', symbol: 'AED ', label: 'AED (د.إ) — UAE Dirham' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD ($) — Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD ($) — Australian Dollar' },
  { code: 'SGD', symbol: 'S$', label: 'SGD ($) — Singapore Dollar' },
];

export const getCurrencySymbol = (currency?: string): string => {
  switch (currency?.toUpperCase()) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'AED': return 'AED ';
    case 'CAD': return 'CA$';
    case 'AUD': return 'A$';
    case 'SGD': return 'S$';
    default: return '₹';
  }
};

export interface Deliverable {
  id: string;
  projectId: string;
  name: string; // Expense Type / Deliverable Name
  category: string;
  status: DeliverableStatus;
  startDate: string;
  endDate: string;
  progress: number;
  assignedTo: string;
  assignedAvatar?: string;
  currency?: string; // e.g. "INR", "USD", "EUR"
  value: number; // backward compatibility
  cost?: number; // Base cost
  tax?: number; // Tax amount
  total?: number; // Total = Cost + Tax
  notes?: string;
  attachmentUrl?: string;
}


export interface Project {
  id: string; // e.g. "EST2024-1"
  name: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  targetEndDate: string;
  budget: number;
  currency: string;
  leadManager: string;
  leadAvatar?: string;
  teamMembers: string[];
  description: string;
  health: 'On Track' | 'At Risk' | 'Delayed';
  priority: 'High' | 'Medium' | 'Low';
  deliverables: Deliverable[];
  createdByAdminId?: string;
  createdByAdminName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  department: string;
  avatar: string;
  status: 'Active' | 'Invited' | 'Suspended';
  lastActive: string;
  phone?: string;
  assignedProjectIds: string[];
  createdBy?: string;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  projectId?: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: string;
}

export type ViewType = 'overview' | 'dashboard' | 'inside_project' | 'user_management';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}
