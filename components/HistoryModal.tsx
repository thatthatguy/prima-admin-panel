
import React, { useEffect, useState } from 'react';
import { TemporalRecord, TableSchema } from '../types';
import { fetchHistory, restoreRecord } from '../services/mockDataService';
import { RotateCcw, Clock, X } from 'lucide-react';

interface HistoryModalProps {
  table: TableSchema;
  pkValue: any;
  onClose: () => void;
  onRestored: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ table, pkValue, onClose, onRestored }) => {
  const [history, setHistory] = useState<TemporalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchHistory(table.id, String(pkValue));
      setHistory([...data].reverse()); // Show newest history first
      setLoading(false);
    };
    load();
  }, [table.id, pkValue]);

  const handleRestore = async (hRecord: TemporalRecord) => {
    if (!confirm('Are you sure you want to restore this version?')) return;
    const { ValidFrom, ValidTo, VersionId, ...rest } = hRecord;
    await restoreRecord(table.id, pkValue, rest);
    onRestored();
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: '48rem' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '0.5rem', color: '#2563eb' }}>
              <Clock size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800 }}>Version History</h2>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900 }}>{table.name} · ID: {pkValue}</p>
            </div>
          </div>
          <button onClick={onClose} className="action-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body custom-scroll">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <span className="animate-spin">⌛</span> Loading history...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <Clock size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No historical versions found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.map((record) => (
                <div key={record.VersionId} style={{ border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1rem', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '11px', fontWeight: 700 }}>
                      <span style={{ color: '#64748b' }}>FROM: {new Date(record.ValidFrom).toLocaleString()}</span>
                      <span style={{ color: '#64748b' }}>TO: {new Date(record.ValidTo).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleRestore(record)}
                      className="enterprise-btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '11px' }}
                    >
                      <RotateCcw size={12} style={{ marginRight: '4px' }} /> Restore
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    {table.columns.map(col => (
                      <div key={col.name}>
                        <div style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{col.label}</div>
                        <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                          {col.type === 'BIT' ? (record[col.name] ? 'Active' : 'Inactive') : String(record[col.name] ?? '-')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
