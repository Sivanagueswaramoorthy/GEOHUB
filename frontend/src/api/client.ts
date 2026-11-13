/**
 * GeoHub API Client - Python FastAPI & TiDB Cloud Integration
 * Connects frontend client to backend REST endpoints with JWT bearer authentication,
 * automatic token management, and resilient fallback.
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('geohub_access_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('geohub_access_token', token);
      } else {
        localStorage.removeItem('geohub_access_token');
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('geohub_access_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorDetail = 'API request failed';
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.detail || errorJson.message || errorDetail;
        } catch {
          errorDetail = response.statusText || errorDetail;
        }
        throw new Error(errorDetail);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`[GeoHub API Client] Request to ${url} failed:`, err?.message);
      throw err;
    }
  }

  // ==========================================
  // Auth & Profile Endpoints
  // ==========================================
  public async login(identifier: string, password: string) {
    const res = await this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  public async changePassword(oldPassword: string, newPassword: string) {
    return await this.request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  }

  public async getMe() {
    return await this.request<any>('/auth/me');
  }

  // ==========================================
  // Events Endpoints
  // ==========================================
  public async getEvents() {
    return await this.request<any[]>('/events');
  }

  public async createEvent(eventData: any) {
    return await this.request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  public async registerForEvent(eventId: string) {
    return await this.request<any>(`/events/${eventId}/register`, {
      method: 'POST',
    });
  }

  // ==========================================
  // Tasks & Operational Duties
  // ==========================================
  public async getTasks() {
    return await this.request<any[]>('/tasks');
  }

  public async updateTaskStatus(taskId: string, status: string) {
    return await this.request<any>(`/tasks/${taskId}/status?status=${status}`, {
      method: 'PUT',
    });
  }

  // ==========================================
  // QR Smart Attendance
  // ==========================================
  public async generateQrToken(eventId: string) {
    return await this.request<{ token: string; expires_at: string }>('/qr/generate', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId }),
    });
  }

  public async verifyQrToken(eventId: string, token: string, lat?: number, lng?: number) {
    return await this.request<any>('/qr/verify', {
      method: 'POST',
      body: JSON.stringify({
        event_id: eventId,
        token,
        scanner_latitude: lat,
        scanner_longitude: lng,
      }),
    });
  }

  // ==========================================
  // Financial Ledger
  // ==========================================
  public async submitBudgetRequest(teamName: string, amount: number, reason: string) {
    return await this.request<any>('/finance/budget-request', {
      method: 'POST',
      body: JSON.stringify({
        team_name: teamName,
        requested_amount: amount,
        reason,
      }),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
