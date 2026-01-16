
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Edit3, 
  Trash2, 
  History, 
  Plus, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import EditFormModal from '../components/EditFormModal';
import HistoryModal from '../components/HistoryModal';
import { RecordData, TableSchema } from '../types';
import { SCHEMAS } from '../constants';
import { fetchData, deleteRecord, updateRecord } from '../services/mockDataService';

const RecordExplorerPage: React.FC = () => {
  const [selectedTableId, setSelectedTableId] = useState<string>(SCHEMAS[0].id);
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Inline Editing State
  const [editingPkValue, setEditingPkValue] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<RecordData>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordData | undefined>(undefined);

  const currentTable = useMemo(() => SCHEMAS.find(s => s.id === selectedTableId) || SCHEMAS[0], [selectedTableId]);
  const pkColumnName = useMemo(() => currentTable.columns.find(c => c.isPrimaryKey)?.name || '', [currentTable]);

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
    loadData();
    setCurrentPage(1); 
    setSortConfig(null);
    setFilterQuery('');
    setEditingPkValue(null);
  }, [selectedTableId]);

  // Filtering Logic
  const filteredRecords = useMemo(() => {
    if (!filterQuery) return records;
    const lowerQuery = filterQuery.toLowerCase();
    return records.filter(record => 
      Object.values(record).some(val => 
        String(val).toLowerCase().includes(lowerQuery)
      )
    );
  }, [records, filterQuery]);

  // Sorting Logic
  const sortedRecords = useMemo(() => {
    if (!sortConfig) return filteredRecords;
    return [...filteredRecords].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRecords, sortConfig]);

  // Pagination Logic
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize);
  const startRange = sortedRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, sortedRecords.length);

  const requestSort = (key: string) => {
    if (editingPkValue !== null) return; // Prevent sorting while editing inline
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const handleDelete = async (pkValue: any) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    await deleteRecord(selectedTableId, pkValue);
    loadData();
  };

  // Inline Editing Handlers
  const handleEditStartInline = (record: RecordData) => {
    setEditingPkValue(record[pkColumnName]);
    setEditFormData({ ...record });
  };

  const handleEditCancelInline = () => {
    setEditingPkValue(null);
    setEditFormData({});
  };

  const handleEditSaveInline = async () => {
    if (editingPkValue === null) return;
    try {
      await updateRecord(selectedTableId, editingPkValue, editFormData);
      setEditingPkValue(null);
      loadData();
    } catch (err) {
      alert("Error saving record: " + err);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Dialog Editing Handlers
  const handleEditStartDialog = (record: RecordData) => {
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

  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>
      {/* Header with Table Selector and Search */}
      <div style={{ padding: '1.25rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Record Explorer</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Browse and manage database entities</p>
          </div>
          
          <div style={{ position: 'relative' }}>
            <Database size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <select 
              className="page-size-select"
              style={{ paddingLeft: '2.5rem', height: '42px', minWidth: '220px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
            >
              {SCHEMAS.map(table => (
                <option key={table.id} value={table.id}>{table.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder={`Search in ${currentTable.name}...`}
              className="form-input"
              style={{ width: '300px', paddingLeft: '2.5rem', height: '42px' }}
              value={filterQuery}
              onChange={(e) => { setFilterQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className="enterprise-btn-primary" onClick={() => { setSelectedRecord(undefined); setIsEditModalOpen(true); }} style={{ height: '42px' }}>
            <Plus size={18} /> New Record
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="data-table-container">
          <div className="table-scroll-area custom-scroll">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', minHeight: '300px' }}>
                <Loader2 size={40} className="animate-spin" style={{ color: '#3b82f6' }} />
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Syncing with server...</span>
              </div>
            ) : sortedRecords.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', minHeight: '300px' }}>
                <Database size={64} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p style={{ fontWeight: 600 }}>{filterQuery ? 'No results match your search criteria.' : 'This table contains no records.'}</p>
                {filterQuery && <button onClick={() => setFilterQuery('')} className="enterprise-btn-secondary" style={{ marginTop: '0.5rem' }}>Reset Search</button>}
              </div>
            ) : (
              <table className="enterprise-table">
                <thead>
                  <tr>
                    {currentTable.columns.map(col => (
                      <th 
                        key={col.name} 
                        onClick={() => requestSort(col.name)}
                        style={{ cursor: editingPkValue ? 'default' : 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {col.label}
                          {!editingPkValue && getSortIcon(col.name)}
                        </div>
                      </th>
                    ))}
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record, idx) => {
                    const isEditingInline = editingPkValue === record[pkColumnName];
                    return (
                      <tr key={idx} className={isEditingInline ? 'editing-row' : ''}>
                        {currentTable.columns.map(col => (
                          <td key={col.name}>
                            {isEditingInline && col.isEditable ? (
                              col.type === 'BIT' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={!!editFormData[col.name]} 
                                    onChange={(e) => handleInputChange(col.name, e.target.checked)}
                                  />
                                  <span style={{ fontSize: '11px', fontWeight: 700 }}>{editFormData[col.name] ? 'Active' : 'Inactive'}</span>
                                </div>
                              ) : col.type === 'DECIMAL' || col.type === 'INT' || col.type === 'BIGINT' ? (
                                <input 
                                  className="inline-grid-input"
                                  type="number" 
                                  value={editFormData[col.name] ?? ''} 
                                  onChange={(e) => handleInputChange(col.name, e.target.value)}
                                />
                              ) : col.type === 'DATE' || col.type === 'DATETIME2' ? (
                                <input 
                                  className="inline-grid-input"
                                  type="date" 
                                  value={editFormData[col.name]?.split('T')[0] ?? ''} 
                                  onChange={(e) => handleInputChange(col.name, e.target.value)}
                                />
                              ) : (
                                <input 
                                  className="inline-grid-input"
                                  type="text" 
                                  value={editFormData[col.name] ?? ''} 
                                  onChange={(e) => handleInputChange(col.name, e.target.value)}
                                />
                              )
                            ) : (
                              col.type === 'BIT' ? (
                                <span className={`badge ${record[col.name] ? 'badge-active' : 'badge-inactive'}`}>
                                  {record[col.name] ? 'Active' : 'Inactive'}
                                </span>
                              ) : col.type === 'DECIMAL' ? (
                                `$${Number(record[col.name]).toLocaleString()}`
                              ) : (
                                String(record[col.name] ?? '-')
                              )
                            )}
                          </td>
                        ))}
                        <td style={{ textAlign: 'right' }}>
                          {isEditingInline ? (
                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                              <button className="action-btn-save" onClick={handleEditSaveInline} title="Save Row">
                                <Check size={18} />
                              </button>
                              <button className="action-btn-cancel" onClick={handleEditCancelInline} title="Cancel">
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                              <button className="action-btn" onClick={() => openHistoryModal(record)} title="View History">
                                <History size={16} />
                              </button>
                              <button className="action-btn" onClick={() => handleEditStartInline(record)} title="Inline Edit">
                                <Edit3 size={16} />
                              </button>
                              <button className="action-btn" onClick={() => handleEditStartDialog(record)} title="Edit in Dialog">
                                <ExternalLink size={16} />
                              </button>
                              <button className="action-btn delete" onClick={() => handleDelete(record[pkColumnName])} title="Delete Record">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!loading && sortedRecords.length > 0 && (
            <div className="pagination-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                  Showing <span style={{ color: '#0f172a', fontWeight: 700 }}>{startRange}</span> to <span style={{ color: '#0f172a', fontWeight: 700 }}>{endRange}</span> of <span style={{ color: '#0f172a', fontWeight: 700 }}>{sortedRecords.length}</span> results
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
                <button className="pagination-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft size={16} /></button>
                <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}><ChevronLeft size={16} /></button>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                      return <button key={p} className={`pagination-btn ${currentPage === p ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>;
                    }
                    if (p === currentPage - 2 || p === currentPage + 2) return <span key={p} style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>;
                    return null;
                  })}
                </div>
                <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}><ChevronRight size={16} /></button>
                <button className="pagination-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

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

export default RecordExplorerPage;
