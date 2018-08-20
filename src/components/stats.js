import React, {Component} from 'react';
import { Table } from 'reactstrap';

class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const conversions = this.props.getStats();
        const stats = (
            <tr>
                <th scope="row">1</th>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
            </tr>
        );

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
                    { stats }
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