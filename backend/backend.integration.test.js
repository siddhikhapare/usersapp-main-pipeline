//const { Pool } = require('pg');
const { pool , getUsers, getUserById, createUser, updateUser, deleteUser } = require('./user');

// Use test database configuration
// const testPool = new Pool({
//   user: process.env.POSTGRES_USER || 'myuser',
//   host: process.env.POSTGRES_HOST || 'localhost',
//   database: process.env.POSTGRES_DB || 'users_database',
//   password: process.env.POSTGRES_PASSWORD || 'passwd',
//   port: process.env.DB_PORT || 5432,
// });

describe('Backend Integration Tests', () => {
  beforeAll(async () => {
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE
      )
    `);
  });

  beforeEach(async () => {
    // Clean database before each test
    await pool.query('DELETE FROM users');
    await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  });

  afterAll(async () => {
    // Clean up and close connection
    await pool.query('DELETE FROM users');
    await pool.end();
  });

  describe('User CRUD Operations', () => {
    it('should create a new user', async () => {
      const user = await createUser('John Doe', 'john@example.com');
      
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });

    it('should get all users', async () => {
      await createUser('User 1', 'user1@example.com');
      await createUser('User 2', 'user2@example.com');
      
      const users = await getUsers();
      
      expect(users).toBeDefined();
      expect(users.length).toBe(2);
      expect(users[0].name).toBe('User 1');
      expect(users[1].name).toBe('User 2');
    });

    it('should get user by id', async () => {
      const createdUser = await createUser('Test User', 'test@example.com');
      
      const user = await getUserById(createdUser.id);
      
      expect(user).toBeDefined();
      expect(user.id).toBe(createdUser.id);
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
    });

    it('should return undefined for non-existent user', async () => {
      const user = await getUserById(9999);
      
      expect(user).toBeUndefined();
    });

    it('should update a user', async () => {
      const createdUser = await createUser('Original Name', 'original@example.com');
      
      const updatedUser = await updateUser(createdUser.id, 'Updated Name', 'updated@example.com');
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser.id).toBe(createdUser.id);
      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe('updated@example.com');
    });

    it('should delete a user', async () => {
      const createdUser = await createUser('To Delete', 'delete@example.com');
      
      const deletedUser = await deleteUser(createdUser.id);
      
      expect(deletedUser).toBeDefined();
      expect(deletedUser.id).toBe(createdUser.id);
      
      // Verify user is deleted
      const user = await getUserById(createdUser.id);
      expect(user).toBeUndefined();
    });

    it('should handle duplicate email constraint', async () => {
      await createUser('User 1', 'duplicate@example.com');
      
      await expect(createUser('User 2', 'duplicate@example.com')).rejects.toThrow();
    });

    it('should handle updating to duplicate email', async () => {
      const user1 = await createUser('User 1', 'user1@example.com');
      await createUser('User 2', 'user2@example.com');
      
      await expect(updateUser(user1.id, 'User 1 Updated', 'user2@example.com')).rejects.toThrow();
    });
  });

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      const client = await pool.connect();
      expect(client).toBeDefined();
      client.release();
    });

    it('should execute query successfully', async () => {
      const result = await pool.query('SELECT NOW()');
      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBe(1);
    });
  });
});