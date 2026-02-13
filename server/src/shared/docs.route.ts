import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import path from 'path';
import express from 'express';
import YAML from 'yaml';

const docsRouter = express.Router();
const swaggerPath = path.join(process.cwd(), 'src/shared/configs/swagger.yaml');
const file = readFileSync(swaggerPath, 'utf8');
const swaggerDocument = YAML.parse(file);
const customOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    defaultModelExpandDepth: 0,
    defaultModelsExpandDepth: -1,
    responseInterceptor: (res: any) => {
      const contentType = res.headers['content-type'];
      res.headers = { 'content-type': contentType }; 
      return res;
    },
  },
  customSiteTitle: 'Atomecom API Documentation',
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .responses-wrapper .curl-command { display: none !important; }
    .swagger-ui .responses-wrapper .curl { display: none !important; }
    .swagger-ui .responses-wrapper .request-url { display: none !important; }
    .swagger-ui .responses-inner .response-col_description__inner > div:has(h5) {
      display: none !important;
    }
      .swagger-ui .responses-inner .response-col_description__inner h5,
    .swagger-ui .responses-inner .response-col_description__inner .microlight:has(.headerline) {
      display: none !important;
    }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { 
      font-size: 24px; 
      color: #1e293b; 
      font-weight: 700;
    }
    
    body { background-color: #ffffff; }
    .swagger-ui .scheme-container { 
      padding: 10px 0; 
      background: transparent; 
      box-shadow: none; 
      border-bottom: 1px solid #e2e8f0;
    }

    .swagger-ui .opblock { 
      border-radius: 8px; 
      border: 1px solid #f1f5f9 !important;
    }
    .swagger-ui .opblock .opblock-summary { border-bottom: none; }

    .swagger-ui .btn.authorize {
      border-radius: 6px;
      color: #6366f1;
      border-color: #6366f1;
    }
    .swagger-ui .btn.authorize svg { fill: #6366f1; }
  `,
};

docsRouter.use(
  '',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, customOptions),
);

export default docsRouter;
