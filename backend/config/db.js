const mongoose = require('mongoose');

const CLOUD_MONGO_URI =
  'mongodb+srv://saiyamrajput71:S%40aiyam11@cluster0.ebjm6v5.mongodb.net/skillforge?retryWrites=true&w=majority';
const LOCAL_MONGO_URI = 'mongodb://localhost:27017/SkillForgeAI';

/**
 * Resolves MongoDB URI based on environment:
 * - Deployed / production environments (Render, Vercel, Railway, NODE_ENV=production):
 *   Uses Cloud MongoDB Atlas URI.
 * - Localhost / local development:
 *   Uses local MongoDB URI (mongodb://localhost:27017/SkillForgeAI).
 */
const resolveMongoUri = () => {
  const isDeploy =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.RAILWAY_ENVIRONMENT) ||
    Boolean(process.env.FLY_APP_NAME) ||
    Boolean(process.env.HEROKU_APP_NAME);

  const envUri = process.env.MONGO_URI;

  if (isDeploy) {
    // In production/deployment: use explicit cloud MONGO_URI if valid remote URI, otherwise default to Cloud Atlas URI
    if (envUri && !envUri.includes('localhost') && !envUri.includes('127.0.0.1')) {
      return envUri;
    }
    return CLOUD_MONGO_URI;
  }

  // Local development: use MONGO_URI if provided, otherwise default to local MongoDB
  return envUri || LOCAL_MONGO_URI;
};

const connectDB = async () => {
  try {
    const uri = resolveMongoUri();
    const isCloud = uri.includes('mongodb+srv://') || !uri.includes('localhost');
    console.log(`Connecting to MongoDB (${isCloud ? 'Cloud Atlas' : 'Localhost'})...`);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
