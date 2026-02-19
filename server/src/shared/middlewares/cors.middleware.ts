import cors from 'cors';
import appConfig from '@shared/configs/app.config.js';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowed = appConfig?.security?.cors?.allowedOrigins || [];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Check if origin is allowed or if wildcard is present
    if (allowed.includes('*') || allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
});
