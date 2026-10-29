import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import mongoose from 'mongoose';
import { config } from './config.js';

let embedded = null;

// Connects to MONGODB_URI. In development without one, starts an embedded
// MongoDB so nothing needs installing. Its data lives in ~/.clock-it/mongo
// (override with EMBEDDED_DB_PATH); FAT32/exFAT drives can't hold it.
export async function connectDb() {
  let uri = config.mongoUri;

  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = process.env.EMBEDDED_DB_PATH || join(homedir(), '.clock-it', 'mongo');
    mkdirSync(dbPath, { recursive: true });
    embedded = await MongoMemoryServer.create({
      instance: { dbPath, storageEngine: 'wiredTiger', port: 27027, launchTimeout: 60_000 },
    });
    uri = embedded.getUri('clockit');
    console.log(`[db] No MONGODB_URI set, using embedded MongoDB (data in ${dbPath})`);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`[db] Connected to ${mongoose.connection.name}`);
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (embedded) await embedded.stop({ doCleanup: false });
}
