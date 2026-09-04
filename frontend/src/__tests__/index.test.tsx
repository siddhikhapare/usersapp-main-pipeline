import * as React from 'react';
import { render, screen, fireEvent, waitFor,act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Home from '../pages/index';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

type MockCardProps = {
  card: {
    id: number;
    name: string;
    email: string;
  };
}

// Mock CardComponent
jest.mock('../components/CardComponent', () => {
  return function MockCardComponent({ card }: MockCardProps) {
    return (
      <div data-testid={`card-${card.id}`}>
        <div>ID: {card.id}</div>
        <div>{card.name}</div>
        <div>{card.email}</div>
      </div>
    );
  };
});

describe('Home Component', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for GET /users
    mockedAxios.get.mockResolvedValue({ data: mockUsers });
  });

  describe('Rendering', () => {
    it('should render the page title', async () => {
      await act(async () => {
        render(<Home />);
      })
      expect(screen.getByText('User Management App')).toBeInTheDocument();
    });

    it('should render create user form', async () => {
      await act(async () => {
        render(<Home />);
      })
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should render update user form', async () => {
      await act(async () => {
        render(<Home />);
      })
      expect(screen.getByPlaceholderText('User ID')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New Email')).toBeInTheDocument();
      expect(screen.getByText('Update User')).toBeInTheDocument();
    });
  });

  describe('Fetching Users', () => {
    it('should fetch and display users on mount', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4000/users');
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should handle fetch error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      render(<Home />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching data:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('should reverse the order of users', async () => {
      render(<Home />);

      await waitFor(() => {
        const cards = screen.getAllByTestId(/card-/);
        // After reverse, Jane (id:2) should come before John (id:1)
        expect(cards[0]).toHaveAttribute('data-testid', 'card-2');
        expect(cards[1]).toHaveAttribute('data-testid', 'card-1');
      });
    });
  });

  describe('Creating Users', () => {
    it('should create a new user', async () => {
      const newUser = { id: 3, name: 'New User', email: 'newuser@example.com' };
      mockedAxios.post.mockResolvedValue({ data: newUser });

      render(<Home />);

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Fill in the form
      const nameInput = screen.getByPlaceholderText('Name');
      const emailInput = screen.getByPlaceholderText('Email');
      const addButton = screen.getByText('Add User');

      fireEvent.change(nameInput, { target: { value: 'New User' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:4000/users',
          { name: 'New User', email: 'newuser@example.com' }
        );
      });

      await waitFor(() => {
        expect(screen.getByText('New User')).toBeInTheDocument();
      });

      // Form should be cleared
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
    });

    it('should handle create error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.post.mockRejectedValue(new Error('Create error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Name');
      const emailInput = screen.getByPlaceholderText('Email');
      const addButton = screen.getByText('Add User');

      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error creating user:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Updating Users', () => {
    it('should update an existing user', async () => {
      mockedAxios.put.mockResolvedValue({ data: { id: 1, name: 'Updated Name', email: 'updated@example.com' } });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const userIdInput = screen.getByPlaceholderText('User ID');
      const newNameInput = screen.getByPlaceholderText('New Name');
      const newEmailInput = screen.getByPlaceholderText('New Email');
      const updateButton = screen.getByText('Update User');

      fireEvent.change(userIdInput, { target: { value: '1' } });
      fireEvent.change(newNameInput, { target: { value: 'Updated Name' } });
      fireEvent.change(newEmailInput, { target: { value: 'updated@example.com' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          'http://localhost:4000/users/1',
          { name: 'Updated Name', email: 'updated@example.com' }
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Updated Name')).toBeInTheDocument();
        expect(screen.getByText('updated@example.com')).toBeInTheDocument();
      });

      // Form should be cleared
      expect(userIdInput).toHaveValue('');
      expect(newNameInput).toHaveValue('');
      expect(newEmailInput).toHaveValue('');
    });

    it('should handle update error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.put.mockRejectedValue(new Error('Update error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const userIdInput = screen.getByPlaceholderText('User ID');
      const newNameInput = screen.getByPlaceholderText('New Name');
      const newEmailInput = screen.getByPlaceholderText('New Email');
      const updateButton = screen.getByText('Update User');

      fireEvent.change(userIdInput, { target: { value: '1' } });
      fireEvent.change(newNameInput, { target: { value: 'Test' } });
      fireEvent.change(newEmailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error updating user:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Deleting Users', () => {
    it('should delete a user', async () => {
      mockedAxios.delete.mockResolvedValue({ data: { id: 1, name: 'John Doe', email: 'john@example.com' } });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete User');
      fireEvent.click(deleteButtons[1]); // Delete John Doe (reversed order)

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:4000/users/1');
      });

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('should handle delete error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.delete.mockRejectedValue(new Error('Delete error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete User');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error deleting user:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('API URL Configuration', () => {
    // const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

    // afterEach(() => {
    //   if (originalApiUrl) {
    //     process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    //   } else {
    //     delete process.env.NEXT_PUBLIC_API_URL;
    //   }
    // });

    it('should use environment variable for API URL', async () => {
      //process.env.API_URL = 'http://test-api:5000';
      global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ apiUrl: 'http://test-api:5000' }),
      })
    ) as jest.Mock;

      render(<Home />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://test-api:5000/users'
        );
      });
    });

    it('should fallback to localhost when env var not set', async () => {
      // delete process.env.NEXT_PUBLIC_API_URL;
      // await act(async() =>{
      //   render(<Home />);
      // })
      global.fetch = jest.fn(() => Promise.reject(new Error('fetch failed'))) as jest.Mock;
      render(<Home />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://localhost:4000/users'
        );
      });
    });
  });
});