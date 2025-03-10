import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { userApi } from '../api/userApi';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

type UserRole = 'admin' | 'driver' | 'customer';

interface UserUpdateData {
  name?: string;
  email?: string;
  role?: UserRole;
  password?: string;
}

describe('userApi', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      // Setup
      const userId = 1;
      const userData: UserUpdateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'driver'
      };
      
      const mockResponse = {
        data: {
          data: {
            id: userId,
            name: 'Updated Name',
            email: 'updated@example.com',
            role: 'driver'
          },
          message: 'User updated successfully'
        },
        status: 200
      };
      
      mockedAxios.put.mockResolvedValueOnce(mockResponse);
      
      // Execute
      const result = await userApi.updateUser(userId, userData);
      
      // Verify
      expect(mockedAxios.put).toHaveBeenCalledWith(`/users/${userId}`, userData);
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should handle validation errors', async () => {
      // Setup
      const userId = 1;
      const userData = {
        email: 'invalid-email',
        // Using unknown type assertion to simulate invalid data coming from external source
        role: 'invalid-role' as unknown as UserRole
      };
      
      const mockError = {
        response: {
          data: {
            errors: {
              email: ['The email must be a valid email address.'],
              role: ['The selected role is invalid.']
            }
          },
          status: 422
        }
      };
      
      mockedAxios.put.mockRejectedValueOnce(mockError);
      
      // Execute & Verify
      await expect(userApi.updateUser(userId, userData)).rejects.toEqual(mockError);
      expect(mockedAxios.put).toHaveBeenCalledWith(`/users/${userId}`, userData);
    });
  });
  
  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      // Setup
      const userId = 1;
      
      const mockResponse = {
        status: 204,
        headers: {
          'X-Message': 'User deleted successfully'
        }
      };
      
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);
      
      // Execute
      const result = await userApi.deleteUser(userId);
      
      // Verify
      expect(mockedAxios.delete).toHaveBeenCalledWith(`/users/${userId}`);
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle errors when deleting own account', async () => {
      // Setup
      const userId = 1;
      
      const mockError = {
        response: {
          data: {
            message: 'Cannot delete your own account'
          },
          status: 403
        }
      };
      
      mockedAxios.delete.mockRejectedValueOnce(mockError);
      
      // Execute & Verify
      await expect(userApi.deleteUser(userId)).rejects.toEqual(mockError);
      expect(mockedAxios.delete).toHaveBeenCalledWith(`/users/${userId}`);
    });
  });
});