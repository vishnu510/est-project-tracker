import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import type { ProjectType, ProjectStatus, CurrencyCode } from '../../types';
import { CURRENCY_OPTIONS, getCurrencySymbol } from '../../types';
import { X, Plus, Trash2, Sparkles, FolderPlus } from 'lucide-react';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject, getNextProjectId, users } = useProject();

  const [projectId, setProjectId] = useState('');
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [type, setType] = useState<ProjectType>('Branding');
  const [status, setStatus] = useState<ProjectStatus>('Open');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split('T')[0];
  });
  const [budget, setBudget] = useState('500000');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [leadManager, setLeadManager] = useState('Aarav Sharma');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [health] = useState<'On Track' | 'At Risk' | 'Delayed'>('On Track');

  // Initial Deliverables checklist
  const [deliverableInput, setDeliverableInput] = useState('');
  const [deliverablesList, setDeliverablesList] = useState<string[]>([
    'Strategy & Discovery Phase',
    'Core Creative Concept Draft',
    'Final Deliverable Package & Export'
  ]);

  useEffect(() => {
    if (isOpen) {
      setProjectId(getNextProjectId());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddDeliverableItem = () => {
    if (deliverableInput.trim()) {
      setDeliverablesList([...deliverablesList, deliverableInput.trim()]);
      setDeliverableInput('');
    }
  };

  const handleRemoveDeliverableItem = (index: number) => {
    setDeliverablesList(deliverablesList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientCompany.trim()) return;

    addProject({
      id: projectId || getNextProjectId(),
      name: name.trim(),
      clientName: clientName.trim() || 'Client Representative',
      clientCompany: clientCompany.trim(),
      clientEmail: clientEmail.trim() || 'contact@client.com',
      clientPhone: clientPhone.trim() || '+1 (555) 000-0000',
      type,
      status,
      startDate,
      targetEndDate,
      budget: parseFloat(budget) || 0,
      currency,
      leadManager,
      teamMembers: [leadManager],
      description: description.trim() || `${type} project for ${clientCompany}`,
      health,
      priority,
      initialDeliverables: deliverablesList,
    });

    onClose();
  };

  const projectTypes: ProjectType[] = [
    'Branding',
    'Digital Marketing',
    'Events',
    'Production',
    'Web Development',
    'PR & Media',
    'Content Strategy',
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '8px', 
              background: 'rgba(59, 130, 246, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#3b82f6' 
            }}>
              <FolderPlus size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem' }}>
                Add New Project
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Initialize project tracker and deliverable milestones
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Auto ID & Project Name */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project ID (Auto-Generated)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="text"
                    className="form-input"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#60a5fa' }}
                    required
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setProjectId(getNextProjectId())}
                    title="Generate Next Available ID"
                    style={{ padding: '8px 10px' }}
                  >
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Project Category / Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as ProjectType)}
                >
                  {projectTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project Title / Scope Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Autumn Brand Relaunch & Digital Suite"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Client Info */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Client Company / Brand *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apex Luxury Living"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Contact Person</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. David Vance"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Client Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="contact@company.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client Phone</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                >
                  <option value="Open">Open (Active)</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Project Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Dates & Budget */}
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
                <label className="form-label">Target Completion Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={targetEndDate}
                  onChange={(e) => setTargetEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1.2 }}>
                <label className="form-label">Total Contract Budget ({getCurrencySymbol(currency)})</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    className="form-input"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 500000"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ flex: 0.8 }}>
                <label className="form-label">Project Currency</label>
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
                <label className="form-label">Lead Project Manager</label>
                <select
                  className="form-select"
                  value={leadManager}
                  onChange={(e) => setLeadManager(e.target.value)}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deliverables Scope Builder */}
            <div className="form-group">
              <label className="form-label">Initial Deliverables Checklist</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add deliverable or milestone..."
                  value={deliverableInput}
                  onChange={(e) => setDeliverableInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDeliverableItem();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddDeliverableItem}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {deliverablesList.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.03)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem'
                    }}
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverableItem(index)}
                      className="btn-ghost"
                      style={{ padding: '2px', color: '#f87171' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project Scope Notes / Overview</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Key objectives, deliverables brief, client expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} />
              <span>Create Project ({projectId})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
