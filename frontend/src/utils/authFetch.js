/**
 * Authenticated Fetch Wrapper
 * ============================
 * Centralized fetch wrapper that automatically:
 * - Attaches JWT token from localStorage to Authorization header
 * - Handles 401 responses by clearing auth and redirecting to login
 * - Provides a consistent error handling interface
 */

/**
 * Make an authenticated API request
 *
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} - Fetch response
 */
export async function authFetch(url, options = {}) {
  // Get token from localStorage
  const token = localStorage.getItem('auth_token');

  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Clear auth state
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Redirect to login
    window.location.href = '/login';

    throw new Error('Session expired. Please login again.');
  }

  return response;
}

/**
 * Make an authenticated GET request
 *
 * @param {string} url - API endpoint URL
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function authGet(url) {
  const response = await authFetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Make an authenticated POST request
 *
 * @param {string} url - API endpoint URL
 * @param {object} data - Request body data
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function authPost(url, data) {
  const response = await authFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Make an authenticated PATCH request
 *
 * @param {string} url - API endpoint URL
 * @param {object} data - Request body data
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function authPatch(url, data) {
  const response = await authFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Make an authenticated DELETE request
 *
 * @param {string} url - API endpoint URL
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function authDelete(url) {
  const response = await authFetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get authenticated stream URL with token as query parameter
 * Use this ONLY for /camera/stream and /parking/stream endpoints
 * since <img> tags cannot send Authorization headers
 *
 * @param {string} streamUrl - Base stream URL
 * @returns {string} - Stream URL with token query parameter
 */
export function getAuthStreamUrl(streamUrl) {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return streamUrl;
  }

  const separator = streamUrl.includes('?') ? '&' : '?';
  return `${streamUrl}${separator}token=${token}`;
}
