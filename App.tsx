
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ChevronRight, ChevronLeft, Plus, Filter, Globe, Bell, History, Edit, Trash2, Database, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Check, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import EditFormModal from './components/EditFormModal';
import HistoryModal from './components/HistoryModal';
import { TableSchema, RecordData } from './types';
import { SCHEMAS } from './constants';
import { fetchData, deleteRecord, updateRecord } from './services/mockDataService';

const ITEMS_PER_PAGE = 30;

const App: React.FC = () => {
  const [selectedTableId, setSelectedTableId] = useState<string>(SCHEMAS[0].id);
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [editingCell, setEditingCell] = useState<{ pk: any; colName: string } | null>(null);
  const [inlineValue, setInlineValue] = useState<any>('');
  
  const [editingRecord, setEditingRecord] = useState<RecordData | null>(null);
  const [historyRecord, setHistoryRecord] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);

  const currentTable = useMemo(() => 
    SCHEMAS.find(s => s.id === selectedTableId) || SCHEMAS[0],
    [selectedTableId]
  );

  const loadData = async () => {
    setLoading(true);
    const data = await fetchData(selectedTableId);
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
    setSortConfig(null);
  }, [selectedTableId]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedRecords = useMemo(() => {
    let result = [...records];

    // Filter Logic
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(r => 
        Object.values(r).some(val => 
          String(val).toLowerCase().includes(lowerSearch)
        )
      );
    }

    // Sort Logic
    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [records, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedRecords.length / ITEMS_PER_PAGE);
  const pagedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedRecords.slice(start, start + ITEMS_PER_PAGE);
  }, [processedRecords, currentPage]);

  const handleDelete = async (pkValue: any) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    await deleteRecord(selectedTableId, pkValue);
    loadData();
  };

  const getPKValue = (record: RecordData) => {
    const pkCol = currentTable.columns.find(c => c.isPrimaryKey)?.name;
    return pkCol ? record[pkCol] : null;
  };

  const startInlineEdit = (record: RecordData, colName: string, value: any, isEditable: boolean) => {
    if (!isEditable) return;
    const pk = getPKValue(record);
    setEditingCell({ pk, colName });
    setInlineValue(value);
  };

  const saveInlineEdit = async () => {
    if (!editingCell) return;
    try {
      await updateRecord(selectedTableId, editingCell.pk, { [editingCell.colName]: inlineValue });
      setRecords(prev => prev.map(r => 
        getPKValue(r) === editingCell.pk ? { ...r, [editingCell.colName]: inlineValue } : r
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to save edit");
    } finally {
      setEditingCell(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Global system search..."
                className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsAddingNew(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
            >
              <Plus size={18} />
              New Record
            </button>
            
            <div className="flex items-center gap-4 text-slate-500 border-l pl-6">
              <Bell size={20} className="cursor-pointer hover:text-blue-600" />
              <div className="flex items-center gap-3 ml-2 group cursor-pointer">
                <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-full font-bold shadow-sm">
                  AD
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-none">Admin</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">System Manager</span>
                </div>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Database className="text-blue-600" size={32} />
              {currentTable.name}
            </h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
              >
                <Plus size={16} /> Add {currentTable.name.slice(0, -1)}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                   <button 
                    onClick={() => setShowTableMenu(!showTableMenu)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 group transition-all"
                   >
                    <span className="text-xs font-bold uppercase tracking-widest">{currentTable.name}</span>
                    <ChevronDown size={14} className={`transition-transform ${showTableMenu ? 'rotate-180' : ''}`} />
                   </button>
                   
                   {showTableMenu && (
                     <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 py-1">
                       {SCHEMAS.map(s => (
                         <div 
                           key={s.id}
                           onClick={() => { setSelectedTableId(s.id); setShowTableMenu(false); }}
                           className={`px-4 py-2 cursor-pointer text-sm font-semibold transition-colors flex items-center gap-2 ${selectedTableId === s.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                         >
                           {s.name}
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder={`Search ${processedRecords.length} records...`}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {currentTable.columns.map(col => (
                      <th 
                        key={col.name} 
                        onClick={() => handleSort(col.name)}
                        className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {col.label}
                          {sortConfig?.key === col.name ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-blue-500" /> : <ArrowDown size={12} className="text-blue-500" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-20" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 w-32 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={currentTable.columns.length + 1} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-bold text-slate-500">Syncing with server...</span>
                        </div>
                      </td>
                    </tr>
                  ) : pagedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={currentTable.columns.length + 1} className="px-6 py-20 text-center text-slate-400 font-medium">
                        No results found. Try adjusting your filters.
                      </td>
                    </tr>
                  ) : (
                    pagedRecords.map((record, idx) => {
                      const pk = getPKValue(record);
                      return (
                        <tr key={pk || idx} className="hover:bg-slate-50/80 transition-colors group">
                          {currentTable.columns.map(col => {
                            const isEditing = editingCell?.pk === pk && editingCell?.colName === col.name;
                            return (
                              <td 
                                key={col.name} 
                                className={`px-6 py-4 text-sm font-medium truncate ${col.isEditable ? 'cursor-text' : ''}`}
                                onClick={() => startInlineEdit(record, col.name, record[col.name], col.isEditable)}
                              >
                                {isEditing ? (
                                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    <input
                                      autoFocus
                                      type={col.type === 'DECIMAL' || col.type === 'INT' ? 'number' : 'text'}
                                      value={inlineValue}
                                      onChange={(e) => setInlineValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveInlineEdit();
                                        if (e.key === 'Escape') setEditingCell(null);
                                      }}
                                      onBlur={saveInlineEdit}
                                      className="w-full px-2 py-1 border-2 border-blue-500 rounded outline-none text-sm"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex flex-col">
                                    <span className={`${col.isPrimaryKey ? 'text-slate-900 font-bold' : 'text-slate-600'} ${col.isEditable ? 'group-hover:text-blue-600' : ''}`}>
                                      {col.type === 'BIT' ? (record[col.name] ? 'Yes' : 'No') : 
                                       col.type === 'DECIMAL' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(record[col.name]) :
                                       String(record[col.name] ?? '-')}
                                    </span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setHistoryRecord(record)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><History size={16} /></button>
                              <button onClick={() => setEditingRecord(record)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"><Edit size={16} /></button>
                              <button onClick={() => handleDelete(pk)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-white border-t flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <span>
                Showing {Math.min(processedRecords.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(processedRecords.length, currentPage * ITEMS_PER_PAGE)} of {processedRecords.length} records
              </span>
              
              <div className="flex items-center gap-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-20"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx-1] !== p - 1 && <span className="px-1">...</span>}
                      <button 
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${p === currentPage ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100 text-slate-500'}`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-20"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {(isAddingNew || editingRecord) && (
        <EditFormModal
          table={currentTable}
          initialData={editingRecord || undefined}
          onClose={() => { setEditingRecord(null); setIsAddingNew(false); }}
          onSaved={loadData}
        />
      )}

      {historyRecord && (
        <HistoryModal
          table={currentTable}
          pkValue={getPKValue(historyRecord)}
          onClose={() => setHistoryRecord(null)}
          onRestored={loadData}
        />
      )}
    </div>
  );
};

export default App;
