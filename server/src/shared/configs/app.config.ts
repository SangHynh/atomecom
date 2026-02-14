/**
 * Application Configuration Module
 * Manages environment-specific settings for the application.
 */

interface Config {
  app: {
    port: number;
    host: string;
    version: string;
    _v: string;
  };
  db: {
    uri: string;
  };
  cache: {
    uri: string;
  };
}

// Development environment settings
const development: Config = {
  app: {
    port: Number(process.env.DEV_APP_PORT) || 3636,
    host: process.env.DEV_APP_HOST || 'localhost',
    version: '1.0.0',
    _v: 'v1',
  },
  db: {
    uri: process.env.DEV_DB_URI || 'mongodb://localhost:27017/dev_db',
  },
  cache: {
    uri: process.env.DEV_CACHE_URI || 'redis://localhost:6379/0',
  },
};

// Production environment settings
const production: Config = {
  app: {
    port: Number(process.env.PROD_APP_PORT) || 8080,
    host: process.env.PROD_APP_HOST || '0.0.0.0',
    version: '1.0.0',
    _v: 'v1',
  },
  db: {
    uri: process.env.PROD_DB_URI || '',
  },
  cache: {
    uri: process.env.PROD_CACHE_URI || '',
  },
};

// Test environment (uses same as development; DEV_DB_URI overridden by tests)
const test: Config = {
  ...development,
  db: { uri: process.env.DEV_DB_URI || 'mongodb://localhost:27017/test_db' },
};

// Map configurations to environment names
const configs: Record<string, Config> = {
  development,
  production,
  test,
};
export const NODE_ENV = process.env.NODE_ENV || 'development';
if (!(NODE_ENV in configs)) {
  throw new Error(
    `[Config Error]: Invalid NODE_ENV value: "${NODE_ENV}". Please check your environment variables.`,
  );
}

export default configs[NODE_ENV];
