import { Sequelize } from 'sequelize';
import 'dotenv/config';

const requiredEnvVars = [
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
];

const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingVars.join(', ')}`
  );
  console.error(
    '   Make sure your .env file exists and is correctly configured.'
  );
  process.exit(1);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',

    // Keep terminal clean: no SQL queries
    logging: false,

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  console.log(
    `🔌 Connecting to PostgreSQL at ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}` +
      ` → database: "${process.env.DB_NAME}" as user "${process.env.DB_USER}"`
  );

  try {
    await sequelize.authenticate();

    console.log('✅ PostgreSQL connected via Sequelize');

    if (process.env.NODE_ENV !== 'test') {
      await sequelize.sync({
        alter: process.env.NODE_ENV === 'development',
      });

      console.log('✅ Database synchronized');
    }
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error(`   Message : ${error.message}`);

    if (error.original) {
      console.error(`   Code    : ${error.original.code}`);
      console.error(
        `   Detail  : ${error.original.detail || error.original.message}`
      );
    }

    console.error('\n💡 Troubleshooting tips:');
    console.error(
      '   • Is PostgreSQL running? → docker compose up postgres -d'
    );
    console.error(
      `   • Does the database exist? → CREATE DATABASE ${process.env.DB_NAME};`
    );
    console.error(
      '   • Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in your .env\n'
    );

    process.exit(1);
  }
};

export { sequelize, connectDB };
export default sequelize;