import { apiFetch } from './client';
import { TokenResponse, User } from '../types/auth';

export const authApi = {
  async login(email: string, password: string): Promise<TokenResponse> {
    return apiFetch<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string): Promise<{ user: User; token: TokenResponse }> {
    return apiFetch<{ user: User; token: TokenResponse }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getCurrentUser(): Promise<User> {
    return apiFetch<User>('/auth/me', {
      method: 'GET',
    });
  },
};
