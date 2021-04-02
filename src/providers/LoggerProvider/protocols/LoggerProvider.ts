export type logLeveType =
  | 'error'
  | 'warn'
  | 'info'
  | 'http'
  | 'verbose'
  | 'debug'
  | 'silly';

export interface LoggerProvider {
  log: (level: logLeveType, message: string, ...meta: any[]) => void;
}
