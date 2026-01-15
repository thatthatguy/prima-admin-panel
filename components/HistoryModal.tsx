
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
      setHistory(data.reverse()); // Show newest history first
      setLoading(false);
    };
    load();
  }, [table.id, pkValue]);

  const handleRestore = async (hRecord: TemporalRecord) => {
    if (!confirm('Are you sure you want to restore this version?')) return;
    
    // We remove the temporal meta fields before restoring
    const { ValidFrom, ValidTo, VersionId, ...rest } = hRecord;
    await restoreRecord(table.id, pkValue, rest);
    onRestored();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Version History</h2>
              <p className="text-sm text-slate-500">Table: {table.name} | PK: {pkValue}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock size={48} className="mx-auto mb-4 opacity-20" />
              <p>No historical versions found for this record.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record.VersionId} className="border rounded-xl p-4 hover:border-blue-200 transition-all bg-white shadow-sm group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                        <span className="text-slate-400">From:</span> {new Date(record.ValidFrom).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                        <span className="text-slate-400">To:</span> {new Date(record.ValidTo).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestore(record)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <RotateCcw size={14} />
                      Restore This Version
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-sm">
                    {table.columns.map(col => (
                      <div key={col.name} className="flex flex-col">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">{col.label}</span>
                        <span className="text-slate-700 font-medium">
                          {col.type === 'BIT' ? (record[col.name] ? 'Yes' : 'No') : String(record[col.name] ?? '-')}
                        </span>
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
