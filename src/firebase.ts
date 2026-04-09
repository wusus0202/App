import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp, 
  addDoc, 
  serverTimestamp, 
  increment,
  getDocFromServer
} from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 測試 Firestore 連線
async function testConnection() {
  try {
    console.log("正在測試 Firestore 連線...");
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore 連線成功！");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("❌ Firestore 連線失敗：客戶端離線。請檢查 Firebase 配置或網路。");
    } else {
      console.warn("Firestore 連線測試提示 (非致命):", error);
    }
  }
}
testConnection();

/**
 * Google 登入 (支援彈出與重導向)
 */
export const signInWithGoogle = async () => {
  try {
    // 在行動裝置上，Redirect 通常比 Popup 穩定
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }
  } catch (error: any) {
    console.error("❌ Google 登入失敗:", error);
  }
};

/**
 * 檢查重導向登入結果
 */
export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user;
  } catch (error) {
    console.error("Redirect 登入結果錯誤:", error);
  }
};

/**
 * 訪客登入 (匿名模式)
 */
export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    console.error("❌ 訪客登入失敗:", error);
  }
};

export const signOut = () => firebaseSignOut(auth);

// Firestore Error Handling Spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// 匯出常用的 Firestore 函式
export { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, Timestamp, addDoc, serverTimestamp, onAuthStateChanged, increment, getDocFromServer
};
export type { FirebaseUser };
