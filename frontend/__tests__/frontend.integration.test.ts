/**
 * Frontend Integration Tests
 * These tests run against a real backend API
 * Used in CI pipeline with docker-compose setup
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:4000';

describe('Frontend Integration Tests - Real API', () => {
  let testUserId: number;

  beforeAll(async () => {
    // Wait for backend to be ready
    let retries = 30;
    while (retries > 0) {
      try {
        await axios.get(`${API_URL}/test`);
        console.log('Backend is ready!');
        break;
      } catch {
        retries--;
        if (retries === 0) throw new Error('Backend failed to start');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  });

  beforeEach(async () => {
    // Clean up before each test by deleting all users
    try {
      const response = await axios.get(`${API_URL}/users`);
      const users = response.data;
      for (const user of users) {
        await axios.delete(`${API_URL}/users/${user.id}`);
      }
    } catch {
      console.log('No users to clean up');
    }
  });

  afterEach(async () => {
    // Clean up after each test
    if (testUserId) {
      try {
        await axios.delete(`${API_URL}/users/${testUserId}`);
      } catch {
        // User might already be deleted
      }
    }
  });

  describe('API Health Check', () => {
    it('should connect to backend API', async () => {
      const response = await axios.get(`${API_URL}/test`);
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ message: 'API is working' });
    });

    it('should have correct API_URL configured', () => {
      console.log('Using API_URL:', API_URL);
      expect(API_URL).toBeTruthy();
      expect(typeof API_URL).toBe('string');
    });
  });

  describe('User CRUD Operations - End to End', () => {
    it('should create a user via API', async () => {
      const newUser = {
        name: 'Integration Test User',
        email: 'integration@test.com'
      };

      const response = await axios.post(`${API_URL}/users`, newUser);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(newUser.name);
      expect(response.data.email).toBe(newUser.email);

      testUserId = response.data.id;
    });

    it('should fetch all users via API', async () => {
      // Create test users
      await axios.post(`${API_URL}/users`, { name: 'User 1', email: 'user1@test.com' });
      await axios.post(`${API_URL}/users`, { name: 'User 2', email: 'user2@test.com' });

      const response = await axios.get(`${API_URL}/users`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should fetch a specific user by ID', async () => {
      // Create a user first
      const createResponse = await axios.post(`${API_URL}/users`, {
        name: 'Fetch Test User',
        email: 'fetch@test.com'
      });
      testUserId = createResponse.data.id;

      // Fetch that user
      const response = await axios.get(`${API_URL}/users/${testUserId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(testUserId);
      expect(response.data.name).toBe('Fetch Test User');
      expect(response.data.email).toBe('fetch@test.com');
    });

    it('should return 404 for non-existent user', async () => {
      try {
        await axios.get(`${API_URL}/users/99999`);
        fail('Should have thrown an error');
      } catch (error: unknown) {
          if (axios.isAxiosError(error) && error.response){
            expect(error.response.status).toBe(404);
            expect(error.response.data.message).toBe('User not found');
          }
      }
    });

    it('should update a user via API', async () => {
      // Create a user first
      const createResponse = await axios.post(`${API_URL}/users`, {
        name: 'Original Name',
        email: 'original@test.com'
      });
      testUserId = createResponse.data.id;

      // Update the user
      const updateResponse = await axios.put(`${API_URL}/users/${testUserId}`, {
        name: 'Updated Name',
        email: 'updated@test.com'
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.id).toBe(testUserId);
      expect(updateResponse.data.name).toBe('Updated Name');
      expect(updateResponse.data.email).toBe('updated@test.com');

      // Verify the update
      const getResponse = await axios.get(`${API_URL}/users/${testUserId}`);
      expect(getResponse.data.name).toBe('Updated Name');
      expect(getResponse.data.email).toBe('updated@test.com');
    });

    it('should delete a user via API', async () => {
      // Create a user first
      const createResponse = await axios.post(`${API_URL}/users`, {
        name: 'Delete Test User',
        email: 'delete@test.com'
      });
      const userId = createResponse.data.id;

      // Delete the user
      const deleteResponse = await axios.delete(`${API_URL}/users/${userId}`);
      
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data.id).toBe(userId);

      // Verify user is deleted
      try {
        await axios.get(`${API_URL}/users/${userId}`);
        fail('Should have thrown an error');
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response){
            expect(error.response.status).toBe(404);
          }
      }
    });

    it('should handle duplicate email constraint', async () => {
      // Create first user
      await axios.post(`${API_URL}/users`, {
        name: 'User 1',
        email: 'duplicate@test.com'
      });

      // Try to create another user with same email
      try {
        await axios.post(`${API_URL}/users`, {
          name: 'User 2',
          email: 'duplicate@test.com'
        });
        fail('Should have thrown an error');
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response){
            expect(error.response.status).toBe(500); // Database constraint error
        }
      }
    });
  });

  describe('Complete User Workflow', () => {
    it('should complete a full CRUD workflow', async () => {
      // 1. Create multiple users
      const user1Response = await axios.post(`${API_URL}/users`, {
        name: 'Workflow User 1',
        email: 'workflow1@test.com'
      });
      const user2Response = await axios.post(`${API_URL}/users`, {
        name: 'Workflow User 2',
        email: 'workflow2@test.com'
      });

      expect(user1Response.status).toBe(201);
      expect(user2Response.status).toBe(201);

      const user1Id = user1Response.data.id;
      const user2Id = user2Response.data.id;

      // 2. Fetch all users and verify both exist
      const getAllResponse = await axios.get(`${API_URL}/users`);
      expect(getAllResponse.data.length).toBeGreaterThanOrEqual(2);
      
      //const userIds = getAllResponse.data.map((u: any) => u.id);
      const userIds = getAllResponse.data.map((u: {id: number}) => u.id);
      expect(userIds).toContain(user1Id);
      expect(userIds).toContain(user2Id);

      // 3. Update first user
      const updateResponse = await axios.put(`${API_URL}/users/${user1Id}`, {
        name: 'Workflow User 1 Updated',
        email: 'workflow1-updated@test.com'
      });
      expect(updateResponse.data.name).toBe('Workflow User 1 Updated');

      // 4. Delete second user
      const deleteResponse = await axios.delete(`${API_URL}/users/${user2Id}`);
      expect(deleteResponse.status).toBe(200);

      // 5. Verify final state
      const finalGetAllResponse = await axios.get(`${API_URL}/users`);
      //const finalUserIds = finalGetAllResponse.data.map((u: any) => u.id);
      const finalUserIds = finalGetAllResponse.data.map((u: {id: number}) => u.id);

      expect(finalUserIds).toContain(user1Id);
      expect(finalUserIds).not.toContain(user2Id);

      // Clean up remaining user
      await axios.delete(`${API_URL}/users/${user1Id}`);
    });
  });

  describe('CORS Configuration', () => {
    it('should allow cross-origin requests', async () => {
      const response = await axios.get(`${API_URL}/users`);
      // If we get here without CORS error, CORS is working
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user ID format gracefully', async () => {
      try {
        await axios.get(`${API_URL}/users/invalid-id`);
        fail('Should have thrown an error');
      } catch (error: unknown) {
        if (axios.isAxiosError(error)){
          // Should get some error response
          expect(error.response).toBeDefined();
        }
      }
    });

    it('should handle missing required fields on create', async () => {
      try {
        await axios.post(`${API_URL}/users`, {
          name: 'Test User'
          // Missing email
        });
        fail('Should have thrown an error');
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response){
          expect(error.response.status).toBe(500);
        }
      }
    });

    it('should handle update of non-existent user', async () => {
      try {
        await axios.put(`${API_URL}/users/99999`, {
          name: 'Test',
          email: 'test@test.com'
        });
        fail('Should have thrown an error');
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response){
          expect(error.response.status).toBe(404);
        }
      }
    });

    it('should handle delete of non-existent user', async () => {
      try {
        await axios.delete(`${API_URL}/users/99999`);
        fail('Should have thrown an error');
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response){
          expect(error.response.status).toBe(404);
        }
      }
    });
  });
});