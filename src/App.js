import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";

import TopNavbar from "./components/navbar";
import Stats from "./components/stats";
import TopAgents from "./components/topAgents";
require('./css/index.css');

class App extends Component {
    constructor(props) {
        super(props);
        this.toggleLoggedIn = this.toggleLoggedIn.bind(this);
        this.getLoggedIn = this.getLoggedIn.bind(this);
        this.getStats = this.getStats.bind(this);
        this.countEntries = this.countEntries.bind(this);
        this.getTotalSiteEnrollments = this.getTotalSiteEnrollments.bind(this);
        this.state = {
            loggedIn: (sessionStorage.getItem('hash')) ? true : false,
            stats: {},
            totalSiteEnrollments: {}
        };
        this.baseState = {
            loggedIn: false,
            stats: {},
            totalSiteEnrollments: {}
        };
    }

    isPowerHour(hour){
        //Takes only the hour
        return Number( [8, 10, 12, 14, 16].includes(Number(hour)) );
    }

    licensedVsUnlicensedCriteria(obj){
        if (Number(sessionStorage.getItem('licensed')) === 1) return obj.conversion;    //if licensed
        return obj.enrollment;                                                          //if unlicensed
    }

    countEntries(stats){
        if (stats === undefined) return 0;
        const self = this;
        const anthemProducts = [/ma/i, /ms/i, /pdp/i, /ae/i, /dsnp/i, /hpa/i, /t2/i];
        let hpaEntries = 0;
        let t2Entries = 0;
        let restEntries = stats.reduce(
            (acc, call) => {
                if (call.product === null) return acc;
                if (this.licensedVsUnlicensedCriteria(call) === 0) return acc;
                let isEligiableProduct = false;
                let i = 0;
                for (; i < anthemProducts.length; i++){
                    if ( call.product.match(anthemProducts[i]) ) {
                        isEligiableProduct = true;
                        break;
                    }
                }

                const addedEntries = (isEligiableProduct) ? 1 + self.isPowerHour( (new Date(call.datetime)).getHours() ) : 0;
                if (i === 5) hpaEntries += addedEntries;
                else if (i === 6) t2Entries += addedEntries;
                return acc + addedEntries;
            }, 0
        ) - t2Entries - hpaEntries;

        return Math.floor(t2Entries/10) + Math.floor(hpaEntries/5) + Math.floor(restEntries/2);
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
        else if (sessionStorage.getItem('hash') === 'nuicsdj89fhsd789fnsdui') return this.state.stats;
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
        if (sessionStorage.getItem('hash') === 'nuicsdj89fhsd789fnsdui') {
            this.setState({ loggedIn: true});
        }
        else if (sessionStorage.getItem('hash') !== null) {
            this.setState({ loggedIn: true});
            this.getStats();
        }
    }
    render() {
        return (
            <Router>
                <div>
                    <Route exact path="/" render={() => <TopNavbar getLoggedIn={ this.getLoggedIn }  toggleLoggedIn={ this.toggleLoggedIn } getStats={ this.getStats } /> } />
                    <Route exact path="/" render={() => <Stats getLoggedIn={ this.getLoggedIn} getStats={ this.getStats }  getTotalSiteEnrollments={this.getTotalSiteEnrollments} countEntries={this.countEntries} /> } />
                    <Route path="/:client(Aetna|Anthem|Caresource)/:site(Provo|San Antonio|Memphis|Sandy|Plantation|Roy)" component={TopAgents} />
                </div>
            </Router>
        );
    }
}

export default App;
