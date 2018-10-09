import React from 'react';
import {                    //https://reactstrap.github.io/components/modals/
    Modal,
    ModalHeader,
    ModalBody,
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
        this.toggleModal = this.toggleModal.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.state = {
            isOpen: false,
            modal: false,
            username: 'grliddiard',
            password: '',
            errorMsg: ''
        };
    }
    toggle() {
        this.setState({ isOpen: !this.state.isOpen });
    }
    toggleModal() {
        this.setState({
            modal: !this.state.modal
        });
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

        // fetch('/api/login', {
        //     method: 'POST',
        //     body: JSON.stringify({username: this.state.username, password: this.state.password}),
        //     headers: {
        //         'accept': 'application/json',
        //         'content-type': 'application/json'
        //     }
        // })
        //     .then( function(res) {
        //         if (res.status !== 201) {
        //             self.triggerErrorMessage('Incorrect credentials');
        //             throw new Error('Failed to log in');
        //         }
        //         return res.json();
        //     })
        //     .then( function(data){
        //         if (data.username.toLowerCase() === 'admin' && data.hash === 'nuicsdj89fhsd789fnsdui') {
        //             sessionStorage.setItem('username', data.username);
        //             sessionStorage.setItem('hash', data.hash);
        //             self.props.toggleLoggedIn(true);
        //         }
        //         else {
                    fetch('/api/me', {
                        method: 'POST',
                        body: JSON.stringify({username: self.state.username}),
                        headers: {
                            'accept': 'application/json',
                            'content-type': 'application/json'
                        }
                    })
                        .then( function(res){
                            if ( res.status === 201) return res.json();
                            else {
                                self.triggerErrorMessage('Agent account not found.');
                                throw new Error('Agent account not found.');
                            }
                        })
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
                        .catch( err => console.log(err) );
            //     }
            // })
            // .catch( err => console.log(err) )
    }
    logout() {
        this.props.toggleLoggedIn(false);
    }
    incentiveModal() {
        const client = sessionStorage.getItem('client');
        const site = sessionStorage.getItem('site');
        if (client !== 'Aetna') return;

        return (
            <div>
                <NavLink href="#" onClick={this.toggleModal}>Incentives</NavLink>
                <Modal isOpen={this.state.modal} size={"lg"} toggle={this.toggleModal}>
                    <ModalHeader toggle={this.toggleModal}>Incentive System</ModalHeader>
                    <ModalBody>
                        <img width="100%" src={"/public/Brochure " + site + ".png"} alt={"Site-specific Incentive Information."} />
                        <img width="100%" src={"/public/Brochure All.png"} alt={"General Incentive Information."} />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
    render() {
        const self = this;
        function handleLogout(e) {
            e.preventDefault();
            self.logout();
        }

        const loggedInState = (this.props.getLoggedIn()) ?
                (
                    <NavItem className="container row" style={{minWidth: "250px"}}>
                        <div className="col-6">{ self.incentiveModal() }</div>
                        <Button color="danger" className="col-6" onClick={handleLogout}>Logout</Button>
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
