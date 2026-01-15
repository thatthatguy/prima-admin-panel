
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

export interface FilterCondition {
  column: string;
  value: string;
  operator: 'contains' | 'equals' | 'greaterThan' | 'lessThan';
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
}
