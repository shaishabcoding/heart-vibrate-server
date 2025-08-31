import { GridFSBucket, MongoClient } from 'mongodb';
import colors from 'colors';
import config from '../../config';
import { logger } from '../logger/logger';

let client: MongoClient | null = null;
let bucket: GridFSBucket | null = null;

export default async function connectDB() {
  client ??= new MongoClient(config.url.database);

  logger.info(colors.green('🚀 Database connecting...'));
  await client.connect();
  logger.info(colors.green('🚀 Database connected successfully'));

  bucket ??= new GridFSBucket(client.db(), { bucketName: 'files' });
}

export const getBucket = () => bucket;
