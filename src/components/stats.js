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

        function stats(attr) {
            return (
                <tr>
                    <th scope="row">{attr}</th>
                    <td>{ enrollments(conversions[attr],    'MA', 'P')  }</td>
                    <td>{ conversionRate(conversions[attr], 'MA')       }</td>
                    <td>{ enrollments(conversions[attr],    'PDP', 'P') }</td>
                    <td>{ conversionRate(conversions[attr], 'PDP')      }</td>
                </tr>
            );
        }

        const isLoggedIn = (this.props.getLoggedIn()) ?
            (
                <Table>
                    <thead>
                    <tr>
                        <th></th>
                        <th>MANE</th>
                        <th>MANE Conversion %</th>
                        <th>PDPNE</th>
                        <th>PDPNE Conversion %</th>
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