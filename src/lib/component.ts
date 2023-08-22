/**
 *The component parent
 */
class Component {
  name: string;

  model: {};

  constructor({ name, model }: { name: string, model: {} }) {
    this.name = name;
    this.model = model;
  }

  // eslint-disable-next-line class-methods-use-this
  render() : HTMLElement {
    return document.createElement('');
  }
}

export default Component;
