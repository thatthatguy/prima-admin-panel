
import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Layout, 
  Calendar, 
  Activity, 
  Save, 
  Download, 
  History,
  MessageSquare,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  Target,
  FileText,
  Edit
} from 'lucide-react';
import { UnifiedResultItem, ResultItemType } from '../types';
import UnifiedResultEditModal from '../components/UnifiedResultEditModal';

type ViewPerspective = 'MATRIX' | 'WORKPLAN' | 'MONITORING';

const MOCK_DATA: UnifiedResultItem[] = [
  {
    id: 'obj-1',
    code: '',
    type: 'OBJECTIVE',
    statement: 'Strengthen local government protection capacity at border areas in Panama to improve access to justice of GBV survivors who have crossed the Darien jungle.',
    children: [
      {
        id: 'ind-obj-1',
        code: 'A',
        type: 'INDICATOR',
        statement: '% of GBV survivors receiving access to justice services and/or referrals who report satisfaction with the services received.',
        baseline: 0.00,
        target: 70.00,
        dataSource: 'Statistics reported by Darien protection actors',
        assumption: 'Central Government has capacity to support.',
        indicatorType: 'Percent',
        isInternalUseOnly: false,
        progressHistory: [
          { id: 'p1', date: '2026-01-02', value: 64.8, comment: 'Satisfaction survey applied to service users.', reportedBy: 'HIGUERA Yurys' }
        ]
      },
      {
        id: 'out-1',
        code: '1',
        type: 'OUTCOME',
        statement: 'Protection actors of the Central Government utilize the developed tools and knowledge acquired in their daily tasks.',
        implementingReportingArea: '1020 # Visa/Permit Facilitation',
        assumption: 'Availability of useable pathways by destination countries.',
        children: [
          {
            id: 'ind-out-1',
            code: '1C',
            type: 'INDICATOR',
            statement: '# of government institutions that report the use of the Operationalization Plan',
            baseline: 0,
            target: 4,
            dataSource: 'Interviews to local actors',
            indicatorType: 'Numeric',
            percentComplete: 100
          },
          {
            id: 'output-1.1',
            code: '1.1',
            type: 'OUTPUT',
            statement: 'A mapping and an assessment of local protection actors, services, and current capacities available.',
            implementingReportingArea: '1020 # Visa/Permit Facilitation',
            assumption: 'Tech infrastructure developed and maintained.',
            children: [
              {
                id: 'act-1.1.1',
                code: '1.1.1',
                type: 'ACTIVITY',
                statement: 'Draft ToRs and hire a consultant for the development of the mapping.',
                responsibleParty: 'IOM',
                timeframe: [true, true, false, false, false, false, false, false, false, false, false, false],
                percentComplete: 100,
                startDate: '2022-12-01',
                endDate: '2023-01-31',
                duration: 61,
                activityCode: 'N1.01',
                implementedByPartner: 'No',
                isBudgetRequired: true,
                comments: 'Consultant hired and started.'
              },
              {
                id: 'act-1.1.2',
                code: '1.1.2',
                type: 'ACTIVITY',
                statement: 'Develop a mapping of actors and services (by consultant).',
                responsibleParty: 'Consultant/IOM',
                timeframe: [false, false, true, true, true, false, false, false, false, false, false, false],
                percentComplete: 100,
                startDate: '2023-02-01',
                endDate: '2023-04-30',
                duration: 88,
                activityCode: 'N1.01'
              },
              {
                id: 'act-1.1.3',
                code: '1.1.3',
                type: 'ACTIVITY',
                statement: 'Conduct a meeting with the identified local actors to validate the mapping.',
                responsibleParty: 'Consultant/IOM',
                timeframe: [false, false, false, true, false, false, false, false, false, false, false, false],
                percentComplete: 100,
                startDate: '2023-04-01',
                endDate: '2023-04-30',
                duration: 29,
                activityCode: 'N1.01'
              }
            ]
          }
        ]
      }
    ]
  }
];

const UnifiedResultsPage: React.FC = () => {
  const [view, setView] = useState<ViewPerspective>('MATRIX');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['obj-1', 'out-1', 'output-1.1']));
  const [data, setData] = useState<UnifiedResultItem[]>(MOCK_DATA);
  
  // Modal State
  const [editingItem, setEditingItem] = useState<{ item: UnifiedResultItem, parentStatement?: string } | null>(null);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const renderTypeBadge = (type: ResultItemType) => {
    const colors: Record<string, string> = {
      OBJECTIVE: '#1e40af',
      OUTCOME: '#3b82f6',
      OUTPUT: '#6366f1',
      INDICATOR: '#10b981',
      ACTIVITY: '#f59e0b'
    };
    return (
      <span style={{ 
        fontSize: '9px', fontWeight: 900, background: colors[type] + '20', 
        color: colors[type], padding: '2px 6px', borderRadius: '4px',
        textTransform: 'uppercase', letterSpacing: '0.05em'
      }}>
        {type}
      </span>
    );
  };

  const updateItemRecursive = (items: UnifiedResultItem[], updatedItem: UnifiedResultItem): UnifiedResultItem[] => {
    return items.map(item => {
      if (item.id === updatedItem.id) {
        return { ...item, ...updatedItem };
      }
      if (item.children) {
        return { ...item, children: updateItemRecursive(item.children, updatedItem) };
      }
      return item;
    });
  };

  const handleSaveItem = (updated: UnifiedResultItem) => {
    setData(prev => updateItemRecursive(prev, updated));
    setEditingItem(null);
  };

  const Row: React.FC<{ item: UnifiedResultItem; depth?: number; parentType?: ResultItemType; indicatorIndex?: number; parentStatement?: string }> = ({ item, depth = 0, parentType, indicatorIndex, parentStatement }) => {
    const isExpanded = expandedIds.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    
    const indent = depth * 24;

    const getDisplayCode = () => {
      if (item.type === 'OBJECTIVE') return '';
      if (item.type === 'INDICATOR' && parentType === 'OBJECTIVE' && indicatorIndex !== undefined) {
        return String.fromCharCode(65 + indicatorIndex);
      }
      return item.code;
    };

    const displayCode = getDisplayCode();

    return (
      <>
        <tr className={`unified-row ${item.type.toLowerCase()}`}>
          <td style={{ paddingLeft: `${indent + 12}px`, minWidth: '350px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ width: '20px', flexShrink: 0 }}>
                {hasChildren && (
                  <button onClick={() => toggleExpand(item.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8' }}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {displayCode && <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>{displayCode}</span>}
                  {renderTypeBadge(item.type)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: depth === 0 ? 700 : 500, color: '#1e293b', lineHeight: 1.4 }}>
                  {item.statement}
                </div>
              </div>
            </div>
          </td>

          {view === 'MATRIX' && (
            <>
              <td style={{ fontSize: '12px', color: '#64748b' }}>{item.dataSource || '-'}</td>
              <td style={{ fontSize: '12px', color: '#64748b' }}>{item.baseline ?? '-'}</td>
              <td style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600 }}>{item.target ?? '-'}</td>
              <td style={{ fontSize: '12px', color: '#94a3b8' }}>{item.assumption || '-'}</td>
            </>
          )}

          {view === 'WORKPLAN' && (
            <>
              <td>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{item.responsibleParty || '-'}</span>
              </td>
              <td>
                {item.type === 'ACTIVITY' ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} style={{ 
                        width: '16px', height: '16px', borderRadius: '4px',
                        background: item.timeframe?.[i] ? '#3b82f6' : '#f1f5f9',
                        border: '1px solid',
                        borderColor: item.timeframe?.[i] ? '#2563eb' : '#e2e8f0'
                      }} />
                    ))}
                  </div>
                ) : '-'}
              </td>
            </>
          )}

          {view === 'MONITORING' && (
            <>
              <td style={{ textAlign: 'center' }}>
                {item.percentComplete !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.percentComplete}%`, height: '100%', background: item.percentComplete === 100 ? '#10b981' : '#3b82f6' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, width: '35px' }}>{item.percentComplete}%</span>
                  </div>
                )}
              </td>
              <td>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {item.startDate && <div><Clock size={10} style={{ display: 'inline', marginRight: '4px' }} />{item.startDate}</div>}
                  {item.endDate && <div><CheckCircle2 size={10} style={{ display: 'inline', marginRight: '4px' }} />{item.endDate}</div>}
                </div>
              </td>
              <td>
                <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.comments || (item.progressHistory?.[0]?.comment) || '-'}
                </div>
              </td>
            </>
          )}

          <td style={{ textAlign: 'right', paddingRight: '20px' }}>
             <button 
              className="action-btn" 
              onClick={() => setEditingItem({ item, parentStatement })}
             >
              <MoreVertical size={16} />
             </button>
          </td>
        </tr>
        {isExpanded && item.children?.map((child, idx) => {
          const indicatorIdx = item.type === 'OBJECTIVE' && child.type === 'INDICATOR' 
            ? item.children!.filter((c, i) => c.type === 'INDICATOR' && i <= idx).length - 1
            : undefined;

          return (
            <Row 
              key={child.id} 
              item={child} 
              depth={depth + 1} 
              parentType={item.type} 
              indicatorIndex={indicatorIdx}
              parentStatement={item.statement}
            />
          );
        })}
      </>
    );
  };

  return (
    <div className="unified-results-container" style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
      {/* Control Header */}
      <div style={{ background: 'white', padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Unified Results Module</h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Consolidated Execution Engine</p>
          </div>
          
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button 
              onClick={() => setView('MATRIX')}
              style={{ 
                padding: '6px 16px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                background: view === 'MATRIX' ? 'white' : 'transparent',
                color: view === 'MATRIX' ? '#2563eb' : '#64748b',
                boxShadow: view === 'MATRIX' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Layout size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Design Matrix
            </button>
            <button 
              onClick={() => setView('WORKPLAN')}
              style={{ 
                padding: '6px 16px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                background: view === 'WORKPLAN' ? 'white' : 'transparent',
                color: view === 'WORKPLAN' ? '#2563eb' : '#64748b',
                boxShadow: view === 'WORKPLAN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Workplan
            </button>
            <button 
              onClick={() => setView('MONITORING')}
              style={{ 
                padding: '6px 16px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                background: view === 'MONITORING' ? 'white' : 'transparent',
                color: view === 'MONITORING' ? '#2563eb' : '#64748b',
                boxShadow: view === 'MONITORING' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Activity size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Monitoring
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="enterprise-btn-secondary" style={{ padding: '8px 16px' }}><Download size={16} /> Export</button>
          <button className="enterprise-btn-primary" style={{ padding: '8px 16px', background: '#0f172a' }}><Save size={16} /> Sync All</button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="custom-scroll" style={{ flex: 1, overflow: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table className="enterprise-table" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '400px' }}>Result Statement / Activity</th>
                {view === 'MATRIX' && (
                  <>
                    <th style={{ width: '200px' }}>Data Source</th>
                    <th style={{ width: '100px' }}>Baseline</th>
                    <th style={{ width: '100px' }}>Target</th>
                    <th style={{ width: '200px' }}>Assumptions</th>
                  </>
                )}
                {view === 'WORKPLAN' && (
                  <>
                    <th style={{ width: '180px' }}>Responsibility</th>
                    <th style={{ width: '300px' }}>Timeline (Jan - Dec)</th>
                  </>
                )}
                {view === 'MONITORING' && (
                  <>
                    <th style={{ width: '150px' }}>Progress</th>
                    <th style={{ width: '150px' }}>Key Dates</th>
                    <th style={{ width: '250px' }}>Latest Comments</th>
                  </>
                )}
                <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => <Row key={item.id} item={item} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <UnifiedResultEditModal 
          item={editingItem.item} 
          parentStatement={editingItem.parentStatement}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveItem}
        />
      )}

      {/* Floating Action Hint */}
      <div style={{ 
        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        background: '#0f172a', color: 'white', padding: '10px 24px', borderRadius: '30px',
        display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
        zIndex: 50, fontSize: '12px', fontWeight: 600
      }}>
        <Target size={16} style={{ color: '#10b981' }} />
        <span>Project Overall Health: 85% Complete</span>
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />
        <span style={{ color: '#94a3b8' }}>3 Activities Pending Validation</span>
      </div>
    </div>
  );
};

export default UnifiedResultsPage;
