import logo from './logo.svg';
import { Message } from './message';
import React, { Component } from 'react';
import { ProgressBar } from './progressBar';
import Fire from './services/firebase.service';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      todos: [],
      user: null
    };

    // subscribe on todos stream
    this.subscription = Fire.subscribe(todos => this.setState({
      // add default file upload progress count
      todos: todos.map(todo => ({ ...todo, progress: 0 }))
    }));

    // authentication
    this.authSubscription = Fire.authState.onAuthStateChanged(user =>
      this.setState({ user: user
        ? { displayName: user.displayName, photoURL: user.photoURL }
        : null
      }));

    // subscribe on FCM messages stream
    this.msgSubscription = Fire.msg.onMessage(payload => {
      this.setState({ messages: [...this.state.messages, payload.notification] });
    });
  };

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
    }).catch(e => e);
  }

  getMessage() {
    if (this.state.messages.length) {
      const [head, ...tail] = this.state.messages; // eslint-disable-line
      setTimeout(() => { this.setState({ messages: tail }) }, 4000);
    }
    return this.state.messages[0];
  }

  uploadAttachment = i => e => {
    const file = e.target.files[0];
    if (file) {
      const task = Fire.uploadFile(this.state.todos[i].id, file);
      task.on('state_changed')({
        'next': snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.setState({
            todos: this.state.todos.map((todo, ind) => ind === i
              ? ({ ...todo, progress })
              : todo
            )
          });
        },
        'error': null,
        'complete': null
      });

      task.then(snapShot => snapShot.ref.getDownloadURL())
        .then(url => Fire.updateField(
          this.state.todos[i].id,
          'attachments',
          [...this.state.todos[i].attachments, { url, name: file.name }]))
        .catch(e => e);
    }
  }

  deleteAttachment = (todoInd, attachInd) => e => {
    const id = this.state.todos[todoInd].id;
    const file = this.state.todos[todoInd].attachments[attachInd];
    const newAttachments = this.state.todos[todoInd].attachments.filter((file, ind) => ind !== attachInd);
    Fire.deleteFile(id, file, newAttachments);
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
          <button className="back-up" onClick={Fire.backupTodos}>Backup Todos</button>
          <main>
          {this.state.todos.map((todo, i) => (
            <article key={`todo${i}`} className={`todo__wrapper todo__wrapper--${todo.done ? 'done' : 'not-done'}`}>
              <h2>{todo.header}</h2>
              <p>{todo.descr}</p>
              <input type="file" onChange={this.uploadAttachment(i)} />
              {todo.progress ? <ProgressBar progress={todo.progress} /> : null}
              <h3>Attachments</h3>
              {todo.attachments.length
                ? <div className="todo__attachments">
                  {todo.attachments.map((file, ind) =>
                    <div key={`key_${ind}`}>
                      <a href={file.url} target="_blank">{file.name}</a>
                      <button onClick={this.deleteAttachment(i, ind)}>-</button>
                    </div>
                  )}
                </div> : null
              }
              <button className="todo__done-button" onClick={this.toggleDone(i)}>Toggle Done</button>
            </article>
          ))}
          </main>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
