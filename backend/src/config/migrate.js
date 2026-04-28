/**
 * Database Migration Script
 * Runs the schema.sql file to create all tables
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./database');
const logger = require('../utils/logger');

const runMigration = async () => {
    try {
        logger.info('Starting database migration...');

        // Read schema file
        const schemaPath = path.join(__dirname, '../../..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await pool.query(schema);

        logger.info('Database migration completed successfully');
        logger.info('All tables, indexes, and triggers have been created');

        process.exit(0);
    } catch (error) {
        logger.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
