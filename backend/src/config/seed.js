/**
 * Database Seeding Script
 * Populates database with initial test data
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { pool } = require('./database');
const logger = require('../utils/logger');

const runSeeding = async () => {
    try {
        logger.info('Starting database seeding...');

        // First, hash the password properly
        const defaultPassword = 'Password@123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Read seed file
        const seedPath = path.join(__dirname, '../../..', 'database', 'seeds', '01_initial_data.sql');
        let seedSQL = fs.readFileSync(seedPath, 'utf8');

        // Replace the placeholder password hash with actual bcrypt hash
        seedSQL = seedSQL.replace(
            /\$2b\$10\$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y/g,
            hashedPassword
        );

        // Execute seed data
        await pool.query(seedSQL);

        logger.info('Database seeding completed successfully');
        logger.info('Test users created with password: Password@123');
        logger.info('Sample courses, enrollments, and data have been added');

        process.exit(0);
    } catch (error) {
        logger.error('Seeding failed:', error);
        process.exit(1);
    }
};

runSeeding();
