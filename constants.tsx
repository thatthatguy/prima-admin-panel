
import { TableSchema } from './types';

export const SCHEMAS: TableSchema[] = [
  {
    id: 'employees',
    name: 'Employees',
    columns: [
      { name: 'EmployeeId', label: 'ID', type: 'INT', isPrimaryKey: true, isNullable: false, isEditable: false },
      { name: 'Name', label: 'Full Name', type: 'NVARCHAR', isPrimaryKey: false, isNullable: false, isEditable: true },
      { name: 'Email', label: 'Email Address', type: 'VARCHAR', isPrimaryKey: false, isNullable: false, isEditable: true },
      { name: 'Salary', label: 'Annual Salary', type: 'DECIMAL', isPrimaryKey: false, isNullable: true, isEditable: true },
      { name: 'IsActive', label: 'Active', type: 'BIT', isPrimaryKey: false, isNullable: false, isEditable: true },
      { name: 'CreatedDate', label: 'Joined Date', type: 'DATETIME2', isPrimaryKey: false, isNullable: false, isEditable: false },
    ]
  },
  {
    id: 'products',
    name: 'Products',
    columns: [
      { name: 'ProductId', label: 'Product UID', type: 'UNIQUEIDENTIFIER', isPrimaryKey: true, isNullable: false, isEditable: false },
      { name: 'ProductName', label: 'Name', type: 'NVARCHAR', isPrimaryKey: false, isNullable: false, isEditable: true },
      { name: 'Price', label: 'Unit Price', type: 'DECIMAL', isPrimaryKey: false, isNullable: false, isEditable: true },
      { name: 'StockQuantity', label: 'In Stock', type: 'INT', isPrimaryKey: false, isNullable: false, isEditable: true },
      { name: 'ManufactureDate', label: 'Mfg Date', type: 'DATE', isPrimaryKey: false, isNullable: true, isEditable: true },
    ]
  }
];

export const WORKFLOW_PHASES = [
  "Conceptualization",
  "Proposal Development and Approval for Submission",
  "Proposal Development and Endorsement",
  "Project Activation"
];

export const POOL_ITEMS = {
  Fields: [
    "RMO (Managing Mission)", "RMO (Impl. Mission)", "CoM (Managing Mission)", 
    "CoM (Impl. Mission)", "Endorser", "HQ", "Secondary Fin. Reviewer", 
    "CC", "Comments"
  ],
  Validations: [
    "TASK COMMENTS", "RMO Managing Mission", "RMO Implementing Mission",
    "COM Managing Mission", "COM Implementing Mission", "Financial Secondary Reviewer",
    "Check Pending Tasks"
  ],
  Procedures: [
    "ADD_COMMENT", "CREATE_TASK_RO", "ADD_RO_GROUP", "COMPLETE_TASK",
    "CREATE_TASK_RMOCOM", "REMOVE_PD_COPD", "ADD_COPD", "APPROVE_TASK", "REMOVE_RRMO"
  ],
  Actions: [
    "Send to RMO/COM", "Send to RMO", "Send to COM", "Send to PD",
    "Send to RO", "Send to HQ", "Send to Endorser"
  ]
};
