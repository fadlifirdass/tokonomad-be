import app from './app';
import { initializeDatabase, checkDatabaseConnection, closeDatabasePool } from './config/database';

const PORT = process.env.PORT || 3001;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    await closeDatabasePool();
    console.log('✅ Database connections closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    // Check database connection (optional for development)
    console.log('🔍 Checking database connection...');
    const isDbConnected = await checkDatabaseConnection();

    if (!isDbConnected) {
      console.warn('⚠️  Database connection failed. Running without database.');
      console.warn('   API endpoints requiring database will not work.');
    } else {
      console.log('✅ Database connection successful');

      // Initialize database tables
      console.log('🔧 Initializing database tables...');
      try {
        await initializeDatabase();
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
      }
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║       🚀 TOKONOMAD API SERVER IS RUNNING 🚀          ║
║                                                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Port:        ${PORT}                                   ║
║   URL:         http://localhost:${PORT}                  ║
║                                                       ║
║   📚 API Documentation:                               ║
║   - Health:        GET  /api/health                   ║
║   - Transactions:  POST /api/transactions             ║
║   - Transactions:  GET  /api/transactions             ║
║   - Transaction:   GET  /api/transactions/:id         ║
║   - Webhook:       POST /api/webhooks/xendit          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
