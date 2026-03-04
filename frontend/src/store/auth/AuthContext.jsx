// Auth Context
import { createContext, useState, useEffect } from "react";
import { authService } from "../../services/auth.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token] = useState(localStorage.getItem("jwt_token"));

  useEffect(() => {
    if (token) {
      setUser({ email: "logged_user" }); // ⚠ à remplacer lorsque tu fera /me
    }
  }, [token]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser({ email: data.email, role: data.role });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
