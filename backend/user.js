const { Pool } = require('pg');
require('dotenv').config({ path: './env'});

const pool = new Pool({
  user: process.env.POSTGRES_USER,      
  host: process.env.POSTGRES_HOST,         
  database: process.env.POSTGRES_DB,  
  password: String(process.env.POSTGRES_PASSWORD),   
  port: process.env.DB_PORT || 5432,
});

pool.on('error', (err) => {
   console.error('Unexpected error on idle PostgreSQL client:', err.message); 
});

if(process.env.NODE_ENV !== 'test'){
  pool.connect()
  .then(client => {
    console.log('Database connected successfully');
    client.release(); // Release the client back to the pool
  })
  .catch(err => {
    console.error('Error connecting to the database:', err.stack);
  });
}

const getUsers = async () => {
  const res = await pool.query('SELECT * FROM users ORDER BY id ASC');
  return res.rows;
};

const getUserById = async (id) => {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0];
};

const createUser = async (name, email) => {
  const res = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );
  return res.rows[0];
};

const updateUser = async (id, name, email) => {
  const res = await pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
    [name, email, id]
  );
  return res.rows[0];
};

const deleteUser = async (id) => {
  const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
};

module.exports = {
  pool,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};