import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import type { DeliverableStatus, ProjectStatus, CurrencyCode } from '../../types';
import { CURRENCY_OPTIONS, getCurrencySymbol } from '../../types';
import { AddDeliverableModal } from './AddDeliverableModal';
import { 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Paperclip,
  Check
} from 'lucide-react';

import { ExportButton } from '../common/ExportButton';
import { UserAvatar } from '../common/UserAvatar';
import { 
  exportProjectExpensesToExcel, 
  exportProjectExpensesToCSV, 
  exportProjectExpensesBoth 
} from '../../services/exportService';

export const InsideProjectView: React.FC = () => {
  const { 
    projects, 
    selectedProject, 
    setSelectedProjectId, 
    setCurrentView, 
    updateProject, 
    updateDeliverable, 
    deleteDeliverable,
    addDeliverable,
    users,
    showToast
  } = useProject();

  const [isAddDeliverableOpen, setIsAddDeliverableOpen] = useState(false);
  
  // Inline quick add state
  const [inlineExpenseType, setInlineExpenseType] = useState('');
  const [inlineAssignee, setInlineAssignee] = useState(users[0]?.name || 'Aarav Sharma');
  const [inlineCurrency, setInlineCurrency] = useState<CurrencyCode>(() => (selectedProject?.currency as CurrencyCode) || 'INR');
  const [inlineCost, setInlineCost] = useState('5000');
  const [inlineTaxRate, setInlineTaxRate] = useState('18');

  // Keep inline currency synchronized with the current active project/expenses
  React.useEffect(() => {
    if (selectedProject) {
      const activeCurr = (selectedProject.deliverables?.[selectedProject.deliverables.length - 1]?.currency || 
                          selectedProject.deliverables?.[0]?.currency || 
                          selectedProject.currency || 
                          'INR') as CurrencyCode;
      setInlineCurrency(activeCurr);
    }
  }, [selectedProject?.id, selectedProject?.currency, selectedProject?.deliverables?.length]);

  const handleExportExpensesExcel = () => {
    if (!selectedProject) return;
    exportProjectExpensesToExcel(selectedProject);
    showToast('Excel Downloaded', `Exported ${selectedProject.id} expenses to .xlsx`, 'success');
  };

  const handleExportExpensesCSV = () => {
    if (!selectedProject) return;
    exportProjectExpensesToCSV(selectedProject);
    showToast('CSV Downloaded', `Exported ${selectedProject.id} expenses to .csv`, 'success');
  };

  const handleExportExpensesBoth = () => {
    if (!selectedProject) return;
    exportProjectExpensesBoth(selectedProject);
    showToast('Dual Export Ready', `Downloaded ${selectedProject.id} Excel + CSV files`, 'success');
  };

  if (!selectedProject) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>No Project Selected</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Please select a project from the project dashboard.
        </p>
        <button 
          className="btn-primary" 
          onClick={() => setCurrentView('dashboard')}
          style={{ marginTop: 18 }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const project = selectedProject;
  const projectCurrency = (project.currency as CurrencyCode) || 'INR';
  const currSymbol = getCurrencySymbol(projectCurrency);

  const deliverables = project.deliverables || [];
  const completedCount = deliverables.filter((d) => d.status === 'Completed').length;
  const progressPercent = deliverables.length > 0 
    ? Math.round((completedCount / deliverables.length) * 100) 
    : (project.status === 'Completed' ? 100 : 0);

  // Cost, Tax, and Total Helpers
  const getDelCost = (d: (typeof deliverables)[0]) => (d.cost !== undefined ? d.cost : (d.value || 0));
  const getDelTax = (d: (typeof deliverables)[0]) => (d.tax !== undefined ? d.tax : Math.round(getDelCost(d) * 0.18));
  const getDelTotal = (d: (typeof deliverables)[0]) => (d.total !== undefined ? d.total : (getDelCost(d) + getDelTax(d)));

  const totalCost = deliverables.reduce((acc, d) => acc + getDelCost(d), 0);
  const totalTax = deliverables.reduce((acc, d) => acc + getDelTax(d), 0);
  const grandTotal = deliverables.reduce((acc, d) => acc + getDelTotal(d), 0);

  // Currency resolution based on actual expenses
  const expenseCurrencies = deliverables.map((d) => (d.currency as CurrencyCode) || projectCurrency);
  const uniqueExpenseCurrencies = Array.from(new Set(expenseCurrencies));
  const isMultiCurrency = uniqueExpenseCurrencies.length > 1;

  const primaryExpenseCurrency: CurrencyCode = (uniqueExpenseCurrencies.length > 0 
    ? uniqueExpenseCurrencies[0] 
    : projectCurrency) as CurrencyCode;
    
  const expenseCurrSymbol = getCurrencySymbol(primaryExpenseCurrency);

  // Grouped totals per currency if multiple currencies exist
  const currencyTotals = (uniqueExpenseCurrencies.length > 0 ? uniqueExpenseCurrencies : [projectCurrency]).map((curr) => {
    const delsInCurr = deliverables.filter((d) => ((d.currency as CurrencyCode) || projectCurrency) === curr);
    const cost = delsInCurr.reduce((acc, d) => acc + getDelCost(d), 0);
    const tax = delsInCurr.reduce((acc, d) => acc + getDelTax(d), 0);
    const total = delsInCurr.reduce((acc, d) => acc + getDelTotal(d), 0);
    const sym = getCurrencySymbol(curr);
    return { curr, sym, cost, tax, total, count: delsInCurr.length };
  });

  const formattedCostTotal = isMultiCurrency
    ? currencyTotals.map((c) => `${c.sym}${c.cost.toLocaleString()}`).join(' + ')
    : `${expenseCurrSymbol}${totalCost.toLocaleString()}`;

  const formattedTaxTotal = isMultiCurrency
    ? currencyTotals.map((c) => `${c.sym}${c.tax.toLocaleString()}`).join(' + ')
    : `${expenseCurrSymbol}${totalTax.toLocaleString()}`;

  const formattedGrandTotal = isMultiCurrency
    ? currencyTotals.map((c) => `${c.sym}${c.total.toLocaleString()}`).join(' + ')
    : `${expenseCurrSymbol}${grandTotal.toLocaleString()}`;

  const expenseCurrencyLabel = isMultiCurrency
    ? uniqueExpenseCurrencies.join(', ')
    : primaryExpenseCurrency;

  const handleInlineQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineExpenseType.trim()) return;

    const baseCost = parseFloat(inlineCost) || 0;
    const taxRateNum = parseFloat(inlineTaxRate) || 0;
    const taxAmount = Math.round(baseCost * (taxRateNum / 100));
    const totalAmount = baseCost + taxAmount;
    const assignedUser = users.find((u) => u.name === inlineAssignee);

    addDeliverable(project.id, {
      name: inlineExpenseType.trim(),
      category: 'General',
      status: 'In Progress',
      startDate: project.startDate,
      endDate: project.targetEndDate,
      progress: 25,
      assignedTo: inlineAssignee,
      assignedAvatar: assignedUser?.avatar,
      currency: inlineCurrency,
      cost: baseCost,
      tax: taxAmount,
      total: totalAmount,
      value: baseCost,
    });

    setInlineExpenseType('');
    const symbol = getCurrencySymbol(inlineCurrency);
    showToast('Expense Added', `Added "${inlineExpenseType}" (${symbol}${totalAmount.toLocaleString()})`, 'success');
  };

  const getDeliverableStatusBadge = (status: DeliverableStatus) => {
    switch (status) {
      case 'Completed':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'In Progress':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case 'Under Review':
        return { bg: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    }
  };


  const quickCostNum = parseFloat(inlineCost) || 0;
  const quickTaxNum = Math.round(quickCostNum * ((parseFloat(inlineTaxRate) || 0) / 100));
  const quickTotalNum = quickCostNum + quickTaxNum;

  return (
    <div className="inside-project-container" style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Top Breadcrumb & Project Selector Bar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px',
          flexWrap: 'wrap',
          gap: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            className="btn-secondary" 
            onClick={() => setCurrentView('dashboard')}
            style={{ padding: '7px 12px' }}
          >
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Project /</span>
            <select
              value={project.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                color: '#60a5fa',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} style={{ background: '#1e293b', color: '#fff' }}>
                  {p.id} — {p.name} ({p.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Project Currency Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Currency:</span>
            <select
              value={projectCurrency}
              onChange={(e) => updateProject(project.id, { currency: e.target.value })}
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                color: '#60a5fa',
                borderRadius: 'var(--radius-md)',
                padding: '5px 10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
              title="Change Project Currency"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code} style={{ background: '#1e293b', color: '#fff' }}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
          <select
            className={`status-pill ${
              project.status === 'Open' ? 'status-open' :
              project.status === 'On Hold' ? 'status-hold' :
              project.status === 'Cancelled' ? 'status-cancelled' :
              project.status === 'Completed' ? 'status-completed' : 'status-review'
            }`}
            value={project.status}
            onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}
            style={{ border: 'none', cursor: 'pointer', outline: 'none', padding: '6px 14px' }}
          >
            <option value="Open" style={{ background: '#1e293b', color: '#10b981' }}>● Open</option>
            <option value="On Hold" style={{ background: '#1e293b', color: '#f59e0b' }}>● On Hold</option>
            <option value="Under Review" style={{ background: '#1e293b', color: '#06b6d4' }}>● Under Review</option>
            <option value="Completed" style={{ background: '#1e293b', color: '#a855f7' }}>● Completed</option>
            <option value="Cancelled" style={{ background: '#1e293b', color: '#ef4444' }}>● Cancelled</option>
          </select>
        </div>
      </div>

      {/* Hero Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            padding: '4px 10px',
            borderRadius: '6px',
            fontWeight: 700,
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            {project.id}
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
            {project.name}
          </h1>
          <span className="category-badge category-branding" style={{ fontSize: '0.82rem' }}>
            {project.type}
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 6, maxWidth: '900px' }}>
          {project.description}
        </p>
      </div>

      {/* Two Column Layout: Step 1 (Client Details) and Step 2 (Scope & Deliverables) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* Step 1 Card: Select Client / Project Details */}
        <div 
          className="card" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(23, 32, 51, 0.95), rgba(30, 41, 59, 0.95))',
            border: '1px solid rgba(59, 130, 246, 0.25)' 
          }}
        >
          <div className="card-header">
            <div className="card-title">
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: '8px', 
                background: 'rgba(59, 130, 246, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#3b82f6' 
              }}>
                <Building2 size={17} />
              </div>
              <span>Step 1 — Client & Project Details</span>
            </div>
            <span style={{ 
              fontSize: '0.72rem', 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#34d399', 
              padding: '3px 8px', 
              borderRadius: '999px',
              fontWeight: 600
            }}>
              {project.health}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Client company & name */}
            <div style={{ 
              background: 'var(--bg-input)', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Client Brand / Account
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginTop: 2 }}>
                  {project.clientCompany}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Representative: {project.clientName}
                </div>
              </div>
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem'
              }}>
                {project.clientCompany.charAt(0)}
              </div>
            </div>

            {/* Contact details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 2 }}>
                  <Mail size={13} />
                  <span>Email</span>
                </div>
                <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{project.clientEmail}</span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 2 }}>
                  <Phone size={13} />
                  <span>Phone</span>
                </div>
                <span style={{ color: 'var(--text-primary)' }}>{project.clientPhone || 'N/A'}</span>
              </div>
            </div>

            {/* Financials & Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 2 }}>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 13 }}>
                    {currSymbol.trim()}
                  </span>
                  <span>Contract Budget ({projectCurrency})</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', color: '#34d399' }}>
                  {currSymbol}{project.budget.toLocaleString()}
                </span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 2 }}>
                  <Calendar size={13} />
                  <span>Timeline</span>
                </div>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                  {project.startDate} → {project.targetEndDate}
                </span>
              </div>
            </div>

            {/* Lead Manager */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Project Lead:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserAvatar name={project.leadManager} avatarUrl={project.leadAvatar} size={22} />
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>{project.leadManager}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 Card: Scope & Financials Summary */}
        <div 
          className="card"
          style={{ 
            background: 'linear-gradient(135deg, rgba(23, 32, 51, 0.95), rgba(30, 41, 59, 0.95))',
            border: '1px solid rgba(139, 92, 246, 0.25)' 
          }}
        >
          <div className="card-header">
            <div className="card-title">
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: '8px', 
                background: 'rgba(139, 92, 246, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#c084fc' 
              }}>
                <CheckCircle2 size={17} />
              </div>
              <span>Step 2 — Expenses & Deliverables Scope</span>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => setIsAddDeliverableOpen(true)}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              id="inside-add-deliverable-btn"
            >
              <Plus size={14} />
              <span>+ Add Expense</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Financial Overview Strip */}
            <div style={{ 
              background: 'var(--bg-input)', 
              padding: '14px 16px', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Cost</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9', marginTop: 2 }}>
                  {formattedCostTotal}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Tax</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', color: '#94a3b8', marginTop: 2 }}>
                  {formattedTaxTotal}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Grand Total ({expenseCurrencyLabel})</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.15rem', color: '#34d399', marginTop: 2 }}>
                  {formattedGrandTotal}
                </div>
              </div>
            </div>

            {/* Overall Progress Gauge */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Execution Completion
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: '#60a5fa' }}>
                  {progressPercent}% ({completedCount}/{deliverables.length})
                </span>
              </div>
              <div className="progress-track" style={{ height: 8 }}>
                <div 
                  className={`progress-fill ${progressPercent === 100 ? 'completed' : ''}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Fast Inline Expense Creator with Currency Option */}
            <form onSubmit={handleInlineQuickAdd} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+ Expense Type (e.g. Talent Shoot, Video Edit)..."
                  value={inlineExpenseType}
                  onChange={(e) => setInlineExpenseType(e.target.value)}
                  style={{ fontSize: '0.82rem', padding: '8px 12px', flex: 2, minWidth: '180px' }}
                />
                <select
                  className="form-select"
                  value={inlineAssignee}
                  onChange={(e) => setInlineAssignee(e.target.value)}
                  style={{ fontSize: '0.8rem', padding: '8px 10px', flex: 1.1, minWidth: '130px' }}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>{u.name.split(' ')[0]} ({u.role.split(' ')[0]})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Currency Option Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Curr:</span>
                  <select
                    className="form-select"
                    value={inlineCurrency}
                    onChange={(e) => setInlineCurrency(e.target.value as CurrencyCode)}
                    style={{ fontSize: '0.78rem', padding: '6px 6px', width: '92px', fontWeight: 600, color: '#60a5fa' }}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: '110px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cost:</span>
                  <input
                    type="number"
                    className="form-input"
                    value={inlineCost}
                    onChange={(e) => setInlineCost(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '6px 8px', flex: 1 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '90px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tax%:</span>
                  <input
                    type="number"
                    className="form-input"
                    value={inlineTaxRate}
                    onChange={(e) => setInlineTaxRate(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '6px 6px', width: '48px' }}
                  />
                </div>

                <div style={{ fontSize: '0.78rem', color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '0 4px', whiteSpace: 'nowrap' }}>
                  = {getCurrencySymbol(inlineCurrency)}{quickTotalNum.toLocaleString()}
                </div>

                <button type="submit" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Project Expenses & Deliverable Breakdown Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ 
          padding: '18px 24px', 
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>
              Project Expenses & Deliverable Breakdown
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Detailed financial cost, tax, assignee allocations, and grand total calculations
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ExportButton
              onExportExcel={handleExportExpensesExcel}
              onExportCSV={handleExportExpensesCSV}
              onExportBoth={handleExportExpensesBoth}
              label="Export Expenses"
              size="sm"
            />
            <button 
              className="btn-primary"
              onClick={() => setIsAddDeliverableOpen(true)}
              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            >
              <Plus size={15} />
              <span>+ Add Expense / Deliverable</span>
            </button>
          </div>
        </div>


        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ minWidth: '240px' }}>Expense Type</th>
                <th style={{ minWidth: '140px' }}>Status</th>
                <th style={{ minWidth: '160px' }}>Assignee</th>
                <th style={{ textAlign: 'right', minWidth: '120px' }}>Cost</th>
                <th style={{ textAlign: 'right', minWidth: '110px' }}>Tax</th>
                <th style={{ textAlign: 'right', minWidth: '130px' }}>Total</th>
                <th style={{ textAlign: 'right', minWidth: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliverables.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    No expenses or deliverables logged for this project yet.
                  </td>
                </tr>
              ) : (
                deliverables.map((del) => {
                  const badgeStyle = getDeliverableStatusBadge(del.status);
                  const cost = getDelCost(del);
                  const tax = getDelTax(del);
                  const total = getDelTotal(del);

                  return (
                    <tr key={del.id}>
                      {/* Expense Type */}
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>
                          {del.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                          {del.category && (
                            <span style={{ 
                              fontSize: '0.7rem', 
                              padding: '2px 6px', 
                              background: 'rgba(255,255,255,0.06)', 
                              borderRadius: '4px', 
                              color: '#94a3b8' 
                            }}>
                              {del.category}
                            </span>
                          )}
                          {del.notes && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {del.notes}
                            </span>
                          )}
                          {del.attachmentUrl && (
                            <a 
                              href={del.attachmentUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 3, 
                                fontSize: '0.72rem', 
                                color: '#60a5fa', 
                                textDecoration: 'none' 
                              }}
                            >
                              <Paperclip size={11} />
                              <span>Link</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <select
                          value={del.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as DeliverableStatus;
                            const newProgress = newStatus === 'Completed' ? 100 : (newStatus === 'Pending' ? 0 : del.progress || 50);
                            updateDeliverable(project.id, del.id, { status: newStatus, progress: newProgress });
                          }}
                          style={{
                            background: badgeStyle.bg,
                            color: badgeStyle.color,
                            border: `1px solid ${badgeStyle.border}`,
                            borderRadius: '999px',
                            padding: '4px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="Pending" style={{ background: '#1e293b', color: '#fbbf24' }}>● Pending</option>
                          <option value="In Progress" style={{ background: '#1e293b', color: '#60a5fa' }}>● In Progress</option>
                          <option value="Under Review" style={{ background: '#1e293b', color: '#22d3ee' }}>● Under Review</option>
                          <option value="Completed" style={{ background: '#1e293b', color: '#10b981' }}>● Completed</option>
                        </select>
                      </td>

                      {/* Assignee */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <UserAvatar name={del.assignedTo} avatarUrl={del.assignedAvatar} size={24} />
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {del.assignedTo}
                          </span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <select
                            value={(del.currency as CurrencyCode) || projectCurrency}
                            onChange={(e) => updateDeliverable(project.id, del.id, { currency: e.target.value as CurrencyCode })}
                            style={{
                              background: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.25)',
                              color: '#60a5fa',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 4px',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                            title="Switch Expense Currency"
                          >
                            {CURRENCY_OPTIONS.map((c) => (
                              <option key={c.code} value={c.code} style={{ background: '#1e293b', color: '#fff' }}>
                                {c.code} ({c.symbol})
                              </option>
                            ))}
                          </select>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                            {getCurrencySymbol(del.currency || projectCurrency)}{cost.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Tax */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#94a3b8' }}>
                            {getCurrencySymbol(del.currency || projectCurrency)}{tax.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', fontWeight: 700, color: '#34d399' }}>
                          {getCurrencySymbol(del.currency || projectCurrency)}{total.toLocaleString()}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {del.status !== 'Completed' && (
                            <button
                              className="btn-ghost"
                              onClick={() => updateDeliverable(project.id, del.id, { status: 'Completed', progress: 100 })}
                              title="Mark 100% Completed"
                              style={{ padding: '4px 6px', color: '#34d399' }}
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            className="btn-ghost"
                            onClick={() => deleteDeliverable(project.id, del.id)}
                            title="Delete Expense Item"
                            style={{ padding: '4px 6px', color: '#f87171' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {deliverables.length > 0 && (
              <tfoot>
                <tr style={{
                  background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
                  borderTop: '2px solid rgba(59, 130, 246, 0.4)',
                  fontWeight: 700,
                }}>
                  <td colSpan={3} style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ 
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.95rem', 
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                        fontWeight: 800
                      }}>
                        Grand Total
                      </span>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        padding: '2px 8px', 
                        borderRadius: '999px', 
                        background: 'rgba(59, 130, 246, 0.2)', 
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        fontWeight: 600
                      }}>
                        {deliverables.length} {deliverables.length === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#f1f5f9', fontWeight: 700 }}>
                    {formattedCostTotal}
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: '#cbd5e1', fontWeight: 600 }}>
                    {formattedTaxTotal}
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px 14px', fontFamily: 'var(--font-mono)', fontSize: '1.15rem', color: '#34d399', fontWeight: 800 }}>
                    {formattedGrandTotal}
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px 20px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#60a5fa', fontWeight: 700 }}>{expenseCurrencyLabel}</span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Add Deliverable / Expense Modal */}
      <AddDeliverableModal
        isOpen={isAddDeliverableOpen}
        onClose={() => setIsAddDeliverableOpen(false)}
        projectId={project.id}
      />
    </div>
  );
};
