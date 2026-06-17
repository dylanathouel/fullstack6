import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : null;
  });

  function loginUser(token, user) {
    const data = { token, user };
    localStorage.setItem('auth', JSON.stringify(data));
    setAuth(data);
  }

  function logoutUser() {
    localStorage.removeItem('auth');
    setAuth(null);
  }

  function updateUserInfo(fields) {
    setAuth((prev) => {
      const next = { ...prev, user: { ...prev.user, ...fields } };
      localStorage.setItem('auth', JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider value={{ auth, user: auth?.user ?? null, loginUser, logoutUser, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
