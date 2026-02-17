import helmet from 'helmet';
import { isDev } from '@shared/utils/common.js';

const devConfig = {
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        'https://accounts.google.com/gsi/client',
        'https://connect.facebook.net',
      ],
      'connect-src': [
        "'self'",
        'https://accounts.google.com/gsi/',
        'https://www.facebook.com',
      ],
      'frame-src': [
        "'self'",
        'https://accounts.google.com/gsi/',
        'https://www.facebook.com',
        'https://web.facebook.com',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://accounts.google.com/gsi/style',
      ],
      'img-src': ["'self'", 'data:', 'https://www.facebook.com'],
    },
  },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' as const },
  crossOriginEmbedderPolicy: false,
};

export const helmetMiddleware = isDev ? helmet(devConfig) : helmet();
