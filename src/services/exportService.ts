import * as XLSX from 'xlsx';
import type { Project } from '../types';
import { getCurrencySymbol } from '../types';

/**
 * Clean & Format Helper for CSV
 */
const escapeCSV = (str: string | number | undefined | null): string => {
  if (str === undefined || str === null) return '""';
  const val = String(str).replace(/"/g, '""');
  return `"${val}"`;
};

/**
 * 1. Export Projects List to CSV
 */
export const exportProjectsToCSV = (projects: Project[], filenamePrefix = 'EST_Brand_Services_Projects') => {
  const headers = [
    'Project ID',
    'Project Name',
    'Client Company',
    'Client Representative',
    'Client Email',
    'Lead Admin',
    'Category',
    'Status',
    'Start Date',
    'Target End Date',
    'Currency',
    'Budget',
    'Deliverables Count',
    'Completed Count',
    'Completion %',
    'Health'
  ];

  const rows = projects.map((p) => {
    const dels = p.deliverables || [];
    const completed = dels.filter((d) => d.status === 'Completed').length;
    const progress = dels.length > 0 ? Math.round((completed / dels.length) * 100) : (p.status === 'Completed' ? 100 : 0);
    const curr = p.currency || 'INR';

    return [
      escapeCSV(p.id),
      escapeCSV(p.name),
      escapeCSV(p.clientCompany),
      escapeCSV(p.clientName),
      escapeCSV(p.clientEmail),
      escapeCSV(p.leadManager),
      escapeCSV(p.type),
      escapeCSV(p.status),
      escapeCSV(p.startDate),
      escapeCSV(p.targetEndDate),
      escapeCSV(curr),
      p.budget,
      dels.length,
      completed,
      `${progress}%`,
      escapeCSV(p.health)
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * 2. Export Projects List to Excel (.xlsx)
 */
export const exportProjectsToExcel = (projects: Project[], filenamePrefix = 'EST_Brand_Services_Projects') => {
  const data = projects.map((p) => {
    const dels = p.deliverables || [];
    const completed = dels.filter((d) => d.status === 'Completed').length;
    const progress = dels.length > 0 ? Math.round((completed / dels.length) * 100) : (p.status === 'Completed' ? 100 : 0);
    const curr = p.currency || 'INR';

    return {
      'Project ID': p.id,
      'Project Name': p.name,
      'Client Company': p.clientCompany,
      'Client Representative': p.clientName,
      'Client Email': p.clientEmail,
      'Lead Admin': p.leadManager,
      'Category': p.type,
      'Status': p.status,
      'Start Date': p.startDate,
      'Target End Date': p.targetEndDate,
      'Currency': curr,
      'Budget': `${getCurrencySymbol(curr)}${p.budget.toLocaleString()}`,
      'Deliverables Count': dels.length,
      'Completed Count': completed,
      'Completion %': `${progress}%`,
      'Health': p.health
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 14 }, // ID
    { wch: 32 }, // Name
    { wch: 24 }, // Client
    { wch: 20 }, // Rep
    { wch: 28 }, // Email
    { wch: 18 }, // Admin
    { wch: 18 }, // Type
    { wch: 14 }, // Status
    { wch: 14 }, // Start
    { wch: 14 }, // End
    { wch: 12 }, // Currency
    { wch: 16 }, // Budget
    { wch: 12 }, // Dels
    { wch: 12 }, // Completed
    { wch: 14 }, // %
    { wch: 14 }, // Health
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects Summary');

  XLSX.writeFile(workbook, `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * 3. Export Project Expenses & Deliverable Breakdown to CSV
 */
export const exportProjectExpensesToCSV = (project: Project) => {
  const dels = project.deliverables || [];
  const uniqueDelCurrencies = Array.from(new Set(dels.map((d) => d.currency || project.currency || 'INR')));
  const expenseCurr = uniqueDelCurrencies.length === 1 ? uniqueDelCurrencies[0] : (project.currency || 'INR');
  const symbol = getCurrencySymbol(expenseCurr);

  const headers = [
    'Expense Type',
    'Status',
    'Assignee',
    'Currency',
    `Cost (${symbol})`,
    `Tax (${symbol})`,
    `Total (${symbol})`,
    'Notes / Remarks'
  ];

  const rows = dels.map((d) => {
    const cost = d.cost !== undefined ? d.cost : (d.value || 0);
    const tax = d.tax !== undefined ? d.tax : Math.round(cost * 0.18);
    const total = d.total !== undefined ? d.total : (cost + tax);
    const curr = d.currency || expenseCurr;

    return [
      escapeCSV(d.name),
      escapeCSV(d.status),
      escapeCSV(d.assignedTo),
      escapeCSV(curr),
      cost,
      tax,
      total,
      escapeCSV(d.notes || '')
    ];
  });

  // Calculate Grand Totals
  const totalCost = dels.reduce((acc, d) => acc + (d.cost !== undefined ? d.cost : (d.value || 0)), 0);
  const totalTax = dels.reduce((acc, d) => acc + (d.tax !== undefined ? d.tax : Math.round((d.cost !== undefined ? d.cost : (d.value || 0)) * 0.18)), 0);
  const grandTotal = dels.reduce((acc, d) => acc + (d.total !== undefined ? d.total : ((d.cost !== undefined ? d.cost : (d.value || 0)) + Math.round((d.cost !== undefined ? d.cost : (d.value || 0)) * 0.18))), 0);

  // Add Grand Total row
  rows.push([
    escapeCSV('GRAND TOTAL'),
    escapeCSV(`${dels.length} Items`),
    escapeCSV('All Assignees'),
    escapeCSV(expenseCurr),
    totalCost,
    totalTax,
    grandTotal,
    escapeCSV(`Final Audited Total in ${expenseCurr}`)
  ]);

  const csvContent = '\uFEFF' + [
    `"PROJECT: ${project.id} — ${project.name}"`,
    `"CLIENT: ${project.clientCompany} (${project.clientName})"`,
    `"LEAD ADMIN: ${project.leadManager}"`,
    `"EXPENSE CURRENCY: ${expenseCurr} (${symbol})"`,
    `"STATUS: ${project.status}"`,
    '',
    headers.join(','),
    ...rows.map((r) => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${project.id}_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * 4. Export Project Expenses & Deliverable Breakdown to Excel (.xlsx)
 */
export const exportProjectExpensesToExcel = (project: Project) => {
  const dels = project.deliverables || [];
  const uniqueDelCurrencies = Array.from(new Set(dels.map((d) => d.currency || project.currency || 'INR')));
  const expenseCurr = uniqueDelCurrencies.length === 1 ? uniqueDelCurrencies[0] : (project.currency || 'INR');
  const symbol = getCurrencySymbol(expenseCurr);
  
  const data: Record<string, any>[] = dels.map((d) => {
    const cost = d.cost !== undefined ? d.cost : (d.value || 0);
    const tax = d.tax !== undefined ? d.tax : Math.round(cost * 0.18);
    const total = d.total !== undefined ? d.total : (cost + tax);
    const curr = d.currency || expenseCurr;
    const itemSymbol = getCurrencySymbol(curr);

    return {
      'Expense Type': d.name,
      'Status': d.status,
      'Assignee': d.assignedTo,
      'Currency': curr,
      'Cost': `${itemSymbol}${cost.toLocaleString()}`,
      'Tax': `${itemSymbol}${tax.toLocaleString()}`,
      'Total': `${itemSymbol}${total.toLocaleString()}`,
      'Notes': d.notes || ''
    };
  });

  // Calculate Grand Totals
  const totalCost = dels.reduce((acc, d) => acc + (d.cost !== undefined ? d.cost : (d.value || 0)), 0);
  const totalTax = dels.reduce((acc, d) => acc + (d.tax !== undefined ? d.tax : Math.round((d.cost !== undefined ? d.cost : (d.value || 0)) * 0.18)), 0);
  const grandTotal = dels.reduce((acc, d) => acc + (d.total !== undefined ? d.total : ((d.cost !== undefined ? d.cost : (d.value || 0)) + Math.round((d.cost !== undefined ? d.cost : (d.value || 0)) * 0.18))), 0);

  // Append Grand Total Row
  data.push({
    'Expense Type': 'GRAND TOTAL',
    'Status': `${dels.length} Items`,
    'Assignee': 'All Assignees',
    'Currency': expenseCurr,
    'Cost': `${symbol}${totalCost.toLocaleString()}`,
    'Tax': `${symbol}${totalTax.toLocaleString()}`,
    'Total': `${symbol}${grandTotal.toLocaleString()}`,
    'Notes': `Final Audited Total in ${expenseCurr}`
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 30 }, // Expense Type
    { wch: 16 }, // Status
    { wch: 20 }, // Assignee
    { wch: 12 }, // Currency
    { wch: 16 }, // Cost
    { wch: 16 }, // Tax
    { wch: 18 }, // Total
    { wch: 28 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${project.id} Expenses`);

  XLSX.writeFile(workbook, `${project.id}_Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * 5. Export Both Excel + CSV
 */
export const exportProjectsBoth = (projects: Project[]) => {
  exportProjectsToExcel(projects);
  setTimeout(() => {
    exportProjectsToCSV(projects);
  }, 300);
};

export const exportProjectExpensesBoth = (project: Project) => {
  exportProjectExpensesToExcel(project);
  setTimeout(() => {
    exportProjectExpensesToCSV(project);
  }, 300);
};

/**
 * File Downloader Helper
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
