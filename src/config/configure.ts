import dotenv from 'dotenv';
import { resolve } from 'path';

export const envPath = resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

export default process.env;
