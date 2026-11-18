/**
 * GeoHub API Client - Python FastAPI & TiDB Cloud Integration
 * Connects frontend client to backend REST endpoints with JWT bearer authentication,
 * automatic token management, and resilient fallback across all 17 operations.
 */

export const DEFAULT_CLOUD_API = 'https://roping-udder-unsaid.ngrok-free.dev/api';

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
    // Fall back to active default cloud API tunnel.
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
      const res = await fetch(testUrl, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
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
      'ngrok-skip-browser-warning': 'true',
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
        if (response.status === 401) {
          this.setToken(null);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('geohub:session-expired', {
                detail: { reason: 'Signed out by admin' },
              })
            );
          }
        }
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
  public async getEffectiveModules(): Promise<{ user_id: string; role: string; modules: Record<string, boolean> }> {
    return this.request('/me/modules');
  }

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

  /**
   * Resilient, multi-device SSE sync stream subscriber.
   * Utilizes fetch ReadableStream with 'ngrok-skip-browser-warning' header
   * to ensure tunnel and proxy compatibility across all mobile devices and browsers.
   */
  public subscribeToSyncStream(
    onMessage: (event: { type: string; data: any; raw?: string }) => void,
    onError?: (err: any) => void
  ): () => void {
    const streamUrl = this.getSyncStreamUrl();
    const controller = new AbortController();
    let isAborted = false;

    const readStream = async () => {
      try {
        const response = await fetch(streamUrl, {
          method: 'GET',
          headers: {
            Accept: 'text/event-stream',
            'ngrok-skip-browser-warning': 'true',
            'Cache-Control': 'no-cache',
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`SSE stream connection failed: HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!isAborted) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || '';

          for (const rawMsg of messages) {
            const lines = rawMsg.split('\n');
            let eventType = 'message';
            let dataStr = '';

            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                dataStr = line.slice(5).trim();
              }
            }

            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                onMessage(parsed);
              } catch {
                onMessage({ type: eventType, data: dataStr, raw: dataStr });
              }
            }
          }
        }
      } catch (err: any) {
        if (!isAborted) {
          onError?.(err);
        }
      }
    };

    readStream();

    return () => {
      isAborted = true;
      controller.abort();
    };
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
  // Meetings & Minutes of Meeting (MoM)
  // ==========================================
  public async getMeetings(eventId?: string, status?: string) {
    const params = new URLSearchParams();
    if (eventId) params.append('event_id', eventId);
    if (status) params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await this.request<any[]>(`/meetings${qs}`);
  }

  public async createMeeting(meetingData: any) {
    return await this.request<any>('/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  }

  public async updateMeetingMoM(meetingId: string, momNotes: string, actionItems?: any[]) {
    return await this.request<any>(`/meetings/${encodeURIComponent(meetingId)}/mom`, {
      method: 'PATCH',
      body: JSON.stringify({ mom_notes: momNotes, action_items: actionItems || [] }),
    });
  }

  public async deleteMeeting(meetingId: string) {
    return await this.request<{ success: boolean; message: string }>(`/meetings/${encodeURIComponent(meetingId)}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // Campus Forum & Discussions
  // ==========================================
  public async getForumMessages(channelId?: string) {
    const qs = channelId ? `?channel_id=${encodeURIComponent(channelId)}` : '';
    return await this.request<any[]>(`/forum/messages${qs}`);
  }

  public async createForumMessage(channelId: string, content: string, title?: string) {
    return await this.request<any>('/forum/messages', {
      method: 'POST',
      body: JSON.stringify({ channel_id: channelId, content, title }),
    });
  }

  public async togglePinForumMessage(messageId: string) {
    return await this.request<any>(`/forum/messages/${encodeURIComponent(messageId)}/pin`, {
      method: 'POST',
    });
  }

  public async toggleLikeForumMessage(messageId: string) {
    return await this.request<any>(`/forum/messages/${encodeURIComponent(messageId)}/like`, {
      method: 'POST',
    });
  }

  public async deleteForumMessage(messageId: string) {
    return await this.request<{ success: boolean; message: string }>(`/forum/messages/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // Stock & Inventory
  // ==========================================
  public async getStockItems() {
    return await this.request<any[]>('/finance/stock');
  }

  public async createStockItem(itemData: any) {
    return await this.request<any>('/finance/stock', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  public async updateStockItem(itemId: string, itemData: any) {
    return await this.request<any>(`/finance/stock/${encodeURIComponent(itemId)}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  public async deleteStockItem(itemId: string) {
    return await this.request<{ status: string; message: string }>(`/finance/stock/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // Gallery & Media
  // ==========================================
  public async getGalleryItems(eventId?: string, category?: string) {
    const params = new URLSearchParams();
    if (eventId) params.append('event_id', eventId);
    if (category) params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await this.request<any[]>(`/gallery/items${qs}`);
  }

  public async createGalleryItem(itemData: any) {
    return await this.request<any>('/gallery/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  public async deleteGalleryItem(itemId: string) {
    return await this.request<{ status: string; message: string }>(`/gallery/items/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // Team Membership
  // ==========================================
  public async addTeamMember(teamId: string, userId: string, teamRole: string = 'Member') {
    return await this.request<{ success: boolean; message: string }>(`/teams/${encodeURIComponent(teamId)}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, team_role: teamRole }),
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

  public async createAdminFaculty(payload: {
    name: string;
    roll_no: string;
    email: string;
    department?: string;
    post?: string;
    phone?: string;
    password?: string;
  }) {
    return await this.addAdminFaculty(payload);
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
    year_of_study?: string;
    team?: string;
    team_role?: string;
    is_volunteer?: boolean;
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
      year_of_study?: string;
      team?: string;
      team_role?: string;
      is_volunteer?: boolean;
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

  public async getPlatformModules(): Promise<Record<string, boolean>> {
    return await this.request<Record<string, boolean>>('/admin/modules');
  }

  public async updatePlatformModules(modules: Record<string, boolean>): Promise<{ status: string; modules: Record<string, boolean> }> {
    return await this.request<{ status: string; modules: Record<string, boolean> }>('/admin/modules', {
      method: 'POST',
      body: JSON.stringify(modules),
    });
  }

  public async executeAdminBatchAction(payload: {
    user_ids: string[];
    action: 'assign_squad' | 'set_status' | 'reset_password' | 'delete' | string;
    value?: string;
  }) {
    return await this.request<{
      status: string;
      message: string;
      affected_count: number;
    }>('/admin/users/batch-action', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getAdminSystemDiagnostics() {
    return await this.request<{
      status: string;
      engine: string;
      endpoint: string;
      latency_ms: number;
      table_counts: Record<string, number>;
      recent_audits: Array<{
        id: string;
        action: string;
        actor_name: string;
        target_name: string;
        details: string;
        timestamp: string;
      }>;
    }>('/admin/system/diagnostics');
  }

  public async sendAdminBroadcastAlert(payload: {
    title: string;
    message: string;
    priority?: string;
  }) {
    return await this.request<{
      status: string;
      message: string;
      notification_id: string;
    }>('/admin/broadcast-alert', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getAdminOverview() {
    return await this.request<{
      status: string;
      faculty_count: number;
      student_count: number;
      users_count: number;
      online_count: number;
      modules: Record<string, boolean>;
      latency_ms: number;
    }>('/admin/overview');
  }

  public async getAdminRoleModules() {
    return await this.request<Record<string, Record<string, boolean>>>('/admin/role-modules');
  }

  public async setAdminRoleModule(role: string, module: string, enabled: boolean) {
    return await this.request<{
      status: string;
      role: string;
      module: string;
      enabled: boolean;
    }>(`/admin/role-modules/${encodeURIComponent(role)}/${encodeURIComponent(module)}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
  }

  public async getAdminOnlineSessions() {
    return await this.request<Array<{
      id: string;
      name: string;
      roll_no: string;
      role: string;
      department?: string;
      last_seen_at: string;
      last_platform?: string;
      last_app_version?: string;
    }>>('/admin/sessions/online');
  }

  public async resetAdminUserPassword(userId: string, password?: string) {
    return await this.request<{ status: string; message: string }>(`/admin/users/${encodeURIComponent(userId)}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password: password || 'geohub' }),
    });
  }

  public async pingTiDbHealth(): Promise<{ ok: boolean; latencyMs: number; status: string; database?: string }> {
    const start = performance.now();
    try {
      const res = await this.request<{ status: string; database: string; latency_ms: number }>('/v1/health');
      const elapsed = Math.round(performance.now() - start);
      return { ok: true, latencyMs: res.latency_ms || elapsed, status: res.status, database: res.database };
    } catch {
      const elapsed = Math.round(performance.now() - start);
      return { ok: false, latencyMs: elapsed, status: 'offline' };
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
