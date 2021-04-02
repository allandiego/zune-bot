// interface Job {}

export interface SchedulerProvider {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  // getJobs: (jobName: string) => Promise<Job>;
  // startJob: (jobName: string) => Promise<void>;
  // stoptJob: (jobName: string) => Promise<void>;
  // createJob: (
  //   jobName: string,
  //   handler: (job: any, cb: any) => Promise<void>,
  // ) => Promise<void>;
  // deleteJob: (jobName: string) => Promise<void>;
}
