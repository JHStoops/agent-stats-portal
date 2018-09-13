import React from 'react';
import {
    Alert,
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
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.state = {
            isOpen: false,
            username: 'grliddiard',
            password: '',
            errorMsg: ''
        };
    }
    toggle() {
        this.setState({ isOpen: !this.state.isOpen });
    }
    handleChange(e){
        this.setState({ [e.target.name]: e.target.value });
    }
    handleKeyPress(e) {
        if (e.key === 'Enter') this.login();
    }
    triggerErrorMessage(msg){
        const self = this;
        self.setState({ errorMsg: msg });
        const el = document.getElementById('errorMsg');

        const fade = (() => {
            if (el.style.opacity > 0) {
                el.style.opacity = (el.style.opacity - 0.1).toFixed(2);     // decrease opacity slightly
                setTimeout( fade, 90 );                                     // call fade again in a fraction of a second
            } else {
                el.style.display = "none";
                self.setState({ errorMsg: '' });
            }
        });

        const unfade = (() => {
            el.style.opacity = 1;
            el.style.display = "block";
        });

        unfade();

        setTimeout(() => {
            fade();
        }, 3000);
    }
    login() {
        const self = this;
        //TODO: add input validation

        // TODO: commented to skip the ldap login, since my account doesn't have agent data...
        // fetch('/api/login', {
        //     method: 'POST',
        //     body: JSON.stringify({username: this.state.username, password: this.state.password}),
        //     headers: {
        //         'accept': 'application/json',
        //         'content-type': 'application/json'
        //     }
        // })
        //     .then( function(res){
        //         if ( res.status !== 201) {
        //             self.triggerErrorMessage('Incorrect credentials');
        //             throw new Error('Failed to log in');
        //         }
                fetch('/api/me', {
                    method: 'POST',
                    body: JSON.stringify({username: self.state.username}),
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json'
                    }
                })
                    .then( data => data.json() )
                    .then( function(user) {
                        //store user info
                        sessionStorage.setItem('client', user.client);
                        sessionStorage.setItem('userid', user.userid);
                        sessionStorage.setItem('name', user.name);
                        sessionStorage.setItem('site', user.site);
                        sessionStorage.setItem('username', user.username);
                        sessionStorage.setItem('licensed', user.licensed);
                        sessionStorage.setItem('hash', user.hash);

                        //fetch agent stats
                        self.props.getStats();
                        self.props.toggleLoggedIn(true);
                    })
            // })
            // .catch( err => console.log(err) )
    }
    logout() {
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
                        <NavLink href="#" onClick={handleLogout}>Logout</NavLink>
                    </NavItem>
                )
                :
                (
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Input type="text" onChange={ this.handleChange.bind(this) } name="username" id="username" placeholder="Username" value={this.state.username} onKeyPress={self.handleKeyPress} />
                    </InputGroupAddon>
                    <Input type="password" onChange={ this.handleChange.bind(this) } name="password" id="password" placeholder="password" onKeyPress={self.handleKeyPress} />
                    <InputGroupAddon addonType="append">
                        <Button onClick={this.login.bind( this )}>Login</Button>
                    </InputGroupAddon>
                </InputGroup>
            );

        const activeError = (
                    <Alert id="errorMsg" color="danger">
                        { self.state.errorMsg }
                    </Alert>
            );

        return (
            <div id="navbar">
                <Navbar color="light" light expand="md">
                    <NavbarBrand href="/"><img src="/public/cXp_Logo.png" alt="AEP 2018 Agent Stats Portal"/></NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            { activeError }
                            { loggedInState }
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}
