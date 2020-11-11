// fix import 'dotenv/config'; not working with babel
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });
