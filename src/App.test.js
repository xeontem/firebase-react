import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

jest.mock('./services/firebase.service.js', () => ({
  subscribe: f => f,
  authState: {
    onAuthStateChanged: x => x
  },
  msg: {
    onMessage: x => x
  }
}));

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
