
import React from 'react';
import { LayoutGrid, ListTodo, Folder, Search, BookOpen, HelpCircle, Menu } from 'lucide-react';

const Sidebar: React.FC = () => {
  const items = [
    { icon: <LayoutGrid size={22} />, active: false },
    { icon: <ListTodo size={22} />, active: true },
    { icon: <Folder size={22} />, active: false },
    { icon: <Search size={22} />, active: false },
    { icon: <BookOpen size={22} />, active: false },
  ];

  return (
    <aside className="main-sidebar">
      <div style={{ padding: '0.5rem', marginBottom: '1rem' }}>
        <Menu size={24} style={{ cursor: 'pointer', color: '#bfdbfe' }} />
      </div>
      
      <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`nav-item ${item.active ? 'active' : ''}`}
          >
            {item.icon}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingBottom: '1rem' }}>
        <div className="nav-item">
          <HelpCircle size={22} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
