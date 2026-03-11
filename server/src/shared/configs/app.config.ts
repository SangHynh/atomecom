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
    isProduction: boolean;
  };
  db: {
    uri: string;
  };
  cache: {
    uri: string;
  };
  security: {
    cors: {
      allowedOrigins: string[];
    };
    jwt: {
      accessSecret: string;
      refreshSecret: string;
      accessExpires: string;
      refreshExpires: string;
    };
    oauth: {
      googleClientId: string;
      facebookAppId: string;
    };
    hash: {
      saltRounds: number;
    };
  };
  email: {
    apiKey: string;
    fromEmail: string;
    clientHost: string;
    projectName: string;
    logoUrl: string;
  };
}

// Development environment settings
const development: Config = {
  app: {
    port: Number(process.env.DEV_APP_PORT) || 3636,
    host: process.env.DEV_APP_HOST || 'localhost',
    version: '1.0.0',
    _v: 'v1',
    isProduction: false,
  },
  db: {
    uri: process.env.DEV_DB_URI || 'mongodb://localhost:27017/dev_db',
  },
  cache: {
    uri: process.env.DEV_CACHE_URI || 'redis://localhost:6379/0',
  },
  security: {
    cors: {
      allowedOrigins: [
        'http://localhost:3000',
        'http://localhost:8386',
        'http://localhost:5173',
        'http://localhost:5500',
      ],
    },
    jwt: {
      accessSecret: process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret',
      refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret',
      accessExpires: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      refreshExpires: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    },
    oauth: {
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      facebookAppId: process.env.FACEBOOK_APP_ID || '',
    },
    hash: {
      saltRounds: Number(process.env.SALT_ROUNDS) || 10,
    },
  },
  email: {
    apiKey: process.env.EMAIL_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    clientHost: process.env.CLIENT_HOST || 'http://localhost:3000',
    projectName: process.env.PROJECT_NAME || 'Atomecom',
    logoUrl: process.env.EMAIL_LOGO_URL || '',
  },
};

// Production environment settings
const production: Config = {
  app: {
    port: Number(process.env.PROD_APP_PORT) || 8080,
    host: process.env.PROD_APP_HOST || '0.0.0.0',
    version: '1.0.0',
    _v: 'v1',
    isProduction: true,
  },
  db: {
    uri: process.env.PROD_DB_URI || '',
  },
  cache: {
    uri: process.env.PROD_CACHE_URI || '',
  },
  security: {
    cors: {
      allowedOrigins: (process.env.PROD_CORS_ORIGIN || '').split(','),
    },
    jwt: {
      accessSecret: process.env.ACCESS_TOKEN_SECRET || '',
      refreshSecret: process.env.REFRESH_TOKEN_SECRET || '',
      accessExpires: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      refreshExpires: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    },
    oauth: {
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      facebookAppId: process.env.FACEBOOK_APP_ID || '',
    },
    hash: {
      saltRounds: Number(process.env.SALT_ROUNDS) || 10,
    },
  },
  email: {
    apiKey: process.env.EMAIL_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || '',
    clientHost: process.env.CLIENT_HOST || '',
    projectName: process.env.PROJECT_NAME || 'Atomecom',
    logoUrl: process.env.EMAIL_LOGO_URL || '',
  },
};

// Test environment (uses same as development; DEV_DB_URI overridden by tests)
const test: Config = {
  ...development,
  db: { uri: process.env.TEST_DB_URI || 'mongodb://localhost:27017/test_db' },
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
