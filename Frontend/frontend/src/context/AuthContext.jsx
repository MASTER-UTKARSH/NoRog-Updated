import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("norog_token");
      const savedUser = localStorage.getItem("norog_user");
      if (savedToken && savedUser) {
        const parsed = JSON.parse(savedUser);
        // Verify the parsed data is actually a valid user object
        if (parsed && typeof parsed === "object" && parsed.id) {
          setToken(savedToken);
          setUser(parsed);
        } else {
          // Corrupted user data — clean up
          localStorage.removeItem("norog_token");
          localStorage.removeItem("norog_user");
        }
      }
    } catch {
      // JSON parse failed — corrupted data
      localStorage.removeItem("norog_token");
      localStorage.removeItem("norog_user");
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenStr) => {
    setUser(userData);
    setToken(tokenStr);
    localStorage.setItem("norog_token", tokenStr);
    localStorage.setItem("norog_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("norog_token");
    localStorage.removeItem("norog_user");
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("norog_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
