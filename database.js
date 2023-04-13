const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.db_host,
    database: process.env.db_schema,
    port: process.env.db_port,
    user: process.env.db_user,
});

module.exports = pool;