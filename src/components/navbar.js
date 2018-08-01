import React from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button,
    Form,
    FormGroup,
    Label,
    InputGroup,
    InputGroupText,
    InputGroupAddon,
    Input} from 'reactstrap';

export default class Example extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
    render() {
        return (
            <div id="navbar">
                <Navbar color="light" light expand="md">
                    <NavbarBrand href="/">reactstrap</NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                    <Input type="text" name="username" id="username" placeholder="Username" />
                                </InputGroupAddon>
                                <Input placeholder="and..." />
                                <InputGroupAddon addonType="append">
                                    <Button>Login</Button>
                                </InputGroupAddon>
                            </InputGroup>
                            {/*<InputGroup>*/}
                                {/*<InputGroupAddon addonType="prepend">*/}
                                    {/*<Label for="username" hidden>Username</Label>*/}
                                    {/*<Input type="text" name="username" id="username" placeholder="Username" />*/}
                                {/*</InputGroupAddon>*/}
                                {/*<Input type="password" name="password" id="password" placeholder="password" />*/}
                                {/*<InputGroupAddon addonType="append">*/}
                                    {/*<Button>Login</Button>*/}
                                {/*</InputGroupAddon>*/}
                            {/*</InputGroup>*/}
                            <NavItem>
                                <NavLink href="/components/">Components</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="https://github.com/reactstrap/reactstrap">GitHub</NavLink>
                            </NavItem>
                            <UncontrolledDropdown nav inNavbar>
                                <DropdownToggle nav caret>
                                    Options
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem>
                                        Option 1
                                    </DropdownItem>
                                    <DropdownItem>
                                        Option 2
                                    </DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem>
                                        Reset
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}