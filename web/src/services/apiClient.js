/**
 * Unified Resilient API Client for ShowMySkills.
 * Automatically injects authorization tokens, supports configurable base URLs,
 * enforces fast failover timeouts, and provides fallback data when backend is not running.
 */

export const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
    }
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000/api";
    }
    return "https://showmyskills.xyphx.com/api";
  }
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:5000/api"
  );
};

export const tokenStorage = {
  // The app uses persistent login by default. Callers may opt into session storage.
  storageType: "localStorage",
  getAccessToken: () => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      null
    );
  },

  getRefreshToken: () => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken") ||
      null
    );
  },

  setTokens: ({ accessToken, refreshToken, token }, storageType = "localStorage") => {
    if (typeof window === "undefined") return;
    const access = accessToken || token;
    const storage = storageType === "sessionStorage" ? sessionStorage : localStorage;
    const otherStorage = storageType === "sessionStorage" ? localStorage : sessionStorage;
    for (const key of ["token", "accessToken", "refreshToken", "authToken", "jwt"]) {
      storage.removeItem(key);
      otherStorage.removeItem(key);
    }
    if (access) storage.setItem("accessToken", access);
    if (refreshToken) {
      storage.setItem("refreshToken", refreshToken);
    }
  },

  clearTokens: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("jwt");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("jwt");
  },
};

let refreshPromise = null;

function clearAuthenticationState() {
  tokenStorage.clearTokens();
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}

function storeUserProfile(data) {
  if (typeof window === "undefined" || !data || typeof data !== "object") {
    return;
  }

  const profile = data.user && typeof data.user === "object" ? data.user : data;
  const safeProfile = { ...profile };
  delete safeProfile.accessToken;
  delete safeProfile.refreshToken;
  delete safeProfile.token;
  localStorage.setItem("user", JSON.stringify(safeProfile));
}

async function refreshTokensDirectly() {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    clearAuthenticationState();
    throw new Error("No refresh token available");
  }

  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      const err = new Error("Session expired. Please log in again.");
      err.status = res.status;
      throw err;
    }

    const json = await res.json();
    const payload = json.data || json;
    const accessToken = payload.accessToken || payload.token;
    if (!accessToken) {
      throw new Error("Session could not be refreshed. Please log in again.");
    }
    tokenStorage.setTokens({ accessToken, refreshToken: payload.refreshToken });
    return accessToken;
  } catch (error) {
    clearAuthenticationState();
    if (error?.status) throw error;
    throw new Error("Session could not be refreshed. Please log in again.");
  }
}

/**
 * Standard API request with timeout, auto-injected Bearer auth,
 * and automated silent token refresh on 401 expiration.
 */
export async function apiRequest(endpoint, method = "GET", body = null, customHeaders = {}) {
  const baseUrl = getApiBaseUrl();
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const headers = { ...customHeaders };

  const accessToken = tokenStorage.getAccessToken();
  if (accessToken && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body instanceof FormData) {
    options.body = body;
    // Do not set Content-Type for FormData; browser sets boundary
  } else if (body != null) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  options.signal = controller.signal;

  try {
    let res = await fetch(`${baseUrl}${formattedEndpoint}`, options);

    // Auto-refresh token if access token expired (HTTP 401 on authenticated endpoints)
    if (
      res.status === 401 &&
      !formattedEndpoint.includes("/auth/login") &&
      !formattedEndpoint.includes("/auth/register") &&
      !formattedEndpoint.includes("/auth/refresh") &&
      tokenStorage.getRefreshToken()
    ) {
      try {
        const latestAccessToken = tokenStorage.getAccessToken();
        if (latestAccessToken && latestAccessToken !== accessToken) {
          headers.Authorization = `Bearer ${latestAccessToken}`;
          res = await fetch(`${baseUrl}${formattedEndpoint}`, { ...options, headers });
        } else {
          if (!refreshPromise) {
            refreshPromise = refreshTokensDirectly().finally(() => {
              refreshPromise = null;
            });
          }
          const newAccessToken = await refreshPromise;

          // Retry original request with newly issued access token
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          };
          const retryOptions = {
            ...options,
            headers: retryHeaders,
          };
          res = await fetch(`${baseUrl}${formattedEndpoint}`, retryOptions);
        }
      } catch {
        // Refresh token failed or revoked; proceed to error handling below
      }
    }

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorData = {};
      try {
        errorData = await res.json();
      } catch {
        // Not a JSON response
      }
      const err = new Error(
        errorData.message || `Request failed with HTTP status ${res.status}`
      );
      err.status = res.status;
      err.data = errorData;
      throw err;
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Health check probe for system status and /error diagnostics.
 * Evaluates both Express API server availability and MongoDB database state.
 */
export async function checkBackendHealth() {
  const baseUrl = getApiBaseUrl();
  const startTime = Date.now();

  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    const latencyMs = Date.now() - startTime;
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }

    if (res.status === 200) {
      return {
        online: true,
        statusCode: 200,
        latencyMs,
        backend: payload?.services?.backend || { status: "up" },
        database: payload?.services?.database || { status: "connected" },
        message: payload?.message || "All core systems operational.",
        raw: payload,
      };
    } else if (res.status === 503) {
      return {
        online: true, // Express is responding, but service is degraded
        statusCode: 503,
        latencyMs,
        backend: payload?.services?.backend || { status: "up" },
        database: payload?.services?.database || {
          status: "disconnected",
          error: "MongoDB is not running or disconnected",
        },
        message:
          payload?.message || "Database service unavailable. MongoDB is not running.",
        raw: payload,
      };
    } else {
      return {
        online: true,
        statusCode: res.status,
        latencyMs,
        backend: payload?.services?.backend || { status: "unknown" },
        database: payload?.services?.database || { status: "unknown" },
        message: payload?.message || `HTTP ${res.status}`,
        raw: payload,
      };
    }
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      online: false, // Express is NOT running or unreachable
      statusCode: 503,
      latencyMs,
      backend: {
        status: "offline",
        error: err.message || "Failed to connect to Express backend server.",
      },
      database: {
        status: "unknown",
        error: "Cannot check MongoDB status because backend server is not running.",
      },
      message: "Backend server is not running or unreachable at " + baseUrl,
      raw: { error: err.message },
    };
  }
}

/**
 * Executes a direct API request and unwraps the response data.
 * @param {string} endpoint - API route relative to /api
 * @param {string} method - HTTP method
 * @param {any} body - Request body
 * @param {Function} [transformFn] - Optional transformer function applied to real API data
 */
export async function apiFetch(
  endpoint,
  method = "GET",
  body = null,
  transformFn = null
) {
  const json = await apiRequest(endpoint, method, body);
  const data = json.data !== undefined ? json.data : json;
  if (transformFn && typeof transformFn === "function") {
    return transformFn(data);
  }
  return data;
}

/**
 * Standard API request unwrap with safe error handling (returns null/empty, never dummy data).
 */
export async function apiFetchWithFallback(
  endpoint,
  method = "GET",
  body = null,
  fallbackData = null,
  transformFn = null
) {
  try {
    const json = await apiRequest(endpoint, method, body);
    const data = json.data !== undefined ? json.data : json;
    if (transformFn && typeof transformFn === "function") {
      return transformFn(data);
    }
    return data;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[ShowMySkills API Error] ${method} ${endpoint}: ${err.message}`);
    }
    return fallbackData;
  }
}

// ─────────────────────────────────────────────────────────────
// DOMAIN-SPECIFIC DATABASE API SERVICES
// ─────────────────────────────────────────────────────────────

export const authService = {
  login: async (email, password, role) => {
    const res = await apiRequest("/auth/login", "POST", { email, password, role });
    if (res?.data) {
      tokenStorage.setTokens({
        accessToken: res.data.accessToken || res.data.token,
        refreshToken: res.data.refreshToken,
      });
      storeUserProfile(res.data);
    }
    return res;
  },

  register: async (userData) => {
    const res = await apiRequest("/auth/register", "POST", userData);
    if (res?.data?.accessToken || res?.data?.token) {
      tokenStorage.setTokens({
        accessToken: res.data.accessToken || res.data.token,
        refreshToken: res.data.refreshToken,
      });
      storeUserProfile(res.data);
    }
    return res;
  },

  getCurrentUser: async () => {
    return apiFetchWithFallback("/auth/me", "GET", null, null);
  },

  updateCurrentUser: async (profileData) => {
    return apiRequest("/auth/me", "PUT", profileData);
  },

  sendSignupOtp: async (email) => {
    return apiRequest("/auth/send-otp", "POST", { email });
  },

  verifySignupOtp: async (email, otp) => {
    return apiRequest("/auth/verify-otp", "POST", { email, otp });
  },

  verifyEmail: async (email, otp) => {
    const res = await apiRequest("/auth/verify-email", "POST", { email, otp });
    if (res?.data) {
      if (res.data.accessToken || res.data.token) {
        tokenStorage.setTokens({
          accessToken: res.data.accessToken || res.data.token,
          refreshToken: res.data.refreshToken,
        });
      }
      storeUserProfile(res.data);
    }
    return res;
  },

  refresh: async () => {
    return refreshTokensDirectly();
  },

  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiRequest("/auth/logout", "POST", { refreshToken });
      }
    } catch {}
    tokenStorage.clearTokens();
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    }
    return { success: true };
  },

  forgotPassword: async (email) => {
    return apiRequest("/auth/forgot-password", "POST", { email });
  },

  resetPassword: async (email, otp, newPassword) => {
    return apiRequest("/auth/reset-password", "POST", { email, otp, newPassword });
  },
};

export const bookmarkService = {
  getMyBookmarks: async (type = null) => {
    const endpoint = type ? `/bookmarks?type=${encodeURIComponent(type)}` : "/bookmarks";
    return apiFetchWithFallback(endpoint, "GET", null, []);
  },

  toggleInternship: async (internshipId) => {
    return apiRequest(`/bookmarks/internships/${internshipId}`, "POST");
  },

  toggleCandidate: async (candidateId) => {
    return apiRequest(`/bookmarks/candidates/${candidateId}`, "POST");
  },
};

export const skillService = {
  list: async (category = null) => {
    const endpoint = category ? `/skills?category=${encodeURIComponent(category)}` : "/skills";
    return apiFetchWithFallback(endpoint, "GET", null, []);
  },

  getById: async (id) => {
    return apiFetchWithFallback(`/skills/${id}`, "GET", null, null);
  },

  submit: async (id, answers) => {
    return apiRequest(`/skills/${id}/submit`, "POST", { answers });
  },

  getMySubmissions: async () => {
    return apiFetchWithFallback("/skills/my-submissions", "GET", null, []);
  },
};

export const collegeService = {
  getStudents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/users?role=student&${queryString}` : "/users?role=student";
    return apiFetchWithFallback(endpoint, "GET", null, []);
  },

  verifyStudentId: async (studentId, status = "approved") => {
    return apiRequest(`/admin/verifications/${studentId}`, "PUT", { status });
  },
};

export const verificationService = {
  submit: async (verificationData) => {
    return apiRequest("/verifications", "POST", verificationData);
  },

  getMyRequests: async () => {
    return apiFetchWithFallback("/verifications/my-requests", "GET", null, []);
  },
};

export const internshipService = {
  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/internships?${queryString}` : "/internships";
    return apiFetchWithFallback(endpoint, "GET", null, []);
  },

  getById: async (id) => {
    return apiFetchWithFallback(`/internships/${id}`, "GET", null, null);
  },

  create: async (internshipData) => {
    return apiRequest("/internships", "POST", internshipData);
  },

  update: async (id, internshipData) => {
    return apiRequest(`/internships/${id}`, "PUT", internshipData);
  },

  delete: async (id) => {
    return apiRequest(`/internships/${id}`, "DELETE");
  },

  apply: async (internshipId, notes = "") => {
    return apiRequest("/applications/apply", "POST", { internshipId, notes });
  },

  toggleBookmark: async (internshipId) => {
    return apiRequest(`/bookmarks/internships/${internshipId}`, "POST");
  },
};

export const peopleService = {
  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/users?${queryString}` : "/users";
    return apiFetchWithFallback(endpoint, "GET", null, []);
  },

  getById: async (id) => {
    return apiFetchWithFallback(`/users/${id}`, "GET", null, null);
  },
};

export const applicationService = {
  getMyApplications: async () => {
    return apiFetchWithFallback("/applications/my-applications", "GET", null, []);
  },

  getCompanyApplications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/applications/company-applications?${queryString}`
      : "/applications/company-applications";
    return apiFetchWithFallback(endpoint, "GET", null, []);
  },

  updateStatus: async (applicationId, status, notes = "") => {
    return apiRequest(`/applications/${applicationId}/status`, "PUT", {
      status,
      notes,
    });
  },
};

export const chatService = {
  getConversations: async () => {
    return apiFetchWithFallback("/chats/conversations", "GET", null, []);
  },

  getMessages: async (conversationId) => {
    return apiFetchWithFallback(
      `/chats/conversations/${conversationId}/messages`,
      "GET",
      null,
      []
    );
  },

  sendMessage: async (text, receiverId, conversationId = null) => {
    return apiRequest("/chats/messages", "POST", {
      text,
      receiverId,
      conversationId,
    });
  },
};

export const launchpadService = {
  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/launchpad?${queryString}` : "/launchpad";
    return apiFetchWithFallback(endpoint, "GET", null, []);
  },

  recordClick: async (id) => {
    return apiRequest(`/launchpad/${id}/click`, "POST");
  },
};

export const adminService = {
  getOverview: async () => {
    return apiFetchWithFallback("/admin/overview", "GET", null, null);
  },

  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : "/admin/users";
    return apiFetchWithFallback(endpoint, "GET", null, []);
  },

  updateRoleTag: async (userId, roleTag) => {
    return apiRequest(`/admin/users/${userId}/role-tag`, "PUT", { roleTag });
  },

  moderateInternship: async (internshipId, data) => {
    return apiRequest(`/admin/internships/${internshipId}/moderate`, "PUT", data);
  },

  getVerifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/admin/verifications?${queryString}`
      : "/admin/verifications";
    return apiFetchWithFallback(endpoint, "GET", null, []);
  },

  reviewVerification: async (verificationId, status, rejectionReason = "") => {
    return apiRequest(`/admin/verifications/${verificationId}`, "PUT", {
      status,
      rejectionReason,
    });
  },

  getAnalytics: async () => {
    return apiFetchWithFallback("/admin/analytics", "GET", null, null);
  },
};

export const notificationService = {
  list: async () => {
    return apiFetchWithFallback("/notifications", "GET", null, []);
  },

  markRead: async (notificationId = null) => {
    return apiRequest("/notifications/mark-read", "PUT", { notificationId });
  },
};

export const supportService = {
  getFaqs: async (search = "") => {
    const endpoint = search ? `/support/faqs?search=${encodeURIComponent(search)}` : "/support/faqs";
    return apiFetchWithFallback(endpoint, "GET", null, []);
  },

  submitTicket: async (ticketData) => {
    return apiRequest("/support/tickets", "POST", ticketData);
  },
};

export const uploadService = {
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest("/upload/avatar", "POST", formData);
  },
  uploadInternshipPoster: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest("/upload/internship-poster", "POST", formData);
  },

  uploadCompanyLogo: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest("/upload/logo", "POST", formData);
  },
};

