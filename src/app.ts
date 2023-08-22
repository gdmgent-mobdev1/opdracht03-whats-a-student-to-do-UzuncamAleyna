/* eslint-disable no-new */
/* eslint-disable max-len */
/* eslint-disable import/no-cycle */
/* eslint-disable import/prefer-default-export */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Card, TodoList } from './Components';
import { State } from './lib';
import { auth, fireStoreDb } from './lib/firebase-init';
// eslint-disable-next-line import/no-cycle
import Login from './Components/Login';

const root = document.getElementById('app') as HTMLElement;
const addTodoListInput = document.getElementById('addTodoListInput') as HTMLInputElement;
const addTodoListButton = document.getElementById('addTodoListButton') as HTMLElement;
const todoListDiv = document.getElementById('addTodoListDiv') as HTMLElement;

const login = new Login();
let logoutBtnEventConnected = false; // Event listener is niet gekoppeld aan de log out button
const snapshotListeners: Unsubscribe[] = []; // Store your snapshot listener references here

// Toon Todo List
export function showTodoList() {
  root.innerHTML = '';
  todoListDiv.classList.remove('hide');
}

// Hide Todo List
function hideTodoList() {
  todoListDiv.classList.add('hide');
}

// Uitloggen van de user en controleren of een event listener is gekoppeld aan de log out of niet
function logOut() {
  if (!logoutBtnEventConnected) {
    const logoutButton = document.getElementById('logout_button') as HTMLInputElement;
    logoutButton.addEventListener('click', () => {
      signOut(auth)
        .then(() => {
          console.log('Gebruiker is uitgelogd');
          root.innerHTML = '';
          login.render();
        })
        .catch((err) => {
          console.log(err);
        });
    });
    logoutBtnEventConnected = true;
  }
}

// Link om te registeren bij de login
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target && target.matches('[datalink]')) {
    // Login content wordt verwijderd
    root.innerHTML = '';
    // Register component wordt geimporteerd en gerenderd
    import('./Components/Register').then(({ default: Register }) => {
      new Register();
    });
  }
});

// Link om in te loggen bij de register
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target && target.matches('[datalink-back]')) {
    // Register content wordt verwijderd
    root.innerHTML = '';
    // Login component wordt weer gerenderd
    login.render();
  }
});

// Id's van de todo lists verzamelen
const createdTodoLists: string[] = [];

// Todo list aanmaken met unieke ID
const createTodoList = ({ id, cards, title }: { id: string; cards: State[]; title: string }) => {
  // Nieuwe todo list instantie aanmaken
  const newTodoList: TodoList = new TodoList(root, title, id);

  cards.forEach((card: State) => {
    new Card(card.title, newTodoList.div as HTMLElement, newTodoList, card.id, id, card.deadline, card.description, card.comments);
  });

  // Id van Todo list toevoegen aan createdTodoLists array
  createdTodoLists.push(id);
  return newTodoList;
};

// Event listener voor aanmaken van Todo list
addTodoListButton.addEventListener('click', async () => {
  if (addTodoListInput.value.trim() !== '') {
    await addTodoListFirebase(addTodoListInput.value);
    addTodoListInput.value = '';
  }
});

const addTodoListFirebase = async (title: string) => {
  if (!auth.currentUser) {
    return;
  }
  const loggedInUserID = auth.currentUser.uid;
  const colRef = collection(fireStoreDb, 'lists');
  const docRef = await addDoc(colRef, {
    title,
    loggedInUserID,
  });
  console.log('Todo list ID: ', docRef.id);
  return docRef.id;
};

// User logged in of niet
onAuthStateChanged(auth, async (user) => {
  snapshotListeners.forEach((listener) => listener()); // Call the listener to unsubscribe

  if (user) {
    const currentUser = user.uid;
    console.log('Jouw user ID: ', currentUser);
    const userLists = query(collection(fireStoreDb, 'lists'), where('loggedInUserID', '==', currentUser));

    // Attach new snapshot listeners
    const userListsListener = onSnapshot(userLists, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const cards = await getCards(change.doc.id, currentUser);
          const { id } = change.doc;
          const { title } = change.doc.data();
          const todoList = createTodoList({
            title, id, cards, ...change.doc.data(),
          });
          const allCardsArray = await getAllCards(id);
          console.log(allCardsArray);
          allCardsArray.forEach((card) => {
            new Card(card.title, todoList.div as HTMLElement, todoList, card.id, id, card.deadline, card.description, card.comments);
          });
        }
        if (change.type === 'modified') {
          // rerendering
        }
        if (change.type === 'removed') {
          // removing
        }
      });
    });
    // Als user is ingelogd, toon de todo list
    showTodoList();
    logOut();
    snapshotListeners.push(userListsListener); // Store the listener reference
  } else {
    // Als user niet is ingelogd, toon login
    root.innerHTML = '';
    login.render();
    hideTodoList(); // Hide Todo list wanneer user uitlogd
  }
});

// Get de cards van Todo list van user
const getCards = async (id: string, loggenInUserId: string) => {
  const cardsSnapShot = collection(fireStoreDb, `lists/${id}/cards`);
  const qSnap = await getDocs(query(cardsSnapShot, where('loggenInUserId', '==', loggenInUserId)));
  return qSnap.docs.map((d) => ({
    id: d.id,
    title: d.data().title,
    description: d.data().description,
    comments: d.data().comments,
    parentId: d.data().parentId,
    deadline: d.data().deadline,
  }));
};

// Get alle cards van alle Todo lists van user
const getAllCards = async (listId:string) => {
  const cardsSnapShot = collection(fireStoreDb, `lists/${listId}/cards`);
  const qSnap = await getDocs(cardsSnapShot);
  return qSnap.docs.map((d) => ({
    id: d.id,
    title: d.data().title,
    description: d.data().description,
    comments: d.data().comments,
    parentId: d.data().parentId,
    deadline: d.data().deadline,
  }));
};
