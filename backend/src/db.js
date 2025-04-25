const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'to_do_list',
  password: 'Iury123.33',
  port: 5432,
});

module.exports = pool;
