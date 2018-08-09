import React, { Component } from 'react';
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'; //https://reactstrap.github.io/components/modals/

import TopNavbar from "./components/navbar";
import Stats from "./components/stats";
require('./css/index.css');

class App extends Component {
    constructor(props) {
        super(props);
        this.toggleLoggedIn = this.toggleLoggedIn.bind(this);
        this.state = {
            loggedIn: false
        };
    }
    toggleLoggedIn() {
        this.setState({loggedIn: !this.state.loggedIn});
    }
    render() {
        return (
            <div>
                <TopNavbar toggleLoggedIn={ this.toggleLoggedIn }/>
                <Stats loggedIn={ this.state.loggedIn } />
            </div>
        );
    }
}

export default App;
