
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
  Plus,
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import { WORKFLOW_PHASES, POOL_ITEMS } from '../constants';
import { RoleType, ConfigCategory, RoleConfig } from '../types';

const ASSET_POOL = {
  ...POOL_ITEMS,
  Roles: ["PD", "CoM", "RMO", "RO", "HQ", "IDF", "PCST"]
};

const REVIEW_PROCESS_OPTIONS = ["Standard", "IOMDF", "Emergency"];

type RepositoryTab = ConfigCategory | 'Roles';

interface RoleInstance {
  id: string;
  type: string;
}

interface RoleGroup {
  id: string;
  roles: RoleInstance[];
}

const WorkflowDesignerPage: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState(WORKFLOW_PHASES[0]);
  const [selectedReviewProcess, setSelectedReviewProcess] = useState(REVIEW_PROCESS_OPTIONS[0]);
  const [workflowName, setWorkflowName] = useState('CN_WITH_BUDGET_WORKFLOW 5');
  const [repoTab, setRepoTab] = useState<RepositoryTab>('Fields');
  const [activeCategory, setActiveCategory] = useState<ConfigCategory>('Fields');
  const [isPhaseOpen, setIsPhaseOpen] = useState(false);
  const [isReviewProcessOpen, setIsReviewProcessOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Selection Logic (Transitions)
  const [previousStageId, setPreviousStageId] = useState<string | null>(null);
  const [currentStageId, setCurrentStageId] = useState<string | null>(null);

  // Transition-based Configuration
  const [transitionsConfig, setTransitionsConfig] = useState<Record<string, RoleConfig>>({});

  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([
    { id: 'g1', roles: [{ id: 'PD-1', type: 'PD' }] },
    { id: 'g2', roles: [{ id: 'CoM-1', type: 'CoM' }, { id: 'RMO-1', type: 'RMO' }] },
    { id: 'g3', roles: [{ id: 'HQ-1', type: 'HQ' }] },
    { id: 'g4', roles: [{ id: 'HQ-2', type: 'HQ' }] },
    { id: 'g5', roles: [{ id: 'PCST-1', type: 'PCST' }] },
    { id: 'g6', roles: [{ id: 'CoM-2', type: 'CoM' }] }
  ]);

  const transitionKey = (previousStageId && currentStageId) ? `${previousStageId}_${currentStageId}` : null;

  const handleStageSelection = (id: string) => {
    if (previousStageId === id) {
      setPreviousStageId(null);
      setCurrentStageId(null);
      return;
    }
    if (currentStageId === id) {
      setCurrentStageId(null);
      return;
    }

    if (!previousStageId) {
      setPreviousStageId(id);
    } else if (!currentStageId) {
      setCurrentStageId(id);
    } else {
      setPreviousStageId(id);
      setCurrentStageId(null);
    }
  };

  const ensureTransitionConfig = (key: string) => {
    if (!transitionsConfig[key]) {
      setTransitionsConfig(prev => ({
        ...prev,
        [key]: { fields: [], validations: [], procedures: [], actions: [] }
      }));
    }
  };

  const handleDropToPopup = (e: React.DragEvent, category: ConfigCategory) => {
    e.preventDefault();
    if (!transitionKey) return;
    const item = e.dataTransfer.getData('text/plain');
    const type = e.dataTransfer.getData('type');
    if (type !== 'component') return;
    ensureTransitionConfig(transitionKey);
    const targetKey = category.toLowerCase() as keyof RoleConfig;
    setTransitionsConfig(prev => {
      const currentConfig = prev[transitionKey] || { fields: [], validations: [], procedures: [], actions: [] };
      if (currentConfig[targetKey].includes(item)) return prev;
      return { ...prev, [transitionKey]: { ...currentConfig, [targetKey]: [...currentConfig[targetKey], item] } };
    });
  };

  const handleDropToCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    const roleType = e.dataTransfer.getData('text/plain') as RoleType;
    if (e.dataTransfer.getData('type') === 'role') {
      const newRoleId = `${roleType}-${Date.now()}`;
      setRoleGroups(prev => [...prev, { id: `g-${Date.now()}`, roles: [{ id: newRoleId, type: roleType }] }]);
    }
  };

  const handleDropToJoint = (e: React.DragEvent, groupId: string) => {
    e.stopPropagation(); e.preventDefault();
    const roleType = e.dataTransfer.getData('text/plain') as RoleType;
    if (e.dataTransfer.getData('type') === 'role') {
      const newRoleId = `${roleType}-${Date.now()}`;
      setRoleGroups(prev => prev.map(group => group.id === groupId ? { ...group, roles: [...group.roles, { id: newRoleId, type: roleType }] } : group));
    }
  };

  const removeRoleFromCanvas = (groupId: string, roleId: string) => {
    setRoleGroups(prev => prev.map(group => group.id === groupId ? { ...group, roles: group.roles.filter(r => r.id !== roleId) } : group).filter(group => group.roles.length > 0));
    if (previousStageId === roleId || previousStageId === groupId) setPreviousStageId(null);
    if (currentStageId === roleId || currentStageId === groupId) setCurrentStageId(null);
  };

  const removeItem = (category: ConfigCategory, item: string) => {
    if (!transitionKey) return;
    const targetKey = category.toLowerCase() as keyof RoleConfig;
    setTransitionsConfig(prev => {
      const cfg = prev[transitionKey];
      if (!cfg) return prev;
      return { ...prev, [transitionKey]: { ...cfg, [targetKey]: cfg[targetKey].filter(i => i !== item) } };
    });
  };

  const filteredItems = useMemo(() => (ASSET_POOL[repoTab] || []).filter(item => item.toLowerCase().includes(searchTerm.toLowerCase())), [repoTab, searchTerm]);
  const getStat = (cat: ConfigCategory) => transitionKey ? (transitionsConfig[transitionKey]?.[cat.toLowerCase() as keyof RoleConfig]?.length ?? 0) : 0;

  const RepoItemCard: React.FC<{ item: string, index?: number, isSequenced?: boolean, onRemove?: () => void }> = ({ item, index, isSequenced = false, onRemove }) => (
    <div draggable={!onRemove} onDragStart={(e) => { e.dataTransfer.setData('text/plain', item); e.dataTransfer.setData('type', repoTab === 'Roles' ? 'role' : 'component'); }} className="repo-item">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
        {isSequenced && <span style={{ fontSize: '9px', color: '#3b82f6', background: '#eff6ff', padding: '0.125rem 0.25rem', borderRadius: '4px', border: '1px solid #dbeafe' }}>{String(index! + 1).padStart(2, '0')}</span>}
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item}</span>
      </div>
      {onRemove ? <button onClick={onRemove} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}><Trash2 size={12} /></button> : <MousePointer2 size={12} style={{ color: '#60a5fa' }} />}
    </div>
  );

  return (
    <div className="workflow-view" style={{ width: '100%', height: '100%' }}>
      <div className="repo-aside">
        <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>Asset Repository</h3>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
            {(['Fields', 'Validations', 'Procedures', 'Actions', 'Roles'] as RepositoryTab[]).map(tab => (
              <button key={tab} onClick={() => setRepoTab(tab)} className="repo-tab" style={{ flex: 1, padding: '0.5rem', border: 'none', background: repoTab === tab ? 'white' : 'transparent', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: repoTab === tab ? '#3b82f6' : '#94a3b8', boxShadow: repoTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', justifyContent: 'center' }}>
                {tab === 'Fields' && <Layers size={14} />}
                {tab === 'Validations' && <ShieldCheck size={14} />}
                {tab === 'Procedures' && <Zap size={14} />}
                {tab === 'Actions' && <Activity size={14} />}
                {tab === 'Roles' && <Users size={14} />}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <SearchIcon style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={12} />
            <input type="text" placeholder={`Search ${repoTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none', fontSize: '11px', fontWeight: 700 }} />
          </div>
        </div>
        <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>{filteredItems.map((item) => <RepoItemCard key={item} item={item} />)}</div>
      </div>

      <div className="canvas-area" style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flex: 2 }}>
            {/* Phase Dropdown */}
            <div style={{ flex: 1, maxWidth: '280px', position: 'relative' }}>
              <label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Current Phase</label>
              <button onClick={() => setIsPhaseOpen(!isPhaseOpen)} style={{ width: '100%', background: '#0f172a', color: 'white', padding: '0.625rem 1rem', borderRadius: '12px', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>{selectedPhase} <ChevronDown size={18} /></button>
              {isPhaseOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '4px', zIndex: 50, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
                  {WORKFLOW_PHASES.map(p => <div key={p} onClick={() => { setSelectedPhase(p); setIsPhaseOpen(false); }} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: selectedPhase === p ? '#2563eb' : 'white', color: selectedPhase === p ? 'white' : '#334155' }}>{p}</div>)}
                </div>
              )}
            </div>

            {/* Review Process Dropdown */}
            <div style={{ flex: 1, maxWidth: '220px', position: 'relative' }}>
              <label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Review Process</label>
              <button onClick={() => setIsReviewProcessOpen(!isReviewProcessOpen)} style={{ width: '100%', background: '#0f172a', color: 'white', padding: '0.625rem 1rem', borderRadius: '12px', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>{selectedReviewProcess} <ChevronDown size={18} /></button>
              {isReviewProcessOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '4px', zIndex: 50, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
                  {REVIEW_PROCESS_OPTIONS.map(p => <div key={p} onClick={() => { setSelectedReviewProcess(p); setIsReviewProcessOpen(false); }} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: selectedReviewProcess === p ? '#2563eb' : 'white', color: selectedReviewProcess === p ? 'white' : '#334155' }}>{p}</div>)}
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Workflow Schema</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, outline: 'none', background: 'white' }} />
                <button style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', padding: '8px', cursor: 'pointer', color: '#94a3b8' }}><Settings2 size={16} /></button>
              </div>
            </div>
            <button className="enterprise-btn-primary" style={{ height: '42px', padding: '0 1.5rem', background: '#0f172a' }}>
              <Save size={18} /> SAVE
            </button>
          </div>
        </div>

        <div className="canvas-frame" style={{ height: '350px', flex: 'none', position: 'relative', overflowX: 'auto', overflowY: 'hidden', padding: '0' }} onDragOver={(e) => e.preventDefault()} onDrop={handleDropToCanvas}>
          <div className="canvas-grid-bg"></div>
          
          {/* Selection Legend */}
          <div style={{ 
            position: 'absolute', 
            bottom: '1rem', 
            left: '1rem', 
            background: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(8px)',
            padding: '8px 12px', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4f46e5', boxShadow: '0 0 6px rgba(79, 70, 229, 0.4)' }}></div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Previous Stage</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)' }}></div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Current Stage</span>
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1.5rem', zIndex: 10, padding: '2rem', minWidth: '100%', height: '100%', justifyContent: roleGroups.length > 3 ? 'flex-start' : 'center' }}>
            {roleGroups.map((group, idx) => {
              const hasJointRoles = group.roles.length > 1;
              const isGroupFrom = previousStageId === group.id;
              const isGroupTo = currentStageId === group.id;

              return (
                <React.Fragment key={group.id}>
                  {idx > 0 && <MoveRight size={18} style={{ color: '#cbd5e1', flexShrink: 0 }} />}
                  <div 
                    className={`role-group-container ${isGroupFrom || isGroupTo ? 'selected' : ''}`} 
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} 
                    onDrop={(e) => handleDropToJoint(e, group.id)}
                    onClick={() => hasJointRoles && handleStageSelection(group.id)}
                    style={{ 
                      gap: '0.625rem', padding: '1.25rem', flexShrink: 0,
                      cursor: hasJointRoles ? 'pointer' : 'default',
                      borderWidth: '2px', borderStyle: 'solid',
                      borderColor: isGroupFrom ? '#4f46e5' : isGroupTo ? '#10b981' : '#f1f5f9',
                      backgroundColor: isGroupFrom ? 'rgba(79, 70, 229, 0.05)' : isGroupTo ? 'rgba(16, 185, 129, 0.05)' : 'rgba(248, 250, 252, 0.5)',
                      boxShadow: isGroupFrom ? '0 0 15px rgba(79, 70, 229, 0.1)' : isGroupTo ? '0 0 15px rgba(16, 185, 129, 0.1)' : 'none',
                      transition: 'all 0.2s', position: 'relative', borderRadius: '2.5rem'
                    }}
                  >
                    {group.roles.map((role, rIdx) => {
                      const isRoleFrom = previousStageId === role.id;
                      const isRoleTo = currentStageId === role.id;
                      return (
                        <div key={role.id} style={{ position: 'relative' }}>
                          {rIdx > 0 && <div className="joint-line"></div>}
                          <div 
                            className={`role-node ${isRoleFrom || isRoleTo ? 'selected' : ''}`} 
                            style={{ 
                              width: '70px', height: '70px', borderRadius: '1.25rem', background: 'white', color: '#334155',
                              borderColor: isRoleFrom ? '#4f46e5' : isRoleTo ? '#10b981' : '#e2e8f0',
                              borderWidth: (isRoleFrom || isRoleTo) ? '3px' : '1px',
                              boxShadow: (isRoleFrom || isRoleTo) ? `0 0 15px ${isRoleFrom ? 'rgba(79, 70, 229, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` : 'none'
                            }} 
                            onClick={(e) => { e.stopPropagation(); handleStageSelection(role.id); }}
                          >
                             <div style={{ marginBottom: '2px', color: isRoleFrom ? '#4f46e5' : isRoleTo ? '#10b981' : '#64748b' }}>
                               {role.type === 'PD' ? <Layers size={18}/> : role.type === 'CoM' ? <ShieldCheck size={18}/> : <Zap size={18}/>}
                             </div>
                             <span style={{ fontSize: '10px', fontWeight: 900 }}>{role.type}</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeRoleFromCanvas(group.id, role.id); }} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}><X size={10} /></button>
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {transitionKey && (
          <div style={{ marginTop: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', overflow: 'hidden', paddingBottom: '1rem' }}>
            <div style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9', padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['Fields', 'Validations', 'Procedures', 'Actions'] as ConfigCategory[]).map(cat => (
                  <button key={cat} onClick={() => { setActiveCategory(cat); if (repoTab !== 'Roles') setRepoTab(cat); }} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', border: 'none', background: activeCategory === cat ? 'white' : 'transparent', color: activeCategory === cat ? '#2563eb' : '#94a3b8', cursor: 'pointer', boxShadow: activeCategory === cat ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
                    {cat} <span style={{ marginLeft: '4px', opacity: 0.5 }}>{getStat(cat)}</span>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '6px 16px', borderRadius: '30px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5' }}></div><span style={{ fontSize: '10px', fontWeight: 900 }}>{previousStageId?.split('-')[0]}</span></div>
                <ArrowRight size={14} style={{ color: '#94a3b8' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div><span style={{ fontSize: '10px', fontWeight: 900 }}>{currentStageId?.split('-')[0]}</span></div>
                <button onClick={() => { setPreviousStageId(null); setCurrentStageId(null); }} style={{ marginLeft: '8px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
            </div>
            <div className="custom-scroll" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', minHeight: '180px', maxHeight: '300px', overflowY: 'auto' }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropToPopup(e, activeCategory)}>
              {(transitionsConfig[transitionKey]?.[activeCategory.toLowerCase() as keyof RoleConfig] || []).map((item, idx) => <RepoItemCard key={item} item={item} index={idx} isSequenced onRemove={() => removeItem(activeCategory, item)} />)}
              {(!transitionsConfig[transitionKey] || transitionsConfig[transitionKey][activeCategory.toLowerCase() as keyof RoleConfig].length === 0) && (
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', padding: '4rem', border: '2px dashed #f1f5f9', borderRadius: '1.5rem' }}>
                  <div style={{ opacity: 0.1, marginBottom: '0.5rem' }}>{activeCategory === 'Fields' ? <Layers size={48} /> : activeCategory === 'Validations' ? <ShieldCheck size={48} /> : activeCategory === 'Procedures' ? <Zap size={48} /> : <Activity size={48} />}</div>
                  <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>Drop components to design this path</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDesignerPage;
