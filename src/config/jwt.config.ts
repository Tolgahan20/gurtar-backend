import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessToken: {
    secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'access-secret',
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh-secret',
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
}));
