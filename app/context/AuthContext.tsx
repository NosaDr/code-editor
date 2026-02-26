"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';
import { UserData } from '@/app/type';
import { firebaseTimestampToMillis } from '@/app/lib/dateUtils';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userData: null, 
  loading: true,
  refreshUserData: async () => {} 
});

const buildUserData = (uid: string, email: string | null, displayName: string | null, rawData: any): UserData => ({
  uid,
  email,
  displayName,
  examCategory: rawData.examCategory || 'senior',
  subscriptionStatus: rawData.subscriptionStatus || 'free',
  subscriptionExpiry: firebaseTimestampToMillis(rawData.subscriptionExpiry) || undefined,
  credits: rawData.credits || 0,
  totalCreditsEarned: rawData.totalCreditsEarned || 0,
  ...(rawData.specialization && { specialization: rawData.specialization }),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use a ref so refreshUserData always has access to the latest user
  const userRef = useRef<User | null>(null);

  const refreshUserData = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    
    try {
      const docSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (docSnap.exists()) {
        setUserData(buildUserData(
          currentUser.uid,
          currentUser.email,
          currentUser.displayName,
          docSnap.data()
        ));
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }, []); // No dependencies needed — uses ref

  useEffect(() => {
    // No dependency array issue — onAuthStateChanged handles its own lifecycle
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      userRef.current = currentUser; // Keep ref in sync
      setUser(currentUser);
      
      if (currentUser) {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        
        if (docSnap.exists()) {
          setUserData(buildUserData(
            currentUser.uid,
            currentUser.email,
            currentUser.displayName,
            docSnap.data()
          ));
        } else {
          setUserData({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            examCategory: 'senior',
            subscriptionStatus: 'free',
            credits: 0,
            totalCreditsEarned: 0,
          });
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // ← Empty array: only runs once on mount, no overwrite risk

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);