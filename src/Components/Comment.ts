/* eslint-disable import/no-cycle */
import { v4 as uuidv4 } from 'uuid';
import Card from './Card';

export default class Comment {
  title: string;

  place: HTMLElement;

  card: Card;

  div?: HTMLDivElement;

  id: string;

  constructor(text: string, place: HTMLElement, card: Card) {
    this.title = text;
    this.place = place;
    this.card = card;
    this.id = uuidv4();
    this.render();
  }

  render(): void {
    this.div = document.createElement('div');
    this.div.className = 'comment';
    // this.card.id = this.id;
    this.div.innerText = this.title;
    this.place.append(this.div);
  }
}
