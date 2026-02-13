"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';
import { UserData } from '@/app/type';
import { firebaseTimestampToMillis } from '@/app/lib/dateUtils';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
       
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const rawData = docSnap.data();
       
          const processedData: UserData = {
            uid: currentUser.uid,
            email: currentUser.email || null,
            displayName: currentUser.displayName || null,
            examCategory: rawData.examCategory || 'senior',
            subscriptionStatus: rawData.subscriptionStatus || 'free',
            subscriptionExpiry: firebaseTimestampToMillis(rawData.subscriptionExpiry) || undefined,
            credits: rawData.credits || 0,
            totalCreditsEarned: rawData.totalCreditsEarned || 0,
          };
          setUserData(processedData);
        } else {
          
          const defaultData: UserData = {
            uid: currentUser.uid,
            email: currentUser.email || null,
            displayName: currentUser.displayName || null,
            examCategory: 'senior',
            subscriptionStatus: 'free',
            credits: 0, 
            totalCreditsEarned: 0, 
          };
          setUserData(defaultData);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);