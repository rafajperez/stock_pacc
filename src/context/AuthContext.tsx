"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      try {
        const envEmails = process.env.NEXT_PUBLIC_ALLOWED_EMAILS || "";
        const allowedList = envEmails
          .split(",")
          .map((e) => e.trim().toLowerCase());

        console.log("DEBUG - Usuário logado:", currentUser?.email);
        console.log("DEBUG - Lista permitida:", allowedList);

        if (
          currentUser &&
          currentUser.email &&
          allowedList.includes(currentUser.email.toLowerCase())
        ) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro no AuthProvider:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
