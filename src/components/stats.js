import React, {Component} from 'react';
import { Table } from 'reactstrap';
import { Col, Row, Button, Form, FormGroup, Label, Input } from 'reactstrap';   // For admin table generation

class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            adminStats: [],
            adminSite: '',
            adminClient: '',
            adminStartDate: '',
            adminEndDate: '',
            loggedId: this.props.getLoggedIn,
            siteGoals: {
                'Aetna': {
                    'MANE': {
                        'Provo': 3000,
                        'Sandy': 56,
                        'Plantation': 1222,
                        'San Antonio': 1222,
                        'Memphis': 56
                    },
                    'PDPNE': {
                        'Provo': 8960,
                        'Sandy': 9600,
                        'Plantation': 320,
                        'San Antonio': 320,
                        'Memphis': 12800
                    }
                },
                'Caresource': {
                    'MANE': {
                        'Sandy': 1200
                    }
                }
            },
            agentGoal: {
                'Aetna': {
                    'MANE': {
                        'Provo': 33,
                        'Sandy': 1,
                        'Plantation': 38,
                        'San Antonio': 18,
                        'Memphis': 1
                    },
                    'PDPNE': {
                        'Provo': 97,
                        'Sandy': 160,
                        'Plantation': 10,
                        'San Antonio': 5,
                        'Memphis': 71
                    }
                },
                'Anthem': {
                    'San Antonio': 120,
                    'Roy': 100,
                    'Plantation': 150
                },
                'Caresource': {
                    'MANE': {
                        'Sandy': 48
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
        else if (query === 'entries') {
            const enrollmentsMANE = this.aetnaCaresourceQuery(stats, 'enrollments', 'MA', 'P');
            const enrollmentsPDPNE = this.aetnaCaresourceQuery(stats, 'enrollments', 'PDP', 'P');
            result = Math.floor( (enrollmentsMANE + enrollmentsPDPNE ) / 5);
        }

        if (result === null || isNaN(result) || result === undefined) return 0;
        return result;
    }

    licensedVsUnlicensedCriteria(obj){
        if (Number(sessionStorage.getItem('licensed')) === 1) return obj.conversion;    //if licensed
        return obj.enrollment;                                                          //if unlicensed
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
                    return Number(call.opportunity && anthemProducts.reduce(
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

    render() {
        const self = this;
        let conversions = this.props.getStats();

        function stats(conv, name, client) {
            const aetnaEntries = function(){
                if ( !['Yesterday', 'Today', 'AEP To Date', 'This Week'].includes(name) )
                    return <td> {self.aetnaCaresourceQuery(conv, 'entries')} </td>;
            };
            const anthemEntries = function(){
                if ( !['Yesterday', 'Today', 'AEP To Date', 'This Week'].includes(name) )
                    return <td>{ self.props.countEntries(conv) }</td>;
            };

            if (client === 'Aetna') return (
                <tr key={name}>
                    <th scope="row">{ name }</th>
                    <td className="MAL">
                        { self.aetnaCaresourceQuery(conv, 'totalCalls',        'MA')       }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'enrollments',       'MA', 'P')  }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'enrollments',       'MA', 'M')  }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'homeVisits')                    }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'lacb')                          }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'rawConversionRate', 'MA')       }</td>
                    <td className="MAR">
                        { self.aetnaCaresourceQuery(conv, 'conversionRate',    'MA')       }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'totalCalls',        'PDP')      }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'enrollments',       'PDP', 'P') }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'enrollments',       'PDP', 'M') }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'conversionRate',    'PDP')      }</td>
                    { aetnaEntries() }
                </tr>
            );

            else if (client === 'Caresource') return (
                <tr key={name}>
                    <th scope="row">{ name }</th>
                    <td className="MAL">
                        { self.aetnaCaresourceQuery(conv, 'totalCalls',     'MA')       }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'enrollments',    'MA', 'P')  }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'homeVisits')                 }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'lacb')                       }</td>
                    <td>{ self.aetnaCaresourceQuery(conv, 'conversionRate', 'MA')       }</td>
                </tr>
            );

            else if (client === 'Anthem') return (
                <tr key={name}>
                    <th scope="row">{ name }</th>
                    <td className="MAL">
                        { self.anthemQuery(conv, 'totalCalls',         'MA')       }</td>
                    <td>{ self.anthemQuery(conv, 'opportunities',      'MA')       }</td>
                    <td>{ self.anthemQuery(conv, 'totalEnrollments')               }</td>
                    <td>{ self.anthemQuery(conv, 'enrollments',        't2')       }</td>
                    <td>{ self.anthemQuery(conv, 'enrollments',        'hpa')      }</td>
                    <td>{ self.anthemQuery(conv, 'enrollments',        'ma')       }</td>
                    <td>{ self.anthemQuery(conv, 'enrollments',        'pdp')      }</td>
                    <td>{ self.anthemQuery(conv, 'enrollments',        'ae')       }</td>
                    <td>{ self.anthemQuery(conv, 'enrollments',        'ms')       }</td>
                    <td>{ self.anthemQuery(conv, 'enrollments',        'ms non-gi')}</td>
                    <td>{ self.anthemQuery(conv, 'enrollments',        'dsnp')     }</td>
                    <td>{ self.anthemQuery(conv, 'conversionRate',     'PDP')      }</td>
                    { anthemEntries() }
                </tr>
            );
        }

        function goalsElement(id, title, class_name, product, goalEntity, progress){
            return (
                <div id={id} className={ class_name } title={title}>
                    <div className="col-8 row goalBreakdown">
                        <span className="col-8">{ product }:</span>
                        <span className="col-4">{ progress }</span>
                        <br />
                        <span className="col-8">Goal:</span>
                        <span className="col-4">{ self.state[goalEntity][sessionStorage.getItem('client')][product][sessionStorage.getItem('site')] }</span>
                    </div>
                    <span id="agentGoalPercent" className="col-4">
                        { Number(progress /
                            self.state[goalEntity][sessionStorage.getItem('client')][product][sessionStorage.getItem('site')] * 100).toFixed(2) }%
                    </span>
                </div>
            );
        }

        function tableHeaders(client){
            const HEADERS = {
                "Aetna": [
                    { className: '', title: '', content: ''},
                    { className: '', title: 'Total MA Calls', content: 'Calls'},
                    { className: '', title: 'MA New Enrollments of prospects', content: 'NE'},
                    { className: '', title: 'MA Plan Change for current members', content: 'PC'},
                    { className: '', title: 'Home Visits', content: 'HV'},
                    { className: '', title: 'Licensed Agent Callback', content: 'LACB'},
                    { className: '', title: 'Raw Conversion Rate - all prospect enrollments and leads divided by total prospect calls', content: 'Raw Conv %'},
                    { className: 'MAR', title: 'Conversion Rate - only new enrollments over prospect calls', content: 'Conv %'},
                    { className: '', title: 'Total PDP Calls', content: 'Calls'},
                    { className: '', title: 'PDP New Enrollments of prospects', content: 'NE'},
                    { className: '', title: 'PDP Plan Change for current members', content: 'PC'},
                    { className: '', title: 'Conversion Rate - only prospect enrollments over prospect calls', content: 'Conv %'}
                ],
                "Caresource": [
                    { className: '', title: '', content: ''},
                    { className: '', title: 'Total Calls', content: 'Calls'},
                    { className: '', title: 'New Enrollments of prospects', content: 'New Enrollments'},
                    { className: '', title: 'Home Visits', content: 'Home Visits'},
                    { className: '', title: 'Licensed Agent Callback', content: 'LACB'},
                    { className: '', title: 'Conversion Rate - only new enrollments over prospect calls', content: 'Conversion Rate'}
                ],
                "Anthem": [
                    { className: '', title: '', content: ''},
                    { className: '', title: 'Total Calls', content: 'Calls'},
                    { className: '', title: 'Calls with opportunity of conversion', content: 'Opportunities'},
                    { className: '', title: 'Enrollments across all product types', content: 'Total Enrollments'},
                    { className: '', title: 'T2 - Quote ID Given', content: 'T2'},
                    { className: '', title: 'HPA - Quote ID Given', content: 'HPA'},
                    { className: '', title: 'MAPD Enrollments', content: 'MAPD'},
                    { className: '', title: 'PDP Enrollments', content: 'PDP'},
                    { className: '', title: 'AE Enrollments', content: 'AE'},
                    { className: '', title: 'MS Enrollments', content: 'MS'},
                    { className: '', title: 'MS Non-GI Enrollments', content: 'MS Non-GI'},
                    { className: '', title: 'DSNP Enrollments', content: 'DSNP'},
                    { className: '', title: 'Conversion Rate - only enrollments over total opportunities', content: 'Conv %'}
                ]
            };

            if (HEADERS[client] === undefined) return;

            const entriesGP = function() {
                if (self.state.adminClient.toLowerCase() === 'aetna' && sessionStorage.getItem('username').toLowerCase() === 'admin')
                    return <th className="entriesGP" title="Grand Prize Entries"> GP Entries </th>;
                if (self.state.adminClient.toLowerCase() === 'anthem' && sessionStorage.getItem('username').toLowerCase() === 'admin')
                    return <th className="entriesGP" title="Grand Prize Entries"> GP Entries </th>;
            };

            return (
                <tr>
                    { HEADERS[client].map( el => <th className={el.className} title={el.title} key={el.title}>{el.content}</th> ) }
                    { entriesGP() }
                </tr>
            );
        }

        function table(){
            if (!self.props.getLoggedIn()) return (<p>Please log in</p>);

            if (sessionStorage.getItem('client') === 'Aetna'){
                const totalSiteEnrollments = self.props.getTotalSiteEnrollments();
                return (
                    <div id="elevate">
                        <div id="siteGoals" className="container row">
                            <div className="col-3 goal-label">Site Goals:</div>
                            { goalsElement("maneSiteGoal", "Your site's progress to reaching MANE goal during AEP",
                                "col-4 row", "MANE", "siteGoals", totalSiteEnrollments.mane) }

                            { goalsElement("pdpneSiteGoal", "Your site's progress to reaching PDPNE goal during AEP",
                                "offset-1 col-4 row", "PDPNE", "siteGoals", totalSiteEnrollments.pdpne) }
                        </div>
                        <div id="generalStats" className="container row">
                            <div className="col-3 goal-label">Agent Goals:</div>
                            { goalsElement("maneGoal", "Your progress to reaching your site's MANE goal for individual agents during AEP",
                                "col-4 row", "MANE", "agentGoal", self.aetnaCaresourceQuery(conversions['AEP To Date'], 'enrollments', 'MA', 'P')) }

                            { goalsElement("pdpneGoal", "Your progress to reaching your site's PDPNE goal for individual agents during AEP",
                                "offset-1 col-4 row", "PDPNE", "agentGoal", self.aetnaCaresourceQuery(conversions['AEP To Date'], 'enrollments', 'PDP', 'P')) }
                        </div>

                        <div id="gpEntries" className="container row">
                            <div className="offset-3 col-5 row" title="Entries into Grand Prize raffle &#13; 1 for every 5 MANE or PDPNE enrollments">
                                <div className="col-4">
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
                                { tableHeaders('Aetna') }
                            </thead>
                            <tbody>
                            { stats(conversions['Today'], 'Today', sessionStorage.getItem('client')) }
                            { stats(conversions['Yesterday'], 'Yesterday', sessionStorage.getItem('client')) }
                            { stats(conversions['AEP To Date'], 'AEP To Date', sessionStorage.getItem('client')) }
                            </tbody>
                        </Table>
                    </div>
                );
            }
            else if (sessionStorage.getItem('client') === 'Caresource') {
                const totalSiteEnrollments = self.props.getTotalSiteEnrollments();
                return (
                    <div id="elevate">
                        <div id="siteGoals" className="container row">
                            <div className="col-3 goal-label">Team Goal:</div>
                            { goalsElement("maneSiteGoal", "Your team's progress to reaching MANE goal during AEP",
                                "col-4 row", "MANE", "siteGoals", totalSiteEnrollments.mane) }
                        </div>
                        <div id="generalStats" className="container row">

                            <div className="col-3 goal-label">Agent Goal:</div>
                            { goalsElement("agentGoal", "Your progress to reaching your site's goal for each agent during AEP",
                                "col-3 row", "MANE", "agentGoal", self.aetnaCaresourceQuery(conversions['AEP To Date'], 'enrollments', 'MA', 'P')) }
                        </div>
                        <Table>
                            <thead>
                                { tableHeaders('Caresource') }
                            </thead>
                            <tbody>
                            { stats(conversions['Today'], 'Today', sessionStorage.getItem('client')) }
                            { stats(conversions['Yesterday'], 'Yesterday', sessionStorage.getItem('client')) }
                            { stats(conversions['AEP To Date'], 'AEP To Date', sessionStorage.getItem('client')) }
                            </tbody>
                        </Table>
                    </div>
                );
            }
            else if (sessionStorage.getItem('client') === 'Anthem') {
                const today = new Date();
                return (
                    <div>
                        <div id="generalStats" className="container row">
                            <div id="gpEntries" className="col-3 row" title="Entries into AEP Grand Prize raffle: &#13; 1 for every 10 T2 quotes &#13; 1 for every 5 HPA quotes &#13; 1 for every 2 successful applications">
                                <div className="col-8">
                                    <div>Grand Prize</div>
                                    <div>AEP Entries</div>
                                </div>
                                <div className="col-4 entryCount">{
                                    self.props.countEntries(conversions['AEP To Date'])
                                }
                                </div>
                            </div>
                            {
                                //Only display if between 10/14 and 11/10
                                (today.getTime() > 1539496800000 && today.getTime() < 1541919600000) ? (
                                    <div id="gpEntriesWeekly" className="offset-1 col-3 row" title="Entries into Weekly Grand Prize raffle: &#13; 1 for every 10 T2 quotes &#13; 1 for every 5 HPA quotes &#13; 1 for every 2 successful applications">
                                        <div className="col-8">
                                            <div>Grand Prize</div>
                                            <div>Week Entries</div>
                                        </div>
                                        <div className="col-4 entryCount">{/* weeklyDrawings() */}
                                        </div>
                                    </div>
                                ) : ('')
                            }
                        </div>
                        <Table>
                            <thead>
                                { tableHeaders('Anthem') }
                            </thead>
                            <tbody>
                            { stats(conversions['Today'], 'Today', sessionStorage.getItem('client')) }
                            { stats(conversions['Yesterday'], 'Yesterday', sessionStorage.getItem('client')) }
                            { stats(conversions['This Week'], 'This Week', sessionStorage.getItem('client')) }
                            { stats(conversions['AEP To Date'], 'AEP To Date', sessionStorage.getItem('client')) }
                            </tbody>
                        </Table>
                        {
                            //If licensed Agent -- display disclaimer
                            (sessionStorage.getItem('licensed') === '1') ? (
                                <b>Disclaimer: These numbers should not be used to determine licensed incentives - these are just quotes.</b>
                            ) : ('')
                        }
                    </div>
                );
            }
        }

        function adminGrabStats(){
            // Reset adminStats
            self.setState({adminStats: []});

            // Save data from form
            let site =      document.getElementById('sSite').value;
            let client =    document.getElementById('sClient').value;
            let startDate = document.getElementById('startDate').value
            let endDate =   document.getElementById('endDate').value

            self.setState({adminSite: site});
            self.setState({adminClient: client});
            self.setState({adminStartDate: endDate});
            self.setState({adminEndDate: startDate});

            // Grab data from DB
            fetch(`/api/report/${client}/${site}/${startDate}/${(endDate) ? endDate : '' }`)
                .then( res => res.json() )
                .then( stats => self.setState({adminStats: stats}) )
                .catch( err => console.log(err) );
        }

        function adminStats(client){
            if (self.state.adminStats.length === 0) return;

            // First, group all calls by agents: {'agent_id1': [...calls], 'agent_id2': [...calls], ... }
            let agentStats = {};
            self.state.adminStats.forEach( function(el) {
                if ( !agentStats.hasOwnProperty(el.userid) ) agentStats[el.userid] = {firstName: el.firstName, lastName: el.lastName, calls: []};
                let deepCopy = {};
                Object.assign(deepCopy, el);
                delete deepCopy.firstName;
                delete deepCopy.lastName;
                agentStats[el.userid].calls.push(deepCopy);
            });

            // Sort by lastName in ascending order
            const sorting = function(a, b){
                if(agentStats[a].lastName < agentStats[b].lastName) return -1;
                if(agentStats[a].lastName > agentStats[b].lastName) return 1;

                if(agentStats[a].firstName < agentStats[b].firstName) return -1;
                if(agentStats[a].firstName > agentStats[b].firstName) return 1;
                return 0;
            };

            // Generate the HTML/JSX to be displayed
            let jsx = [];
            Object.keys(agentStats).sort(sorting).forEach( function(key){
                let name = '';
                if (agentStats.hasOwnProperty(key)) name = agentStats[key].lastName + ', ' + agentStats[key].firstName;
                return jsx.push( stats(agentStats[key].calls, name, client) );
            });

            return jsx;
        }

        function adminTable(){
            return (
                <div>
                    <Table>
                        <thead>
                            { tableHeaders(self.state.adminClient) }
                        </thead>
                        <tbody>
                        { adminStats(self.state.adminClient) }
                        </tbody>
                    </Table>
                </div>
            );
        }

        function admin(){
            return (
                <div>
                    <Form>
                        <Row>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="sSite">Site</Label>
                                    <Input type="select" name="site" id="sSite" >
                                        <option value=""></option>
                                        <option value="Provo">PRV</option>
                                        <option value="San Antonio">SAT</option>
                                        <option value="Memphis">MEM</option>
                                        <option value="Sandy">SLC</option>
                                        <option value="Plantation">SAW</option>
                                        <option value="Roy">ROY</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="sClient">Client</Label>
                                    <Input type="select" name="client" id="sClient" >
                                        <option value=""></option>
                                        <option value="Aetna">Aetna</option>
                                        <option value="Caresource">CareSource</option>
                                        <option value="Anthem">Anthem</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="startDate">Start Date</Label>
                                    <Input type="date" name="startDate" id="startDate" min="2018-10-01" max="2019-01-31" defaultValue="2018-10-01" placeholder="Start Date" />
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="endDate">End Date</Label>
                                    <Input type="date" name="endDate" id="endDate"  min="2018-10-01" max="2019-01-31"
                                           placeholder="End Date" />
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Button id="bGenerate" style={{marginTop: 32 + 'px'}} onClick={adminGrabStats}>Generate</Button>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Form>
                    { (self.state.adminStats.length > 0) ? adminTable() : '' }
                </div>
            );
        }

        return (
            <div>
                { (sessionStorage.getItem('username') != null && sessionStorage.getItem('hash').toLowerCase() === 'nuicsdj89fhsd789fnsdui') ? admin() : table() }
            </div>
        );
    }
}

export default Stats;