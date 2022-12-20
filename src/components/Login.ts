import Component from '../lib/Component';
import Elements from '../lib/Elements';

class LoginComponent extends Component {
  constructor() {
    super({
      name: 'Login',
      model: {},
    });
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    const loginContainer = document.createElement('div');
    loginContainer.appendChild(
      Elements.createHeader({
        textContent: 'Welcome to this page',
      }),
    );
    return loginContainer;
  }
}

export default LoginComponent;
