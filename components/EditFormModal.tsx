
import React, { useState, useEffect } from 'react';
import { TableSchema, RecordData } from '../types';
import { createRecord, updateRecord } from '../services/mockDataService';
import { X, Save, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">
              {isEditing ? `Edit ${table.name}` : `New ${table.name}`}
            </h2>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
            {table.columns.map((col) => {
              if (col.isPrimaryKey && isEditing) return null;
              if (!col.isEditable && isEditing) return null;

              return (
                <div key={col.name} className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    {col.label}
                    {!col.isNullable && <span className="text-red-500">*</span>}
                  </label>
                  
                  {col.type === 'BIT' ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!formData[col.name]}
                        onChange={(e) => handleChange(col.name, e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">{formData[col.name] ? 'Active' : 'Inactive'}</span>
                    </div>
                  ) : col.type === 'DECIMAL' || col.type === 'INT' || col.type === 'BIGINT' ? (
                    <input
                      type="number"
                      step={col.type === 'DECIMAL' ? '0.01' : '1'}
                      required={!col.isNullable}
                      value={formData[col.name] ?? ''}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  ) : col.type === 'DATE' || col.type === 'DATETIME2' ? (
                    <input
                      type="date"
                      required={!col.isNullable}
                      value={formData[col.name]?.split('T')[0] ?? ''}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      required={!col.isNullable}
                      placeholder={`Enter ${col.label.toLowerCase()}...`}
                      value={formData[col.name] ?? ''}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
              ) : (
                <Save size={18} />
              )}
              {isEditing ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFormModal;
