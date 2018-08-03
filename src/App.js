import React, { Component } from 'react';
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'; //https://reactstrap.github.io/components/modals/

import TopNavbar from "./components/navbar";
require('./css/index.css');

class App extends Component {
  render() {
    return (
      <div>
          <TopNavbar />
          <p>Hello World!</p>
      </div>
    );
  }
}

export default App;
