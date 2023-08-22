/* eslint-disable no-new */
/* eslint-disable import/no-cycle */
import { v4 as uuidv4 } from 'uuid';
import { root, State } from '../lib';
import { dragstartHandler } from '../lib/dragAndDrop';
import { deleteCardFromFirebase, updateCardCommentsFirebase, updateCardDeadlineFirebase } from '../lib/firebase-init';
import Comment from './Comment';
import EditableText from './EditableText';
import TodoList from './TodoList';

export default class Card {
  place: HTMLElement;

  todoList: TodoList;

  state: State;

  menuContainer?: HTMLElement;

  card?: HTMLDivElement;

  deleteButton?: HTMLButtonElement;

  p?: HTMLParagraphElement;

  menu?: HTMLDivElement;

  menuTitle?: HTMLDivElement;

  menuDescription?: HTMLDivElement;

  commentsInput?: HTMLInputElement;

  commentsButton?: HTMLButtonElement;

  menuComments?: HTMLDivElement;

  editableDescription?: EditableText;

  editableText?: EditableText;

  id: string;

  parentId: string;

  deadlineDate?: HTMLInputElement;

  // eslint-disable-next-line @typescript-eslint/default-param-last
  constructor(title: string, place: HTMLElement, todoList: TodoList, id = `_${uuidv4()}`, parentId:string, deadline:string, description = 'Click to write a description...', comments: string[]) {
    this.id = id;
    this.place = place;
    this.todoList = todoList;
    this.state = {
      id,
      title,
      description: description || 'Click to write a description...',
      comments: comments || [],
      deadline: deadline || '',
    };
    this.parentId = parentId;
    this.render();
  }

  render(): void {
    this.card = document.createElement('div');
    this.card.classList.add('card');
    this.card.setAttribute('draggable', 'true');
    this.card.id = this.id;
    this.deleteButton = document.createElement('button');
    this.deleteButton.classList.add('delete-btn');
    this.card.addEventListener('click', (e) => {
      if (e.target !== this.deleteButton) {
        this.showMenu.call(this);
      }
    });
    this.card.addEventListener('dragstart', dragstartHandler);

    this.p = document.createElement('p');
    this.p.classList.add('p-title');
    this.p.innerText = this.state.title;

    this.deleteButton = document.createElement('button');
    this.deleteButton.classList.add('delete-btn');

    this.deleteButton.addEventListener('click', () => {
      this.deleteCard.call(this);
      deleteCardFromFirebase(this.parentId!, this.id);
    });

    this.card.append(this.p);
    this.card.append(this.deleteButton);
    this.place.append(this.card);
  }

  deleteCard(): void {
    this.card?.remove();
    const i = this.todoList.cardArray.indexOf(this);
    this.todoList.cardArray.splice(i, 1);
  }

  showMenu(): void {
    // Create elements
    this.menu = document.createElement('div');
    this.menuContainer = document.createElement('div');
    this.menuTitle = document.createElement('div');
    this.menuDescription = document.createElement('div');
    this.commentsInput = document.createElement('input');
    this.commentsButton = document.createElement('button');
    this.menuComments = document.createElement('div');

    // Add class names
    this.menu.className = 'menu';
    this.menuContainer.className = 'menuContainer';
    this.menu.setAttribute('data-id', this.id);
    this.menu.setAttribute('data-todolist-id', this.parentId);
    this.menuTitle.className = 'menuTitle';
    this.menuDescription.className = 'menuDescription';
    this.menuComments.className = 'menuComments';
    this.commentsInput.className = 'commentsInput comment';
    this.commentsButton.className = 'commentsButton btn-save';

    // Add Deadline
    this.deadlineDate = document.createElement('input');
    this.deadlineDate.className = 'deadlineDate';
    this.deadlineDate.type = 'date';
    this.deadlineDate.value = this.state.deadline;

    // Add inner title
    this.commentsButton.innerText = 'Add';
    this.commentsInput.placeholder = 'Write a comment...';

    // Event listeners
    this.menuContainer.addEventListener('click', (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains('menuContainer') && (this.menuContainer != null)) {
        this.menuContainer?.remove();
      }
    });

    this.commentsButton.addEventListener('click', () => {
      if (this.commentsInput?.value !== '' && (this.commentsInput != null)) {
        const newComment = this.commentsInput.value;
        this.state.comments?.push(newComment);

        // De comments updaten in firebase
        updateCardCommentsFirebase(this.parentId, this.id, 'comments', this.state.comments || []);

        // Input veld leegmaken
        this.commentsInput.value = '';

        // Render de comments
        if (this.menuComments) {
          this.menuComments.innerHTML = '';
          this.state.comments?.forEach((comment) => {
            new Comment(comment, this.menuComments as HTMLElement, this);
          });
        }
      }
    });

    // Render de comments
    this.state.comments.forEach((comment) => {
      new Comment(comment, this.menuComments!, this);
    });

    // Event listener voor deadline
    this.deadlineDate.addEventListener('change', () => {
      if (this.deadlineDate) {
        this.state.deadline = this.deadlineDate.value;
        updateCardDeadlineFirebase(this.parentId, this.id, 'deadline', this.state.deadline);
      }
    });

    // Append
    this.menu.append(this.menuTitle);
    this.menu.append(this.menuDescription);
    this.menu.append(this.commentsInput);
    this.menu.append(this.commentsButton);
    this.menu.append(this.menuComments);
    this.menu.append(this.deadlineDate);
    this.menuContainer.append(this.menu);
    root.append(this.menuContainer);
    this.editableDescription = new EditableText(this.state.description, this.menuDescription, this, 'description', 'textarea', this.id, this.parentId);
    this.editableText = new EditableText(this.state.title, this.menuTitle, this, 'title', 'input', this.id, this.parentId);
  }

  renderComments(): void {
    if (this.menuComments instanceof HTMLElement && this.menuComments != null) {
      this.menuComments.innerHTML = '';

      this.state.comments?.forEach((comment) => {
        if (this.menuComments instanceof HTMLElement) {
          new Comment(comment, this.menuComments, this);
        }
      });
    }
  }
}
