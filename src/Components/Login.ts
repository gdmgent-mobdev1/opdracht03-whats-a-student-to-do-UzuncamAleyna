import { LoginUser, signInWithGoogle } from '../lib/firebase-init';
// eslint-disable-next-line import/no-cycle
import { showTodoList } from '../app';

export default class Login {
  constructor() {
    this.render();
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    const root = document.getElementById('app') as HTMLElement;
    const loginDiv = document.createElement('div');
    loginDiv.className = 'login';
    loginDiv.innerHTML = `
        <h1 id="todo_title">Smart-Todo</h1>
        <div class="login_container">
            <h1 class="login_title">Login</h1>
            <form class="login_form">
            <label for="email" class="input_label">Email</label>
            <input type="email" name="email" id="email" class="login_input"/>
            <label for="password" class="input_label">Password</label>
            <input type="password" name="password" id="password" class="login_input"/>
            <button type="submit" class="login_button">Login</button>
            </form>
            <!-- LINK TO SIGN UP -->
            <div class="signup-link">
              <a href="#" id="signup-link" datalink>Don't have an account? Sign up</a>
            </div>
            <div class="or_text">
            OR
            </div>
            <!-- SIGN IN WITH GOOGLE -->
            <div class="signin_btn">
                <button class="google_btn" id="google_signin_btn" datalink>Sign in with Google</button>
            </div>
        </div>
        `;
    root.append(loginDiv);

    const loginForm = document.querySelector('.login_form') as HTMLFormElement;
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (document.querySelector('#email') as HTMLInputElement).value;
      const password = (document.querySelector('#password') as HTMLInputElement).value;
      LoginUser(email, password);
      showTodoList();
    });

    const googleBtn = document.getElementById('google_signin_btn') as HTMLFormElement;
    googleBtn.addEventListener('click', async () => {
      const user = await signInWithGoogle();
      if (user) {
        showTodoList();
      }
    });
  }
}
