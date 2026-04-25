/**
 * AuthContext — Fuente de verdad del estado de autenticación.
 *
 * SEGURIDAD:
 * - El JWT token vive SOLO en memoria (estado React).
 * - NO se persiste en localStorage, sessionStorage, ni cookies.
 * - Si el usuario recarga la página, deberá volver a iniciar sesión.
 *   (Comportamiento correcto para evitar XSS token theft.)
 */
import { createContext, useContext, useState, useCallback } from "react";

/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} rol
 * @property {number} id
 * @property {string} nombre
 * @property {string} apellido
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {string|null} token
 * @property {User|null} user
 * @property {(token: string, user: User) => void} login
 * @property {() => void} logout
 * @property {() => void} handleUnauthorized
 */

const AuthContext = createContext(/** @type {AuthContextValue} */ (null));

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(/** @type {string|null} */ (null));
  const [user, setUser] = useState(/** @type {User|null} */ (null));

  /**
   * Establece la sesión tras un login exitoso.
   * @param {string} newToken
   * @param {User} newUser
   */
  const login = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  }, []);

  /**
   * Limpia la sesión (logout manual).
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Callback para el ApiClient cuando recibe un 401.
   * Limpia el estado sin redirigir — la UI reacciona automáticamente
   * al token === null via PrivateRoute.
   */
  const handleUnauthorized = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, handleUnauthorized }}>
      {children}
    </AuthContext.Provider>
  );
};

/** @returns {AuthContextValue} */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
