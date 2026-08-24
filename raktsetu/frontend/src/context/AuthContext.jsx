import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [donor, setDonor] = useState(() => {
    const stored = localStorage.getItem("raktsetu_donor");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("raktsetu_token");
    if (!token) {
      setLoading(false);
      return;
    }
    client
      .get("/donors/me")
      .then((res) => {
        setDonor(res.data);
        localStorage.setItem("raktsetu_donor", JSON.stringify(res.data));
      })
      .catch(() => {
        setDonor(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, donorData) {
    localStorage.setItem("raktsetu_token", token);
    localStorage.setItem("raktsetu_donor", JSON.stringify(donorData));
    setDonor(donorData);
  }

  function logout() {
    localStorage.removeItem("raktsetu_token");
    localStorage.removeItem("raktsetu_donor");
    setDonor(null);
  }

  function updateDonor(donorData) {
    localStorage.setItem("raktsetu_donor", JSON.stringify(donorData));
    setDonor(donorData);
  }

  return (
    <AuthContext.Provider value={{ donor, loading, login, logout, updateDonor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
