import '@config/env';
import mongoose from 'mongoose';

export const initDatabase = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // enable use of findByIdAndUpdate() without deprecation
    useFindAndModify: false,
    // enable use of Schema.index() without deprecation
    useCreateIndex: true,
  });
};
