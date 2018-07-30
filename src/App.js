import React, { Component } from 'react';
import NavBar from './components/navbar.js';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'; //https://reactstrap.github.io/components/modals/

class App extends Component {
  render() {
    return (
      <div>
          <NavBar />
          <p>Hello World!</p>
      </div>
    );
  }
}

export default App;
