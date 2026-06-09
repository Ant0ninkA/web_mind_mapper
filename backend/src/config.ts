import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/mindmapper',
  useMongo: process.env.USE_MONGO === 'true',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: required('JWT_SECRET'),
  jwtTtlHours: parseInt(process.env.JWT_TTL_HOURS ?? '24', 10),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
};

export const isProduction = config.nodeEnv === 'production';
