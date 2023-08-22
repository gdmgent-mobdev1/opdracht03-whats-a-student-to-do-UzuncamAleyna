/* eslint-disable max-len */
/* eslint-disable import/no-cycle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc } from 'firebase/firestore';
import { dragoverHandler, dropHandler } from '../lib/dragAndDrop';
import {
  addTodoFirebase,
  deleteTodoListFirebase,
  fireStoreDb,
  timeSpentFirebase,
  updateTimerFirebase,
  updateScoreFirebase,
  auth,
  deleteCardFromFirebase,
} from '../lib/firebase-init';
import Card from './Card';

export default class TodoList {
  place: HTMLElement;

  title: string;

  cardArray: Card[];

  input?: HTMLInputElement;

  div?: HTMLDivElement;

  h2?: HTMLHeadingElement;

  button?: HTMLButtonElement;

  deleteButton?: HTMLButtonElement;

  todoListElement?: string | HTMLElement;

  id: string;

  deadline: string;

  description: string;

  comments: string[];

  timerInterval: NodeJS.Timeout | null = null; // NodeJS.Timeout is the type of the timerInterval, deze zorgt ervoor dat de timerInterval niet null is

  startTime: number = 0;

  currentTime: number = 0; // time that has passed since the timer started

  timerRunning: boolean = false;

  timerScreen: HTMLDivElement | undefined;

  startButton: HTMLButtonElement | undefined;

  stopButton: HTMLButtonElement | undefined;

  constructor(place: HTMLElement, title = 'to-do list', id = `_${uuidv4()}`, deadline = '', description = '', comments = []) {
    this.id = id;
    this.place = place;
    this.title = title;
    this.cardArray = [];
    this.id = id;
    this.deadline = deadline;
    this.description = description;
    this.comments = comments;
    this.render();
  }

  // Inside your TodoList class
  startTimer() {
    if (!this.timerRunning) {
      this.startTime = Date.now() - this.currentTime; // 0 seconden
      this.timerInterval = setInterval(() => {
        // Tijd die is gepasseerd sinds timer is gestart
        this.currentTime = Date.now() - this.startTime;
        this.updateTimerScreen();
        updateTimerFirebase(this.id, this.currentTime);
      }, 1000);
      // Timer is gestart
      this.timerRunning = true;
    }
  }

  stopTimer() {
    if (this.timerRunning && this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerRunning = false;
      timeSpentFirebase(this.id, this.currentTime);
    }
  }

  updateTimerScreen() {
    if (this.timerScreen) {
      const seconds = Math.floor(this.currentTime / 1000); // miliseconden -> seconden
      const minutes = Math.floor(seconds / 60); // seconden -> minuten
      const remainingSeconds = seconds % 60; // overige seconden (seconden mogen 60 niet overschrijden)

      let formattedRemainingSeconds: string;
      if (remainingSeconds < 10) {
        formattedRemainingSeconds = `0${remainingSeconds}`;
      } else {
        formattedRemainingSeconds = `${remainingSeconds}`;
      }
      this.timerScreen.innerText = `${minutes}:${formattedRemainingSeconds}`;
    }
  }

  // Here we initialize the saved timer value and update the timer display. Initialize means that we set the timer to the value that was saved in the database.
  async initialiseTimer() {
    try {
      const todoListDoc = doc(fireStoreDb, 'lists', this.id);
      const todoListSnap = await getDoc(todoListDoc);
      const data = todoListSnap.data();
      if (data && data.currentTime !== undefined) {
        this.currentTime = data.currentTime;
        this.updateTimerScreen();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async deleteTodoList() {
    const user = auth.currentUser;
    const scorePerProject = 10;
    if (user) {
      await updateScoreFirebase(user.uid, scorePerProject); // Score toevoegen bij de gebruiker
    }
    // Verwijder de subtaken van de todo list
    for (const card of this.cardArray) {
      await deleteCardFromFirebase(this.id, card.id);
    }
    // Verwijder daarna de todo list
    await deleteTodoListFirebase(this.id);
  }

  async addToDo() {
    if (this.input instanceof HTMLInputElement && this.div instanceof HTMLDivElement) {
      const text = this.input.value;
      const cardId = await addTodoFirebase(text, this.id);
      const newCard = new Card(text, this.div, this, cardId, this.id, this.deadline, this.description, this.comments);
      this.cardArray.push(newCard);
    }
  }

  render(): void {
    this.createToDoListElement();
    if (this.todoListElement instanceof HTMLElement) {
      this.todoListElement.addEventListener('drop', dropHandler);
      this.todoListElement.addEventListener('dragover', dragoverHandler);
      this.place.append(this.todoListElement);
    }
  }

  async createToDoListElement(): Promise<void> {
    // Create elements
    this.h2 = document.createElement('h2');
    this.h2.innerText = this.title;
    this.input = document.createElement('input');
    this.input.classList.add('comment');
    this.button = document.createElement('button');
    this.button.innerText = 'Add';
    this.button.classList.add('btn-save');
    this.button.id = 'to-do-list-button';
    this.div = document.createElement('div');
    this.deleteButton = document.createElement('button');
    this.deleteButton.classList.add('delete-btn');
    this.todoListElement = document.createElement('div');
    this.todoListElement.id = this.id;
    this.timerScreen = document.createElement('div');
    this.timerScreen.classList.add('timer');
    this.startButton = document.createElement('button');
    this.startButton.innerText = 'Start Timer';
    this.startButton.classList.add('start_button');
    this.stopButton = document.createElement('button');
    this.stopButton.innerText = 'Stop Timer';
    this.stopButton.classList.add('stop_button');
    // Add Event listener
    this.button.addEventListener('click', () => {
      if ((this.input !== null) && this.input?.value !== '') {
        this.addToDo.call(this);
        this.input!.value = '';
      }
    });
    this.deleteButton.addEventListener('click', async () => {
      await this.deleteTodoList();
      deleteTodoListFirebase(this.id);
      document.querySelector(`#${this.id}`)?.remove();
    });

    // Timer
    this.startButton.addEventListener('click', () => {
      this.startTimer();
    });

    this.stopButton.addEventListener('click', () => {
      this.stopTimer();
      timeSpentFirebase(this.id, this.currentTime); // Pass the elapsed time
      console.log(this.currentTime);
    });

    // Append elements to the to-do list element
    this.todoListElement.append(this.h2);
    this.todoListElement.append(this.input);
    this.todoListElement.append(this.button);
    this.todoListElement.append(this.div);
    this.todoListElement.append(this.deleteButton);
    this.todoListElement.append(this.timerScreen);
    this.todoListElement.append(this.startButton);
    this.todoListElement.append(this.stopButton);
    this.todoListElement.classList.add('todoList');

    await this.initialiseTimer();
  }
}
