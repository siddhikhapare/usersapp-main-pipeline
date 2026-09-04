const request = require('supertest');
const express = require('express');
const userService = require('./user');
const cors = require('cors');

// Mock the user service
jest.mock('./user');

// Create a test app
const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Test API
  app.get('/test', (req, res) => {
    try {
      res.status(200).json({ message: 'API is working' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  // Get all users
  app.get('/users', async (req, res) => {
    try {
      const users = await userService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user by id
  app.get('/users/:id', async (req, res) => {
    try {
      const user = await userService.getUserById(parseInt(req.params.id, 10));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create user
  app.post('/users', async (req, res) => {
    try {
      const user = await userService.createUser(req.body.name, req.body.email);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user
  app.put('/users/:id', async (req, res) => {
    try {
      const user = await userService.updateUser(
        parseInt(req.params.id, 10),
        req.body.name,
        req.body.email
      );
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete user
  app.delete('/users/:id', async (req, res) => {
    try {
      const user = await userService.deleteUser(parseInt(req.params.id, 10));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return app;
};

describe('Backend API Unit Tests', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  describe('GET /test', () => {
    it('should return API is working message', async () => {
      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'API is working' });
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'healthy' });
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ];
      userService.getUsers.mockResolvedValue(mockUsers);

      const response = await request(app).get('/users');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(userService.getUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when fetching users', async () => {
      userService.getUsers.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/users');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Database error' });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      userService.getUserById.mockResolvedValue(mockUser);

      const response = await request(app).get('/users/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(userService.getUserById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      const response = await request(app).get('/users/999');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should handle errors when fetching user by id', async () => {
      userService.getUserById.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/users/1');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Database error' });
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUser = { name: 'New User', email: 'newuser@example.com' };
      const createdUser = { id: 3, ...newUser };
      userService.createUser.mockResolvedValue(createdUser);

      const response = await request(app)
        .post('/users')
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdUser);
      expect(userService.createUser).toHaveBeenCalledWith(newUser.name, newUser.email);
    });

    it('should handle errors when creating user', async () => {
      userService.createUser.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/users')
        .send({ name: 'Test', email: 'test@example.com' });
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Database error' });
    });
  });

  describe('PUT /users/:id', () => {
    it('should update an existing user', async () => {
      const updatedUser = { id: 1, name: 'Updated Name', email: 'updated@example.com' };
      userService.updateUser.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/users/1')
        .send({ name: 'Updated Name', email: 'updated@example.com' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
      expect(userService.updateUser).toHaveBeenCalledWith(1, 'Updated Name', 'updated@example.com');
    });

    it('should return 404 when updating non-existent user', async () => {
      userService.updateUser.mockResolvedValue(null);

      const response = await request(app)
        .put('/users/999')
        .send({ name: 'Test', email: 'test@example.com' });
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should handle errors when updating user', async () => {
      userService.updateUser.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/users/1')
        .send({ name: 'Test', email: 'test@example.com' });
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Database error' });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const deletedUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      userService.deleteUser.mockResolvedValue(deletedUser);

      const response = await request(app).delete('/users/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(deletedUser);
      expect(userService.deleteUser).toHaveBeenCalledWith(1);
    });

    it('should return 404 when deleting non-existent user', async () => {
      userService.deleteUser.mockResolvedValue(null);

      const response = await request(app).delete('/users/999');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should handle errors when deleting user', async () => {
      userService.deleteUser.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/users/1');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Database error' });
    });
  });
});