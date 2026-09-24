import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import type { DeliverableStatus, CurrencyCode } from '../../types';
import { CURRENCY_OPTIONS, getCurrencySymbol } from '../../types';
import { X, Plus, Receipt } from 'lucide-react';

interface AddDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const AddDeliverableModal: React.FC<AddDeliverableModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const { addDeliverable, users, selectedProject } = useProject();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Production');
  const [status, setStatus] = useState<DeliverableStatus>('In Progress');
  const [startDate, setStartDate] = useState(() => selectedProject?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => selectedProject?.targetEndDate || new Date().toISOString().split('T')[0]);
  const [progress, setProgress] = useState(25);
  const [assignedTo, setAssignedTo] = useState(users[0]?.name || 'Aarav Sharma');
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const defaultDelCurr = selectedProject?.deliverables?.[0]?.currency;
    return (defaultDelCurr || selectedProject?.currency || 'INR') as CurrencyCode;
  });
  const [cost, setCost] = useState('8000');
  const [taxRate, setTaxRate] = useState('18');
  const [notes, setNotes] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  React.useEffect(() => {
    if (isOpen && selectedProject) {
      const activeCurr = (selectedProject.deliverables?.[0]?.currency || selectedProject.currency || 'INR') as CurrencyCode;
      setCurrency(activeCurr);
      setStartDate(selectedProject.startDate);
      setEndDate(selectedProject.targetEndDate);
    }
  }, [isOpen, selectedProject]);

  if (!isOpen) return null;

  const costNum = parseFloat(cost) || 0;
  const taxRateNum = parseFloat(taxRate) || 0;
  const taxAmount = Math.round(costNum * (taxRateNum / 100));
  const totalAmount = costNum + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assignedUser = users.find((u) => u.name === assignedTo);

    addDeliverable(projectId, {
      name: name.trim(),
      category,
      status,
      startDate,
      endDate,
      progress: Number(progress),
      assignedTo,
      assignedAvatar: assignedUser?.avatar,
      currency,
      cost: costNum,
      tax: taxAmount,
      total: totalAmount,
      value: costNum,
      notes: notes.trim(),
      attachmentUrl: attachmentUrl.trim() || undefined,
    });

    onClose();
  };

  const categories = ['Strategy', 'Design', 'Development', 'Production', 'Post-Production', 'Marketing', 'Media Seeding', 'General'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              <Receipt size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem' }}>
                Add Project Expense / Deliverable
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Itemize cost, tax, and assignee for {projectId}
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Expense Type / Item Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Master Logo System & Vector Files, Media Buy, Talent Shoot..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category / Department</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DeliverableStatus)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assignee Lead</label>
                <select
                  className="form-select"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Currency</label>
                <select
                  className="form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                >
                  {CURRENCY_OPTIONS.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1.2 }}>
                <label className="form-label">Base Cost ({getCurrencySymbol(currency)})</label>
                <input
                  type="number"
                  className="form-input"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. 8000"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tax Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="18"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Calculated Tax Amount</label>
                <div style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  color: '#94a3b8'
                }}>
                  {getCurrencySymbol(currency)}{taxAmount.toLocaleString()} ({taxRate}%)
                </div>
              </div>
            </div>

            {/* Calculated Grand Total Pill */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Item Total (Cost + Tax)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Subtotal: {getCurrencySymbol(currency)}{costNum.toLocaleString()} + Tax: {getCurrencySymbol(currency)}{taxAmount.toLocaleString()}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.3rem', color: '#34d399' }}>
                {getCurrencySymbol(currency)}{totalAmount.toLocaleString()}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Progress Completion</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#60a5fa', fontWeight: 600 }}>
                  {progress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Attachment Link / URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://estbrandservices.com/vault/... or https://figma.com/..."
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expense Notes & Description</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Notes on vendor, rate cards, invoice number, acceptance criteria..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} />
              <span>+ Add to Expense Matrix</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
