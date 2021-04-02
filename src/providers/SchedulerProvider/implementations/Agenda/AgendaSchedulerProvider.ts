// import { Agenda, AgendaConfig } from 'agenda';
import Agenda from 'agenda';

import { SchedulerProvider } from '@providers/SchedulerProvider/protocols/SchedulerProvider';
import { validadeSubscribersJob } from './jobs';

// CRON Format
// +----------------- Seconds           (range: 0-59)
// |  +-------------- Minutes           (range: 0-59)
// |  |  +----------- Hours             (range: 0-23)
// |  |  |  +-------- Day of Month      (range: 1-31)
// |  |  |  |  +----- Months            (range: 0-11, 0 standing for Jan)
// |  |  |  |  |  +-- Day of Week       (range: 0-6, 0 standing for Sun)
// |  |  |  |  |  |
// *  *  *  *  *  *

export class AgendaSchedulerProvider implements SchedulerProvider {
  private agenda: Agenda;

  constructor(private config: Agenda.AgendaConfiguration) {
    this.agenda = new Agenda(this.config);
  }

  async start(): Promise<void> {
    try {
      this.agenda.define('validade-subscribers', async (job, cb) => {
        await validadeSubscribersJob();
        // job.repeatEvery('00 03 * * * *', {
        //   timezone: 'America/Sao_Paulo',
        // });
        // job.repeatAt('3:30pm');
        // await job.save();
      });

      await this.agenda.start();

      const dailySubscribersValidation = this.agenda.create(
        'validade-subscribers',
        {},
      );

      await dailySubscribersValidation
        .repeatEvery('00 00 03 * * *', {
          timezone: 'America/Sao_Paulo',
        })
        .save();

      // await dailySubscribersValidation.run();
      // await agenda.every('12 hours', ['validade-subscribers'], {}, {});
      // await agenda.every('*/3 * * * *', 'validade-subscribers');

      // agenda.on('start', job => {
      //   console.log('Job %s starting', job.attrs.name);
      // });

      // agenda.on('complete', job => {
      //   console.log(`Job ${job.attrs.name} finished`);
      // });

      // agenda.on('success:send email', job => {
      //   console.log(`Sent Email Successfully to ${job.attrs.data.to}`);
      // });

      // agenda.on('fail:send email', (err, job) => {
      //   console.log(`Job failed with error: ${err.message}`);
      // });
    } catch (error) {
      console.log(error);
    }
  }

  async stop(): Promise<void> {
    await this.agenda.stop();
  }
}
