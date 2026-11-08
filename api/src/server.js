import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), 'api/.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const { default: app } = await import('./app.js');
const { connectDB } = await import('./config/db.js');

const PORT = process.env.PORT || 5000;

// Catch synchronous exceptions before crash
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err.message, err.stack);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Initial MongoDB connection error (server running in degraded mode):', err.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Express API server running on port ${PORT}`);
    console.log(`🩺 Healthcheck endpoints: http://localhost:${PORT}/api/health & http://localhost:${PORT}/health`);
    console.log(`🛡️  Security layers initialized: Helmet, RateLimiting, CORS, NoSQL/XSS Sanitizer`);
  });

  // Handle unhandled Promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
      process.exit(1);
    });
  });

  // Graceful shutdown on SIGTERM / SIGINT
  const handleShutdown = (signal) => {
    console.log(`Received ${signal}. Gracefully closing HTTP server...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
