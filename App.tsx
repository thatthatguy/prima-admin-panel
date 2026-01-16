
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Bell, 
  Database, 
  Workflow, 
  LayoutGrid, 
  Edit3, 
  Trash2, 
  History, 
  Plus, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import WorkflowConfigView from './components/WorkflowConfig';
import EditFormModal from './components/EditFormModal';
import HistoryModal from './components/HistoryModal';
import { RecordData, TableSchema } from './types';
import { SCHEMAS } from './constants';
import { fetchData, deleteRecord } from './services/mockDataService';

const App: React.FC = () => {
  const [view, setView] = useState<'crud' | 'workflow'>('workflow');
  const [selectedTableId, setSelectedTableId] = useState<string>(SCHEMAS[0].id);
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordData | undefined>(undefined);

  const currentTable = useMemo(() => SCHEMAS.find(s => s.id === selectedTableId) || SCHEMAS[0], [selectedTableId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchData(selectedTableId);
      setRecords(data);
    } catch (err) {
      console.error("Failed to load records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (view === 'crud') {
      loadData();
      setCurrentPage(1); // Reset page when table changes
    }
  }, [selectedTableId, view]);

  // Pagination Logic
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [records, currentPage, pageSize]);

  const totalPages = Math.ceil(records.length / pageSize);
  const startRange = (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, records.length);

  const handleDelete = async (pkValue: any) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    await deleteRecord(selectedTableId, pkValue);
    loadData();
  };

  const openEditModal = (record?: RecordData) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const openHistoryModal = (record: RecordData) => {
    const pkCol = currentTable.columns.find(c => c.isPrimaryKey)?.name;
    if (pkCol) {
      setSelectedRecord(record);
      setIsHistoryModalOpen(true);
    }
  };

  const pkColumnName = useMemo(() => currentTable.columns.find(c => c.isPrimaryKey)?.name || '', [currentTable]);

  return (
    <div className="layout-container">
      <aside className="main-sidebar">
        <div 
          className={`nav-item ${view === 'crud' ? 'active' : ''}`} 
          onClick={() => setView('crud')}
          title="Record Explorer"
        >
          <LayoutGrid size={22} />
        </div>
        <div 
          className={`nav-item ${view === 'workflow' ? 'active' : ''}`} 
          onClick={() => setView('workflow')}
          title="Workflow Designer"
        >
          <Workflow size={22} />
        </div>
      </aside>
      
      <main className="main-content">
        <header className="top-header">
          <div style={{ flex: 1, maxWidth: '32rem', position: 'relative' }}>
            <Search 
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
              size={20} 
            />
            <input 
              type="text" 
              placeholder="Global system search..." 
              style={{ 
                width: '100%', 
                backgroundColor: '#f1f5f9', 
                border: 'none', 
                borderRadius: '9999px', 
                padding: '0.625rem 1rem 0.625rem 3rem',
                fontSize: '0.875rem',
                outline: 'none'
              }} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Bell size={20} style={{ color: '#64748b', cursor: 'pointer' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 700 }}>AD</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Admin</span>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900 }}>Manager</span>
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {view === 'workflow' ? (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <WorkflowConfigView />
            </div>
          ) : (
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div className="crud-sidebar">
                <h3 style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Data Sources</h3>
                {SCHEMAS.map(table => (
                  <div 
                    key={table.id}
                    className={`table-selector-item ${selectedTableId === table.id ? 'active' : ''}`}
                    onClick={() => setSelectedTableId(table.id)}
                  >
                    <Database size={18} />
                    {table.name}
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '2rem 2rem 0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {currentTable.name}
                    </h1>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '14px' }}>Managing records for {currentTable.name} entity</p>
                  </div>
                  <button className="enterprise-btn-primary" onClick={() => openEditModal()}>
                    <Plus size={18} /> Add New
                  </button>
                </div>

                <div className="data-table-container">
                  <div className="table-scroll-area custom-scroll">
                    {loading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', minHeight: '300px' }}>
                        <Loader2 size={40} className="animate-spin" style={{ color: '#3b82f6' }} />
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>Loading records...</span>
                      </div>
                    ) : records.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', minHeight: '300px' }}>
                        <Database size={64} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <p style={{ fontWeight: 600 }}>No records found in this table.</p>
                      </div>
                    ) : (
                      <table className="enterprise-table">
                        <thead>
                          <tr>
                            {currentTable.columns.map(col => (
                              <th key={col.name}>{col.label}</th>
                            ))}
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRecords.map((record, idx) => (
                            <tr key={idx}>
                              {currentTable.columns.map(col => (
                                <td key={col.name}>
                                  {col.type === 'BIT' ? (
                                    <span className={`badge ${record[col.name] ? 'badge-active' : 'badge-inactive'}`}>
                                      {record[col.name] ? 'Active' : 'Inactive'}
                                    </span>
                                  ) : col.type === 'DECIMAL' ? (
                                    `$${Number(record[col.name]).toLocaleString()}`
                                  ) : (
                                    String(record[col.name] ?? '-')
                                  )}
                                </td>
                              ))}
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                  <button className="action-btn" onClick={() => openHistoryModal(record)} title="View History">
                                    <History size={16} />
                                  </button>
                                  <button className="action-btn" onClick={() => openEditModal(record)} title="Edit Record">
                                    <Edit3 size={16} />
                                  </button>
                                  <button className="action-btn delete" onClick={() => handleDelete(record[pkColumnName])} title="Delete Record">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Pagination Bar */}
                  {!loading && records.length > 0 && (
                    <div className="pagination-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                          Showing <span style={{ color: '#0f172a', fontWeight: 700 }}>{startRange}</span> to <span style={{ color: '#0f172a', fontWeight: 700 }}>{endRange}</span> of <span style={{ color: '#0f172a', fontWeight: 700 }}>{records.length}</span> results
                        </span>
                        <select 
                          className="page-size-select" 
                          value={pageSize} 
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                        >
                          <option value={10}>10 / page</option>
                          <option value={25}>25 / page</option>
                          <option value={50}>50 / page</option>
                        </select>
                      </div>

                      <div className="pagination-controls">
                        <button 
                          className="pagination-btn" 
                          onClick={() => setCurrentPage(1)} 
                          disabled={currentPage === 1}
                        >
                          <ChevronsLeft size={16} />
                        </button>
                        <button 
                          className="pagination-btn" 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            // Basic logic to only show nearby pages
                            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                              return (
                                <button 
                                  key={p} 
                                  className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
                                  onClick={() => setCurrentPage(p)}
                                >
                                  {p}
                                </button>
                              );
                            }
                            if (p === currentPage - 2 || p === currentPage + 2) {
                              return <span key={p} style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>;
                            }
                            return null;
                          })}
                        </div>

                        <button 
                          className="pagination-btn" 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight size={16} />
                        </button>
                        <button 
                          className="pagination-btn" 
                          onClick={() => setCurrentPage(totalPages)} 
                          disabled={currentPage === totalPages}
                        >
                          <ChevronsRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {isEditModalOpen && (
        <EditFormModal 
          table={currentTable} 
          initialData={selectedRecord} 
          onClose={() => setIsEditModalOpen(false)} 
          onSaved={loadData} 
        />
      )}
      
      {isHistoryModalOpen && selectedRecord && (
        <HistoryModal 
          table={currentTable} 
          pkValue={selectedRecord[pkColumnName]} 
          onClose={() => setIsHistoryModalOpen(false)} 
          onRestored={loadData} 
        />
      )}
    </div>
  );
};

export default App;
