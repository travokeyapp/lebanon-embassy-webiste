import { MongoClient, type Db } from "mongodb";

type GlobalWithMongo = typeof globalThis & {
  __embassyMongoClient?: Promise<MongoClient>;
};

const DEFAULT_DB_NAME = "lebanon_embassy";

// One client per process (re-used across hot reloads in dev and across
// invocations of a warm serverless function on Vercel).
function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  }

  const store = globalThis as GlobalWithMongo;
  if (!store.__embassyMongoClient) {
    const client = new MongoClient(uri, { maxPoolSize: 5 });
    store.__embassyMongoClient = client.connect().catch((error) => {
      // Do not cache a failed connection attempt.
      store.__embassyMongoClient = undefined;
      throw error;
    });
  }
  return store.__embassyMongoClient;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB || DEFAULT_DB_NAME);
}

// For one-off scripts, so the process can exit cleanly.
export async function closeDb(): Promise<void> {
  const store = globalThis as GlobalWithMongo;
  const pending = store.__embassyMongoClient;
  store.__embassyMongoClient = undefined;
  if (pending) {
    const client = await pending.catch(() => null);
    await client?.close();
  }
}
