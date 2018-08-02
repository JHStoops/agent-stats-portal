import React, { Component } from 'react';
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'; //https://reactstrap.github.io/components/modals/

const NavBar = require('./components/navbar.js');
require('./css/index.css');

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
