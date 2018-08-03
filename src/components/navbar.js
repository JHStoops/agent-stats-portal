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
            loggedIn: false,
            username: '',
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
        this.setState({ loggedIn: true });
        const self = this;
        //TODO: add input validation
        fetch('http://localhost:3000/api/me', {
            method: 'POST',
            body: JSON.stringify({username: self.state.username}),
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        })
            .then( function(user){
                console.log(user);
            })
        // fetch('http://localhost:3000/api/login', {
        //     method: 'POST',
        //     body: JSON.stringify({username: this.state.username, password: this.state.password}),
        //     headers: {
        //         'accept': 'application/json',
        //         'content-type': 'application/json'
        //     }
        // })
        //     .then( function(res){
        //         fetch('http://localhost:3000/api/me', {
        //             method: 'POST',
        //             body: JSON.stringify({username: self.state.username}),
        //             headers: {
        //                 'accept': 'application/json',
        //                 'content-type': 'application/json'
        //             }
        //         })
        //             .then( function(user){
        //                 console.log(user);
        //             })
        //     })
    }
    logout() {
        this.setState({ loggedIn: false });
    }
    render() {
        const isLoggedIn = (this.state.loggedIn) ?
                (
                    <NavItem>
                        <NavLink href="/" onClick={this.logout.bind(this)}>Logout</NavLink>    {/*TODO: Make this a logout button and a "Hello, [agentname]" or something*/}
                    </NavItem>
                )
                :
                (
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Input type="text" onChange={ this.handleChange.bind(this) } name="username" id="username" placeholder="Username" />
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
                    <NavbarBrand href="/"><img src="/public/cXp_Logo.png" alt="AEP 2018 Agent Stats Portal"/></NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            { isLoggedIn }
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}
