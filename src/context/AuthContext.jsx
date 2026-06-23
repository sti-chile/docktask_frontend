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
 * @typedef {Object} GuestSession
 * @property {string} token
 * @property {string} role — "guest"
 * @property {number} workspace_id
 * @property {string} guest_id
 * @property {number} expires_in_hours
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {string|null} token
 * @property {User|null} user
 * @property {boolean} isGuest
 * @property {GuestSession|null} guestSession
 * @property {(token: string, user: User) => void} login
 * @property {(session: GuestSession) => void} loginAsGuest
 * @property {() => void} logout
 * @property {() => void} handleUnauthorized
 */

const AuthContext = createContext(/** @type {AuthContextValue} */ (null));

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(/** @type {string|null} */ (null));
  const [user, setUser] = useState(/** @type {User|null} */ (null));
  const [guestSession, setGuestSession] = useState(/** @type {GuestSession|null} */ (null));

  /**
   * Establece la sesión tras un login exitoso (usuario real).
   */
  const login = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setGuestSession(null);
  }, []);

  /**
   * Inicia sesión como invitado (demo).
   */
  const loginAsGuest = useCallback((session) => {
    setToken(session.token);
    setUser({
      username: "invitado",
      rol: "guest",
      id: session.guest_id,
      nombre: "Invitado",
      apellido: "",
    });
    setGuestSession(session);
  }, []);

  /**
   * Limpia la sesión (logout manual).
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setGuestSession(null);
  }, []);

  /**
   * Callback para el ApiClient cuando recibe un 401.
   */
  const handleUnauthorized = useCallback(() => {
    setToken(null);
    setUser(null);
    setGuestSession(null);
  }, []);

  const isGuest = guestSession !== null;

  return (
    <AuthContext.Provider value={{ token, user, isGuest, guestSession, login, loginAsGuest, logout, handleUnauthorized }}>
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
