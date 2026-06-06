const app = require('./src/app');
const config = require('./src/config/env');
const { logger } = require('./src/utils/logger');

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});


// Graceful shutdown — when the process receives a termination signal
// (e.g. Ctrl+C, or Render stopping the container), we:
// 1. Stop accepting new connections
// 2. Wait for in-flight requests to complete
// 3. Then exit cleanly
// This prevents dropped requests during deployments.
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
    process.exit(0);
  });
});