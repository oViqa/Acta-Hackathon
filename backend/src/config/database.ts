import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB || 'puddingmeetup';

    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db(dbName);

    // Ensure geospatial index for event location
    await db.collection('events').createIndex({ location: '2dsphere' });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
}

export async function disconnectDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB disconnected');
  }
}
