export type leveType =
  | 'error'
  | 'warn'
  | 'info'
  | 'http'
  | 'verbose'
  | 'debug'
  | 'silly';

export interface ILog {
  log: (level: leveType, message: string, ...meta: any[]) => void;
}
