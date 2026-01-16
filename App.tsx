
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bell, Database, Workflow, LayoutGrid } from 'lucide-react';
import WorkflowConfigView from './components/WorkflowConfig';
import Sidebar from './components/Sidebar';
import { RecordData } from './types';
import { SCHEMAS } from './constants';
import { fetchData } from './services/mockDataService';

const App: React.FC = () => {
  const [view, setView] = useState<'crud' | 'workflow'>('workflow');
  const [selectedTableId, setSelectedTableId] = useState<string>(SCHEMAS[0].id);
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentTable = useMemo(() => SCHEMAS.find(s => s.id === selectedTableId) || SCHEMAS[0], [selectedTableId]);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchData(selectedTableId);
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => { if (view === 'crud') loadData(); }, [selectedTableId, view]);

  return (
    <div className="layout-container">
      <aside className="main-sidebar">
        <div 
          className={`nav-item ${view === 'crud' ? 'active' : ''}`} 
          onClick={() => setView('crud')}
        >
          <LayoutGrid size={22} />
        </div>
        <div 
          className={`nav-item ${view === 'workflow' ? 'active' : ''}`} 
          onClick={() => setView('workflow')}
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

        <div style={{ flex: 1, overflow: 'auto' }}>
          {view === 'workflow' ? <WorkflowConfigView /> : (
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Database style={{ color: '#2563eb' }} size={32} /> {currentTable.name}
                </h1>
                <button className="enterprise-btn-primary">
                  + New Record
                </button>
              </div>
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '1.5rem', background: 'white' }}>
                Record Explorer View Active
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
