import { ILog, leveType } from './ILog';
import { ILogger } from './ILogger';

export class AppLogger implements ILog {
  constructor(private readonly logger: ILogger) {}

  log(level: leveType, message: string, ...meta: any[]): void {
    this.logger.log(level, message, ...meta);
  }
}
