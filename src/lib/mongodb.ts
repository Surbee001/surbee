import { MongoClient, Db, MongoClientOptions } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://202410988_db_user:GC3M6iOZYKDvsf4r@surbee.ossq9o9.mongodb.net/?appName=Surbee';

if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined');
}

/**
 * Connect to MongoDB and return cached connection
 */
export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
    } as MongoClientOptions);

    await client.connect();
    const db = client.db('surbee');

    // Ensure indexes exist
    await createIndexes(db);

    cachedClient = client;
    cachedDb = db;

    console.log('✅ Connected to MongoDB');
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Create necessary indexes for better query performance
 */
async function createIndexes(db: Db) {
  try {
    // Projects collection indexes
    const projectsCollection = db.collection('projects');
    await projectsCollection.createIndex({ user_id: 1 });
    await projectsCollection.createIndex({ status: 1 });
    await projectsCollection.createIndex({ created_at: -1 });

    // Survey responses collection indexes
    const responsesCollection = db.collection('survey_responses');
    await responsesCollection.createIndex({ survey_id: 1 });
    await responsesCollection.createIndex({ user_id: 1 });
    await responsesCollection.createIndex({ session_id: 1 });
    await responsesCollection.createIndex({ created_at: -1 });
    await responsesCollection.createIndex({ ip_address: 1 });

    // Chat messages collection indexes
    const messagesCollection = db.collection('chat_messages');
    await messagesCollection.createIndex({ project_id: 1, user_id: 1 });
    await messagesCollection.createIndex({ created_at: -1 });

    console.log('✅ MongoDB indexes created');
  } catch (error) {
    console.error('Warning: Error creating indexes:', error);
  }
}

/**
 * Get database instance
 */
export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

/**
 * Close MongoDB connection
 */
export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('✅ MongoDB connection closed');
  }
}
