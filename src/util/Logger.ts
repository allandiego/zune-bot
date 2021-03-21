import ptBR, { format } from 'date-fns';
import chalk from 'chalk';

const DATE_FORMAT = 'yyyy-MM-dd H:m:s';

const logger = {
  log: (content: string): void => {
    const formatedDate = format(new Date(), DATE_FORMAT, { locale: ptBR });
    const timestamp = `[${formatedDate}]:`;

    console.log(`${timestamp} ${chalk.blue('LOG')} ${content}`);
  },
  warn: (content: string): void => {
    const formatedDate = format(new Date(), DATE_FORMAT, { locale: ptBR });
    const timestamp = `[${formatedDate}]:`;

    console.log(`${timestamp} ${chalk.yellow('WARN')} ${content}`);
  },
  error: (content: string): void => {
    const formatedDate = format(new Date(), DATE_FORMAT, { locale: ptBR });
    const timestamp = `[${formatedDate}]:`;

    console.log(`${timestamp} ${chalk.red('ERROR')} ${content}`);
  },
  debug: (content: string): void => {
    const formatedDate = format(new Date(), DATE_FORMAT, { locale: ptBR });
    const timestamp = `[${formatedDate}]:`;

    console.log(`${timestamp} ${chalk.green('DEBUG')} ${content}`);
  },
  cmd: (content: string): void => {
    const formatedDate = format(new Date(), DATE_FORMAT, { locale: ptBR });
    const timestamp = `[${formatedDate}]:`;

    console.log(`${timestamp} ${chalk.gray('CMD')} ${content}`);
  },
  ready: (content: string): void => {
    const formatedDate = format(new Date(), DATE_FORMAT, { locale: ptBR });
    const timestamp = `[${formatedDate}]:`;

    console.log(`${timestamp} ${chalk.green('READY')} ${content}`);
  },
  load: (content: string): void => {
    const formatedDate = format(new Date(), DATE_FORMAT, { locale: ptBR });
    const timestamp = `[${formatedDate}]:`;

    console.log(`${timestamp} ${chalk.magenta('LOAD')} ${content}`);
  },
  event: (content: string): void => {
    const formatedDate = format(new Date(), DATE_FORMAT, { locale: ptBR });
    const timestamp = `[${formatedDate}]:`;

    console.log(`${timestamp} ${chalk.cyan('EVENT')} ${content}`);
  },
};

export default logger;

// const log = (): void => {
//   const DATE_FORMAT = 'yyyy-MM-dd H:m:s';
//   const formatedDate = format(new Date(), DATE_FORMAT, { locale: ptBR });
//   const timestamp = `[${formatedDate}]:`;

//   function ready(content: string): void {
//     console.log(`${timestamp} ${chalk.green('READY')} ${content}`);
//   }

//   const logger = {
//     log: () =>
//       console.log(`${timestamp} ${chalk.blue(type.toUpperCase())} ${content}`),
//     warn: () =>
//       console.log(
//         `${timestamp} ${chalk.yellow(type.toUpperCase())} ${content}`,
//       ),
//     error: () =>
//       console.log(`${timestamp} ${chalk.red(type.toUpperCase())} ${content}`),
//     debug: () =>
//       console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content}`),
//     cmd: () =>
//       console.log(`${timestamp} ${chalk.gray(type.toUpperCase())} ${content}`),
//     ready: () =>
//       console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content}`),
//     load: () =>
//       console.log(
//         `${timestamp} ${chalk.magenta(type.toUpperCase())} ${content}`,
//       ),
//     event: () =>
//       console.log(`${timestamp} ${chalk.cyan(type.toUpperCase())} ${content}`),
//   };
// };

// export default log;
