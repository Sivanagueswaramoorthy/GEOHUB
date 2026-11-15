/**
 * GeoHub API Client - Python FastAPI & TiDB Cloud Integration
 * Connects frontend client to backend REST endpoints with JWT bearer authentication,
 * automatic token management, and resilient fallback across all 17 operations.
 */

export const DEFAULT_CLOUD_API = 'https://geohub-backend.onrender.com/api';

export function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('geohub_api_base_url');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
    }
  }

  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '';
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Detect Android APK wrapper environment
  const isApk =
    typeof navigator !== 'undefined' &&
    (navigator.userAgent.includes('GeoHubMobileApp') ||
      (typeof window !== 'undefined' && window.location.hostname === 'appassets.androidplatform.net'));

  if (isApk) {
    // In APK, relative '/api' resolves to Android local assets which 404s.
    // Fall back to default cloud API.
    return DEFAULT_CLOUD_API;
  }

  return '/api';
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('geohub_access_token');
      (window as any).setGeoHubServerUrl = (url: string) => this.setBaseUrl(url);
      (window as any).getGeoHubServerUrl = () => this.getBaseUrl();
    }
  }

  public getBaseUrl(): string {
    return resolveApiBaseUrl();
  }

  public setBaseUrl(url: string) {
    if (typeof window !== 'undefined') {
      if (url && url.trim()) {
        const clean = url.trim().replace(/\/+$/, '');
        localStorage.setItem('geohub_api_base_url', clean);
      } else {
        localStorage.removeItem('geohub_api_base_url');
      }
    }
  }

  public async testServerHealth(): Promise<{ ok: boolean; latencyMs?: number; message?: string }> {
    const baseUrl = this.getBaseUrl();
    const startTime = performance.now();
    try {
      // Test either health endpoint or base
      const testUrl = baseUrl.endsWith('/api')
        ? `${baseUrl.slice(0, -4)}/health`
        : `${baseUrl}/health`;
      const res = await fetch(testUrl, { method: 'GET', cache: 'no-store' });
      const latencyMs = Math.round(performance.now() - startTime);
      return { ok: res.ok, latencyMs, message: res.ok ? 'Connected' : `HTTP ${res.status}` };
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Connection refused' };
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
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const isTest = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), isTest ? 100 : 8000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });
      clearTimeout(timeoutId);

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
      if (typeof import.meta !== 'undefined' && import.meta.env?.MODE !== 'test') {
        console.warn(`[GeoHub API Client] Request to ${url} failed:`, err?.message);
      }
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

  public async getUsers() {
    return await this.request<any[]>('/auth/users');
  }

  public async enrollUser(userData: any) {
    return await this.request<any>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  public async setUserRole(userId: string, role: string, post?: string) {
    return await this.request<any>('/auth/set-role', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role, post }),
    });
  }

  // ==========================================
  // Events & Approvals Endpoints
  // ==========================================
  public async getEvents(status?: string) {
    const query = status ? `?status=${status}` : '';
    return await this.request<any[]>(`/events${query}`);
  }

  public async createEvent(eventData: any) {
    return await this.request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  public async updateEvent(eventId: string, eventData: any) {
    return await this.request<any>(`/events/${encodeURIComponent(eventId)}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  public async deleteEvent(eventId: string) {
    return await this.request<{ status: string; message: string }>(`/events/${encodeURIComponent(eventId)}`, {
      method: 'DELETE',
    });
  }

  public async updateEventStatus(eventId: string, newStatus: string) {
    return await this.request<any>(`/events/${eventId}/status?status_in=${encodeURIComponent(newStatus)}`, {
      method: 'PATCH',
    });
  }

  public async cancelEvent(eventId: string, reason: string) {
    return await this.request<any>(`/events/${eventId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public async assignEventScanners(eventId: string, scannerUserIds: string[]) {
    return await this.request<any>(`/events/${eventId}/scanners`, {
      method: 'POST',
      body: JSON.stringify({ scanner_user_ids: scannerUserIds }),
    });
  }

  public async registerForEvent(eventId: string) {
    return await this.request<any>(`/events/${eventId}/register`, {
      method: 'POST',
    });
  }

  // ==========================================
  // Real-Time Multi-Device Sync Stream
  // ==========================================
  public async getSyncStatus() {
    return await this.request<{
      status: string;
      active_devices_connected: number;
      timestamp: string;
      capabilities: string[];
    }>('/sync/status');
  }

  public getSyncStreamUrl(): string {
    const baseUrl = this.getBaseUrl();
    const clean = baseUrl.startsWith('/') ? baseUrl : baseUrl.replace(/\/+$/, '');
    return `${clean}/sync/stream`;
  }

  // ==========================================
  // Squads, Membership & Tasks
  // ==========================================
  public async getTeams() {
    return await this.request<any[]>('/teams');
  }

  public async submitJoinRequest(teamId: string, requestedRole?: string) {
    return await this.request<any>('/teams/join-request', {
      method: 'POST',
      body: JSON.stringify({ team_id: teamId, requested_role: requestedRole }),
    });
  }

  public async getTasks(scope: 'my_tasks' | 'team' | 'all' = 'my_tasks', status?: string) {
    const params = new URLSearchParams({ scope });
    if (status) params.append('status', status);
    return await this.request<any[]>(`/tasks?${params.toString()}`);
  }

  public async createTask(taskData: any) {
    return await this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  public async updateTask(taskId: string, taskData: any) {
    return await this.request<any>(`/tasks/${encodeURIComponent(taskId)}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  public async deleteTask(taskId: string) {
    return await this.request<{ status: string; message: string }>(`/tasks/${encodeURIComponent(taskId)}`, {
      method: 'DELETE',
    });
  }

  public async updateTaskStatus(taskId: string, status: string) {
    return await this.request<any>(`/tasks/${taskId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
    });
  }

  public async submitTaskProof(taskId: string, proofUrl: string) {
    return await this.request<any>(`/tasks/${taskId}/proof`, {
      method: 'POST',
      body: JSON.stringify({ proof_url: proofUrl }),
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
  // Financial Ledger & Treasury
  // ==========================================
  public async getBudgetRequests() {
    return await this.request<any[]>('/finance/budget-requests');
  }

  public async submitBudgetRequest(teamName: string, amount: number, reason: string) {
    return await this.request<any>('/finance/budget-requests', {
      method: 'POST',
      body: JSON.stringify({
        team_name: teamName,
        requested_amount: amount,
        reason,
      }),
    });
  }

  public async approveBudgetRequest(requestId: string) {
    return await this.request<any>(`/finance/budget-requests/${requestId}/approve`, {
      method: 'POST',
    });
  }

  public async deleteBudgetRequest(requestId: string) {
    return await this.request<{ status: string; message: string }>(`/finance/budget-requests/${encodeURIComponent(requestId)}`, {
      method: 'DELETE',
    });
  }

  public async getExpenses() {
    return await this.request<any[]>('/finance/expenses');
  }

  public async createExpense(expenseData: any) {
    return await this.request<any>('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  public async updateExpense(expenseId: string, expenseData: any) {
    return await this.request<any>(`/finance/expenses/${encodeURIComponent(expenseId)}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  }

  public async deleteExpense(expenseId: string) {
    return await this.request<{ status: string; message: string }>(`/finance/expenses/${encodeURIComponent(expenseId)}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // Audit Logs & Analytics
  // ==========================================
  public async getAuditLogs() {
    return await this.request<any[]>('/audit-logs');
  }

  public async getDashboardStats() {
    return await this.request<any>('/dashboard/stats');
  }

  // ==========================================
  // SuperAdmin Role Governance & Operations
  // ==========================================
  public async getAdminRolesCredentials() {
    return await this.request<any[]>('/admin/roles-credentials');
  }

  public async setAdminRoleCredentials(payload: {
    role: string;
    roll_no: string;
    name?: string;
    email?: string;
    password?: string;
    status?: string;
  }) {
    return await this.request<{
      status: string;
      message: string;
      user: any;
    }>('/admin/set-role-credentials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getAdminPermissionsMatrix() {
    return await this.request<{
      flags: string[];
      matrix: Record<string, Record<string, boolean>>;
      roles: string[];
      has_overrides: boolean;
      overridden_roles: string[];
    }>('/admin/permissions-matrix');
  }

  public async updateAdminPermissionsMatrix(payload: {
    role: string;
    permissions?: Record<string, boolean>;
    action?: 'enable_all' | 'disable_all' | null;
  }) {
    return await this.request<{
      status: string;
      message: string;
      effective_matrix: any;
    }>('/admin/permissions-matrix', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async resetAdminPermissionsMatrix(role: string = 'all') {
    return await this.request<{
      status: string;
      message: string;
      effective_matrix: any;
    }>('/admin/reset-permissions-matrix', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  // ==========================================
  // SuperAdmin Faculty Governance & Provisioning
  // ==========================================
  public async getAdminFaculty() {
    return await this.request<any[]>('/admin/faculty');
  }

  public async addAdminFaculty(payload: {
    name: string;
    roll_no: string;
    email: string;
    department?: string;
    post?: string;
    phone?: string;
    password?: string;
  }) {
    return await this.request<any>('/admin/faculty', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateAdminFaculty(
    facultyId: string,
    payload: {
      name?: string;
      roll_no?: string;
      email?: string;
      department?: string;
      post?: string;
      phone?: string;
      status?: string;
      password?: string;
    }
  ) {
    return await this.request<any>(`/admin/faculty/${encodeURIComponent(facultyId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async deleteAdminFaculty(facultyId: string) {
    return await this.request<{ status: string; message: string }>(`/admin/faculty/${encodeURIComponent(facultyId)}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // SuperAdmin User Management (Scholars & Officers)
  // ==========================================
  public async getAdminUsers() {
    return await this.request<any[]>('/admin/users');
  }

  public async createAdminUser(payload: {
    name: string;
    roll_no: string;
    email: string;
    role?: string;
    department?: string;
    post?: string;
    phone?: string;
    password?: string;
  }) {
    return await this.request<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateAdminUser(
    userId: string,
    payload: {
      name?: string;
      roll_no?: string;
      email?: string;
      role?: string;
      department?: string;
      post?: string;
      phone?: string;
      status?: string;
      password?: string;
    }
  ) {
    return await this.request<any>(`/admin/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async deleteAdminUser(userId: string) {
    return await this.request<{ status: string; message: string }>(`/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }

  public async purgePlatformData() {
    return await this.request<{
      status: string;
      message: string;
      summary: any;
    }>('/admin/purge-data', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
