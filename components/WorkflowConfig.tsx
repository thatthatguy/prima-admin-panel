
import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  MoveRight, 
  X, 
  MousePointer2, 
  Save, 
  Trash2, 
  Settings2, 
  ShieldCheck, 
  Zap, 
  Layers,
  Search as SearchIcon,
  Users,
  Plus
} from 'lucide-react';
import { WORKFLOW_PHASES, POOL_ITEMS } from '../constants';
import { RoleType, ConfigCategory, WorkflowConfig as IWorkflowConfig } from '../types';

// Extend pool items with Roles
const ASSET_POOL = {
  ...POOL_ITEMS,
  Roles: ["PD", "CoM", "RMO", "RO", "HQ", "IDF", "PCST"]
};

type RepositoryTab = ConfigCategory | 'Roles';

interface RoleInstance {
  id: string;
  type: string;
}

interface RoleGroup {
  id: string;
  roles: RoleInstance[];
}

const WorkflowConfigView: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState(WORKFLOW_PHASES[0]);
  const [workflowName, setWorkflowName] = useState('CN_WITH_BUDGET_WORKFLOW 5');
  const [activeRole, setActiveRole] = useState<RoleType | null>(null);
  const [activeCategory, setActiveCategory] = useState<ConfigCategory>('Fields');
  const [repoTab, setRepoTab] = useState<RepositoryTab>('Fields');
  const [isPhaseOpen, setIsPhaseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [config, setConfig] = useState<IWorkflowConfig['roles']>({
    PD: { fields: [], validations: [], procedures: [] },
    CoM: { fields: [], validations: [], procedures: [] },
    RmO: { fields: [], validations: [], procedures: [] }
  });

  // Groups of roles (can be single or joint)
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([
    { id: 'g1', roles: [{ id: 'PD-1', type: 'PD' }] },
    { id: 'g2', roles: [{ id: 'CoM-1', type: 'CoM' }, { id: 'RmO-1', type: 'RmO' }] }
  ]);

  const handleDragStart = (e: React.DragEvent, item: string, type: 'component' | 'role') => {
    e.dataTransfer.setData('text/plain', item);
    e.dataTransfer.setData('type', type);
  };

  const handleDropToPopup = (e: React.DragEvent, role: RoleType, category: ConfigCategory) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    const type = e.dataTransfer.getData('type');
    
    if (type !== 'component') return;

    const targetKey = category.toLowerCase() as keyof typeof config.PD;
    if (!config[role][targetKey].includes(item)) {
      setConfig(prev => ({
        ...prev,
        [role]: {
          ...prev[role],
          [targetKey]: [...prev[role][targetKey], item]
        }
      }));
    }
  };

  const handleDropToCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    const roleType = e.dataTransfer.getData('text/plain');
    const type = e.dataTransfer.getData('type');

    if (type === 'role') {
      const newId = `${roleType}-${Date.now()}`;
      setRoleGroups(prev => [...prev, { 
        id: `g-${Date.now()}`, 
        roles: [{ id: newId, type: roleType }] 
      }]);
      initializeRoleConfig(roleType);
    }
  };

  const handleDropToJoint = (e: React.DragEvent, groupId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const roleType = e.dataTransfer.getData('text/plain');
    const type = e.dataTransfer.getData('type');

    if (type === 'role') {
      const newId = `${roleType}-${Date.now()}`;
      setRoleGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, roles: [...group.roles, { id: newId, type: roleType }] }
          : group
      ));
      initializeRoleConfig(roleType);
    }
  };

  const initializeRoleConfig = (roleType: string) => {
    if (!(roleType in config)) {
      setConfig(prev => ({
        ...prev,
        [roleType as RoleType]: { fields: [], validations: [], procedures: [] }
      }));
    }
  };

  const removeRoleFromCanvas = (groupId: string, roleId: string) => {
    setRoleGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return { ...group, roles: group.roles.filter(r => r.id !== roleId) };
      }
      return group;
    }).filter(group => group.roles.length > 0));
  };

  const removeItem = (role: RoleType, category: ConfigCategory, item: string) => {
    const targetKey = category.toLowerCase() as keyof typeof config.PD;
    setConfig(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [targetKey]: prev[role][targetKey].filter(i => i !== item)
      }
    }));
  };

  const getCategoryIcon = (cat: RepositoryTab) => {
    switch(cat) {
      case 'Fields': return <Layers size={14} />;
      case 'Validations': return <ShieldCheck size={14} />;
      case 'Procedures': return <Zap size={14} />;
      case 'Roles': return <Users size={14} />;
    }
  };

  const getRoleIcon = (roleType: string, size = 20) => {
    switch(roleType) {
      case 'PD': return <Layers size={size} />;
      case 'CoM': return <ShieldCheck size={size} />;
      case 'RmO': return <Zap size={size} />;
      default: return <Users size={size} />;
    }
  };

  const filteredItems = useMemo(() => {
    const items = ASSET_POOL[repoTab] || [];
    return items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [repoTab, searchTerm]);

  const RepoItemCard: React.FC<{ item: string, index?: number, isSequenced?: boolean, onRemove?: () => void }> = ({ item, index, isSequenced = false, onRemove }) => (
    <div
      draggable={!onRemove}
      onDragStart={(e) => handleDragStart(e, item, repoTab === 'Roles' ? 'role' : 'component')}
      className={`bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-[12px] font-bold text-slate-700 shadow-sm transition-all flex items-center justify-between group ${!onRemove ? 'cursor-grab active:cursor-grabbing hover:border-blue-400 hover:bg-blue-50/50' : 'hover:border-blue-200'}`}
    >
      <div className="flex items-center gap-2 truncate">
        {isSequenced && <span className="text-[9px] text-blue-500 bg-blue-50 px-1 py-0.5 rounded border border-blue-100 shrink-0">{String(index! + 1).padStart(2, '0')}</span>}
        <span className="truncate">{item}</span>
      </div>
      {onRemove ? (
        <button onClick={onRemove} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
          <Trash2 size={12} />
        </button>
      ) : (
        <div className="opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity shrink-0">
          <MousePointer2 size={12} />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Refined Compact Repository */}
      <div className="w-64 bg-white border-r flex flex-col shadow-sm z-10">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Asset Repository</h3>
          
          <div className="flex bg-slate-200/50 p-1 rounded-lg mb-3">
            {(['Fields', 'Validations', 'Procedures', 'Roles'] as RepositoryTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => { setRepoTab(tab); if(tab !== 'Roles') setActiveCategory(tab as ConfigCategory); }}
                className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center ${repoTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title={tab}
              >
                {getCategoryIcon(tab)}
              </button>
            ))}
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input 
              type="text" 
              placeholder={`Search ${repoTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="text-center py-6 text-slate-300">
              <p className="text-[9px] font-black uppercase tracking-widest">No matching assets</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <RepoItemCard key={item} item={item} />
            ))
          )}
        </div>
        
        <div className="p-3 bg-blue-50/50 border-t border-blue-100">
          <p className="text-[9px] text-blue-600 leading-tight font-bold italic">
            {repoTab === 'Roles' ? 'Drop roles on the canvas for new groups, or on an existing role to create a joint role.' : `Drag ${repoTab} into a Role's configuration.`}
          </p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden relative">
        <div className="flex justify-between items-start mb-6">
          <div className="relative w-[380px]">
            <div className="flex flex-col gap-1 mb-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selected Phase</label>
              <button
                onClick={() => setIsPhaseOpen(!isPhaseOpen)}
                className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-between font-bold text-xs shadow-lg shadow-slate-200"
              >
                {selectedPhase}
                <ChevronDown size={18} className={`${isPhaseOpen ? 'rotate-180' : ''} transition-transform`} />
              </button>
            </div>
            {isPhaseOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                {WORKFLOW_PHASES.map((phase) => (
                  <div
                    key={phase}
                    onClick={() => { setSelectedPhase(phase); setIsPhaseOpen(false); }}
                    className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors ${selectedPhase === phase ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    {phase}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Workflow Schema</label>
            <div className="flex items-center gap-2">
               <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 outline-none w-64 bg-white focus:border-blue-500 transition-all shadow-sm"
              />
              <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                <Settings2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Roles Canvas */}
        <div 
          className="flex-1 flex flex-col items-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropToCanvas}
        >
          <div 
            onClick={() => { setRepoTab('Roles'); setActiveRole(null); }}
            className="w-full bg-white border border-slate-200 rounded-[2rem] p-8 min-h-[400px] relative shadow-sm flex items-center justify-center cursor-crosshair group overflow-x-auto custom-scrollbar"
          >
            <div className="absolute top-4 left-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <h4 className="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em]">Live Interconnect (Joint Roles Support)</h4>
            </div>

            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1E3A8A 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            <div className="flex items-center gap-12 z-10 px-12 min-w-max">
              {roleGroups.map((group, gIdx) => (
                <React.Fragment key={group.id}>
                  {gIdx > 0 && <MoveRight size={20} className="text-slate-300 shrink-0" />}
                  
                  {/* Role Group (Individual or Joint) */}
                  <div 
                    className="flex flex-col items-center gap-4 py-4 px-6 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 relative group/group min-w-[120px]"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => handleDropToJoint(e, group.id)}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/group:opacity-100 transition-opacity bg-blue-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase whitespace-nowrap">
                      Drop here for Joint Role
                    </div>
                    
                    {group.roles.map((roleInst, rIdx) => {
                      const isSelected = activeRole === roleInst.type;
                      let bgClass = "bg-white border-slate-100 text-slate-800";
                      
                      if (roleInst.type === 'PD') bgClass = isSelected ? "bg-red-500 border-red-200 text-white" : "hover:border-red-400 bg-red-50/30 text-red-900";
                      else if (roleInst.type === 'CoM') bgClass = isSelected ? "bg-blue-600 border-blue-200 text-white" : "hover:border-blue-400 bg-blue-50/30 text-blue-900";
                      else if (roleInst.type === 'RmO') bgClass = isSelected ? "bg-violet-600 border-violet-200 text-white" : "hover:border-violet-400 bg-violet-50/30 text-violet-900";
                      else bgClass = isSelected ? "bg-slate-800 border-slate-600 text-white" : "hover:border-slate-400 bg-white text-slate-900";

                      return (
                        <div key={roleInst.id} className="relative group/role">
                          {rIdx > 0 && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-200"></div>
                          )}
                          <div 
                            onClick={(e) => { e.stopPropagation(); setActiveRole(roleInst.type as RoleType); setRepoTab(activeCategory); }}
                            className={`w-20 h-20 rounded-[1.5rem] border-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${bgClass} ${isSelected ? 'scale-110 shadow-xl z-20' : 'hover:shadow-lg hover:-translate-y-0.5 shadow-sm'}`}
                          >
                            <div className="mb-1">{getRoleIcon(roleInst.type, 20)}</div>
                            <span className="font-black text-[11px] tracking-tighter uppercase">{roleInst.type}</span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeRoleFromCanvas(group.id, roleInst.id); if(activeRole === roleInst.type) setActiveRole(null); }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/role:opacity-100 transition-opacity shadow-sm z-30"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              ))}
              
              {roleGroups.length === 0 && (
                <div className="flex flex-col items-center gap-3 text-slate-300">
                  <Plus size={48} className="opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Drop a role to start</p>
                </div>
              )}
            </div>
          </div>

          {/* Config Detail Popup */}
          {activeRole && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300 w-full max-w-xl">
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropToPopup(e, activeRole, activeCategory)}
                className="bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl overflow-hidden"
              >
                <div className="bg-slate-50 border-b border-slate-100 p-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {(['Fields', 'Validations', 'Procedures'] as ConfigCategory[]).map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setRepoTab(cat); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeCategory === cat ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {getCategoryIcon(cat)}
                        {cat}
                        <span className={`ml-1 px-1 rounded-full text-[8px] ${activeCategory === cat ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                          {config[activeRole][cat.toLowerCase() as keyof typeof config.PD].length}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setActiveRole(null)} className="p-1.5 text-slate-300 hover:text-slate-900 transition-colors mr-1">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-5 grid grid-cols-2 gap-2.5 min-h-[180px] bg-white max-h-[350px] overflow-y-auto custom-scrollbar">
                  {config[activeRole][activeCategory.toLowerCase() as keyof typeof config.PD].length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center text-slate-300 py-8 border-2 border-dashed border-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                        <MousePointer2 size={20} className="opacity-10" />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em]">Drop Components Here</p>
                    </div>
                  ) : (
                    config[activeRole][activeCategory.toLowerCase() as keyof typeof config.PD].map((item, idx) => (
                      <RepoItemCard 
                        key={item} 
                        item={item} 
                        index={idx} 
                        isSequenced 
                        onRemove={() => removeItem(activeRole, activeCategory, item)} 
                      />
                    ))
                  )}
                </div>
                
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {getRoleIcon(activeRole, 14)} {activeRole} Instance
                  </span>
                  <p className="text-[8px] font-bold text-slate-400 italic">Syncing with global state...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <button 
            onClick={() => alert('Global Workflow configuration synced.')}
            className="bg-[#1E3A8A] hover:bg-blue-900 text-white px-6 py-3 rounded-xl shadow-xl shadow-blue-200 flex items-center gap-2 font-black text-xs transition-all hover:scale-105 active:scale-95"
          >
            <Save size={16} />
            SYNC WORKFLOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowConfigView;
