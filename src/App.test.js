import App from './App';
import React from 'react';
import { expect } from 'chai';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('./services/firebase.service.js', () => ({
  subscribe: f => f,
  authState: {
    onAuthStateChanged: x => x
  },
  msg: {
    onMessage: x => x
  }
}));

it('renders three <App /> component', () => {
  const wrapper = shallow(<App />);
  expect(wrapper.exists()).equals(true);
});

it('renders three <App /> component', () => {
  const wrapper = shallow(<App />);
  expect(wrapper.exists()).equals(true);
});
