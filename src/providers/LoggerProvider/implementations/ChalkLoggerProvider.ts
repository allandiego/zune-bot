import chalk from 'chalk';
import ptBR, { format } from 'date-fns';

import { LoggerProvider, logLeveType } from '../protocols/LoggerProvider';

export class ChalkLoggerProvider implements LoggerProvider {
  private DATE_FORMAT = 'yyyy-MM-dd H:m:s';

  levelColor(level: logLeveType): string {
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

  log(level: logLeveType, message: string, ...meta: any[]): void {
    const formatedDate = format(new Date(), this.DATE_FORMAT, { locale: ptBR });
    const timestamp = `[${formatedDate}]:`;

    console.log(`${timestamp} ${this.levelColor(level)} ${message}`);
  }
}
