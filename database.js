const { Pool } = require('pg');


const pool = new Pool({
    host:'localhost',
    database:'community_users',
    port:5432,
});

module.exports = pool;