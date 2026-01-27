
export type DataType = 'INT' | 'BIGINT' | 'DECIMAL' | 'BIT' | 'NVARCHAR' | 'VARCHAR' | 'DATETIME2' | 'DATE' | 'UNIQUEIDENTIFIER';

export interface ColumnMetadata {
  name: string;
  label: string;
  type: DataType;
  isPrimaryKey: boolean;
  isNullable: boolean;
  isEditable: boolean;
}

export interface TableSchema {
  id: string;
  name: string;
  columns: ColumnMetadata[];
}

export interface RecordData {
  [key: string]: any;
}

export interface TemporalRecord extends RecordData {
  ValidFrom: string;
  ValidTo: string;
  VersionId: string;
}

// Workflow Types
export type RoleType = 'PD' | 'CoM' | 'RMO' | 'RO' | 'HQ' | 'IDF' | 'PCST';
export type ConfigCategory = 'Fields' | 'Validations' | 'Procedures' | 'Actions';

export interface RoleConfig {
  fields: string[];
  validations: string[];
  procedures: string[];
  actions: string[];
}

export interface WorkflowConfig {
  id: string;
  name: string;
  phase: string;
  roles: {
    [key: string]: RoleConfig; 
  };
}

// Unified Results Module Types
export type ResultItemType = 'OBJECTIVE' | 'OUTCOME' | 'OUTPUT' | 'INDICATOR' | 'ACTIVITY';
export type IndicatorValueType = 'Numeric' | 'Text' | 'Percent';

export interface ProgressEntry {
  id: string;
  date: string;
  value: number | string;
  comment: string;
  reportedBy: string;
}

export interface UnifiedResultItem {
  id: string;
  code: string;
  type: ResultItemType;
  statement: string;
  
  // Basic Matrix Fields
  description?: string;
  assumption?: string;
  indicatorName?: string;
  baseline?: number;
  isBaselineTbd?: boolean;
  target?: number;
  dataSource?: string;
  
  // Specialized Fields from Screenshots
  implementingReportingArea?: string;
  crossCuttingTags?: string[];
  relatedSrfResults?: string[];
  relatedSdgTargets?: string[];
  relatedGcmObjective?: string;
  relatedMigofPrinciple?: string;
  implementingMissions?: string[];
  appealCode?: string;
  indicatorType?: IndicatorValueType;
  isInternalUseOnly?: boolean;
  activityCode?: string;
  implementedByPartner?: 'Yes' | 'No';
  isBudgetRequired?: boolean;
  
  // Workplan Fields
  responsibleParty?: string;
  timeframe?: boolean[]; // 12-month boolean array
  
  // Monitoring Fields
  percentComplete?: number;
  startDate?: string;
  endDate?: string;
  duration?: number;
  comments?: string;
  progressHistory?: ProgressEntry[];
  
  children?: UnifiedResultItem[];
  isOpen?: boolean;
}
