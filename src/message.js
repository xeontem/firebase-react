import React, { Component } from 'react';
import Fire from './services/firebase.service';
import './message.css';

export class Message extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  };

  render() {
    const { message } = this.props;
    return (
      <aside className="message__wrapper" >
        <img src={message.icon} width="100" height="100"/>
        <div>
          <h3>{message.title}</h3>
          <p>{message.body}</p>
        </div>
      </aside>
    );
  }
}
