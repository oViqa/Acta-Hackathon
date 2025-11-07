import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  // Check for MONGODB_URI at runtime, not at module load time
  // This allows the build to succeed even if MONGODB_URI is not set
  const MONGODB_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI || '';

  if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in your environment variables');
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

