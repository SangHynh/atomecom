import mongoose from 'mongoose';
import appConfig from '@config/app.config.js';

/**
 * Connect to a test-specific database.
 * Appends a unique identifier to the base connection string to ensure isolation.
 */
export const connect = async () => {
  // Use the URI from config, but ensure we are using a unique DB for this test run if possible,
  // or rely on the fact that we clear it.
  // For better isolation in parallel tests, we might want a unique DB name.
  // However, app.config.js for 'test' env often sets a specific DB.
  // Let's assume sequential running or separate workers for now, or just append a random string if the URI allows.

  // Simple approach: Use the configured URI.
  // If you want unique DBs per test file, you'd modify the URI here.
  if (!appConfig || !appConfig.db || !appConfig.db.uri) {
    throw new Error('Database URI not configured in appConfig');
  }
  const uri = appConfig.db.uri;

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    // console.log(`Connected to test DB: ${uri}`);
  }
};

/**
 * Drop the database, close the connection.
 */
export const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
};

/**
 * Clear all data in the database.
 */
export const clearDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }
  }
};
