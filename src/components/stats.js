import React, {Component} from 'react';
import { Table } from 'reactstrap';

class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedId: this.props.getLoggedIn,
            agentGoal: {
                'Aetna': {
                    'MANE': {
                        'Provo': 33,
                        'Salt Lake City': 1,
                        'Sawgrass': 38,
                        'San Antonio': 18,
                        'Memphis': 1
                    },
                    'PDPNE': {
                        'Provo': 97,
                        'Salt Lake City': 160,
                        'Sawgrass': 10,
                        'San Antonio': 5,
                        'Memphis': 71
                    }
                },
                'Anthem': {
                    'San Antonio': 120,
                    'Roy': 100,
                    'Sawgrass': 150
                },
                'Caresource': {
                    'MANE': {
                        'Salt Lake City': 48
                    }
                }
            }
        };
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

        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    anthemQuery(stats, query, product){
        //query is the type of data to extract from stats (e.g. enrollments, conversionRate, hv, lacb, etc.)
        //product is any of these: ma, pdp, ae, ms, ms non-gi, t2, hpa, dnsp, abcbs
        if (!stats) return 0;
        let result = null;
        const anthemProducts = ['ma', 'ms', 'ms non-gi', 'pdp', 'ae', 't2', 'hpa', 'dnsp', 'abcbs'];

        function licensedVsUnlicensedCriteria(obj){
            if (Number(sessionStorage.getItem('licensed')) === 1) return obj.conversion;    //if licensed
            return obj.enrollment;                                                          //if unlicensed
        }

        if (query === 'totalCalls') result = stats.length;
        else if (query === 'opportunities')
            result = stats.reduce(
                (acc, call) => Number(call.opportunity && anthemProducts.reduce(
                    (bool, prod) => Number(call.product.toLowerCase().includes(prod)) | bool, 0)
                ) + acc, 0
            );
        else if (query === 'totalEnrollments')
            result = stats.reduce(
                (acc, call) => Number(licensedVsUnlicensedCriteria(call) && anthemProducts.reduce(
                    (bool, prod) => Number(call.product.toLowerCase().includes(prod)) | bool, 0)
                ) + acc, 0
            );
        else if (query === 'conversionRate')
            result = Number(this.anthemQuery(stats, 'totalEnrollments') / this.anthemQuery(stats, 'opportunities') * 100).toFixed(2);
        else if (query === 'enrollments' && product === 'ms')
            result = stats.reduce(
                (acc, call) => Number(call.product.toLowerCase().includes('ms') && licensedVsUnlicensedCriteria(call) ) + acc, 0)
                - this.anthemQuery(stats, 'enrollments', 'ms non-gi');
        else if (query === 'enrollments')
            result = stats.reduce(
                (acc, call) => Number(call.product.toLowerCase().includes(product) && licensedVsUnlicensedCriteria(call) ) + acc, 0
            );
        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    render() {
        let conversions = this.props.getStats();
        let weekly = this.props.getWeekly();
        let weeklyDrawings = function() {
            const product = Math.floor( (Number(weekly.t2)  / 10) +
            Math.floor( Number(weekly.hpa) / 5) +
            Math.floor(
                Number(weekly.totalEnrollments) -
                Number(weekly.t2) -
                Number(weekly.hpa)
            ) / 2);

            return (isNaN(product)) ? 0 : product;

        };
        const self = this;

        function stats(attr) {
            if (sessionStorage.getItem('client') === 'Aetna') return (
                <tr>
                    <th scope="row">{attr}</th>
                    <td className="MAL">
                        { self.aetnaCaresourceQuery(conversions[attr], 'totalCalls',        'MA')       }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'enrollments',       'MA', 'P')  }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'enrollments',       'MA', 'M')  }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'homeVisits')                    }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'lacb')                          }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'rawConversionRate', 'MA')       }</td>
                    <td className="MAR">
                        { self.aetnaCaresourceQuery(conversions[attr], 'conversionRate',    'MA')       }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'totalCalls',        'PDP')      }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'enrollments',       'PDP', 'P') }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'enrollments',       'PDP', 'M') }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'conversionRate',    'PDP')      }</td>
                </tr>
            );

            else if (sessionStorage.getItem('client') === 'Caresource') return (
                <tr>
                    <th scope="row">{attr}</th>
                    <td className="MAL">
                        { self.aetnaCaresourceQuery(conversions[attr], 'totalCalls',     'MA')       }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'enrollments',    'MA', 'P')  }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'homeVisits')                 }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'lacb')                       }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'conversionRate', 'MA')       }</td>
                </tr>
            );

            else if (sessionStorage.getItem('client') === 'Anthem') return (
                <tr>
                    <th scope="row">{attr}</th>
                    <td className="MAL">
                        { self.anthemQuery(conversions[attr], 'totalCalls',         'MA')       }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'opportunities',      'MA')       }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'totalEnrollments')               }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        't2')       }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'hpa')      }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'ma')       }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'pdp')      }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'ae')       }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'ms')       }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'ms non-gi')}</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'dnsp')     }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'abcbs')    }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'conversionRate',     'PDP')      }</td>
                </tr>
            );
        }

        function weeklyStats() {
            return (
                <tr>
                    <th scope="row">This Week</th>
                    <td className="MAL">{ weekly.calls | 0          }</td>
                    <td>{ weekly.opportunities | 0                  }</td>
                    <td>{ weekly.totalEnrollments | 0               }</td>
                    <td>{ weekly.t2 | 0                             }</td>
                    <td>{ weekly.hpa | 0                            }</td>
                    <td>{ weekly.mapd | 0                           }</td>
                    <td>{ weekly.pdp | 0                            }</td>
                    <td>{ weekly.ae | 0                             }</td>
                    <td>{ weekly.ms | 0                             }</td>
                    <td>{ weekly['ms non-gi'] | 0                   }</td>
                    <td>{ weekly.dnsp | 0                           }</td>
                    <td>{ weekly.abcbs | 0                          }</td>
                    <td>{ Number(weekly.convRate).toFixed(2) | 0    }</td>
                </tr>
            )
        }

        function table(){
            if (!self.props.getLoggedIn()) return (<p>Please log in</p>);

            if (sessionStorage.getItem('client') === 'Aetna') return (
                <div id="elevate">
                    <div id="generalStats" className="container row">
                        <div id="maneGoal" className="col-3 row" title="Your progress to reaching your site's MANE goal for individual agents during AEP">
                            <div className="col-8 row goalBreakdown">
                                <span className="col-8">MANE:</span>
                                <span className="col-4">{ self.aetnaCaresourceQuery(conversions['AEP To Date'], 'enrollments', 'MA', 'P') }</span>
                                <br />
                                <span className="col-8">Goal:</span>
                                <span className="col-4">{ self.state.agentGoal[sessionStorage.getItem('client')]['MANE'][sessionStorage.getItem('site')] }</span>
                            </div>
                            <span id="agentGoalPercent" className="col-4">
                                { Number(self.aetnaCaresourceQuery(conversions['AEP To Date'], 'enrollments', 'MA', 'P') /
                                    self.state.agentGoal[sessionStorage.getItem('client')]['MANE'][sessionStorage.getItem('site')] * 100).toFixed(2)}%
                            </span>
                        </div>
                        <div id="pdpneGoal" className="offset-1 col-3 row" title="Your progress to reaching your site's PDPNE goal for individual agents during AEP">
                            <div className="col-8 row goalBreakdown">
                                <span className="col-8">PDPNE:</span>
                                <span className="col-4">{ self.aetnaCaresourceQuery(conversions['AEP To Date'], 'enrollments', 'PDP', 'P') }</span>
                                <br />
                                <span className="col-8">Goal:</span>
                                <span className="col-4">{ self.state.agentGoal[sessionStorage.getItem('client')]['PDPNE'][sessionStorage.getItem('site')] }</span>
                            </div>
                            <span id="agentGoalPercent" className="col-4">
                                { Number(self.aetnaCaresourceQuery(conversions['AEP To Date'], 'enrollments', 'PDP', 'P') /
                                    self.state.agentGoal[sessionStorage.getItem('client')]['PDPNE'][sessionStorage.getItem('site')] * 100).toFixed(2)}%
                            </span>
                        </div>
                        <div id="gpEntries" className="offset-1 col-3 row" title="Entries into Grand Prize raffle &#13; 1 for every 5 MANE or PDPNE enrollments">
                            <div className="col-8">
                                <div>Grand Prize</div>
                                <div>AEP Entries</div>
                            </div>
                            <div className="col-4 entryCount">{
                                Math.floor( (
                                    self.aetnaCaresourceQuery(conversions['AEP To Date'], 'enrollments', 'MA', 'P')
                                    + self.aetnaCaresourceQuery(conversions['AEP To Date'], 'enrollments', 'PDP', 'P') )
                                    / 5) // Every 5 new enrollments gives an entry to the gp drawing)
                            }
                            </div>
                        </div>
                    </div>
                    <Table>
                        <thead>
                        <tr>
                            <td></td>
                            <td colSpan="7">MA</td>
                            <td colSpan="5">PDP</td>
                        </tr>
                        <tr>
                            <th></th>
                            <th className="MAL" title="Total MA Calls">Calls</th>
                            <th title="New Enrollments of prospects">NE</th>
                            <th title="Plan Change for current members">PC</th>
                            <th title="Home Visits">HV</th>
                            <th title="Licensed Agent Callback">LACB</th>
                            <th title="Raw Conversion Rate - all prospect enrollments and leads divided by total prospect calls">Raw Conv %</th>
                            <th className="MAR" title="Conversion Rate - only new enrollments over prospect calls">Conv %</th>
                            <th title="Total PDP Calls">Calls</th>
                            <th title="New Enrollments of prospects">NE</th>
                            <th title="Plan Change for current members">PC</th>
                            <th title="Conversion Rate - only prospect enrollments over prospect calls">Conv %</th>
                        </tr>
                        </thead>
                        <tbody>
                        { stats('Today') }
                        { stats('Yesterday') }
                        { stats('AEP To Date') }
                        </tbody>
                    </Table>
                </div>
            );

            else if (sessionStorage.getItem('client') === 'Caresource') return (
                <div id="elevate">
                    <div id="generalStats" className="container row">
                        <div id="agentGoal" className="col-3 row" title="Your progress to reaching your site's goal for each agent during AEP">
                            <div id="agentGoalBreakdown" className="col-8 row">
                                <span className="col-6">MANE:</span>
                                <span className="col-6">{ self.aetnaCaresourceQuery(conversions['AEP To Date'], 'enrollments', 'MA', 'P') }</span>
                                <br />
                                <span className="col-6">Goal:</span>
                                <span className="col-6">{ self.state.agentGoal[sessionStorage.getItem('client')]['MANE'][sessionStorage.getItem('site')] }</span>
                            </div>
                            <span id="agentGoalPercent" className="col-4">
                                { Number(self.aetnaCaresourceQuery(conversions['AEP To Date'], 'enrollments', 'MA', 'P') /
                                    self.state.agentGoal[sessionStorage.getItem('client')]['MANE'][sessionStorage.getItem('site')] * 100).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <Table>
                        <thead>
                        <tr>
                            <th></th>
                            <th className="MAL" title="Total Calls">Calls</th>
                            <th title="New Enrollments of prospects">New Enrollments</th>
                            <th title="Home Visits">Home Visits</th>
                            <th title="Licensed Agent Callback">LACB</th>
                            <th className="MAR" title="Conversion Rate - only new enrollments over prospect calls">Conversion Rate</th>
                        </tr>
                        </thead>
                        <tbody>
                        { stats('Today') }
                        { stats('Yesterday') }
                        { stats('AEP To Date') }
                        </tbody>
                    </Table>
                </div>
            );

            else if (sessionStorage.getItem('client') === 'Anthem') return (
                <div>
                    <div id="generalStats" className="container row">
                        <div id="gpEntries" className="col-3 row" title="Entries into AEP Grand Prize raffle: &#13; 1 for every 10 T2 quotes &#13; 1 for every 5 HPA quotes &#13; 1 for every 2 successful applications">
                            <div className="col-8">
                                <div>Grand Prize</div>
                                <div>AEP Entries</div>
                            </div>
                            <div className="col-4 entryCount">{
                                Math.floor( self.anthemQuery(conversions['AEP To Date'], 'enrollments', 't2')  / 10) +
                                Math.floor( self.anthemQuery(conversions['AEP To Date'], 'enrollments', 'hpa') / 5) +
                                Math.floor( (
                                    self.anthemQuery(conversions['AEP To Date'], 'totalEnrollments') -
                                    self.anthemQuery(conversions['AEP To Date'], 'enrollments', 't2') -
                                    self.anthemQuery(conversions['AEP To Date'], 'enrollments', 'hpa')
                                ) / 2)
                            }
                            </div>
                        </div>
                        <div id="gpEntriesWeekly" className="offset-1 col-3 row" title="Entries into Weekly Grand Prize raffle: &#13; 1 for every 10 T2 quotes &#13; 1 for every 5 HPA quotes &#13; 1 for every 2 successful applications">
                            <div className="col-8">
                                <div>Grand Prize</div>
                                <div>Week Entries</div>
                            </div>
                            <div className="col-4 entryCount">{ weeklyDrawings() }
                            </div>
                        </div>
                    </div>
                    <Table>
                        <thead>
                        <tr>
                            <th></th>
                            <th className="MAL" title="Total Calls">Calls</th>
                            <th title="Calls with opportunity of conversion">Opportunities</th>
                            <th title="Enrollments across all product types">Total Enrollments</th>
                            <th title="T2 - Quote ID Given">T2</th>
                            <th title="HPA - Quote ID Given">HPA</th>
                            <th title="MAPD Enrollments">MAPD</th>
                            <th title="PDP Enrollments">PDP</th>
                            <th title="AE Enrollments">AE</th>
                            <th title="MS Enrollments">MS</th>
                            <th title="MS Non-GI Enrollments">MS Non-GI</th>
                            <th title="DNSP Enrollments">DNSP</th>
                            <th title="ABCBS Non-GI Enrollments">ABCBS</th>
                            <th className="MAR" title="Conversion Rate - only enrollments over total opportunities">Conv %</th>
                        </tr>
                        </thead>
                        <tbody>
                        { stats('Today') }
                        { stats('Yesterday') }
                        { ( sessionStorage.getItem('client') === "Anthem" ) ? weeklyStats() : '' }
                        { stats('AEP To Date') }
                        </tbody>
                    </Table>
                </div>
            );
        }

        return (
            <div>
                { table() }
            </div>
        );
    }
}

export default Stats;