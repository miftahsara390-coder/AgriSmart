/**
 * AgriSmart — DB Setup Script
 * Connects to PostgreSQL, creates agrismart_db if missing, then exits.
 */
require('dotenv').config();
const { Client } = require('pg');

const config = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT, 10) || 5432,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres', // connect to default DB first
};

const targetDB = process.env.DB_NAME || 'agrismart_db';

async function main() {
  const client = new Client(config);

  console.log(`\n🔌 Connecting to PostgreSQL at ${config.host}:${config.port} as "${config.user}"...`);

  try {
    await client.connect();
    console.log('✅ PostgreSQL 17 is running!\n');

    // Check if target DB exists
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDB]
    );

    if (res.rowCount === 0) {
      console.log(`📦 Database "${targetDB}" not found — creating it...`);
      await client.query(`CREATE DATABASE "${targetDB}"`);
      console.log(`✅ Database "${targetDB}" created successfully!\n`);
    } else {
      console.log(`✅ Database "${targetDB}" already exists.\n`);
    }

    // Verify we can connect to the target DB
    await client.end();
    const targetClient = new Client({ ...config, database: targetDB });
    await targetClient.connect();
    console.log(`✅ Connection to "${targetDB}" verified!\n`);
    await targetClient.end();

    console.log('🎉 Database setup complete. You can now run: npm start\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL is not running!');
      console.error('   Start it from Windows Services or run:');
      console.error('   net start postgresql-x64-17\n');
    } else if (err.code === '28P01') {
      console.error('\n💡 Wrong password for user postgres.');
      console.error('   Update DB_PASSWORD in your .env file.\n');
    }
    await client.end().catch(() => {});
    process.exit(1);
  }
}

main();
