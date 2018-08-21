import React, {Component} from 'react';
import { Table } from 'reactstrap';

class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
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
                    <td className="MA">{ totalCalls(conversions[attr],      'MA')       }</td>
                    <td className="MA">{ opportunities(conversions[attr],   'MA')       }</td>
                    <td className="MA">{ enrollments(conversions[attr],     'MA', 'P')  }</td>
                    <td className="MA">{ enrollments(conversions[attr],     'MA', 'M')  }</td>
                    <td className="MA">{ homeVisits(conversions[attr])                  }</td>
                    <td className="MA">{ lacb(conversions[attr])                        }</td>
                    <td className="MA">{ conversionRate(conversions[attr],  'MA')       }</td>
                    <td className="PDP">{ totalCalls(conversions[attr],     'PDP')      }</td>
                    <td className="PDP">{ opportunities(conversions[attr],  'PDP')      }</td>
                    <td className="PDP">{ enrollments(conversions[attr],    'PDP', 'P') }</td>
                    <td className="PDP">{ enrollments(conversions[attr],    'PDP', 'M') }</td>
                    <td className="PDP">{ conversionRate(conversions[attr], 'PDP')      }</td>
                </tr>
            );
        }

        const isLoggedIn = (this.props.getLoggedIn()) ?
            (
                <Table>
                    <thead>
                    <tr>
                        <td></td>
                        <td className="MAS" colSpan="7">MA</td>
                        <td className="PDP" colSpan="5">PDP</td>
                    </tr>
                    <tr>
                        <th></th>
                        <th className="MA">Calls</th>
                        <th className="MA">Opportunities</th>
                        <th className="MA">Enrollments</th>
                        <th className="MA">Plan Changes</th>
                        <th className="MA">HV</th>
                        <th className="MA">LACB</th>
                        <th className="MA">Conversion Rate</th>
                        <th className="PDP">Calls</th>
                        <th className="PDP">Opportunities</th>
                        <th className="PDP">Enrollments</th>
                        <th className="PDP">Plan Changes</th>
                        <th className="PDP">Conversion %</th>
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
                { isLoggedIn }
            </div>
        );
    }
}

export default Stats;