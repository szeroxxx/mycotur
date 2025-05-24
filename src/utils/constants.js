/**
 * Environment variables from .env file for easy access
 */
export const ENV = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'mycotur-secret-key',
  NEXTAUTH_BACKEND_URL: process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:3500',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500',
};

/**
 * API endpoints
 */
export const API = {
  BASE_URL: ENV.NEXT_PUBLIC_API_URL,
  IMAGE_URL: `${ENV.NEXT_PUBLIC_API_URL}/api/image`,
};