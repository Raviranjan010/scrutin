const mongoose = require('mongoose');

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/scrutin';
const AUTH_FAILURE_PATTERNS = [
  'Authentication failed',
  'bad auth',
  'auth failed',
  'MongoServerError: bad auth'
];

function isAuthFailure(error) {
  const message = String(error?.message || '');
  return AUTH_FAILURE_PATTERNS.some((pattern) => message.includes(pattern));
}

async function tryConnect(uri) {
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
}

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const allowLocalFallback = process.env.NODE_ENV !== 'production';

  try {
    if (mongoUri) {
      return await tryConnect(mongoUri);
    }
    console.warn(`MONGODB_URI is not set. Trying local MongoDB: ${DEFAULT_MONGO_URI}`);
    return await tryConnect(DEFAULT_MONGO_URI);
  } catch (error) {
    if (mongoUri && allowLocalFallback && isAuthFailure(error)) {
      try {
        console.warn('MongoDB auth failed for MONGODB_URI. Falling back to local MongoDB for development.');
        return await tryConnect(DEFAULT_MONGO_URI);
      } catch (fallbackError) {
        console.error('MongoDB connection failed.');
        console.error(`Remote reason: ${error.message}`);
        console.error(`Local fallback reason: ${fallbackError.message}`);
        console.error(`Start local MongoDB or fix Backend/.env MONGODB_URI credentials.`);
        process.exit(1);
      }
    }

    console.error('MongoDB connection failed.');
    console.error(`Reason: ${error.message}`);
    if (!mongoUri) {
      console.error(`Tried default local URI: ${DEFAULT_MONGO_URI}`);
      console.error('Set MONGODB_URI in Backend/.env if your database is hosted remotely.');
    } else {
      console.error('Check your MONGODB_URI in Backend/.env (credentials, host, and network access).');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
