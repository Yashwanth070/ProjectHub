const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try connecting to the configured MongoDB URI first
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/project-portal';
    
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.log('⚠ Local MongoDB not available, starting in-memory database...');
    }

    // Fallback to in-memory MongoDB
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    
    const conn = await mongoose.connect(memUri);
    console.log(`✓ MongoDB In-Memory Server running at ${memUri}`);
    console.log('  ℹ Data will not persist between restarts');
    
    // Store reference for cleanup
    process.mongod = mongod;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB error: ${err.message}`);
});

module.exports = connectDB;
