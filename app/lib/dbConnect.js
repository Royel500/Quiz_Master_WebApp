'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';

let cachedClient = null;
console.log(process.env.DB_USER);
function dbConnect(collectionName) {
  if (!collectionName) throw new Error('Collection name is required');

  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.DB_URL, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
  }

  return cachedClient.db(process.env.DB_USER).collection(collectionName);
}

export default dbConnect;
