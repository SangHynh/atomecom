/**
 * Application Configuration Module
 * Manages environment-specific settings for the application.
 */

interface Config {
  app: {
    port: number;
    host: string;
  };
  db: {
    uri: string;
  };
}

// Development environment settings
const development: Config = {
  app: {
    port: Number(process.env.DEV_APP_PORT) || 5000,
    host: process.env.DEV_APP_HOST || 'localhost',
  },
  db: {
    uri: process.env.DEV_DB_URI || 'mongodb://localhost:27017/dev_db',
  },
};

// Production environment settings
const production: Config = {
  app: {
    port: Number(process.env.PROD_APP_PORT) || 8080,
    host: process.env.PROD_APP_HOST || '0.0.0.0',
  },
  db: {
    uri: process.env.PROD_DB_URI || '',
  },
};

// Map configurations to environment names
const configs: Record<string, Config> = {
  development,
  production,
};
export const NODE_ENV = process.env.NODE_ENV || 'development';
if (!(NODE_ENV in configs)) {
  throw new Error(
    `[Config Error]: Invalid NODE_ENV value: "${NODE_ENV}". Please check your environment variables.`,
  );
}

export default configs[NODE_ENV];
