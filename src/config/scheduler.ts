export const schedulerConfig = {
  // processEvery: '1 hour',
  processEvery: '5 minutes',
  db: {
    address: process.env.MONGODB_URI,
    collection: 'agendaJobs',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};
