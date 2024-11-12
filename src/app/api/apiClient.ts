import { MeResponse, ServerWithMessagesAndUsers } from '../types/server';
import { LoginCredentials, User } from '../types/user';

interface SignUpCredentials {
  email: string;
  username: string;
  password: string;
}

class APIClient {
  private baseUrl: string = 'http://localhost:8080';

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      return null;
    }
  }

  async getServer(id: string): Promise<ServerWithMessagesAndUsers | null> {
    try {
      const response = await fetch(`${this.baseUrl}/servers/${id}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to get server');
      }

      return response.json();
    } catch (error) {
      return null;
    }
  }

  async signup(credentials: SignUpCredentials): Promise<User> {
    const response = await fetch(`${this.baseUrl}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    return response.json();
  }

  async getMe(): Promise<MeResponse> {
    const response = await fetch(`${this.baseUrl}/me`, {
      credentials: 'include',
    });
    return response.json();
  }
}

export const apiClient = new APIClient();
