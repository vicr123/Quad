import React from 'react';
import Sidebar from './sidebar';
import Header from './header';
import Fetch from 'fetch';
import UserSettings from './usersettings';
import GuildSettings from './guildsettings';
import LoadingPane from './loadingpane';

class Configurator extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            mainPage: "loader",
            panePage: "userSettings"
        };
    }
    
    componentDidMount() {
        Fetch.get("/auth/me").then(results => {
            let guilds = results.guilds;
            guilds.sort((firstEl, secondEl) => {
                let first = firstEl.name.toLowerCase();
                let second = secondEl.name.toLowerCase();
                if (first < second) {
                    return -1;
                } else if (first > second) {
                    return 1;
                } else {
                    return 0;
                }
            });
            this.setState({
                user: results.user,
                guilds: guilds,
                mainPage: "configurator"
            });
        });
    }
    
    currentPane() {
        if (this.state.panePage === "userSettings") {
            return <UserSettings />
        } else {
            return <GuildSettings key={this.state.panePage} guildId={this.state.panePage} />
        }
    }
    
    changePane(key) {
        this.setState({
            panePage: key
        });
    }
    
    render() {
        if (this.state.mainPage === "loader") {
            return <div className="mainContainer containerVertical containerCenter">
                <LoadingPane />
            </div>
        } else {
            return <div className="mainContainer containerVertical">
                <Header user={this.state.user} />
                <div className="containerHorizontal grow">
                    <Sidebar guilds={this.state.guilds} current={this.state.panePage} changePane={this.changePane.bind(this)} />
                    {this.currentPane()}
                </div>
            </div>
        }
    }
}

export default Configurator;