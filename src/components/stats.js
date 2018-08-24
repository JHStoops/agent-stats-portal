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

    aetnaCaresourceQuery(stats, query, product, callerType){
        //query is the type of data to extract from stats (e.g. enrollments, conversionRate, hv, lacb, etc.)
        if (!stats) return 0;
        let result = null;

        if (query === 'enrollments') result = stats.reduce((acc, call) => Number(call.product === product && call.callerType === callerType && call.enrollment) + acc, 0);
        else if (query === 'conversionRate') result = Number( this.aetnaCaresourceQuery(stats, 'enrollments', product, 'P') /
            stats.reduce((acc, call) => Number(call.product === product && call.callerType === 'P' && call.opportunity === 1) + acc, 0) * 100).toFixed(2)
        else if (query === 'rawConversionRate') result = Number(stats.reduce((acc, call) => Number(call.product === product && (call.hv || call.lacb || call.enrollment)) + acc, 0) /
            this.aetnaCaresourceQuery(stats, 'opportunities', product, 'P') * 100).toFixed(2)
        else if (query === 'homeVisits') result = stats.reduce((acc, call) => Number(call.hv) + acc, 0);
        else if (query === 'lacb') result = stats.reduce((acc, call) => Number(call.lacb) + acc, 0);
        else if (query === 'totalCalls') result = stats.reduce((acc, call) => Number(call.product === product) + acc, 0);
        else if (query === 'opportunities') result = stats.reduce((acc, call) => Number(call.opportunity && call.product === product) + acc, 0);

        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    anthemQuery(stats, query, product){
        //query is the type of data to extract from stats (e.g. enrollments, conversionRate, hv, lacb, etc.)
        //product is any of these: mapd, pdp, ae, ms, ms non-gi
        if (!stats) return 0;
        let result = null;
        const anthemProducts = ['ma', 'ms', 'ms non-gi', 'pdp', 'ae', 't2', 'hpa'];

        if (query === 'totalCalls') result = stats.length;
        else if (query === 'opportunities') result = stats.reduce((acc, call) => Number(call.opportunity && anthemProducts.reduce( (bool, prod) => Number(call.product.toLowerCase().includes(prod)) | bool, 0) ) + acc, 0);
        else if (query === 'totalEnrollments') result = stats.reduce((acc, call) => Number((call.enrollment || call.conversion) && anthemProducts.reduce( (bool, prod) => Number(call.product.toLowerCase().includes(prod)) | bool, 0) ) + acc, 0);
        else if (query === 'conversionRate') result = Number(this.anthemQuery(stats, 'totalEnrollments') / this.anthemQuery(stats, 'opportunities') * 100).toFixed(2);
        else if (query === 'enrollments' && product === 'ms') {
            result = stats.reduce((acc, call) => Number(call.product.toLowerCase().includes('ms') && (call.enrollment || call.conversion) ) + acc, 0) -
                this.anthemQuery(stats, 'enrollments', 'ms non-gi');
        }
        else if (query === 'enrollments') result = stats.reduce((acc, call) => Number(call.product.toLowerCase().includes(product) && (call.enrollment || call.conversion) ) + acc, 0);

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
                        { self.aetnaCaresourceQuery(conversions[attr], 'totalCalls',        'MA')       }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'opportunities',     'MA')       }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'enrollments',       'MA', 'P')  }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'enrollments',       'MA', 'M')  }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'homeVisits')                    }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'lacb')                          }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'rawConversionRate', 'MA')       }</td>
                    <td className="MAR">
                        { self.aetnaCaresourceQuery(conversions[attr], 'conversionRate',    'MA')       }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'totalCalls',        'PDP')      }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'opportunities',     'PDP')      }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'enrollments',       'PDP', 'P') }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'enrollments',       'PDP', 'M') }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'rawConversionRate', 'PDP')      }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'conversionRate',    'PDP')      }</td>
                </tr>
            );

            else if (sessionStorage.getItem('client') === 'Caresource') return (
                <tr>
                    <th scope="row">{attr}</th>
                    <td className="MAL">
                        { self.aetnaCaresourceQuery(conversions[attr], 'totalCalls',     'MA')       }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'opportunities',  'MA')       }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'enrollments',    'MA', 'P')  }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'homeVisits')                 }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'lacb')                       }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'rawConversionRate', 'MA')    }</td>
                    <td>{ self.aetnaCaresourceQuery(conversions[attr], 'conversionRate', 'MA')       }</td>
                </tr>
            );

            else if (sessionStorage.getItem('client') === 'Anthem') return (
                <tr>
                    <th scope="row">{attr}</th>
                    <td className="MAL">
                        { self.anthemQuery(conversions[attr], 'totalCalls',         'MA')       }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'opportunities',      'MA')       }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'totalEnrollments')  }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        't2')  }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'hpa')                            }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'ma')                            }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'pdp')        }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'ae')        }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'ms')        }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'enrollments',        'ms non-gi')       }</td>
                    <td>{ self.anthemQuery(conversions[attr], 'conversionRate',     'PDP')      }</td>
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
                                <span className="col-6">{ self.aetnaCaresourceQuery(conversions.aepToDate, 'enrollments', 'MA', 'P') }</span>
                                <br />
                                <span className="col-6">Goal:</span>
                                <span className="col-6">{ self.state.siteGoal[sessionStorage.getItem('client')][sessionStorage.getItem('site')] }</span>
                            </div>
                            <span id="siteGoalPercent" className="col-4">
                                { Number(self.aetnaCaresourceQuery(conversions.aepToDate, 'enrollments', 'MA', 'P') /
                                    self.state.siteGoal[sessionStorage.getItem('client')][sessionStorage.getItem('site')] * 100).toFixed(2)}%
                            </span>
                        </div>
                        <div id="gpEntries" className="offset-1 col-5" title="Entries into Grand Prize raffle - 1 for every 5 MANE enrollments">
                            Grand Prize Entries: { Math.floor(
                            ( self.aetnaCaresourceQuery(conversions.aepToDate, 'enrollments', 'MA', 'P')
                                + self.aetnaCaresourceQuery(conversions.aepToDate, 'enrollments', 'PDP', 'P') )
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
                                <span className="col-6">{ self.aetnaCaresourceQuery(conversions.aepToDate, 'enrollments', 'MA', 'P') }</span>
                                <br />
                                <span className="col-6">Goal:</span>
                                <span className="col-6">{ self.state.siteGoal[sessionStorage.getItem('client')][sessionStorage.getItem('site')] }</span>
                            </div>
                            <span id="siteGoalPercent" className="col-4">
                                { Number(self.aetnaCaresourceQuery(conversions.aepToDate, 'enrollments', 'MA', 'P') /
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
                            <div id="siteGoalBreakdown" className="col-9 row">
                                <span className="col-7">Enrolled:</span>
                                <span className="col-5">{ self.anthemQuery(conversions.aepToDate, 'totalEnrollments') }</span>
                                <span className="col-7">Goal:</span>
                                <span className="col-5">{ self.state.siteGoal[sessionStorage.getItem('client')][sessionStorage.getItem('site')] }</span>
                            </div>
                            <span id="siteGoalPercent" className="col-3">
                                { Number(self.anthemQuery(conversions.aepToDate, 'totalEnrollments') /
                                    self.state.siteGoal[sessionStorage.getItem('client')][sessionStorage.getItem('site')] * 100).toFixed(2)}%
                            </span>
                        </div>
                        <div id="gpEntries" className="offset-1 col-3 row" title="Entries into Grand Prize raffle - 1 for every 10 T2 quotes, 1 for every 5 HPA quotes, 1 for every 2 successful applications">
                            <div className="col-8">
                                <div>Grand Prize</div>
                                <div>AEP Entries</div>
                            </div>
                            <div className="col-4 entryCount">{
                                Math.floor( self.anthemQuery(conversions.aepToDate, 'enrollments', 't2')  / 10) +
                                Math.floor( self.anthemQuery(conversions.aepToDate, 'enrollments', 'hpa') / 5) +
                                Math.floor( (
                                    self.anthemQuery(conversions.aepToDate, 'totalEnrollments') -
                                    self.anthemQuery(conversions.aepToDate, 'enrollments', 't2') -
                                    self.anthemQuery(conversions.aepToDate, 'enrollments', 'hpa')
                                ) / 2)
                            }
                            </div>
                        </div>
                        <div id="gpEntriesWeekly" className="offset-1 col-3 row" title="Entries into Grand Prize raffle - 1 for every 10 MANE enrollments">
                            {/*TODO: make this based on last 7 days of calls*/}
                            <div className="col-8">
                                <div>Grand Prize</div>
                                <div>Week Entries</div>
                            </div>
                            <div className="col-4 entryCount">{
                                Math.floor( self.anthemQuery(conversions.aepToDate, 'enrollments', 't2')  / 10) +
                                Math.floor( self.anthemQuery(conversions.aepToDate, 'enrollments', 'hpa') / 5) +
                                Math.floor( (
                                    self.anthemQuery(conversions.aepToDate, 'totalEnrollments') -
                                    self.anthemQuery(conversions.aepToDate, 'enrollments', 't2') -
                                    self.anthemQuery(conversions.aepToDate, 'enrollments', 'hpa')
                                ) / 2)
                            }
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
                            <th className="MAR" title="Conversion Rate - only enrollments over total opportunities">Conv %</th>
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