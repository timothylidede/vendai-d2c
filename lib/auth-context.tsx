// lib/auth-context.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface UserData {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  provider: string;
  address: string;
  city: string;
  area?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: any; // Firebase User
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        setUserData(
          userDoc.exists()
            ? {
                uid: firebaseUser.uid,
                name: userDoc.data().name || firebaseUser.displayName || "User",
                email: userDoc.data().email || firebaseUser.email || "",
                phone: userDoc.data().phone || "",
                photoURL: userDoc.data().photoURL || firebaseUser.photoURL || "",
                provider: userDoc.data().provider || "google",
                address: userDoc.data().address || "Westlands",
                city: userDoc.data().city || "Nairobi",
                area: userDoc.data().area || "",
                createdAt: userDoc.data().createdAt || new Date().toISOString(),
                updatedAt: userDoc.data().updatedAt || new Date().toISOString(),
              }
            : null
        );
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, userData, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);