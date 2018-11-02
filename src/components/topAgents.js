import React, { Component } from 'react';
import { Table } from 'reactstrap';

class TopAgents extends Component {
    constructor(props) {
        super(props);
        this.updateStats = this.updateStats.bind(this);
        this.state = {
            stats: [],
            topAgentCategories: ['LEADS', 'MANE', 'MAPC', 'PDPNE', 'PDPPC', 'RSVP'],
            counter: 0
        };
    }

    getCategory(){
        return this.state.topAgentCategories[this.state.counter % this.state.topAgentCategories.length];
    }

    updateStats(){
        const today = new Date();
        const self = this;
        fetch(`/api/report/${this.props.match.params.client}/${this.props.match.params.site}/${today.getYear()+1900 + "-" + Number(today.getMonth() + 1) + "-" + today.getDate()}`)
            .then( res => res.json() )
            .then( stats => self.sortStats(stats) )
            .catch( err => console.log(err) );
    }

    populateTable(){
        const key = this.getCategory();
        return this.state.stats
            .sort( (a, b) => (key === 'LEADS') ? (b.HV + b.LACB) - (a.HV + a.LACB) : b[key] - a[key])
            .slice(0, 10)
            .filter( el => (key === 'LEADS') ? el.HV + el.LACB > 0 : el[key] > 0)
            .map( el =>
                <tr key={el['First Name']+el['Last Name']}>
                    <td>{el['First Name']} {el['Last Name']}</td>
                    <td>{ (key === 'LEADS') ? el.HV + el.LACB : el[key]}</td>
                </tr> );
    }

    sortStats(stats){
        //Runs after render(), when user downloads stats
        if (stats.length === 0) return;

        // First, group all calls by agents: {'agent_id1': [...calls], 'agent_id2': [...calls], ... }
        let agentStats = {};
        const self = this;
        stats.forEach( function(el) {
            if ( !agentStats.hasOwnProperty(el.userid) ) agentStats[el.userid] = {fName: el.firstName, lName: el.lastName, calls: []};
            let deepCopy = {};
            Object.assign(deepCopy, el);
            delete deepCopy.fName;
            delete deepCopy.lName;
            agentStats[el.userid].calls.push(deepCopy);
        });

        // Sort by lastName in ascending order
        const sorting = function(a, b){
            if(agentStats[a].lName < agentStats[b].lName) return -1;
            if(agentStats[a].lName > agentStats[b].lName) return 1;

            if(agentStats[a].fName < agentStats[b].fName) return -1;
            if(agentStats[a].fName > agentStats[b].fName) return 1;
            return 0;
        };

        // populate JSON data
        let json = [];
        Object.keys(agentStats).sort(sorting).forEach( function(el){
            let jsonStats = {};
            if (self.props.match.params.client === "Aetna"){
                jsonStats = {
                    "First Name": agentStats[el].fName,
                    "Last Name": agentStats[el].lName,
                    "MA Calls": self.aetnaCaresourceQuery(agentStats[el].calls, 'totalCalls', 'MA'),
                    "MANE": self.aetnaCaresourceQuery(agentStats[el].calls, 'enrollments', 'MA', 'P'),
                    MAPC: self.aetnaCaresourceQuery(agentStats[el].calls, 'enrollments', 'MA', 'M'),
                    HV: self.aetnaCaresourceQuery(agentStats[el].calls, 'homeVisits'),
                    LACB: self.aetnaCaresourceQuery(agentStats[el].calls, 'lacb'),
                    "MA Raw Conv %": self.aetnaCaresourceQuery(agentStats[el].calls, 'rawConversionRate', 'MA'),
                    "MA Conv %": self.aetnaCaresourceQuery(agentStats[el].calls, 'conversionRate', 'MA'),
                    "PDP Calls": self.aetnaCaresourceQuery(agentStats[el].calls, 'totalCalls', 'PDP'),
                    PDPNE: self.aetnaCaresourceQuery(agentStats[el].calls, 'enrollments', 'PDP', 'P'),
                    PDPPC: self.aetnaCaresourceQuery(agentStats[el].calls, 'enrollments', 'PDP', 'M'),
                    "PDP Conv %": self.aetnaCaresourceQuery(agentStats[el].calls, 'conversionRate', 'PDP'),
                    Entries: self.aetnaCaresourceQuery(agentStats[el].calls, 'entries'),
                    RSVP: self.aetnaCaresourceQuery(agentStats[el].calls, 'rsvp')
                };
            }
            else if (self.props.match.params.client === "Caresource"){
                jsonStats = {
                    "First Name": agentStats[el].fName,
                    "Last Name": agentStats[el].lName,
                    "Calls": self.aetnaCaresourceQuery(agentStats[el].calls, 'totalCalls', 'MA'),
                    MANE: self.aetnaCaresourceQuery(agentStats[el].calls, 'enrollments', 'MA', 'P'),
                    HV: self.aetnaCaresourceQuery(agentStats[el].calls, 'homeVisits'),
                    LACB: self.aetnaCaresourceQuery(agentStats[el].calls, 'lacb'),
                    "Conv %": self.aetnaCaresourceQuery(agentStats[el].calls, 'conversionRate', 'MA')
                };
            }
            else if (self.props.match.params.client === "Anthem"){
                jsonStats = {
                    "First Name": agentStats[el].fName,
                    "Last Name": agentStats[el].lName,
                    "Total Calls": self.anthemQuery(agentStats[el].calls, 'totalCalls', 'MA'),
                    "Opportunities": self.anthemQuery(agentStats[el].calls, 'opportunities', 'MA'),
                    "Total Enrollments": self.anthemQuery(agentStats[el].calls, 'totalEnrollments'),
                    "T2": self.anthemQuery(agentStats[el].calls, 'enrollments', 't2'),
                    "HPA": self.anthemQuery(agentStats[el].calls, 'enrollments', 'hpa'),
                    "MA": self.anthemQuery(agentStats[el].calls, 'enrollments', 'ma'),
                    "PDP": self.anthemQuery(agentStats[el].calls, 'enrollments', 'pdp'),
                    "AE": self.anthemQuery(agentStats[el].calls, 'enrollments', 'ae'),
                    "MS": self.anthemQuery(agentStats[el].calls, 'enrollments', 'ms'),
                    "MS Non-GI": self.anthemQuery(agentStats[el].calls, 'enrollments', 'ms non-gi'),
                    "DSNP": self.anthemQuery(agentStats[el].calls, 'enrollments', 'dsnp'),
                    "Conversion Rate": self.anthemQuery(agentStats[el].calls, 'conversionRate', 'PDP'),
                    "Entries": self.props.countEntries(agentStats[el].calls)
                };
            }
            else return;

            json.push(jsonStats);
        });
        this.setState({stats: [...json]});
    }

    licensedVsUnlicensedCriteria(obj){
        if (Number(sessionStorage.getItem('licensed')) === 1){ //if licensed
            //Exhaustive list of qualifying disposition ID's
            if ( [171, 222, 271, 362, 375, 376, 400, 415, 434].includes(obj.dispoID) ) return obj.conversion | obj.enrollment;
            else return 0;
        }
        return obj.enrollment;                                  //if unlicensed
    }

    anthemQuery(stats, query, product){
        //query is the type of data to extract from stats (e.g. enrollments, conversionRate, hv, lacb, etc.)
        //product is any of these: ma, pdp, ae, ms, ms non-gi, t2, hpa, dsnp
        if (!stats) return 0;
        if (stats.length === 0) return 0;
        let result = null;
        const anthemProducts = ['ma', 'ms', 'ms non-gi', 'pdp', 'ae', 't2', 'hpa', 'dsnp'];

        if (query === 'totalCalls') result = stats.length;
        else if (query === 'opportunities')
            result = stats.reduce(
                (acc, call) => {
                    if (call.product === null) return acc;
                    if (call.opportunity === 0) return acc;

                    if ( sessionStorage.getItem('licensed')) return acc + [171, 222, 271, 362, 375, 376, 400, 415, 434].includes(call.dispoID);
                    else return Number(anthemProducts.reduce(
                        (bool, prod) => Number(call.product.toLowerCase().includes(prod)) | bool, 0)
                    ) + acc;
                }, 0
            );
        else if (query === 'totalEnrollments')
            result = stats.reduce(
                (acc, call) => {
                    if (call.product === null) return acc;
                    return Number(this.licensedVsUnlicensedCriteria(call) && anthemProducts.reduce(
                        (bool, prod) => Number(call.product.toLowerCase().includes(prod)) | bool, 0)
                    ) + acc
                }, 0
            );
        else if (query === 'conversionRate')
            result = Number(this.anthemQuery(stats, 'totalEnrollments') / this.anthemQuery(stats, 'opportunities') * 100).toFixed(2);
        else if (query === 'enrollments' && product === 'ms')
            result = stats.reduce(
                (acc, call) => {
                    if (call.product === null) return acc;
                    const msEnroll = Number( call.product.toLowerCase().includes(product) && this.licensedVsUnlicensedCriteria(call) );
                    return msEnroll + acc;
                }, 0)
                - this.anthemQuery(stats, 'enrollments', 'ms non-gi');
        else if (query === 'enrollments' && product === 'dsnp'){
            result = stats.reduce(
                (acc, call) => {
                    if (call.product === null) return acc;
                    const dsnpEnroll = Number( call.product.toLowerCase().includes(product) && this.licensedVsUnlicensedCriteria(call) );
                    return Number(dsnpEnroll && call.dispo.toLowerCase().substr(0, 2) === 't2' ) + acc
                }, 0
            );
        }
        else if (query === 'enrollments')
            result = stats.reduce(
                (acc, call) => {
                    if (call.product === null) return acc;
                    const enroll = Number(call.product.toLowerCase().includes(product) && this.licensedVsUnlicensedCriteria(call) );
                    return enroll + acc;
                }, 0
            );
        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    aetnaCaresourceQuery(stats, query, product, callerType){
        //query is the type of data to extract from stats (e.g. enrollments, conversionRate, hv, lacb, etc.)
        if (!stats) return 0;
        let result = null;

        if (query === 'enrollments')
            result = stats.reduce(
                (acc, call) => Number(call.product === product && call.callerType === callerType && call.enrollment) + acc, 0
            );
        // Enrollment Conversion Rate = total new enrollments / total calls with prospects. We do not separate out opportunity or non-opportunity
        else if (query === 'conversionRate')
            result = Number( this.aetnaCaresourceQuery(stats, 'enrollments', product, 'P')
                / stats.reduce( (acc, call) => Number(call.product === product && call.callerType === 'P') + acc, 0)
                * 100).toFixed(2);
        else if (query === 'rawConversionRate')
            result = Number(stats.reduce(
                (acc, call) => Number(call.product === product && call.callerType === 'P' && (call.hv || call.lacb || call.enrollment)) + acc, 0)
                / stats.reduce((acc, call) => Number(call.product === product && call.callerType === 'P') + acc, 0)
                * 100).toFixed(2);
        else if (query === 'homeVisits') result = stats.reduce((acc, call) => Number(call.hv) + acc, 0);
        else if (query === 'lacb') result = stats.reduce((acc, call) => Number(call.lacb) + acc, 0);
        else if (query === 'totalCalls') result = stats.reduce((acc, call) => Number(call.product === product) + acc, 0);
        else if (query === 'rsvp') result = stats.reduce((acc, call) => acc + Number(call.rsvp), 0);
        else if (query === 'entries') {
            const enrollmentsMANE = this.aetnaCaresourceQuery(stats, 'enrollments', 'MA', 'P');
            const enrollmentsPDPNE = this.aetnaCaresourceQuery(stats, 'enrollments', 'PDP', 'P');
            result = Math.floor( (enrollmentsMANE + enrollmentsPDPNE ) / 5);
        }

        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    leftImage(){
        return (this.props.match.params.site === 'Provo')
            ? <img src="../../public/CaptainUnderpants.png" alt="Captain Underpants" className="col-3"/>
            : <div className="col-3"></div>;
    }

    rightImage(){
        return (this.props.match.params.site === 'Provo')
            ? <img src="../../public/JeanGreyPhoenix.png" alt="Jean Grey" className="col-3"/>
            : <div className="col-3"></div>;
    }

    componentWillMount() {
        this.updateStats();
        setInterval(() => {this.updateStats(); this.setState({counter: this.state.counter+1})}, 60000);
    }

    render() {
        return (
            <div className="container">
                <br/>
                <div className="row"><h1 className="mx-auto">Top Agent Stats</h1></div>
                <br/>
                <div className="row">
                    { this.leftImage() }
                    <Table striped className="col-6">
                        <thead>
                        <tr>
                            <th>Agent</th>
                            <th>{ this.getCategory() }</th>
                        </tr>
                        </thead>
                        <tbody>
                        { this.populateTable() }
                        </tbody>
                    </Table>
                    { this.rightImage() }
                </div>
            </div>
        );
    }
}

export default TopAgents;
