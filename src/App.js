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
        this.getTotalSiteEnrollments = this.getTotalSiteEnrollments.bind(this);
        this.state = {
            loggedIn: (sessionStorage.getItem('hash')) ? true : false,
            stats: {},
            weekly: {},
            totalSiteEnrollments: {}
        };
        this.baseState = {
            loggedIn: false,
            stats: {},
            weekly: {},
            totalSiteEnrollments: {}
        };
    }
    getLoggedIn(){
        return this.state.loggedIn;
    }
    toggleLoggedIn(b) {
        if (b === false || this.state.loggedIn === true) {
            sessionStorage.clear();
            this.setState(Object.assign({}, this.baseState));       //toggle logged out
        }
        else this.setState({loggedIn: true});                       //toggle logged in
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
                    self.setState({weekly: weekly[0]});
                    return weekly;
                })
                .catch( err => console.log(err) );
        }
    }
    getTotalSiteEnrollments(){
        if (Object.keys(this.state.totalSiteEnrollments).length) return this.state.totalSiteEnrollments;
        else if (sessionStorage.getItem('hash')){
            const self = this;
            return fetch(`/api/siteEnrollments/${sessionStorage.getItem('client')}/${sessionStorage.getItem('site')}`)
                .then( res => res.json() )
                .then( totalSiteEnrollments => {
                    self.setState({totalSiteEnrollments: totalSiteEnrollments[0]});
                    return totalSiteEnrollments[0];
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
                <Stats getLoggedIn={ this.getLoggedIn} getStats={ this.getStats } getWeekly={ this.getWeekly } getTotalSiteEnrollments={this.getTotalSiteEnrollments} />
            </div>
        );
    }
}

export default App;
