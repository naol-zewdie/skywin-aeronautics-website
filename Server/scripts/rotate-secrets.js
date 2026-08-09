const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(dbUrl);
  console.log('Connected to MongoDB.');

  console.log('Bumping tokenVersion for all users to invalidate existing sessions...');
  const result = await mongoose.connection.collection('users').updateMany(
    {},
    { $inc: { tokenVersion: 1 } }
  );

  console.log(`Successfully updated ${result.modifiedCount} users.`);
  
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Secrets rotation complete. You must also update JWT_SECRET and JWT_REFRESH_SECRET in your .env files and restart the server.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
