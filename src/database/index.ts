import '@config/env';
import mongoose from 'mongoose';

class Database {
  mongoConnection: Promise<typeof mongoose>;

  constructor() {
    this.initMongo();
  }

  async initMongo() {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // enable use of findByIdAndUpdate() without deprecation
      useFindAndModify: false,
      // enable use of Schema.index() without deprecation
      useCreateIndex: true,
    });
  }
}

export default new Database();
