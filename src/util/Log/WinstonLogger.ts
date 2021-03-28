import { createLogger, format, transports } from 'winston';
// import 'winston-daily-rotate-file';
import { ILogger, leveType } from './ILogger';

const { combine, timestamp, label, printf } = format;

export class WinstonLogger implements ILogger {
  private logConsoleFormat = printf(
    ({
      level: logLevel,
      message: logMessage,
      label: logLabel,
      timestamp: logTimestamp,
    }) => {
      return `${logTimestamp} [${logLabel}] ${logLevel.toUpperCase()}: ${logMessage}`;
    },
  );

  private logFileFormat = printf(
    ({ level: logLevel, message: logMessage, timestamp: logTimestamp }) => {
      return `${logTimestamp} [${logLevel.toUpperCase()}]: ${logMessage}`;
    },
  );

  winstonLogger = createLogger({
    level: process.env.NODE_ENV !== 'production' ? 'verbose' : 'info',
    // format: winston.format.json(),
    // defaultMeta: { service: 'user-service' },
    format: combine(timestamp(), this.logFileFormat),
    // format: format.printf(log => {
    //   const DATE_FORMAT = 'yyyy-MM-dd H:m:s';
    //   const formatedDate = formatFns(new Date(), DATE_FORMAT, { locale: ptBR });
    //   const timestamp = `[${formatedDate}]:`;
    //   return `[${log.level.toUpperCase()}] - ${log.message}`;
    // }),
    // exceptionHandlers: [
    //   new transports.File({ dirname: 'log', filename: 'log-exceptions.log' }),
    // ],
    transports:
      process.env.NODE_ENV === 'production'
        ? [
            new transports.File({
              dirname: 'log',
              filename: 'log-error.log',
              level: 'error',
              // options: { flags: 'w' }, // replace file
            }),

            new transports.File({
              dirname: 'log',
              filename: 'log-combined.log',
              // options: { flags: 'w' }, // replace file
            }),
            // new transports.DailyRotateFile({
            //   dirname: 'log',
            //   filename: 'log-error.log',
            //   level: 'error',
            //   // options: { flags: 'w' },
            // }),

            // new transports.DailyRotateFile({
            //   dirname: 'log',
            //   filename: 'log-combined.log',
            //   // options: { flags: 'w' },
            // }),
          ]
        : [
            new transports.Console({
              format: combine(
                label({ label: 'BOT' }),
                timestamp(),
                this.logConsoleFormat,
              ),
              // format: format.simple(),
            }),

            new transports.File({
              dirname: 'log',
              filename: 'log-error.log',
              level: 'error',
            }),

            new transports.File({
              dirname: 'log',
              filename: 'log-combined.log',
            }),
          ],
  });

  log(level: leveType, message: string, ...meta: any[]): void {
    this.winstonLogger.log(level, message, ...meta);
  }
}
