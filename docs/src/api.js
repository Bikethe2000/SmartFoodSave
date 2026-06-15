import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

let token = null;
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    token = await user.getIdToken();
  } else {
    token = null;
  }
});

export const api = {
  isAuthenticated() {
    return !!token;
  },

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      token = await userCredential.user.getIdToken();
      currentUser = userCredential.user;
      return currentUser;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      token = await userCredential.user.getIdToken();
      currentUser = userCredential.user;
      return currentUser;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async logout() {
    try {
      await signOut(auth);
      token = null;
      currentUser = null;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getToken() {
    if (currentUser) {
      token = await currentUser.getIdToken();
    }
    return token;
  },

  async fetchDocsIndex() {
    try {
      const response = await fetch('/api/docs/index');
      if (!response.ok) throw new Error('Failed to fetch docs index');
      return await response.json();
    } catch (error) {
      console.error('Error fetching docs index:', error);
      return [];
    }
  },

  async fetchDocContent(docId) {
    try {
      const response = await fetch(`/api/docs/${docId}`);
      if (!response.ok) throw new Error('Failed to fetch doc content');
      return await response.json();
    } catch (error) {
      console.error('Error fetching doc content:', error);
      return null;
    }
  },
};
