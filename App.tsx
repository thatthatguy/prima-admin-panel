
import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, ChevronLeft, Plus, Filter, Globe, Bell, History, Edit, Trash2, Database, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Workflow, LayoutGrid } from 'lucide-react';
import Sidebar from './components/Sidebar';
import EditFormModal from './components/EditFormModal';
import HistoryModal from './components/HistoryModal';
import WorkflowConfigView from './components/WorkflowConfig';
import { TableSchema, RecordData } from './types';
import { SCHEMAS } from './constants';
import { fetchData, deleteRecord, updateRecord } from './services/mockDataService';

const ITEMS_PER_PAGE = 30;

const App: React.FC = () => {
  const [view, setView] = useState<'crud' | 'workflow'>('workflow'); // Default to workflow for presentation
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
    if (view === 'crud') loadData();
  }, [selectedTableId, view]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedRecords = useMemo(() => {
    let result = [...records];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(r => Object.values(r).some(val => String(val).toLowerCase().includes(lowerSearch)));
    }
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

  const saveInlineEdit = async () => {
    if (!editingCell) return;
    try {
      await updateRecord(selectedTableId, editingCell.pk, { [editingCell.colName]: inlineValue });
      setRecords(prev => prev.map(r => getPKValue(r) === editingCell.pk ? { ...r, [editingCell.colName]: inlineValue } : r));
    } finally { setEditingCell(null); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar with Navigation Toggle */}
      <aside className="w-[72px] bg-[#1E3A8A] min-h-screen flex flex-col items-center py-6 gap-8 text-blue-200 shrink-0 relative">
        <div 
          onClick={() => setView('crud')}
          className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all ${view === 'crud' ? 'bg-[#3b82f6] text-white shadow-lg' : 'hover:bg-blue-800 hover:text-white'}`}
        >
          <LayoutGrid size={22} />
        </div>
        <div 
          onClick={() => setView('workflow')}
          className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all ${view === 'workflow' ? 'bg-[#3b82f6] text-white shadow-lg' : 'hover:bg-blue-800 hover:text-white'}`}
        >
          <Workflow size={22} />
        </div>
      </aside>
      
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
            <div className="flex items-center gap-4 text-slate-500">
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

        <div className="flex-1 overflow-auto">
          {view === 'workflow' ? (
            <WorkflowConfigView />
          ) : (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                  <Database className="text-blue-600" size={32} />
                  {currentTable.name}
                </h1>
                <button 
                  onClick={() => setIsAddingNew(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg"
                >
                  <Plus size={18} /> New Record
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
                  <button 
                    onClick={() => setShowTableMenu(!showTableMenu)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">{currentTable.name}</span>
                    <ChevronDown size={14} className={`${showTableMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showTableMenu && (
                    <div className="absolute top-48 left-20 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1">
                      {SCHEMAS.map(s => (
                        <div key={s.id} onClick={() => { setSelectedTableId(s.id); setShowTableMenu(false); }} className="px-4 py-2 cursor-pointer text-sm font-semibold hover:bg-blue-50">{s.name}</div>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder={`Search ${processedRecords.length} records...`}
                    className="pl-4 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none w-80"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {currentTable.columns.map(col => (
                          <th key={col.name} onClick={() => handleSort(col.name)} className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest cursor-pointer">
                            <div className="flex items-center gap-2">
                              {col.label}
                              {sortConfig?.key === col.name ? (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-20" />}
                            </div>
                          </th>
                        ))}
                        <th className="px-6 py-4 w-32 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pagedRecords.map((record, idx) => {
                        const pk = getPKValue(record);
                        return (
                          <tr key={pk || idx} className="hover:bg-slate-50/80 group">
                            {currentTable.columns.map(col => (
                              <td key={col.name} className="px-6 py-4 text-sm font-medium truncate">
                                {col.type === 'DECIMAL' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(record[col.name]) : String(record[col.name] ?? '-')}
                              </td>
                            ))}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
                                <button onClick={() => setHistoryRecord(record)} className="p-1.5 hover:bg-blue-50 rounded-lg"><History size={16} /></button>
                                <button onClick={() => setEditingRecord(record)} className="p-1.5 hover:bg-green-50 rounded-lg"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(pk)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-white">
                  <span>Showing Page {currentPage} of {totalPages}</span>
                  <div className="flex gap-1">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20"><ChevronLeft size={16} /></button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20"><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
