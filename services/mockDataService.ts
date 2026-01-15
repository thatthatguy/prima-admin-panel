
import { TableSchema, RecordData, TemporalRecord } from '../types';
import { SCHEMAS } from '../constants';

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const products = ['Quantum', 'Hyper', 'Nano', 'Pulse', 'Aero', 'Nova', 'Cyber', 'Titan', 'Flux', 'Solar'];
const suffixes = ['Pro', 'Max', 'Ultra', 'Elite', 'Lite', 'Plus', 'X', 'Prime', 'One', 'Core'];

const generateMockStore = () => {
  const store: Record<string, RecordData[]> = {
    employees: [],
    products: []
  };

  // Generate 100 Employees
  for (let i = 1; i <= 100; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    store.employees.push({
      EmployeeId: i,
      Name: `${fn} ${ln}`,
      Email: `${fn.toLowerCase()}.${ln.toLowerCase()}@enterprise.com`,
      Salary: Math.floor(Math.random() * 200000) + 50000,
      IsActive: Math.random() > 0.2,
      CreatedDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0]
    });
  }

  // Generate 100 Products
  for (let i = 1; i <= 100; i++) {
    const p = products[Math.floor(Math.random() * products.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    store.products.push({
      ProductId: crypto.randomUUID(),
      ProductName: `${p} ${s} ${i}`,
      Price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
      StockQuantity: Math.floor(Math.random() * 500),
      ManufactureDate: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString().split('T')[0]
    });
  }

  return store;
};

const mockStore = generateMockStore();
const mockHistory: Record<string, Record<string, TemporalRecord[]>> = {};

export const fetchData = async (tableId: string): Promise<RecordData[]> => {
  await new Promise(r => setTimeout(r, 400));
  return [...(mockStore[tableId] || [])];
};

export const fetchHistory = async (tableId: string, primaryKey: string): Promise<TemporalRecord[]> => {
  await new Promise(r => setTimeout(r, 500));
  return mockHistory[tableId]?.[primaryKey] || [];
};

export const createRecord = async (tableId: string, data: RecordData): Promise<RecordData> => {
  const schema = SCHEMAS.find(s => s.id === tableId);
  if (!schema) throw new Error("Table not found");

  const pkCol = schema.columns.find(c => c.isPrimaryKey);
  const newRecord = { ...data };

  if (pkCol) {
    if (pkCol.type === 'INT') {
      const maxId = Math.max(...mockStore[tableId].map(r => r[pkCol.name] as number), 0);
      newRecord[pkCol.name] = maxId + 1;
    } else if (pkCol.type === 'UNIQUEIDENTIFIER') {
      newRecord[pkCol.name] = crypto.randomUUID();
    }
  }

  mockStore[tableId].unshift(newRecord);
  return newRecord;
};

export const updateRecord = async (tableId: string, pkValue: string | number, data: RecordData): Promise<RecordData> => {
  const schema = SCHEMAS.find(s => s.id === tableId);
  const pkCol = schema?.columns.find(c => c.isPrimaryKey)?.name;
  if (!pkCol) throw new Error("PK not found");

  const index = mockStore[tableId].findIndex(r => r[pkCol] === pkValue);
  if (index === -1) throw new Error("Record not found");

  if (!mockHistory[tableId]) mockHistory[tableId] = {};
  if (!mockHistory[tableId][String(pkValue)]) mockHistory[tableId][String(pkValue)] = [];
  
  const current = mockStore[tableId][index];
  mockHistory[tableId][String(pkValue)].push({
    ...current,
    ValidFrom: new Date(Date.now() - 86400000).toISOString(),
    ValidTo: new Date().toISOString(),
    VersionId: `v${Math.random().toString(36).substr(2, 5)}`
  } as TemporalRecord);

  mockStore[tableId][index] = { ...current, ...data };
  return mockStore[tableId][index];
};

export const deleteRecord = async (tableId: string, pkValue: string | number): Promise<void> => {
  const schema = SCHEMAS.find(s => s.id === tableId);
  const pkCol = schema?.columns.find(c => c.isPrimaryKey)?.name;
  if (!pkCol) return;

  mockStore[tableId] = mockStore[tableId].filter(r => r[pkCol] !== pkValue);
};

export const restoreRecord = async (tableId: string, pkValue: string | number, historicalData: RecordData): Promise<RecordData> => {
  return updateRecord(tableId, pkValue, historicalData);
};
