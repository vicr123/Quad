import React, { Component } from "react";
import {hot} from "react-hot-loader";
import Helmet from 'react-helmet';
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
    
    componentDidCatch(error, info) {
        console.log(error);
        console.log(info);
        this.setState({
            page: "error",
            error: error,
            info: info
        });
    }

    renderApp() {
        if (this.state.page === "login") {
            return <Login tokenChanged={this.reload.bind(this)} />
        } else if (this.state.page === "configurator") {
            return <Configurator tokenChanged={this.reload.bind(this)} />
        } else if (this.state.page === "error") {

            return <div className="mainContainer containerVertical containerCenter">
                <h1>Ouch</h1>
                <p>Looks like something strange happened.</p>
                <pre>{this.state.error.message}</pre>
                <a className="button" onClick={() => {
                    window.location.reload();
                }}>Reload</a>
            </div>
        }
    }

	render() {
		return <>
			<Helmet>
				<title>{CONFIG.bot.name}</title>
			</Helmet>
			{this.renderApp()}
		</>
	}
}

export default hot(module)(App);
