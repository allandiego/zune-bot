import chalk from 'chalk';
import ptBR, { format } from 'date-fns';

import { ILogger, leveType } from './ILogger';

export class ChalkLogger implements ILogger {
  private DATE_FORMAT = 'yyyy-MM-dd H:m:s';

  levelColor(level: leveType): string {
    const COLOR = {
      error: chalk.red('ERROR'),
      warn: chalk.yellow('WARN'),
      info: chalk.blue('INFO'),
      http: chalk.magenta('HTTP'),
      verbose: chalk.gray('VERBOSE'),
      debug: chalk.green('DEBUG'),
      silly: chalk.cyan('SILLY'),
    };

    return COLOR[level];
  }

  log(level: leveType, message: string, ...meta: any[]): void {
    const formatedDate = format(new Date(), this.DATE_FORMAT, { locale: ptBR });
    const timestamp = `[${formatedDate}]:`;

    console.log(`${timestamp} ${this.levelColor(level)} ${message}`);
  }
}
