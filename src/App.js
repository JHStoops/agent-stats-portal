import React, { Component } from 'react';
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'; //https://reactstrap.github.io/components/modals/

import TopNavbar from "./components/navbar";
import Stats from "./components/stats";
require('./css/index.css');

class App extends Component {
    constructor(props) {
        super(props);
        this.toggleLoggedIn = this.toggleLoggedIn.bind(this);
        this.getLoggedIn = this.getLoggedIn.bind(this);
        this.setStats = this.setStats.bind(this);
        this.getStats = this.getStats.bind(this);
        this.getWeekly = this.getWeekly.bind(this);
        this.state = {
            loggedIn: (sessionStorage.getItem('hash')) ? true : false,
            stats: [],
            weekly: {}
        };
    }
    getLoggedIn(){
        return this.state.loggedIn;
    }
    toggleLoggedIn(b) {
        if (b === undefined) this.setState({loggedIn: !this.state.loggedIn});
        else this.setState({loggedIn: b});
    }
    getStats(){
        return this.state.stats;
    }
    getWeekly(){
        return this.state.weekly;
    }
    setStats(payload){
        this.setState({stats: payload});
    }
    componentWillMount() {
        if (sessionStorage.getItem('hash') !== null) {
            this.setState({ loggedIn: true});
            const self = this;
            fetch(`http://localhost:3000/api/stats/${sessionStorage.getItem('client')}/${sessionStorage.getItem('userid')}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-authentication': sessionStorage.getItem('hash')
                }
            })
                .then( data => data.json() )
                .then( function(stats){
                    console.log(stats);
                    self.setState({stats: stats});
                })
                .catch( err => {console.log(err); self.toggleLoggedIn(false);});

            //If it's an anthem agent, download stats for weekly drawing
            if (sessionStorage.getItem('client').toLowerCase() === 'anthem'){
                const weeklyDrawingStart = "2018-09-03";
                fetch(`http://localhost:3000/api/report/${sessionStorage.getItem('client')}/${sessionStorage.getItem('site')}/${weeklyDrawingStart}`, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json',
                        'x-authentication': sessionStorage.getItem('hash'),
                        'username': sessionStorage.getItem('username')
                    }
                })
                    .then( data => data.json() )
                    .then( function(weekly){
                        console.log(weekly);
                        self.setState({weekly: weekly[0]});
                    })
                    .catch( err => console.log(err) );
            }
        }
    }
    render() {
        return (
            <div>
                <TopNavbar getLoggedIn={ this.getLoggedIn } toggleLoggedIn={ this.toggleLoggedIn } setStats={ this.setStats }/>
                <Stats getLoggedIn={ this.getLoggedIn} getStats={ this.getStats } getWeekly={ this.getWeekly }/>
            </div>
        );
    }
}

export default App;
