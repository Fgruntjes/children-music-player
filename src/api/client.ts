const API_BASE = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      return { error: error.message || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export const api = {
  // Auth
  async getAuthUrl() {
    return fetchApi<{ url: string }>('/auth/google');
  },

  async handleCallback(code: string) {
    return fetchApi<{ user: import('../types').User; device: import('../types').Device }>(
      '/auth/callback',
      {
        method: 'POST',
        body: JSON.stringify({ code }),
      }
    );
  },

  async checkMusicAccess(accessToken: string) {
    return fetchApi<{ hasAccess: boolean }>('/auth/check-music-access', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    });
  },

  async logout() {
    return fetchApi('/auth/logout', { method: 'POST' });
  },

  // Device
  async registerDevice(userId: string, deviceType: 'parent' | 'child') {
    return fetchApi<{ device: import('../types').Device }>('/device/register', {
      method: 'POST',
      body: JSON.stringify({ userId, deviceType }),
    });
  },

  async getDevice(deviceId: string) {
    return fetchApi<{ device: import('../types').Device }>(`/device/${deviceId}`);
  },

  async updateDevice(deviceId: string, updates: Partial<import('../types').Device>) {
    return fetchApi<{ device: import('../types').Device }>(`/device/${deviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Pairing
  async createPairingRequest(childDeviceId: string, parentDeviceId: string) {
    return fetchApi<{ request: import('../types').PairingRequest }>('/pairing/request', {
      method: 'POST',
      body: JSON.stringify({ childDeviceId, parentDeviceId }),
    });
  },

  async getPairingRequests(deviceId: string) {
    return fetchApi<{ requests: import('../types').PairingRequest[] }>(
      `/pairing/requests/${deviceId}`
    );
  },

  async respondToPairing(requestId: string, status: 'approved' | 'rejected') {
    return fetchApi<{ request: import('../types').PairingRequest }>(`/pairing/respond/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async getLinkedDevices(deviceId: string) {
    return fetchApi<{ devices: import('../types').Device[] }>(`/device/${deviceId}/linked`);
  },

  // Whitelist
  async getWhitelist(parentDeviceId: string) {
    return fetchApi<{ whitelist: import('../types').Whitelist }>(`/whitelist/${parentDeviceId}`);
  },

  async updateWhitelist(parentDeviceId: string, whitelist: Partial<import('../types').Whitelist>) {
    return fetchApi<{ whitelist: import('../types').Whitelist }>(`/whitelist/${parentDeviceId}`, {
      method: 'PUT',
      body: JSON.stringify(whitelist),
    });
  },

  // Music Search (via YouTube Music)
  async searchMusic(query: string, accessToken: string, type?: 'artist' | 'track' | 'playlist') {
    return fetchApi<{
      artists: import('../types').Artist[];
      tracks: import('../types').Track[];
      playlists: import('../types').Playlist[];
    }>('/music/search', {
      method: 'POST',
      body: JSON.stringify({ query, accessToken, type }),
    });
  },

  // Playlists
  async getPlaylists(deviceId: string) {
    return fetchApi<{ playlists: import('../types').Playlist[] }>(`/playlists/${deviceId}`);
  },

  async createPlaylist(playlist: Omit<import('../types').Playlist, 'id' | 'createdAt' | 'updatedAt'>) {
    return fetchApi<{ playlist: import('../types').Playlist }>('/playlists', {
      method: 'POST',
      body: JSON.stringify(playlist),
    });
  },

  async updatePlaylist(playlistId: string, updates: Partial<import('../types').Playlist>) {
    return fetchApi<{ playlist: import('../types').Playlist }>(`/playlists/${playlistId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deletePlaylist(playlistId: string) {
    return fetchApi(`/playlists/${playlistId}`, { method: 'DELETE' });
  },

  async getChildrenPlaylists(parentDeviceId: string) {
    return fetchApi<{ playlists: import('../types').Playlist[] }>(
      `/playlists/children/${parentDeviceId}`
    );
  },
};
