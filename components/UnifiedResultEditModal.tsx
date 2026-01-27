
import React, { useState } from 'react';
import { X, Info, ChevronDown, Search } from 'lucide-react';
import { UnifiedResultItem, ResultItemType, IndicatorValueType } from '../types';

interface UnifiedResultEditModalProps {
  item: UnifiedResultItem;
  parentStatement?: string;
  onClose: () => void;
  onSave: (updatedItem: UnifiedResultItem) => void;
}

const RichTextEditor: React.FC<{ label: string; value: string; onChange: (val: string) => void; required?: boolean }> = ({ label, value, onChange, required }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
      {label}{required && <span style={{ color: '#ef4444' }}>*</span>} <Info size={14} style={{ color: '#92400e', cursor: 'pointer' }} />
    </label>
    <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ background: '#f3f4f6', padding: '4px', borderBottom: '1px solid #d1d5db', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {/* Mock Toolbar matching screenshots */}
        {['B', 'I', 'U', 'S'].map(tool => (
          <button key={tool} type="button" style={{ padding: '2px 8px', background: 'white', border: '1px solid #d1d5db', borderRadius: '2px', fontSize: '11px', fontWeight: 900 }}>{tool}</button>
        ))}
        <div style={{ width: '1px', background: '#d1d5db', margin: '0 4px' }} />
        <select style={{ fontSize: '10px', padding: '2px' }}><option>Calibri</option></select>
        <select style={{ fontSize: '10px', padding: '2px' }}><option>11</option></select>
      </div>
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        style={{ width: '100%', minHeight: '80px', padding: '8px', border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'inherit' }}
      />
    </div>
  </div>
);

const UnifiedResultEditModal: React.FC<UnifiedResultEditModalProps> = ({ item, parentStatement, onClose, onSave }) => {
  const [formData, setFormData] = useState<UnifiedResultItem>({ ...item });
  const [activeTab, setActiveTab] = useState<'Details' | 'Search'>('Details');

  const handleFieldChange = (field: keyof UnifiedResultItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderContextBox = (label: string, text?: string) => (
    <div style={{ background: '#ecfeff', padding: '12px 16px', borderRadius: '4px', borderLeft: '4px solid #06b6d4', marginBottom: '1.5rem' }}>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#0e7490', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '12px', color: '#0891b2' }}>{text || 'Not specified'}</p>
    </div>
  );

  const renderHeader = () => {
    let title = '';
    switch(item.type) {
      case 'OBJECTIVE': title = 'Objective'; break;
      case 'OUTCOME': title = `Outcome ${item.code}`; break;
      case 'OUTPUT': title = `Output ${item.code}`; break;
      case 'INDICATOR': title = `Indicator ${item.code}`; break;
      case 'ACTIVITY': title = `Activity ${item.code}`; break;
    }
    return (
      <div className="modal-header" style={{ padding: '12px 16px' }}>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>{title}</h2>
        <button onClick={onClose} className="action-btn"><X size={18} /></button>
      </div>
    );
  };

  const renderTabs = () => {
    if (['INDICATOR', 'ACTIVITY'].includes(item.type)) return null;
    return (
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 16px' }}>
        <button 
          onClick={() => setActiveTab('Details')}
          style={{ 
            padding: '10px 16px', fontSize: '13px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
            borderBottom: activeTab === 'Details' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'Details' ? '#3b82f6' : '#6b7280'
          }}
        >
          Details
        </button>
        <button 
          onClick={() => setActiveTab('Search')}
          style={{ 
            padding: '10px 16px', fontSize: '13px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
            borderBottom: activeTab === 'Search' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'Search' ? '#3b82f6' : '#6b7280'
          }}
        >
          {item.type === 'OBJECTIVE' ? 'Search Results Statement' : 'Search Results Statement'}
        </button>
      </div>
    );
  };

  const renderFormContent = () => {
    if (activeTab === 'Search') {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>Search interface for results statements will appear here.</p>
        </div>
      );
    }

    switch(item.type) {
      case 'OBJECTIVE':
        return (
          <div style={{ padding: '1.5rem' }}>
            <RichTextEditor 
              label="Description" 
              value={formData.statement} 
              onChange={(val) => handleFieldChange('statement', val)} 
              required 
            />
          </div>
        );
      case 'OUTCOME':
        return (
          <div style={{ padding: '1.5rem' }}>
            {renderContextBox('Related Objective', parentStatement)}
            <RichTextEditor label="Description" value={formData.statement} onChange={(val) => handleFieldChange('statement', val)} required />
            <RichTextEditor label="Assumption" value={formData.assumption || ''} onChange={(val) => handleFieldChange('assumption', val)} required />
            <div className="form-group">
              <label className="form-label">Implementing Reporting Area<span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                <input style={{ flex: 1, border: 'none', padding: '8px', fontSize: '12px' }} value={formData.implementingReportingArea} onChange={(e) => handleFieldChange('implementingReportingArea', e.target.value)} />
                <button type="button" style={{ border: 'none', background: 'none', padding: '4px 8px' }}><Search size={14} /></button>
              </div>
            </div>
          </div>
        );
      case 'OUTPUT':
        return (
          <div style={{ padding: '1.5rem' }}>
            {renderContextBox('Related Outcome', parentStatement)}
            <RichTextEditor label="Description" value={formData.statement} onChange={(val) => handleFieldChange('statement', val)} required />
            <RichTextEditor label="Assumption" value={formData.assumption || ''} onChange={(val) => handleFieldChange('assumption', val)} required />
            <div className="form-group">
              <label className="form-label">Implementing Reporting Area<span style={{ color: '#ef4444' }}>*</span></label>
              <input className="form-input" value={formData.implementingReportingArea} onChange={(e) => handleFieldChange('implementingReportingArea', e.target.value)} />
            </div>
          </div>
        );
      case 'INDICATOR':
        return (
          <div style={{ padding: '1.5rem' }}>
            {renderContextBox('Result Statement', parentStatement)}
            <RichTextEditor label="Description" value={formData.statement} onChange={(val) => handleFieldChange('statement', val)} required />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Indicator Type <Info size={12} /></label>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                  {['Numeric', 'Text', 'Percent'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="radio" checked={formData.indicatorType === t} onChange={() => handleFieldChange('indicatorType', t)} /> {t}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Baseline <Info size={12} /></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="number" className="form-input" style={{ width: '80px' }} value={formData.baseline} onChange={(e) => handleFieldChange('baseline', Number(e.target.value))} disabled={formData.isBaselineTbd} />
                  <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}><input type="checkbox" checked={formData.isBaselineTbd} onChange={(e) => handleFieldChange('isBaselineTbd', e.target.checked)} /> TBD</label>
                </div>
              </div>
              <div>
                <label className="form-label">Target <Info size={12} /></label>
                <input type="number" className="form-input" value={formData.target} onChange={(e) => handleFieldChange('target', Number(e.target.value))} />
              </div>
            </div>

            <RichTextEditor label="Data Source and Collection Method" value={formData.dataSource || ''} onChange={(val) => handleFieldChange('dataSource', val)} required />
            
            <div>
              <label className="form-label">Is the Indicator for Internal Use Only? <Info size={12} /></label>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="radio" checked={formData.isInternalUseOnly === true} onChange={() => handleFieldChange('isInternalUseOnly', true)} /> Yes</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="radio" checked={formData.isInternalUseOnly === false} onChange={() => handleFieldChange('isInternalUseOnly', false)} /> No</label>
              </div>
            </div>
          </div>
        );
      case 'ACTIVITY':
        return (
          <div style={{ padding: '1.5rem' }}>
            {renderContextBox('Related Output', parentStatement)}
            <RichTextEditor label="Description" value={formData.statement} onChange={(val) => handleFieldChange('statement', val)} required />
            <RichTextEditor label="Assumption" value={formData.assumption || ''} onChange={(val) => handleFieldChange('assumption', val)} required />
            
            <div className="form-group">
              <label className="form-label">Implementing Mission<span style={{ color: '#ef4444' }}>*</span></label>
              <input className="form-input" disabled value="PA10 - Panama, CO, PANAMA" />
            </div>

            <div className="form-group">
              <label className="form-label">Activity Code<span style={{ color: '#ef4444' }}>**</span> <a href="#" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Activity Codes List</a></label>
              <select className="form-input" value={formData.activityCode} onChange={(e) => handleFieldChange('activityCode', e.target.value)}>
                <option value="">- SELECT -</option>
                <option value="N1.01">N1.01 - Partnership Coord - public</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Will this activity be implemented by the implementing partner?<span style={{ color: '#ef4444' }}>*</span></label>
              <select className="form-input" value={formData.implementedByPartner} onChange={(e) => handleFieldChange('implementedByPartner', e.target.value)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Is Budget Required?</label>
              <input type="checkbox" checked={formData.isBudgetRequired} onChange={(e) => handleFieldChange('isBudgetRequired', e.target.checked)} style={{ width: '20px', height: '20px' }} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderFooter = () => (
    <div className="modal-footer" style={{ padding: '12px 16px', gap: '6px' }}>
      <button 
        onClick={() => onSave(formData)} 
        style={{ padding: '6px 20px', background: '#0284c7', color: 'white', borderRadius: '4px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
      >
        Save
      </button>
      <button 
        onClick={onClose} 
        style={{ padding: '6px 20px', background: '#0284c7', color: 'white', borderRadius: '4px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
      >
        Cancel
      </button>
      {['OUTCOME', 'OUTPUT'].includes(item.type) && (
        <button style={{ padding: '6px 20px', background: '#0284c7', color: 'white', borderRadius: '4px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Hide</button>
      )}
      {['INDICATOR', 'ACTIVITY'].includes(item.type) && (
        <button style={{ padding: '6px 20px', background: '#0284c7', color: 'white', borderRadius: '4px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Delete</button>
      )}
    </div>
  );

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: '42rem', borderRadius: '4px' }}>
        {renderHeader()}
        {renderTabs()}
        <div className="modal-body custom-scroll" style={{ padding: 0 }}>
          {renderFormContent()}
        </div>
        {renderFooter()}
      </div>
    </div>
  );
};

export default UnifiedResultEditModal;
