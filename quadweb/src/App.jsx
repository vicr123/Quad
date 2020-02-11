import React, { Component } from "react";
import {hot} from "react-hot-loader";
import "./App.css";
import Login from "./login"
import Configurator from "./configurator/configurator"

class App extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            page: "login"
        };
    }
    
    componentDidMount() {
        this.reload();
    }
    
    reload() {
        let page = "login";
        if (localStorage.getItem("token")) {
            page = "configurator";
        }
        
        this.setState({
            page: page
        });
    }
    
    render() {
        if (this.state.page === "login") {
            return <Login tokenChanged={this.reload.bind(this)} />
        } else if (this.state.page === "configurator") {
            return <Configurator tokenChanged={this.reload.bind(this)} />
        }
    }
}

export default hot(module)(App);
