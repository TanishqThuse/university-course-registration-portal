/**
 * Database Migration Script
 * Runs the schema.sql file to create all tables
 * Splits statements to handle PL/pgSQL $$ blocks properly
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./database');
const logger = require('../utils/logger');

/**
 * Splits SQL into individual statements, correctly handling PL/pgSQL $$ blocks
 */
function splitSqlStatements(sql) {
    const statements = [];
    let current = '';
    let inDollarQuote = false;
    let dollarTag = '';

    const lines = sql.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip pure comment lines and blank lines when not building a statement
        if (!current && (trimmed.startsWith('--') || trimmed === '')) {
            continue;
        }

        current += line + '\n';

        // Detect opening/closing of dollar-quoted blocks (e.g. $$ ... $$)
        const dollarMatches = [...line.matchAll(/\$\w*\$/g)];
        for (const match of dollarMatches) {
            if (!inDollarQuote) {
                inDollarQuote = true;
                dollarTag = match[0];
            } else if (match[0] === dollarTag) {
                inDollarQuote = false;
                dollarTag = '';
            }
        }

        // Only split on semicolons that are outside dollar-quoted blocks
        if (!inDollarQuote && trimmed.endsWith(';')) {
            const stmt = current.trim();
            if (stmt && stmt !== ';') {
                statements.push(stmt);
            }
            current = '';
        }
    }

    if (current.trim()) {
        statements.push(current.trim());
    }

    return statements;
}

const runMigration = async () => {
    const client = await pool.connect();
    try {
        logger.info('Starting database migration...');

        const schemaPath = path.join(__dirname, '../../..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        const statements = splitSqlStatements(schema);
        logger.info(`Found ${statements.length} SQL statements to execute`);

        await client.query('BEGIN');

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            try {
                await client.query(stmt);
            } catch (err) {
                // Log and skip DROP IF EXISTS errors (table may not exist yet)
                if (stmt.toUpperCase().startsWith('DROP') && err.code === '42P01') {
                    logger.info(`Skipping DROP (table does not exist): ${stmt.substring(0, 60)}...`);
                } else {
                    logger.error(`Failed at statement ${i + 1}: ${stmt.substring(0, 120)}`);
                    throw err;
                }
            }
        }

        await client.query('COMMIT');

        logger.info('Database migration completed successfully');
        logger.info('All tables, indexes, and triggers have been created');
        process.exit(0);
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Migration failed:', error);
        process.exit(1);
    } finally {
        client.release();
    }
};

runMigration();
