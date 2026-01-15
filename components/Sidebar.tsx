
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
    <aside className="w-[72px] bg-[#1E3A8A] min-h-screen flex flex-col items-center py-6 gap-8 text-blue-200 shrink-0 relative">
      <div className="p-2 mb-4">
        <Menu size={24} className="cursor-pointer hover:text-white" />
      </div>
      
      <div className="flex-1 w-full flex flex-col items-center gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all ${
              item.active 
                ? 'bg-[#3b82f6] text-white shadow-lg' 
                : 'hover:bg-blue-800 hover:text-white'
            }`}
          >
            {item.icon}
          </div>
        ))}
      </div>

      <div className="mt-auto pb-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-blue-800 hover:text-white cursor-pointer transition-all">
          <HelpCircle size={22} />
        </div>
      </div>
      
      {/* Decorative vertical line */}
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
    </aside>
  );
};

export default Sidebar;
