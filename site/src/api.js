import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from './firebase';

let currentUser = null;

// Monitor auth state
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

export const api = {
  // Authentication Methods
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, token: await userCredential.user.getIdToken() };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  signup: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, token: await userCredential.user.getIdToken() };
    } catch (error) {
      throw new Error(error.message || 'Signup failed');
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message || 'Logout failed');
    }
  },

  isAuthenticated: () => {
    return !!currentUser;
  },

  getCurrentUser: () => currentUser,

  // Stats Methods
  getWeeklyWaste: async () => {
    try {
      const q = query(collection(db, 'dailyLogs'), where('userId', '==', currentUser?.uid || ''));
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => doc.data());
      
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      return logs.slice(-5).map((log, index) => {
        const wasteKg = parseFloat((log.leftovers * 0.2).toFixed(1));
        return {
          day: days[index % days.length],
          waste: wasteKg,
          portions: log.leftovers
        };
      });
    } catch (error) {
      console.error('Error fetching weekly waste:', error);
      throw error;
    }
  },

  // Predictions Methods
  getUpcomingPredictions: async () => {
    try {
      const q = query(
        collection(db, 'predictions'),
        where('userId', '==', currentUser?.uid || '')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.riskLevel === 'High' || p.riskLevel === 'Medium');
    } catch (error) {
      console.error('Error fetching upcoming predictions:', error);
      throw error;
    }
  },

  getPredictions: async (from, to) => {
    try {
      const q = query(collection(db, 'predictions'), where('userId', '==', currentUser?.uid || ''));
      const snapshot = await getDocs(q);
      let predictions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (from && to) {
        predictions = predictions.filter(p => p.date >= from && p.date <= to);
      }
      return predictions;
    } catch (error) {
      console.error('Error fetching predictions:', error);
      throw error;
    }
  },

  getPredictionDetails: async (id) => {
    try {
      const docRef = doc(db, 'predictions', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      throw new Error('Prediction not found');
    } catch (error) {
      console.error('Error fetching prediction details:', error);
      throw error;
    }
  },

  // Recommendations Methods
  getTodayRecommendations: async () => {
    try {
      const q = query(
        collection(db, 'recommendations'),
        where('userId', '==', currentUser?.uid || ''),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .slice(0, 3);
    } catch (error) {
      console.error('Error fetching today recommendations:', error);
      throw error;
    }
  },

  getRecommendations: async () => {
    try {
      const q = query(collection(db, 'recommendations'), where('userId', '==', currentUser?.uid || ''));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  acceptRecommendation: async (id) => {
    try {
      const docRef = doc(db, 'recommendations', id);
      await updateDoc(docRef, { status: 'accepted' });
      return { success: true };
    } catch (error) {
      console.error('Error accepting recommendation:', error);
      throw error;
    }
  },

  ignoreRecommendation: async (id) => {
    try {
      const docRef = doc(db, 'recommendations', id);
      await updateDoc(docRef, { status: 'ignored' });
      return { success: true };
    } catch (error) {
      console.error('Error ignoring recommendation:', error);
      throw error;
    }
  },

  // Data Logs Methods
  getDailyLogs: async () => {
    try {
      const q = query(collection(db, 'dailyLogs'), where('userId', '==', currentUser?.uid || ''));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching daily logs:', error);
      throw error;
    }
  },

  addDailyLog: async (logData) => {
    try {
      const docRef = await addDoc(collection(db, 'dailyLogs'), {
        ...logData,
        userId: currentUser?.uid || '',
        createdAt: new Date(),
      });
      return { id: docRef.id, ...logData };
    } catch (error) {
      console.error('Error adding daily log:', error);
      throw error;
    }
  },

  // Real-time subscription methods
  subscribeToPredictions: (callback) => {
    const q = query(collection(db, 'predictions'), where('userId', '==', currentUser?.uid || ''));
    return onSnapshot(q, (snapshot) => {
      const predictions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(predictions);
    }, (error) => {
      console.error('Error in predictions subscription:', error);
      callback([]);
    });
  },

  subscribeToRecommendations: (callback) => {
    const q = query(collection(db, 'recommendations'), where('userId', '==', currentUser?.uid || ''));
    return onSnapshot(q, (snapshot) => {
      const recommendations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(recommendations);
    }, (error) => {
      console.error('Error in recommendations subscription:', error);
      callback([]);
    });
  },
};
