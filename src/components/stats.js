import React, {Component} from 'react';
import { Table } from 'reactstrap';

class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedId: this.props.getLoggedIn,
            siteGoal: {
                'Aetna': {
                    'Provo': 250,
                    'Salt Lake City': 350,
                    'Sawgrass': 215,
                    'San Antonio': 180,
                    'Memphis': 170
                },
                'Anthem': {
                    'San Antonio': 120,
                    'Roy': 100,
                    'Sawgrass': 150
                },
                'Caresource': {
                    'Salt Lake City': 120
                }
            }
        };
    }

    enrollments(stats, product, callerType){
        if (!stats) return 0;
        const result = stats.reduce((acc, call) => Number(call.product === product && call.callerType === callerType && call.enrollment === 1) + acc, 0);
        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    conversionRate(stats, product){
        if (!stats) return 0;
        const result = Number(stats.reduce((acc, call) => Number(call.product === product && call.callerType === 'P' && call.enrollment) + acc, 0) /
            stats.reduce((acc, call) => Number(call.product === product && call.callerType === 'P' && call.opportunity === 1) + acc, 0) * 100).toFixed(2)
        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    rawConversionRate(stats, product){
        if (!stats) return 0;
        const result = Number(stats.reduce((acc, call) => Number(call.product === product && (call.hv === 1 || call.lacb || call.enrollment)) + acc, 0) /
            stats.reduce((acc, call) => Number(call.product === product && call.opportunity === 1) + acc, 0) * 100).toFixed(2)
        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    homeVisits(stats){
        if (!stats) return 0;
        const result = stats.reduce((acc, call) => Number(call.hv === 1) + acc, 0);
        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    lacb(stats){
        if (!stats) return 0;
        const result = stats.reduce((acc, call) => Number(call.lacb === 1) + acc, 0);
        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    totalCalls(stats, product){
        if (!stats) return 0;
        const result = stats.reduce((acc, call) => Number(call.product === product) + acc, 0);
        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    opportunities(stats, product){
        if (!stats) return 0;
        const result = stats.reduce((acc, call) => Number(call.opportunity === 1 && call.product === product) + acc, 0);
        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    render() {
        let conversions = this.props.getStats();
        const self = this;

        function stats(attr) {
            if (sessionStorage.getItem('client') === 'Aetna') return (
                <tr>
                    <th scope="row">{attr}</th>
                    <td className="MAL">
                        { self.totalCalls(conversions[attr],     'MA')       }</td>
                    <td>{ self.opportunities(conversions[attr],  'MA')       }</td>
                    <td>{ self.enrollments(conversions[attr],    'MA', 'P')  }</td>
                    <td>{ self.enrollments(conversions[attr],    'MA', 'M')  }</td>
                    <td>{ self.homeVisits(conversions[attr])                 }</td>
                    <td>{ self.lacb(conversions[attr])                       }</td>
                    <td>{ self.rawConversionRate(conversions[attr], 'MA')    }</td>
                    <td className="MAR">
                        { self.conversionRate(conversions[attr], 'MA')       }</td>
                    <td>{ self.totalCalls(conversions[attr],     'PDP')      }</td>
                    <td>{ self.opportunities(conversions[attr],  'PDP')      }</td>
                    <td>{ self.enrollments(conversions[attr],    'PDP', 'P') }</td>
                    <td>{ self.enrollments(conversions[attr],    'PDP', 'M') }</td>
                    <td>{ self.rawConversionRate(conversions[attr], 'PDP')   }</td>
                    <td>{ self.conversionRate(conversions[attr], 'PDP')      }</td>
                </tr>
            );

            else if (sessionStorage.getItem('client') === 'Caresource') return (
                <tr>
                    <th scope="row">{attr}</th>
                    <td className="MAL">
                        { self.totalCalls(conversions[attr],     'MA')       }</td>
                    <td>{ self.opportunities(conversions[attr],  'MA')       }</td>
                    <td>{ self.enrollments(conversions[attr],    'MA', 'P')  }</td>
                    <td>{ self.enrollments(conversions[attr],    'MA', 'M')  }</td>
                    <td>{ self.homeVisits(conversions[attr])                 }</td>
                    <td>{ self.lacb(conversions[attr])                       }</td>
                    <td>{ self.rawConversionRate(conversions[attr], 'MA')    }</td>
                    <td>{ self.conversionRate(conversions[attr], 'MA')       }</td>
                </tr>
            );

            else if (sessionStorage.getItem('client') === 'Anthem') return (
                <tr>
                    <th scope="row">{attr}</th>
                    <td className="MAL">
                        { self.totalCalls(conversions[attr],     'MA')       }</td>
                    <td>{ self.opportunities(conversions[attr],  'MA')       }</td>
                    <td>{ self.enrollments(conversions[attr],    'MA', 'P')  }</td>
                    <td>{ self.enrollments(conversions[attr],    'MA', 'M')  }</td>
                    <td>{ self.homeVisits(conversions[attr])                 }</td>
                    <td>{ self.lacb(conversions[attr])                       }</td>
                    <td>{ self.rawConversionRate(conversions[attr], 'MA')    }</td>
                    <td className="MAR">
                        { self.conversionRate(conversions[attr], 'MA')       }</td>
                    <td>{ self.totalCalls(conversions[attr],     'PDP')      }</td>
                    <td>{ self.opportunities(conversions[attr],  'PDP')      }</td>
                    <td>{ self.enrollments(conversions[attr],    'PDP', 'P') }</td>
                    <td>{ self.enrollments(conversions[attr],    'PDP', 'M') }</td>
                    <td>{ self.rawConversionRate(conversions[attr], 'PDP')   }</td>
                    <td>{ self.conversionRate(conversions[attr], 'PDP')      }</td>
                </tr>
            );
        }

        function table(){
            if (!self.props.getLoggedIn()) return (<p>Please log in</p>);

            if (sessionStorage.getItem('client') === 'Aetna') return (
                <div>
                    <div id="generalStats" className="container row">
                        <div id="siteGoal" className="col-3 row" title="Your progress to reaching your site's goal for each agent during AEP">
                            <div id="siteGoalBreakdown" className="col-8 row">
                                <span className="col-6">MANE:</span>
                                <span className="col-6">{ self.enrollments(conversions.aepToDate, 'MA', 'P') }</span>
                                <br />
                                <span className="col-6">Goal:</span>
                                <span className="col-6">{ self.state.siteGoal[sessionStorage.getItem('client')][sessionStorage.getItem('site')] }</span>
                            </div>
                            <span id="siteGoalPercent" className="col-4">
                                { Number(self.enrollments(conversions.aepToDate, 'MA', 'P') /
                                    self.state.siteGoal[sessionStorage.getItem('client')][sessionStorage.getItem('site')] * 100).toFixed(2)}%
                            </span>
                        </div>
                        <div id="gpEntries" className="offset-1 col-5" title="Entries into Grand Prize raffle - 1 for every 5 MANE enrollments">
                            Grand Prize Entries: { Math.floor(
                            ( self.enrollments(conversions.aepToDate, 'MA', 'P')
                                + self.enrollments(conversions.aepToDate, 'PDP', 'P') )
                            / 5 // Every 5 new enrollments gives an entry to the gp drawing
                        ) }
                        </div>
                    </div>
                    <Table>
                        <thead>
                        <tr>
                            <td></td>
                            <td colSpan="8">MA</td>
                            <td colSpan="6">PDP</td>
                        </tr>
                        <tr>
                            <th></th>
                            <th className="MAL" title="Total Calls">Calls</th>
                            <th title="Calls with opportunity of conversion">Opportunities</th>
                            <th title="New Enrollments of prospects">NE</th>
                            <th title="Plan Change for current members">PC</th>
                            <th title="Home Visits">HV</th>
                            <th title="Licensed Agent Callback">LACB</th>
                            <th title="Raw Conversion Rate - all enrollments and leads divided by total opportunities">Raw Conv %</th>
                            <th className="MAR" title="Conversion Rate - only new enrollments over opportunities">Conv %</th>
                            <th title="Total Calls">Calls</th>
                            <th title="Calls with opportunity of conversion">Opportunities</th>
                            <th title="New Enrollments of prospects">NE</th>
                            <th title="Plan Change for current members">PC</th>
                            <th title="Raw Conversion Rate - all enrollments and leads divided by total opportunities">Raw Conv %</th>
                            <th title="Conversion Rate - only new enrollments over opportunities">Conversion %</th>
                        </tr>
                        </thead>
                        <tbody>
                        { stats('today') }
                        { stats('yesterday') }
                        { stats('aepToDate') }
                        </tbody>
                    </Table>
                </div>
            );

            else if (sessionStorage.getItem('client') === 'Caresource') return (
                <div>
                    <div id="generalStats" className="container row">
                        <div id="siteGoal" className="col-3 row" title="Your progress to reaching your site's goal for each agent during AEP">
                            <div id="siteGoalBreakdown" className="col-8 row">
                                <span className="col-6">MANE:</span>
                                <span className="col-6">{ self.enrollments(conversions.aepToDate, 'MA', 'P') }</span>
                                <br />
                                <span className="col-6">Goal:</span>
                                <span className="col-6">{ self.state.siteGoal[sessionStorage.getItem('client')][sessionStorage.getItem('site')] }</span>
                            </div>
                            <span id="siteGoalPercent" className="col-4">
                                { Number(self.enrollments(conversions.aepToDate, 'MA', 'P') /
                                    self.state.siteGoal[sessionStorage.getItem('client')][sessionStorage.getItem('site')] * 100).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <Table>
                        <thead>
                        <tr>
                            <th></th>
                            <th className="MAL" title="Total Calls">Calls</th>
                            <th title="Calls with opportunity of conversion">Opportunities</th>
                            <th title="New Enrollments of prospects">NE</th>
                            <th title="Plan Change for current members">PC</th>
                            <th title="Home Visits">HV</th>
                            <th title="Licensed Agent Callback">LACB</th>
                            <th title="Raw Conversion Rate - all enrollments and leads divided by total opportunities">Raw Conv %</th>
                            <th className="MAR" title="Conversion Rate - only new enrollments over opportunities">Conv %</th>
                        </tr>
                        </thead>
                        <tbody>
                        { stats('today') }
                        { stats('yesterday') }
                        { stats('aepToDate') }
                        </tbody>
                    </Table>
                </div>
            );

            else if (sessionStorage.getItem('client') === 'Anthem') return (
                <div>
                    <div id="generalStats" className="container row">
                        <div id="siteGoal" className="col-3 row" title="Your progress to reaching your site's goal for each agent during AEP">
                            <div id="siteGoalBreakdown" className="col-8 row">
                                <span className="col-6">MANE:</span>
                                <span className="col-6">{ self.enrollments(conversions.aepToDate, 'MA', 'P') }</span>
                                <br />
                                <span className="col-6">Goal:</span>
                                <span className="col-6">{ self.state.siteGoal[sessionStorage.getItem('client')][sessionStorage.getItem('site')] }</span>
                            </div>
                            <span id="siteGoalPercent" className="col-4">
                                { Number(self.enrollments(conversions.aepToDate, 'MA', 'P') /
                                    self.state.siteGoal[sessionStorage.getItem('client')][sessionStorage.getItem('site')] * 100).toFixed(2)}%
                            </span>
                        </div>
                        <div id="gpEntries" className="offset-1 col-5" title="Entries into Grand Prize raffle - 1 for every 5 MANE enrollments">
                            Grand Prize Entries: { Math.floor(
                            ( self.enrollments(conversions.aepToDate, 'MA', 'P')
                                + self.enrollments(conversions.aepToDate, 'PDP', 'P') )
                            / 5 // Every 5 new enrollments gives an entry to the gp drawing
                        ) }
                        </div>
                    </div>
                    <Table>
                        <thead>
                        <tr>
                            <td></td>
                            <td colSpan="8">MA</td>
                            <td colSpan="6">PDP</td>
                        </tr>
                        <tr>
                            <th></th>
                            <th className="MAL" title="Total Calls">Calls</th>
                            <th title="Calls with opportunity of conversion">Opportunities</th>
                            <th title="New Enrollments of prospects">NE</th>
                            <th title="Plan Change for current members">PC</th>
                            <th title="Home Visits">HV</th>
                            <th title="Licensed Agent Callback">LACB</th>
                            <th title="Raw Conversion Rate - all enrollments and leads divided by total opportunities">Raw Conv %</th>
                            <th className="MAR" title="Conversion Rate - only new enrollments over opportunities">Conv %</th>
                            <th title="Total Calls">Calls</th>
                            <th title="Calls with opportunity of conversion">Opportunities</th>
                            <th title="New Enrollments of prospects">NE</th>
                            <th title="Plan Change for current members">PC</th>
                            <th title="Raw Conversion Rate - all enrollments and leads divided by total opportunities">Raw Conv %</th>
                            <th title="Conversion Rate - only new enrollments over opportunities">Conversion %</th>
                        </tr>
                        </thead>
                        <tbody>
                        { stats('today') }
                        { stats('yesterday') }
                        { stats('aepToDate') }
                        </tbody>
                    </Table>
                </div>
            );
        }

        return (
            <div id="stats">
                { table() }
            </div>
        );
    }
}

export default Stats;