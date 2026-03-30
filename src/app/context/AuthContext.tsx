import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_KEY = "foodie_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authAPI.login(email, password);
      const role = (data.role ?? "CUSTOMER").toUpperCase() as User["role"];
      const loggedIn: User = {
        id:    String(data.userId),
        name:  data.name,
        email: data.email,
        role,
      };
      setUser(loggedIn);
      localStorage.setItem(SESSION_KEY, JSON.stringify(loggedIn));
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) => {
    setLoading(true);
    try {
      await authAPI.register(formData);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // proceed even if server call fails
    } finally {
      setUser(null);
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const isAdmin =
    user?.role === "ADMIN" ||
    (user?.role as string)?.toLowerCase() === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}