// eslint-disable-next-line import/no-cycle
import { showTodoList } from '../app';
import { root } from '../lib';
import { RegisterUser } from '../lib/firebase-init';

export default class Register {
  constructor() {
    this.render();
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    const registerDiv = document.createElement('div');
    registerDiv.className = 'register';
    registerDiv.innerHTML = `
      <h1 id="todo_title">Smart-Todo</h1>
      <div class="register_container">
          <h1 class="register_title">Register</h1>
          <form action="" class="register_form">
              <label for="email" class="register_label">Email</label>
              <input type="email" name="email" id="email" class="register_input">
              <label for="password" class="register_label">Password</label>
              <input type="password" name="password" id="password" class="register_input">
              <button type="submit" class="register_button">Register</button>
          </form>
          <div class="register_link">
            <a href="#" id="register_link" datalink-back>Already have an account? Log in</a>
         </div>
      </div>
      `;
    root.append(registerDiv);

    const registrForm = document.querySelector('.register_form') as HTMLFormElement;
    registrForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (document.querySelector('#email') as HTMLInputElement).value;
      const password = (document.querySelector('#password') as HTMLInputElement).value;
      RegisterUser(email, password);
      showTodoList();
    });
  }
}
