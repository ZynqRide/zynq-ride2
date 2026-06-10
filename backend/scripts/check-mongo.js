const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || null;

async function main() {
  if (!uri) {
    console.error('MONGODB_URI not set. Create backend/.env or set the MONGODB_URI env var.');
    process.exit(2);
  }

  try {
    const hostMatch = uri.match(/@([^/]+)/);
    console.log('Attempting MongoDB connection to host:', hostMatch ? hostMatch[1] : 'unknown');
    await mongoose.connect(uri);
    console.log('MongoDB connection successful');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

main();
