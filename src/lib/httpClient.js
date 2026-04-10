/**
 * Cliente HTTP centralizado para comunicación con el backend Flask
 *
 * IMPORTANTE:
 * - Maneja autenticación con JWT tokens
 * - Maneja errores HTTP de forma centralizada
 * - Soporta redirección automática en 401
 * - Compatible con Vite (usa import.meta.env)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.docktask.com';

class HttpClient {
  constructor(token = null) {
    this.baseURL = API_BASE_URL;
    this.customToken = token;
  }

  /**
   * Crea una nueva instancia con un token específico
   * @param {string} token - JWT token
   * @returns {HttpClient}
   */
  withToken(token) {
    return new HttpClient(token);
  }

  /**
   * Obtiene el token de autenticación del localStorage o usa el token customizado
   * @returns {string|null}
   */
  getAuthToken() {
    if (this.customToken) return this.customToken;
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Construye los headers de la petición
   * @param {Object} customHeaders - Headers adicionales
   * @returns {Object}
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Maneja la respuesta HTTP y errores
   * @param {Response} response - Fetch Response object
   * @returns {Promise<any>}
   */
  async handleResponse(response) {
    if (!response.ok) {
      // Intentar extraer mensaje de error en JSON
      let errorJson = null;
      try {
        errorJson = await response.clone().json();
      } catch (_) {
        errorJson = null;
      }

      // Fallback a texto plano
      let errorText = null;
      if (!errorJson) {
        try {
          errorText = await response.text();
        } catch (_) {
          errorText = null;
        }
      }

      // El backend Flask usa "error" como key
      const errorMessage =
        errorJson?.error ||
        errorJson?.message ||
        errorText ||
        `Error HTTP: ${response.status}`;

      // Si es 401, limpiar token y redirigir a login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.response = { data: errorJson, status: response.status };
      throw error;
    }

    // Manejar respuestas vacías (204 No Content)
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  /**
   * GET request
   * @param {string} endpoint - URL endpoint (ej: '/api/mensajes')
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<any>}
   */
  async get(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(options.headers),
      ...options
    });
    return this.handleResponse(response);
  }

  /**
   * POST request
   * @param {string} endpoint - URL endpoint
   * @param {Object} data - Body de la petición
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<any>}
   */
  async post(endpoint, data = null, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(options.headers),
      body: data ? JSON.stringify(data) : null,
      ...options
    });
    return this.handleResponse(response);
  }

  /**
   * PUT request
   * @param {string} endpoint - URL endpoint
   * @param {Object} data - Body de la petición
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<any>}
   */
  async put(endpoint, data = null, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(options.headers),
      body: data ? JSON.stringify(data) : null,
      ...options
    });
    return this.handleResponse(response);
  }

  /**
   * PATCH request
   * @param {string} endpoint - URL endpoint
   * @param {Object} data - Body de la petición
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<any>}
   */
  async patch(endpoint, data = null, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(options.headers),
      body: data ? JSON.stringify(data) : null,
      ...options
    });
    return this.handleResponse(response);
  }

  /**
   * DELETE request
   * @param {string} endpoint - URL endpoint
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<any>}
   */
  async delete(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(options.headers),
      ...options
    });
    return this.handleResponse(response);
  }

  /**
   * Upload de archivos (FormData)
   * @param {string} endpoint - URL endpoint
   * @param {FormData} formData - FormData con archivos
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<any>}
   */
  async upload(endpoint, formData, options = {}) {
    const token = this.getAuthToken();
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // NO incluir Content-Type, el browser lo setea automáticamente con boundary

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: formData,
      ...options
    });
    return this.handleResponse(response);
  }
}

// Exportar instancia singleton (usa token de localStorage)
export const httpClient = new HttpClient();

// Exportar clase para crear instancias con tokens específicos
export default HttpClient;

// Helper para crear cliente con token
export const createHttpClient = (token) => new HttpClient(token);
