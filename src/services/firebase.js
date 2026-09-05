import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs,
  arrayUnion
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail 
} from 'firebase/auth';

let firebaseApp = null;
let db = null;
let auth = null;

const getFallbackApiKey = () => {
  try {
    if (typeof atob !== 'undefined') {
      return atob("QUl6YVN5Q3UyT1NBZExUVmdwQUhmRzlQNDdhT1p1d0tqb1pQT3ZZ");
    }
  } catch {
    // fallback
  }
  return "";
};

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || getFallbackApiKey(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cvc-portal-c73b0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cvc-portal-c73b0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cvc-portal-c73b0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "922441157837",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:922441157837:web:f2dd3c47bbb694d9276d84",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HJ1Z37QJFH"
};

export const isFirebaseConfigured = () => {
  try {
    const config = getFirebaseConfig();
    return !!(config && config.apiKey && config.projectId);
  } catch {
    return false;
  }
};

export const getFirebaseConfig = () => {
  try {
    const config = localStorage.getItem('cvc_firebase_config');
    if (config) {
      const parsed = JSON.parse(config);
      if (parsed && parsed.apiKey && parsed.apiKey.startsWith('AIza')) {
        return parsed;
      }
    }
    return DEFAULT_FIREBASE_CONFIG;
  } catch {
    return DEFAULT_FIREBASE_CONFIG;
  }
};

export const saveFirebaseConfig = (config) => {
  if (config) {
    localStorage.setItem('cvc_firebase_config', JSON.stringify(config));
  } else {
    localStorage.removeItem('cvc_firebase_config');
  }
  initializeFirebase();
};

export const initializeFirebase = () => {
  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    firebaseApp = null;
    db = null;
    auth = null;
    return false;
  }

  try {
    const apps = getApps();
    if (apps.length > 0) {
      for (const app of apps) {
        deleteApp(app);
      }
    }
    firebaseApp = initializeApp(config);
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    return true;
  } catch (error) {
    console.error("Firebase init failed:", error);
    firebaseApp = null;
    db = null;
    auth = null;
    return false;
  }
};

// Initialize on import
initializeFirebase();

// ==========================================
// Authentication APIs
// ==========================================
export const loginWithEmail = (email, password) => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Check your config.");
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = (email, password) => {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  return createUserWithEmailAndPassword(auth, email, password);
};

export const resetPasswordEmail = (email) => {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  return sendPasswordResetEmail(auth, email);
};

export const loginWithGoogle = () => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Check your config.");
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logoutUser = () => {
  if (!auth) return Promise.resolve();
  return signOut(auth);
};

export const onAuthChanged = (callback) => {
  if (!auth) {
    // If not configured, trigger callback with null (anonymous/guest) or check local storage mock user
    const mockUser = localStorage.getItem('cvc_mock_user');
    callback(mockUser ? JSON.parse(mockUser) : null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Mock Login for Local Storage mode
export const loginMockUser = (email) => {
  const mockUser = {
    uid: 'mock_user_' + email.replace(/[^a-zA-Z0-9]/g, ''),
    email: email,
    displayName: email.split('@')[0],
    isMock: true
  };
  localStorage.setItem('cvc_mock_user', JSON.stringify(mockUser));
  return mockUser;
};

export const logoutMockUser = () => {
  localStorage.removeItem('cvc_mock_user');
  localStorage.removeItem('cvc_active_workspace');
};

// ==========================================
// Team & Workspace APIs
// ==========================================
export const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a Team Workspace
export const createTeam = async (name, ownerId, isMock = false) => {
  const inviteCode = generateInviteCode();
  const teamData = {
    name,
    ownerId,
    members: [ownerId],
    inviteCode,
    createdAt: new Date().toISOString()
  };

  if (db && !isMock) {
    try {
      const docRef = await addDoc(collection(db, 'teams'), teamData);
      return { id: docRef.id, ...teamData };
    } catch (err) {
      console.warn("Firestore createTeam failed, falling back to LocalStorage:", err);
      if (err.code === 'permission-denied' || err.message?.includes('permission')) {
        throw new Error("データベース書き込み権限エラー (Permission Denied)。Firebaseコンソールのセキュリティルールをご確認いただくか、ログイン状態をご確認ください。");
      }
      throw err;
    }
  } else {
    // Local storage teams
    const stored = localStorage.getItem('teams');
    const teams = stored ? JSON.parse(stored) : [];
    const newId = 'team_' + Date.now().toString();
    const newTeam = { id: newId, ...teamData };
    teams.push(newTeam);
    localStorage.setItem('teams', JSON.stringify(teams));
    notifyLocalListeners('teams');
    return newTeam;
  }
};

// Join a Team Workspace using Invite Code
export const joinTeamWithCode = async (inviteCode, userId, isMock = false) => {
  const cleanCode = inviteCode.trim().toUpperCase();

  if (db && !isMock) {
    try {
      const teamsRef = collection(db, 'teams');
      const q = query(teamsRef, where("inviteCode", "==", cleanCode));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Fallback check local storage if not found in cloud
        const stored = localStorage.getItem('teams');
        const teams = stored ? JSON.parse(stored) : [];
        const localTeam = teams.find(t => t.inviteCode === cleanCode);
        if (localTeam) {
          if (!localTeam.members.includes(userId)) {
            localTeam.members.push(userId);
            localStorage.setItem('teams', JSON.stringify(teams));
            notifyLocalListeners('teams');
          }
          return localTeam;
        }
        throw new Error("無効な招待コードです。チームが見つかりませんでした。");
      }

      const teamDoc = snapshot.docs[0];
      const teamData = teamDoc.data();
      
      if (teamData.members && teamData.members.includes(userId)) {
        return { id: teamDoc.id, ...teamData }; // Already a member
      }

      await updateDoc(doc(db, 'teams', teamDoc.id), {
        members: arrayUnion(userId)
      });

      return { id: teamDoc.id, ...teamData, members: [...(teamData.members || []), userId] };
    } catch (err) {
      console.warn("Firestore joinTeamWithCode error:", err);
      if (err.code === 'permission-denied' || err.message?.includes('permission') || err.message?.includes('permissions')) {
        // Check if it exists locally before throwing permission error
        const stored = localStorage.getItem('teams');
        const teams = stored ? JSON.parse(stored) : [];
        const localTeam = teams.find(t => t.inviteCode === cleanCode);
        if (localTeam) {
          if (!localTeam.members.includes(userId)) {
            localTeam.members.push(userId);
            localStorage.setItem('teams', JSON.stringify(teams));
            notifyLocalListeners('teams');
          }
          return localTeam;
        }
        throw new Error("データベースのアクセス権限エラー: Firestoreのセキュリティルールで teams コレクションの読み書き権限が許可されているかご確認ください。");
      }
      throw err;
    }
  } else {
    // Local storage teams fallback
    const stored = localStorage.getItem('teams');
    const teams = stored ? JSON.parse(stored) : [];
    const teamIndex = teams.findIndex(t => t.inviteCode === cleanCode);

    if (teamIndex === -1) {
      throw new Error("無効な招待コードです。ローカルチームが見つかりませんでした。");
    }

    const team = teams[teamIndex];
    if (!team.members.includes(userId)) {
      team.members.push(userId);
      localStorage.setItem('teams', JSON.stringify(teams));
      notifyLocalListeners('teams');
    }
    return team;
  }
};

// Subscribe to User's Team list
export const subscribeToUserTeams = (userId, callback, isMock = false) => {
  // Local Storage fallback helper
  const fetchLocalTeams = () => {
    const stored = localStorage.getItem('teams');
    const teams = stored ? JSON.parse(stored) : [];
    const userTeams = teams.filter(t => t.members && t.members.includes(userId));
    callback(userTeams);
  };

  if (db && !isMock) {
    try {
      const q = query(collection(db, 'teams'), where("members", "array-contains", userId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(teams);
      }, (error) => {
        console.error("Teams subscribe error:", error);
        fetchLocalTeams();
      });
      return unsubscribe;
    } catch (e) {
      console.error("Failed to subscribe to Firestore teams:", e);
      fetchLocalTeams();
    }
  }

  // Register listener for local updates
  if (!localListeners['teams']) {
    localListeners['teams'] = [];
  }
  localListeners['teams'].push(fetchLocalTeams);

  fetchLocalTeams();

  return () => {
    if (localListeners['teams']) {
      localListeners['teams'] = localListeners['teams'].filter(cb => cb !== fetchLocalTeams);
    }
  };
};

// ==========================================
// Firestore Real-Time Subscriptions & CRUD
// ==========================================

const localListeners = {};

const notifyLocalListeners = (collectionName) => {
  if (localListeners[collectionName]) {
    const stored = localStorage.getItem(collectionName);
    const data = stored ? JSON.parse(stored) : [];
    localListeners[collectionName].forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error(`Error notifying local listener for ${collectionName}:`, e);
      }
    });
  }
};

// Subscribe to items filtered by workspaceId
export const subscribeToCollection = (collectionName, workspaceId, callback, fallbackData, isMock = false) => {
  if (db && !isMock) {
    try {
      const colRef = collection(db, collectionName);
      // Filter by workspaceId
      const q = query(colRef, where("workspaceId", "==", workspaceId));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // If Firestore returns 0 items for this workspace and it is a personal workspace on first visit, check local fallback
        if (items.length === 0 && fallbackData) {
          const stored = localStorage.getItem(collectionName);
          if (stored) {
            const localList = JSON.parse(stored).filter(item => item.workspaceId === workspaceId);
            if (localList.length > 0) {
              callback(localList);
              return;
            }
          }
        }
        callback(items);
      }, (error) => {
        console.error(`Firestore subscribe error for ${collectionName}:`, error);
        readLocalStorageFallback(collectionName, workspaceId, callback, fallbackData);
      });
      return unsubscribe;
    } catch (e) {
      console.error(`Failed to subscribe to Firestore ${collectionName}:`, e);
    }
  }
  
  // Register local listener
  if (!localListeners[collectionName]) {
    localListeners[collectionName] = [];
  }
  const localCallback = () => readLocalStorageFallback(collectionName, workspaceId, callback, fallbackData);
  localListeners[collectionName].push(localCallback);

  localCallback();

  return () => {
    if (localListeners[collectionName]) {
      localListeners[collectionName] = localListeners[collectionName].filter(cb => cb !== localCallback);
    }
  };
};

const readLocalStorageFallback = (collectionName, workspaceId, callback, fallbackData) => {
  const stored = localStorage.getItem(collectionName);
  let list = stored ? JSON.parse(stored) : [];
  
  if (!stored && fallbackData) {
    // Inject seed workspaceId on first load
    list = fallbackData.map(item => ({ ...item, workspaceId }));
    localStorage.setItem(collectionName, JSON.stringify(list));
  }
  
  // Filter by workspaceId
  const filtered = list.filter(item => item.workspaceId === workspaceId);
  callback(filtered);
};

export const addDocument = async (collectionName, data, isMock = false) => {
  if (db && !isMock) {
    try {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, data);
      return docRef.id;
    } catch (err) {
      console.warn(`Firestore addDocument failed for ${collectionName}, falling back to LocalStorage:`, err);
    }
  }
  
  // LocalStorage handling
  const stored = localStorage.getItem(collectionName);
  const list = stored ? JSON.parse(stored) : [];
  const newId = 'local_' + Date.now().toString() + Math.random().toString(36).substring(2, 5);
  const newItem = { id: newId, ...data };
  list.push(newItem);
  localStorage.setItem(collectionName, JSON.stringify(list));
  notifyLocalListeners(collectionName);
  return newId;
};

export const updateDocument = async (collectionName, docId, data, isMock = false) => {
  if (db && !isMock) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
      return;
    } catch (err) {
      console.warn(`Firestore updateDocument failed for ${collectionName}, falling back to LocalStorage:`, err);
    }
  }
  
  // LocalStorage handling
  const stored = localStorage.getItem(collectionName);
  let list = stored ? JSON.parse(stored) : [];
  list = list.map(item => item.id === docId ? { ...item, ...data } : item);
  localStorage.setItem(collectionName, JSON.stringify(list));
  notifyLocalListeners(collectionName);
};

export const deleteDocument = async (collectionName, docId, isMock = false) => {
  if (db && !isMock) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return;
    } catch (err) {
      console.warn(`Firestore deleteDocument failed for ${collectionName}, falling back to LocalStorage:`, err);
    }
  }
  
  // LocalStorage handling
  const stored = localStorage.getItem(collectionName);
  let list = stored ? JSON.parse(stored) : [];
  list = list.filter(item => item.id !== docId);
  localStorage.setItem(collectionName, JSON.stringify(list));
  notifyLocalListeners(collectionName);
};
