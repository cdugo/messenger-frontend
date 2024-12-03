import { LoginCredentials, SignupCredentials, User } from '../types/user';
import { Server, ServerWithUsers, MeResponse, MessagesResponse } from '../types/server';

interface ApiErrorResponse {
  status: string;
  message: string;
  details?: string;
}

interface CreateServerParams {
  name: string;
  description?: string;
}

class ApiError extends Error {
  status: string;
  details?: string;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.status = response.status;
    this.details = response.details;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(data);
    }
    
    return data;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  async login(credentials: LoginCredentials): Promise<User> {
    return this.request<User>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(credentials: SignupCredentials): Promise<User> {
    return this.request<User>('/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<void> {
    return this.request('/logout', {
      method: 'POST',
    });
  }

  async getMe(): Promise<MeResponse> {
    return this.request<MeResponse>('/me');
  }

  async getServer(id: number | string): Promise<ServerWithUsers> {
    return this.request<ServerWithUsers>(`/servers/${id}`);
  }

  async createServer(params: CreateServerParams): Promise<Server> {
    return this.request<Server>('/servers', {
      method: 'POST',
      body: JSON.stringify({
        server: {
          name: params.name,
          description: params.description
        }
      }),
    });
  }

  async getMessages(serverId: number | string, page: number = 1): Promise<MessagesResponse> {
    return this.request<MessagesResponse>(`/servers/${serverId}/messages?page=${page}`);
  }

  async getAllServers(): Promise<ServerWithUsers[]> {
    return this.request<ServerWithUsers[]>('/servers');
  }

  async joinServer(serverId: string | number): Promise<Server> {
    return this.request<Server>(`/servers/${serverId}/join`, {
      method: 'POST'
    });
  }
}

export const apiClient = new ApiClient();
