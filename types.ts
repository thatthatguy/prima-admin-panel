
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
export type RoleType = 'PD' | 'CoM' | 'RmO';
export type ConfigCategory = 'Fields' | 'Validations' | 'Procedures';

export interface WorkflowConfig {
  id: string;
  name: string;
  phase: string;
  roles: {
    [key in RoleType]: {
      fields: string[];
      validations: string[];
      procedures: string[];
    };
  };
}
