import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';

// Firebase configuration (hardcoded)
const firebaseConfig = {
  apiKey: 'AIzaSyAosY9XOqxE1n1hxY2iP_KBIwLiwUf8nSs',
  authDomain: 'workmanagement-a6b1e.firebaseapp.com',
  projectId: 'workmanagement-a6b1e',
  storageBucket: 'workmanagement-a6b1e.appspot.com',
  messagingSenderId: '568635570670',
  appId: '1:568635570670:web:6156e0e9eb743c9da1b6ff',
  measurementId: 'G-1KRFHKR3C1',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility function for logging errors
const logError = (message: string, error: any) => {
  if (process.env.NODE_ENV === 'production') {
    console.error(`PROD LOG: ${message}`, error);
  } else {
    console.error(`DEV LOG: ${message}`, error);
  }
};

// User Authentication Functions
export const loginUser = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    logError('Error logging in user', error);
    throw new Error('Unable to log in. Please check your credentials.');
  }
};

export const logoutUser = async () => {
  try {
    return await signOut(auth);
  } catch (error) {
    logError('Error logging out user', error);
    throw new Error('Unable to log out. Please try again.');
  }
};

export const signUpUser = async (
  email: string,
  password: string,
  role: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await addDoc(collection(db, 'users'), {
      uid: userCredential.user.uid,
      email: email,
      role: role,
    });
    return userCredential.user;
  } catch (error) {
    logError('Error signing up user', error);
    throw new Error('Unable to sign up. Please try again.');
  }
};

// Firestore Functions
export const getUserRole = async (uid: string): Promise<string | null> => {
  try {
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().role;
    }
    return null;
  } catch (error) {
    logError('Error fetching user role', error);
    throw new Error('Unable to fetch user role.');
  }
};

export const addTask = async (title: string, assignedTo: string) => {
  try {
    await addDoc(collection(db, 'tasks'), {
      title,
      assignedTo,
      completed: false,
    });
  } catch (error) {
    logError('Error adding task', error);
    throw new Error('Unable to add task. Please try again.');
  }
};

// Fetch tasks where the 'assignedTo' field matches the worker's user ID (uid)
export const getTasks = async (userId: string) => {
  try {
    console.log(`Fetching tasks for user: ${userId}`);

    const tasksCollection = collection(db, 'tasks');
    const q = query(tasksCollection, where('assignedTo', '==', userId)); // Filter tasks by assignedTo
    const querySnapshot = await getDocs(q);

    const tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Fetched tasks:`, tasks);

    return tasks;
  } catch (error) {
    logError('Error fetching tasks', error);
    throw new Error('Unable to fetch tasks.');
  }
};

// Fetch all tasks without filtering by user ID (for admin)
export const getAllTasks = async () => {
  try {
    console.log(`Fetching all tasks`);

    const tasksCollection = collection(db, 'tasks');
    const querySnapshot = await getDocs(tasksCollection);

    const tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Fetched all tasks:`, tasks);

    return tasks;
  } catch (error) {
    logError('Error fetching all tasks', error);
    throw new Error('Unable to fetch all tasks.');
  }
};

export const completeTask = async (taskId: string) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, { completed: true });
  } catch (error) {
    logError('Error completing task', error);
    throw new Error('Unable to complete task. Please try again.');
  }
};

export const getWorkers = async () => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'worker'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    logError('Error fetching workers', error);
    throw new Error('Unable to fetch workers.');
  }
};

// Export Firebase User Type
export type { FirebaseUser as User };
