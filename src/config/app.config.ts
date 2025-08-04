import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'Gurtar',
  workingDirectory: process.env.PWD || process.cwd(),
  frontendDomain: process.env.FRONTEND_DOMAIN,
  backendDomain: process.env.BACKEND_DOMAIN || 'http://localhost:3000',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en',
  headerLanguage: process.env.HEADER_LANGUAGE || 'x-custom-lang',
}));
