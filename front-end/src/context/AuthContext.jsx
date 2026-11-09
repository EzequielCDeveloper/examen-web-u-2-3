import React, { useState, useEffect, createContext } from "react";
import { setToken, getToken, removeToken } from "../api/token";
import { useUser } from "../hooks/useUser";

export const AuthContext = createContext({
  auth: undefined,
  user: null,
  login: () => null,
  logout: () => null,
});

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(undefined);
  const { getMe } = useUser();

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setAuth(null);
      } else {
        await login(token);
      }
    };
    initAuth();
  }, []);

  const login = async (token) => {
    try {
      setToken(token);
      const me = await getMe(token);
      const authData = { token, me };
      setAuth(authData);
      localStorage.setItem("anime_user", JSON.stringify(me));
      // Sincronizar evento de autenticación para componentes que escuchan cambios globales
      window.dispatchEvent(
        new CustomEvent("auth:login_success", { detail: { token, user: me } })
      );
      return me;
    } catch (error) {
      console.error("Error al autenticar con token:", error);
      removeToken();
      setAuth(null);
      throw error;
    }
  };

  const logout = () => {
    setAuth(null);
    removeToken();
    window.dispatchEvent(new Event("auth:session_expired"));
  };

  const valueContext = {
    auth,
    user: auth?.me || null,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={valueContext}>
      {children}
    </AuthContext.Provider>
  );
}
