import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    host: process.env.db_host,
    database: process.env.db_schema,
    port: process.env.db_port as number | undefined,
    user: process.env.db_user,
    max: 2
});

export default pool;
