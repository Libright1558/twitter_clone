import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({
    host: process.env.db_host,
    database: process.env.db_schema,
    port: process.env.db_port,
    user: process.env.db_user,
});

export default pool;