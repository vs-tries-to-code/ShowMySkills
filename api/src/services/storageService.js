/**
 * XyphX Centralized Object Storage Service Integration
 * Reference: ShowMySkills — Centralized Storage Integration Guide
 * Target Storage: storage.xyphx.com
 */

export class StorageService {
  constructor(config = {}) {
    this._baseUrl = config.baseUrl;
    this._productId = config.productId;
    this._productKey = config.productKey;
    this._productSecret = config.productSecret;
  }

  get baseUrl() {
    return (this._baseUrl || process.env.STORAGE_BASE_URL || 'https://storage.xyphx.com').replace(/\/+$/, '');
  }

  get productId() {
    return this._productId || process.env.STORAGE_PRODUCT_ID || 'showmyskills';
  }

  get productKey() {
    return this._productKey || process.env.STORAGE_PRODUCT_KEY || '';
  }

  get productSecret() {
    return this._productSecret || process.env.STORAGE_PRODUCT_SECRET || '';
  }

  /**
   * Check whether centralized storage credentials are fully configured
   */
  isConfigured() {
    return Boolean(this.productKey && this.productSecret);
  }

  /**
   * Helper to retrieve required microservice authentication headers
   */
  getHeaders() {
    return {
      'X-Product-ID': this.productId,
      'X-Product-Key': this.productKey,
      'X-Product-Secret': this.productSecret,
    };
  }

  /**
   * Upload file to centralized MinIO bucket via XyphX Storage Microservice
   * @param {Object} params
   * @param {string} params.userId - Authenticated user identifier (e.g. MongoDB ID or username)
   * @param {Buffer|Uint8Array} params.buffer - File buffer
   * @param {string} params.fileName - Original file name with extension
   * @param {string} [params.mimeType] - MIME type of the file
   * @param {string} [params.projectId] - Optional project ID for association
   * @returns {Promise<{fileId: string, originalName: string, mimeType: string, sizeBytes: number, url: string, storage?: object}>}
   */
  async uploadFile({ userId, buffer, fileName, mimeType = 'application/octet-stream', projectId }) {
    if (!this.isConfigured()) {
      throw new Error('Centralized storage is not configured. Missing STORAGE_PRODUCT_KEY or STORAGE_PRODUCT_SECRET.');
    }

    if (!userId) {
      throw new Error('userId is required for centralized storage upload.');
    }

    if (!buffer) {
      throw new Error('File buffer is required for upload.');
    }

    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimeType });
    formData.append('file', blob, fileName);
    formData.append('userId', String(userId));

    if (projectId) {
      formData.append('projectId', String(projectId));
    }

    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = responseData?.message || responseData?.error || `Upload failed with status ${response.status}`;
      throw new Error(`Centralized Storage Upload Error: ${errorMsg}`);
    }

    return responseData;
  }

  /**
   * Delete file from centralized storage bucket (Server-to-Server Protected)
   * @param {string} fileId - Storage file ID (ULID)
   * @param {string} userId - Owner user ID
   */
  async deleteFile(fileId, userId) {
    if (!this.isConfigured()) {
      throw new Error('Centralized storage is not configured.');
    }

    if (!fileId) {
      throw new Error('fileId is required to delete file.');
    }

    const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: String(userId) }),
    });

    const data = await response.json().catch(() => ({ success: response.ok }));
    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `Delete failed with status ${response.status}`;
      throw new Error(`Centralized Storage Delete Error: ${errorMsg}`);
    }

    return data;
  }

  /**
   * Fetch user storage quota and current usage breakdown
   * @param {string} userId
   */
  async getUserQuota(userId) {
    if (!this.isConfigured()) {
      throw new Error('Centralized storage is not configured.');
    }

    const response = await fetch(`${this.baseUrl}/storage/usage?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `Failed to fetch quota with status ${response.status}`;
      throw new Error(`Centralized Storage Quota Error: ${errorMsg}`);
    }

    return data;
  }
}

export const storageService = new StorageService();
export default storageService;

