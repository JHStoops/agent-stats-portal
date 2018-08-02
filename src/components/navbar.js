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
        //TODO: add input validation
        //TODO: tie in api call
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
                    <NavbarBrand href="/"><img src="/public/cXp_Logo.png"/></NavbarBrand>
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
