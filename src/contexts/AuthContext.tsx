import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, FirebaseUser, db, doc, onSnapshot, setDoc, checkRedirectResult, handleFirestoreError, OperationType } from '../firebase';

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role?: string;
  points?: number;
  level?: number;
  streak?: number;
  bio?: string;
  tasks_completed_today?: number;
  total_tasks_completed?: number;
  completion_rate?: number;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider initialized, starting auth check...");
    
    // 安全機制：如果 10 秒後還在載入，強制結束載入狀態
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timeout reached, forcing loading to false.");
        setLoading(false);
      }
    }, 10000);

    // 檢查重導向登入結果 (針對行動裝置)
    checkRedirectResult().then(redirectUser => {
      if (redirectUser) {
        console.log("Redirect login success:", redirectUser.uid);
      }
    }).catch(err => {
      console.error("Redirect check error:", err);
    });

    let unsubscribeProfile: (() => void) | null = null;

    // 監聽 Firebase 登入狀態
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? `User ${firebaseUser.uid}` : "No user");
      setUser(firebaseUser);
      
      // 清除之前的 Profile 監聽器
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        // 監聽使用者個人資料
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeProfile = onSnapshot(userRef, async (docSnap) => {
          console.log("Profile snapshot received, exists:", docSnap.exists());
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            setLoading(false);
            clearTimeout(loadingTimeout);
          } else {
            // 如果沒資料，建立一個基本的並寫入 Firestore
            const basicProfile: UserProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Guest User',
              email: firebaseUser.email || null,
              photoURL: firebaseUser.photoURL || null,
              role: 'user',
              points: 0,
              level: 1,
              streak: 0,
              tasks_completed_today: 0,
              total_tasks_completed: 0,
              completion_rate: 0
            };
            
            try {
              console.log("正在嘗試建立個人資料...", basicProfile);
              await setDoc(userRef, basicProfile);
              console.log("個人資料建立成功！");
              setProfile(basicProfile);
            } catch (error) {
              handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}`);
            }
            setLoading(false);
            clearTimeout(loadingTimeout);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
          clearTimeout(loadingTimeout);
        });
      } else {
        setProfile(null);
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      clearTimeout(loadingTimeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
