import React, {Component} from 'react';
import { Table } from 'reactstrap';

class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        let conversions = this.props.getStats();

        function enrollments(stats, product, callerType){
            if (!stats) return 0;
            const result = stats.reduce((acc, call) => Number(call.product === product && call.callerType === callerType && call.enrollment === 1) + acc, 0);
            if (result === null || isNaN(result) || result === undefined) return 0;
            return result;
        }

        function conversionRate(stats, product){
            if (!stats) return 0;
            const result = Number(stats.reduce((acc, call) => Number(call.product === product /*&& call.callerType === 'P'*/ && (call.hv === 1 || call.lacb || call.enrollment)) + acc, 0) /
                stats.reduce((acc, call) => Number(call.product === product /*&& call.callerType === 'P'*/ && call.opportunity === 1) + acc, 0) * 100).toFixed(2)
            if (result === null || isNaN(result) || result === undefined) return 0;
            return result;
        }

        function homeVisits(stats){
            if (!stats) return 0;
            const result = stats.reduce((acc, call) => Number(call.hv === 1) + acc, 0);
            if (result === null || isNaN(result) || result === undefined) return 0;
            return result;
        }

        function lacb(stats){
            if (!stats) return 0;
            const result = stats.reduce((acc, call) => Number(call.lacb === 1) + acc, 0);
            if (result === null || isNaN(result) || result === undefined) return 0;
            return result;
        }

        function totalCalls(stats, product){
            if (!stats) return 0;
            const result = stats.reduce((acc, call) => Number(call.product === product) + acc, 0);
            if (result === null || isNaN(result) || result === undefined) return 0;
            return result;
        }

        function opportunities(stats, product){
            if (!stats) return 0;
            const result = stats.reduce((acc, call) => Number(call.opportunity === 1 && call.product === product) + acc, 0);
            if (result === null || isNaN(result) || result === undefined) return 0;
            return result;
        }

        function stats(attr) {
            return (
                <tr>
                    <th scope="row">{attr}</th>
                    <td className="MAL">
                        { totalCalls(conversions[attr],     'MA')       }</td>
                    <td>{ opportunities(conversions[attr],  'MA')       }</td>
                    <td>{ enrollments(conversions[attr],    'MA', 'P')  }</td>
                    <td>{ enrollments(conversions[attr],    'MA', 'M')  }</td>
                    <td>{ homeVisits(conversions[attr])                  }</td>
                    <td>{ lacb(conversions[attr])                        }</td>
                    <td className="MAR">
                        { conversionRate(conversions[attr], 'MA')       }</td>
                    <td>{ totalCalls(conversions[attr],     'PDP')      }</td>
                    <td>{ opportunities(conversions[attr],  'PDP')      }</td>
                    <td>{ enrollments(conversions[attr],    'PDP', 'P') }</td>
                    <td>{ enrollments(conversions[attr],    'PDP', 'M') }</td>
                    <td>{ conversionRate(conversions[attr], 'PDP')      }</td>
                </tr>
            );
        }

        const table = (this.props.getLoggedIn()) ?
            (
                <Table>
                    <thead>
                    <tr>
                        <td></td>
                        <td colSpan="7">MA</td>
                        <td colSpan="5">PDP</td>
                    </tr>
                    <tr>
                        <th></th>
                        <th className="MAL">Calls</th>
                        <th>Opportunities</th>
                        <th>Enrollments</th>
                        <th>Plan Changes</th>
                        <th>HV</th>
                        <th>LACB</th>
                        <th className="MAR">Conversion Rate</th>
                        <th>Calls</th>
                        <th>Opportunities</th>
                        <th>Enrollments</th>
                        <th>Plan Changes</th>
                        <th>Conversion %</th>
                    </tr>
                    </thead>
                    <tbody>
                    { stats('today') }
                    { stats('yesterday') }
                    { stats('aepToDate') }
                    </tbody>
                </Table>
            )
            :
            (
                <p>Please log in</p>
            );

        return (
            <div id="stats">
                { table }
            </div>
        );
    }
}

export default Stats;