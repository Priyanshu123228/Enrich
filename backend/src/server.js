import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env reliably from backend directory or CWD
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();
import app from './app.js';
import { connectDB } from './config/db.js';
import { verifyEmailTransporter } from './config/nodemailer.js';

const PORT = process.env.PORT || 5000;

/**
 * Start the backend server after establishing database connection
 */
const startServer = async () => {
  try {
    // Attempt DB connection
    await connectDB();

    // Start HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
      console.log(`📡 Health check available at: http://localhost:${PORT}/api/v1/health`);

      // Verify email transporter non-blockingly
      verifyEmailTransporter().catch((err) => {
        console.warn(`Email check warning: ${err.message}`);
      });
    });

    // Handle Unhandled Promise Rejections gracefully
    process.on('unhandledRejection', (reason, promise) => {
      console.error('⚠️ [Server Warning] Unhandled Promise Rejection:', reason);
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err) => {
      console.error('💥 [Server Critical] Uncaught Exception:', err);
    });
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
