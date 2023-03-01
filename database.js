const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host:'localhost',
    database:'community_users',
    port:process.env.db_port,
});

module.exports = pool;