/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  deleteDoc,
  collection,
  addDoc,
  setDoc,
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAUtF16hTMWpoRdIccVkOJMMNyJYj8LMds',
  authDomain: 'whats-a-student-to-do-5f931.firebaseapp.com',
  projectId: 'whats-a-student-to-do-5f931',
  storageBucket: 'whats-a-student-to-do-5f931.appspot.com',
  messagingSenderId: '953459344478',
  appId: '1:953459344478:web:55894df89338ada51e20cf',
};

// Initialiseer Firebase
const app = initializeApp(firebaseConfig);

export const fireStoreApp = initializeApp(firebaseConfig);

// Haal database op
export const fireStoreDb = getFirestore(fireStoreApp);

// Voeg Todo List toe aan database
export const addTodoFirebase = async (text: string, todoId: string) => {
  const cardsSnapShot = collection(fireStoreDb, `lists/${todoId}/cards`);

  const docRef = await addDoc(cardsSnapShot, {
    title: text,
    description: '',
    comments: [],
    deadline: '',
  });
  return docRef.id;
};

export const updateTodoFirebase = async (todoListId: string, id: string, attribute: string, value: string) => {
  console.log(todoListId, id, attribute, value);
  if (attribute === 'title') {
    await setDoc(doc(fireStoreDb, `lists/${todoListId}/cards`, id), {
      title: value,
    }, { merge: true });
  } else if (attribute === 'description') {
    await setDoc(doc(fireStoreDb, `lists/${todoListId}/cards`, id), {
      description: value,
    }, { merge: true });
  }
};

export const updateCardCommentsFirebase = async (todoListId: string, id: string, attribute: string, value: string[]) => {
  if (attribute === 'comments') {
    await setDoc(doc(fireStoreDb, `lists/${todoListId}/cards`, id), {
      comments: value,
    }, { merge: true });
  }
};

export const updateCardDeadlineFirebase = async (todoListId: string, id: string, attribute: string, value: string) => {
  if (attribute === 'deadline') {
    await setDoc(doc(fireStoreDb, `lists/${todoListId}/cards`, id), {
      deadline: value,
    }, { merge: true });
  }
};

export const updateTimerFirebase = async (todoListId: string, currentTime: number) => {
  await setDoc(doc(fireStoreDb, 'lists', todoListId), {
    currentTime,
  }, { merge: true });
};

export const updateScoreFirebase = async (todoListId: string, score: number) => {
  const todoListRef = doc(fireStoreDb, 'scoreboard', todoListId);
  await setDoc(todoListRef, {
    score,
  }, { merge: true });
};

export const deleteTodoListFirebase = async (id: string) => {
  await deleteDoc(doc(fireStoreDb, 'lists', id));
};

export const deleteCardFromFirebase = async (todoListId: string, id: string) => {
  await deleteDoc(doc(fireStoreDb, `lists/${todoListId}/cards`, id));
};

export const timeSpentFirebase = async (todoListId: string, timeSpent: number) => {
  try {
    const seconds = Math.floor(timeSpent / 1000); // miliseconden -> seconden
    const minutes = Math.floor(seconds / 60); // seconden -> minuten
    const remainingSeconds = seconds % 60; // overige seconden

    const formatTheTimer = `${minutes.toString()}:${remainingSeconds.toString().padStart(2, '0')}`; // Formateer de timer naar minuten:seconden in string

    await setDoc(doc(fireStoreDb, 'lists', todoListId), {
      timeSpent: formatTheTimer,
    }, { merge: true });
  } catch (error) {
    console.error('Foutje bij het verkijgen van de gespendeerde tijd:', error);
  }
};

export const auth = getAuth();

// User aanmaken met email en wachtwoord
export const RegisterUser = async (email: string, password: string) => {
  const userAuth = await createUserWithEmailAndPassword(auth, email, password);
  return userAuth.user;
};

// User inloggen met email en wachtwoord
export const LoginUser = async (email: string, password: string) => {
  const userAuth = await signInWithEmailAndPassword(auth, email, password);
  return userAuth.user;
};

// User inloggen met Google
const googleAuthProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const userAuth = await signInWithPopup(auth, googleAuthProvider);
    return userAuth.user;
  } catch (error) {
    console.error('Foutje bij het inloggen met Google:', error);
    return null;
  }
};

const user = auth.currentUser;
if (user) {
  const userDocRef = doc(fireStoreDb, 'users', user.uid);
  await setDoc(userDocRef, { scores: [] });
}
