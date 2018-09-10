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
        this.getStats = this.getStats.bind(this);
        this.getWeekly = this.getWeekly.bind(this);
        this.state = {
            loggedIn: (sessionStorage.getItem('hash')) ? true : false,
            stats: {},
            weekly: {}
        };
    }
    getLoggedIn(){
        return this.state.loggedIn;
    }
    toggleLoggedIn(b) {
        if (b === undefined) this.setState({loggedIn: !this.state.loggedIn});
        else this.setState({loggedIn: b});

        //clear state if logging out
        if (!this.state.loggedIn) {
            this.setState({ stats: undefined });
            this.setState({ weekly: undefined });
        }
    }
    getStats(){
        if (Object.keys(this.state.stats).length) return this.state.stats;
        else if (sessionStorage.getItem('hash')) {
            const self = this;
            return fetch(`/api/stats/${sessionStorage.getItem('client')}/${sessionStorage.getItem('userid')}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-authentication': sessionStorage.getItem('hash')
                }
            })
                .then(data => data.json())
                .then(function (stats) {
                    console.log(stats);
                    self.setState({stats: stats});
                    return stats;
                })
                .catch(err => {
                    console.log(err);
                    self.toggleLoggedIn(false);
                });
        }
    }
    getWeekly(){
        if (Object.keys(this.state.weekly).length) return this.state.weekly;
        else if (sessionStorage.getItem('hash')){
            const self = this;
            const weeklyDrawingStart = "2018-09-03";
            return fetch(`/api/report/${sessionStorage.getItem('client')}/${sessionStorage.getItem('site')}/${weeklyDrawingStart}`, {
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
                    return weekly;
                })
                .catch( err => console.log(err) );
        }
    }
    componentWillMount() {
        if (sessionStorage.getItem('hash') !== null) {
            this.setState({ loggedIn: true});
            this.getStats();
            if (sessionStorage.getItem('client').toLowerCase() === 'anthem') this.getWeekly();  //Get weekly stats for Anthem
        }
    }
    render() {
        return (
            <div>
                <TopNavbar getLoggedIn={ this.getLoggedIn } toggleLoggedIn={ this.toggleLoggedIn } getStats={ this.getStats }/>
                <Stats getLoggedIn={ this.getLoggedIn} getStats={ this.getStats } getWeekly={ this.getWeekly }/>
            </div>
        );
    }
}

export default App;
