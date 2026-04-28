/**
 * Database Configuration and Connection Pool
 * PostgreSQL connection using pg library
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database configuration
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'university_system',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
};

// Create connection pool
const pool = new Pool(config);

// Pool error handler
pool.on('error', (err, client) => {
    logger.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Pool connection handler
pool.on('connect', () => {
    logger.debug('New client connected to database');
});

// Pool removal handler
pool.on('remove', () => {
    logger.debug('Client removed from pool');
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV === 'development') {
            logger.debug('Executed query', {
                text,
                duration: `${duration}ms`,
                rows: result.rowCount
            });
        }
        
        return result;
    } catch (error) {
        logger.error('Database query error:', {
            text,
            error: error.message
        });
        throw error;
    }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} Database client
 */
const getClient = async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
        logger.error('A client has been checked out for more than 5 seconds!');
    }, 5000);

    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
        client.lastQuery = args;
        return query.apply(client, args);
    };

    // Monkey patch the release method to clear our timeout
    client.release = () => {
        clearTimeout(timeout);
        // Set the methods back to their old un-monkey-patched version
        client.query = query;
        client.release = release;
        return release.apply(client);
    };

    return client;
};

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Callback function that receives client
 * @returns {Promise} Transaction result
 */
const transaction = async (callback) => {
    const client = await getClient();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Close all connections in the pool
 */
const closePool = async () => {
    await pool.end();
    logger.info('Database pool closed');
};

module.exports = {
    query,
    getClient,
    transaction,
    closePool,
    pool
};
