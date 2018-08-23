import React, { Component } from 'react';
import logo from './logo.svg';
import Fire from './services/firebase.service';
import { Message } from './message';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      todos: [],
      user: null
    };
    this.subscription = Fire.subscribe(todos => this.setState({ todos }));
    this.authSubscription = Fire.authState.onAuthStateChanged(user =>
      this.setState({ user: user
        ? { displayName: user.displayName, photoURL: user.photoURL }
        : null
      }));
    Fire.msg.onMessage(payload => {
      this.setState({ messages: [...this.state.messages, payload.notification] });
    });
  };

  componentWillUnmount() {
    this.subscription();
    this.authSubscription();
  }

  toggleDone = i => e => {
    Fire.toggleDone(this.state.todos[i].id, !this.state.todos[i].done);
  }

  login = () => {
    Fire.login().then(user => {
      this.setState({ user });
    });
  }

  logout = () => {
    Fire.logout().then(user => {
      this.setState({ user });
    });
  }

  getMessage() {
    if (this.state.messages.length) {
      const [head, ...tail] = this.state.messages;
      setTimeout(() => { this.setState({ messages: tail }) }, 4000);
    }
    return this.state.messages[0];
  }

  render() {
    const user = this.state.user || {};
    const message = this.getMessage();
    return (
      <React.Fragment>
        {message && <Message message={message} />}
        <div className="App">
          <header className="App-header">
          <section>
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </section>
          <section className="login__wrapper">
            <img src={user.photoURL} alt='avatar' />
            <p>{user.displayName}</p>
            <button onClick={this.state.user === null ? this.login : this.logout}>
              {this.state.user === null ? 'Login' : 'Logout'}
            </button>
          </section>
          </header>
          <button onClick={Fire.backupTodos}>Backup Todos</button>
          <main>
          {this.state.todos.map((todo, i) => (
            <article key={`todo${i}`} className={`todo__wrapper todo__wrapper--${todo.done ? 'done' : 'not-done'}`}>
              <h2>{todo.header}</h2>
              <p>{todo.descr}</p>
              <button onClick={this.toggleDone(i)}>Toggle Done</button>
            </article>
          ))}
          </main>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
