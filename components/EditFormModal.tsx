
import React, { useState } from 'react';
import { TableSchema, RecordData } from '../types';
import { createRecord, updateRecord } from '../services/mockDataService';
import { X, Save } from 'lucide-react';

interface EditFormModalProps {
  table: TableSchema;
  initialData?: RecordData;
  onClose: () => void;
  onSaved: () => void;
}

const EditFormModal: React.FC<EditFormModalProps> = ({ table, initialData, onClose, onSaved }) => {
  const [formData, setFormData] = useState<RecordData>(initialData || {});
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        const pkCol = table.columns.find(c => c.isPrimaryKey)?.name;
        if (!pkCol) return;
        await updateRecord(table.id, initialData[pkCol], formData);
      } else {
        await createRecord(table.id, formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      alert("Error saving record: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="modal-header">
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              {isEditing ? `Edit ${table.name}` : `New ${table.name}`}
            </h2>
            <button type="button" onClick={onClose} className="action-btn">
              <X size={20} />
            </button>
          </div>

          <div className="modal-body custom-scroll">
            {table.columns.map((col) => {
              // Hide primary keys and non-editable fields during edit if needed
              if (col.isPrimaryKey && isEditing) return null;
              if (!col.isEditable && isEditing) return null;

              return (
                <div key={col.name} className="form-group">
                  <label className="form-label">
                    {col.label}
                    {!col.isNullable && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
                  </label>
                  
                  {col.type === 'BIT' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                      <input
                        type="checkbox"
                        checked={!!formData[col.name]}
                        onChange={(e) => handleChange(col.name, e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span className={`badge ${formData[col.name] ? 'badge-active' : 'badge-inactive'}`}>
                        {formData[col.name] ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ) : col.type === 'DECIMAL' || col.type === 'INT' || col.type === 'BIGINT' ? (
                    <input
                      type="number"
                      step={col.type === 'DECIMAL' ? '0.01' : '1'}
                      required={!col.isNullable}
                      value={formData[col.name] ?? ''}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      className="form-input"
                      placeholder={`Enter ${col.label.toLowerCase()}...`}
                    />
                  ) : col.type === 'DATE' || col.type === 'DATETIME2' ? (
                    <input
                      type="date"
                      required={!col.isNullable}
                      value={formData[col.name]?.split('T')[0] ?? ''}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <input
                      type="text"
                      required={!col.isNullable}
                      placeholder={`Enter ${col.label.toLowerCase()}...`}
                      value={formData[col.name] ?? ''}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      className="form-input"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="enterprise-btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="enterprise-btn-primary"
            >
              {loading ? <span className="animate-spin">⌛</span> : <Save size={18} />}
              {isEditing ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFormModal;
