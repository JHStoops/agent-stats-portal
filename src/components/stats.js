import React, {Component} from 'react';

class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: this.props.loggedIn
        };
    }
    isLoggedIn(){
        return this.props.loggedIn;
    }
    render() {
        const isLoggedIn = (this.isLoggedIn()) ?
            (
                <p>thank you for logging in</p>
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