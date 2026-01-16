
import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Workflow, 
  LayoutGrid,
  Menu,
  HelpCircle
} from 'lucide-react';
import WorkflowDesignerPage from './pages/WorkflowDesignerPage';
import RecordExplorerPage from './pages/RecordExplorerPage';

type AppPage = 'explorer' | 'designer';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<AppPage>('designer');

  return (
    <div className="layout-container">
      {/* Global Navigation Shell */}
      <aside className="main-sidebar">
        <div style={{ padding: '0.5rem', marginBottom: '1.5rem' }}>
          <Menu size={24} style={{ cursor: 'pointer', color: '#bfdbfe' }} />
        </div>
        
        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div 
            className={`nav-item ${activePage === 'explorer' ? 'active' : ''}`} 
            onClick={() => setActivePage('explorer')}
            title="Record Explorer"
          >
            <LayoutGrid size={22} />
          </div>
          <div 
            className={`nav-item ${activePage === 'designer' ? 'active' : ''}`} 
            onClick={() => setActivePage('designer')}
            title="Workflow Designer"
          >
            <Workflow size={22} />
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div className="nav-item">
            <HelpCircle size={22} />
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        {/* Global Top Bar */}
        <header className="top-header">
          <div style={{ flex: 1, maxWidth: '32rem', position: 'relative' }}>
            <Search 
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
              size={20} 
            />
            <input 
              type="text" 
              placeholder="Search across all modules..." 
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
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} style={{ color: '#64748b' }} />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid #f1f5f9' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 700, boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)' }}>AD</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Admin</span>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>System Manager</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Area */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {activePage === 'designer' ? (
            <WorkflowDesignerPage />
          ) : (
            <RecordExplorerPage />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
