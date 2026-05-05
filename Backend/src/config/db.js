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
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !mongoUri) {
    console.error('FATAL ERROR: MONGODB_URI is not set in production environment.');
    console.error('Please provide a valid MongoDB Atlas URI in your environment variables.');
    process.exit(1);
  }

  try {
    if (mongoUri) {
      return await tryConnect(mongoUri);
    }
    
    // In production, we should never reach here because of the check above.
    // In development/test, we fallback to local.
    console.warn(`MONGODB_URI is not set. Trying local MongoDB: ${DEFAULT_MONGO_URI}`);
    return await tryConnect(DEFAULT_MONGO_URI);
  } catch (error) {
    const allowLocalFallback = !isProduction;

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
    } else {
      console.error('\n--- Troubleshooting MongoDB Connection ---');
      console.error('1. Check if your IP address is whitelisted in MongoDB Atlas.');
      console.error('2. Verify the username and password in MONGODB_URI.');
      console.error('3. Ensure the cluster is running and accessible.');
      console.error('-------------------------------------------\n');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
