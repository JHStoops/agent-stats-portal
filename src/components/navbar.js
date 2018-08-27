import React from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Button,
    InputGroup,
    InputGroupAddon,
    Input} from 'reactstrap';

export default class TopNavbar extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
            username: 'grliddiard',
            password: ''
        };
    }
    toggle() {
        this.setState({ isOpen: !this.state.isOpen });
    }
    handleChange(e){
        this.setState({ [e.target.name]: e.target.value });
    }
    login() {
        const self = this;
        //TODO: add input validation

        // TODO: commented to skip the ldap login, since my account doesn't have agent data...
        // fetch('http://localhost:3000/api/login', {
        //     method: 'POST',
        //     body: JSON.stringify({username: this.state.username, password: this.state.password}),
        //     headers: {
        //         'accept': 'application/json',
        //         'content-type': 'application/json'
        //     }
        // })
        //     .then( function(res){
                fetch('http://localhost:3000/api/me', {
                    method: 'POST',
                    body: JSON.stringify({username: self.state.username}),
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json'
                    }
                })
                    .then( data => data.json() )
                    .then( function(user) {
                        // TODO: should this be stored in react component instead, and loaded on refresh?
                        //store user info
                        sessionStorage.setItem('client', user.client);
                        sessionStorage.setItem('userid', user.userid);
                        sessionStorage.setItem('name', user.name);
                        sessionStorage.setItem('site', user.site);
                        sessionStorage.setItem('username', user.username);
                        sessionStorage.setItem('licensed', user.licensed);
                        sessionStorage.setItem('hash', user.hash);

                        //fetch agent stats
                        fetch(`http://localhost:3000/api/stats/${user.client}/${user.userid}`, {
                            method: 'GET',
                            headers: {
                                'accept': 'application/json',
                                'content-type': 'application/json',
                                'x-authentication': user.hash
                            }
                        })
                            .then( data => data.json() )
                            .then( function(stats){
                                console.log(stats);
                                self.props.setStats(stats);
                                self.props.toggleLoggedIn(true);
                            })
                            .catch( err => {console.log(err); self.props.toggleLoggedIn(false);})
                    })
        //     })
    }
    logout() {
        sessionStorage.clear();
        this.props.toggleLoggedIn(false);
    }
    render() {
        const self = this;
        function handleLogout(e) {
            e.preventDefault();
            self.logout();
        }

        const loggedInState = (this.props.getLoggedIn()) ?
                (
                    <NavItem>
                        <NavLink href="#" onClick={handleLogout}>Logout</NavLink>    {/*TODO: Make this a logout button and a "Hello, [agentname]" or something*/}
                    </NavItem>
                )
                :
                (
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Input type="text" onChange={ this.handleChange.bind(this) } name="username" id="username" placeholder="Username" value={this.state.username} />
                    </InputGroupAddon>
                    <Input type="password" onChange={ this.handleChange.bind(this) } name="password" id="password" placeholder="password" />
                    <InputGroupAddon addonType="append">
                        <Button onClick={this.login.bind( this )}>Login</Button>
                    </InputGroupAddon>
                </InputGroup>
            );

        return (
            <div id="navbar">
                <Navbar color="light" light expand="md">
                    <NavbarBrand href="/"><img src={ (['Aetna', 'Caresource'].includes(sessionStorage.getItem('client')) ) ? "/public/ELEVATE4.4.png" : "/public/cXp_Logo.png"} width="108" height="80" alt="AEP 2018 Agent Stats Portal"/></NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            { loggedInState }
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}
