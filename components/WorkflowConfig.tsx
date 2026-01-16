
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
      setRoleGroups(prev => [...prev, { id: `g-${Date.now()}`, roles: [{ id: newId, type: roleType }] }]);
    }
  };

  const handleDropToJoint = (e: React.DragEvent, groupId: string) => {
    e.stopPropagation(); e.preventDefault();
    const roleType = e.dataTransfer.getData('text/plain');
    const type = e.dataTransfer.getData('type');
    if (type === 'role') {
      const newId = `${roleType}-${Date.now()}`;
      setRoleGroups(prev => prev.map(group => group.id === groupId ? { ...group, roles: [...group.roles, { id: newId, type: roleType }] } : group));
    }
  };

  const removeRoleFromCanvas = (groupId: string, roleId: string) => {
    setRoleGroups(prev => prev.map(group => group.id === groupId ? { ...group, roles: group.roles.filter(r => r.id !== roleId) } : group).filter(group => group.roles.length > 0));
  };

  const removeItem = (role: RoleType, category: ConfigCategory, item: string) => {
    const targetKey = category.toLowerCase() as keyof typeof config.PD;
    setConfig(prev => ({ ...prev, [role]: { ...prev[role], [targetKey]: prev[role][targetKey].filter(i => i !== item) } }));
  };

  const filteredItems = useMemo(() => {
    const items = ASSET_POOL[repoTab] || [];
    return items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [repoTab, searchTerm]);

  const RepoItemCard: React.FC<{ item: string, index?: number, isSequenced?: boolean, onRemove?: () => void }> = ({ item, index, isSequenced = false, onRemove }) => (
    <div
      draggable={!onRemove}
      onDragStart={(e) => handleDragStart(e, item, repoTab === 'Roles' ? 'role' : 'component')}
      className="repo-item"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
        {isSequenced && <span style={{ fontSize: '9px', color: '#3b82f6', background: '#eff6ff', padding: '0.125rem 0.25rem', borderRadius: '4px', border: '1px solid #dbeafe' }}>{String(index! + 1).padStart(2, '0')}</span>}
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item}</span>
      </div>
      {onRemove ? (
        <button onClick={onRemove} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}><Trash2 size={12} /></button>
      ) : (
        <MousePointer2 size={12} style={{ color: '#60a5fa' }} />
      )}
    </div>
  );

  return (
    <div className="workflow-view">
      <div className="repo-aside">
        <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>Asset Repository</h3>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
            {(['Fields', 'Validations', 'Procedures', 'Roles'] as RepositoryTab[]).map(tab => (
              <button 
                key={tab} 
                onClick={() => { setRepoTab(tab); if(tab !== 'Roles') setActiveCategory(tab as ConfigCategory); }} 
                className="repo-tab"
                style={{ 
                  flex: 1, padding: '0.5rem', border: 'none', background: repoTab === tab ? 'white' : 'transparent', 
                  borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: repoTab === tab ? '#3b82f6' : '#94a3b8', boxShadow: repoTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {tab === 'Fields' && <Layers size={14} />}
                {tab === 'Validations' && <ShieldCheck size={14} />}
                {tab === 'Procedures' && <Zap size={14} />}
                {tab === 'Roles' && <Users size={14} />}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <SearchIcon style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={12} />
            <input 
              type="text" 
              placeholder={`Search ${repoTab}...`} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none', fontSize: '11px', fontWeight: 700 }}
            />
          </div>
        </div>
        <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {filteredItems.map((item) => <RepoItemCard key={item} item={item} />)}
        </div>
        <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff80', borderTop: '1px solid #dbeafe' }}>
          <p style={{ fontSize: '9px', color: '#2563eb', fontWeight: 700, margin: 0 }}>Drag roles to canvas for new stages, or onto roles for joint actions.</p>
        </div>
      </div>

      <div className="canvas-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ width: '380px', position: 'relative' }}>
            <label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Current Phase</label>
            <button onClick={() => setIsPhaseOpen(!isPhaseOpen)} style={{ width: '100%', background: '#0f172a', color: 'white', padding: '0.625rem 1rem', borderRadius: '12px', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              {selectedPhase} <ChevronDown size={18} />
            </button>
            {isPhaseOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '4px', zIndex: 50, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
                {WORKFLOW_PHASES.map(p => <div key={p} onClick={() => { setSelectedPhase(p); setIsPhaseOpen(false); }} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: selectedPhase === p ? '#2563eb' : 'white', color: selectedPhase === p ? 'white' : '#334155' }}>{p}</div>)}
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Workflow Schema</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, outline: 'none', background: 'white' }} />
              <button style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', padding: '8px', cursor: 'pointer', color: '#94a3b8' }}><Settings2 size={16} /></button>
            </div>
          </div>
        </div>

        <div className="canvas-frame" onDragOver={(e) => e.preventDefault()} onDrop={handleDropToCanvas}>
          <div className="canvas-grid-bg"></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', zIndex: 10 }}>
            {roleGroups.map((group, idx) => (
              <React.Fragment key={group.id}>
                {idx > 0 && <MoveRight size={20} style={{ color: '#cbd5e1' }} />}
                <div className="role-group-container" onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={(e) => handleDropToJoint(e, group.id)}>
                  {group.roles.map((role, rIdx) => {
                    const isSelected = activeRole === role.type;
                    let style: React.CSSProperties = { borderColor: '#f1f5f9', color: '#0f172a', background: 'white' };
                    if (role.type === 'PD') style = isSelected ? { background: '#ef4444', borderColor: '#fee2e2', color: 'white' } : { background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' };
                    else if (role.type === 'CoM') style = isSelected ? { background: '#2563eb', borderColor: '#dbeafe', color: 'white' } : { background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' };
                    else if (role.type === 'RmO') style = isSelected ? { background: '#7c3aed', borderColor: '#ede9fe', color: 'white' } : { background: '#f5f3ff', borderColor: '#ddd6fe', color: '#5b21b6' };
                    
                    return (
                      <div key={role.id} style={{ position: 'relative' }}>
                        {rIdx > 0 && <div className="joint-line"></div>}
                        <div 
                          className={`role-node ${isSelected ? 'selected' : ''}`} 
                          style={style} 
                          onClick={(e) => { e.stopPropagation(); setActiveRole(role.type as RoleType); setRepoTab(activeCategory); }}
                        >
                           <div style={{ marginBottom: '4px' }}>
                             {role.type === 'PD' ? <Layers size={20}/> : role.type === 'CoM' ? <ShieldCheck size={20}/> : <Zap size={20}/>}
                           </div>
                           <span style={{ fontSize: '11px', fontWeight: 900 }}>{role.type}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeRoleFromCanvas(group.id, role.id); }} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} /></button>
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
            {roleGroups.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#cbd5e1' }}>
                <Plus size={48} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Drop First Role</span>
              </div>
            )}
          </div>
        </div>

        {activeRole && (
          <div style={{ 
            marginTop: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1.5rem', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', width: '100%', maxWidth: '36rem', alignSelf: 'center' 
          }}>
            <div style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9', padding: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['Fields', 'Validations', 'Procedures'] as ConfigCategory[]).map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => { setActiveCategory(cat); setRepoTab(cat); }} 
                    style={{ 
                      padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', 
                      border: 'none', background: activeCategory === cat ? 'white' : 'transparent', 
                      color: activeCategory === cat ? '#2563eb' : '#94a3b8', cursor: 'pointer',
                      boxShadow: activeCategory === cat ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {cat} <span style={{ marginLeft: '4px', opacity: 0.5 }}>{config[activeRole][cat.toLowerCase() as keyof typeof config.PD].length}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setActiveRole(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.5rem', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <div 
              className="custom-scroll"
              style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', minHeight: '180px', maxHeight: '350px', overflowY: 'auto' }}
              onDragOver={(e) => e.preventDefault()} 
              onDrop={(e) => handleDropToPopup(e, activeRole, activeCategory)}
            >
              {config[activeRole][activeCategory.toLowerCase() as keyof typeof config.PD].map((item, idx) => (
                <RepoItemCard key={item} item={item} index={idx} isSequenced onRemove={() => removeItem(activeRole, activeCategory, item)} />
              ))}
              {config[activeRole][activeCategory.toLowerCase() as keyof typeof config.PD].length === 0 && (
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', padding: '2rem', border: '2px dashed #f1f5f9', borderRadius: '1rem' }}>
                  <MousePointer2 size={32} style={{ opacity: 0.1, marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>Drop Components Here</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem' }}>
          <button className="enterprise-btn-primary">
            <Save size={16} /> SYNC CONFIGURATION
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowConfigView;
