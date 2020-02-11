import React from 'react';
import Heading from './heading';
import PaneGroup from './panegroup';
import LoadingPane from './loadingpane';
import Fetch from 'fetch';

class GuildSettings extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            currentPage: "loader"
        };
    }
    
    componentDidMount() {
        Fetch.get(`/guilds/${this.props.guildId}`).then(response => {
            this.setState({
                settings: response.settings,
                guild: response.guild,
                channels: response.channels,
                currentPage: "configure"
            });
        }).catch(err => {
            this.setState({
                currentPage: "error"
            });
        });
    }
    
    addQuad() {
        
    }
    
    onPrefixChange(event) {
        let newPrefix = event.target.value;
        this.setState(state => {
            let settings = state.settings;
            settings.prefix = newPrefix;
            return {
                settings: settings
            };
        });
    }
    
    submitPrefixChange(event) {
        Fetch.post(`/guilds/${this.props.guildId}/set`, {
            prefix: this.state.settings.prefix
        });
    }
    
    render() {
        if (this.state.currentPage === "loader") {
            return <LoadingPane />
        } else if (this.state.currentPage === "error") {
            return <div className="containerVertical containerCenter fill grow">
                <h1>Add Quad</h1>
                <a className="button" onClick={this.addQuad.bind(this)}>Add Quad to the server</a>
            </div>
        } else {
            return <div className="containerVertical grow">
                <Heading title={this.state.guild.name} />
                <PaneGroup title="Prefix">
                    <p>Set the prefix for Quad commands.</p>
                    <input type="text" value={this.state.settings.prefix} onChange={this.onPrefixChange.bind(this)} onBlur={this.submitPrefixChange.bind(this)} />
                    <p>Example usage: {this.state.settings.prefix}ping</p>
                </PaneGroup>
            </div>
        }
    }
}

export default GuildSettings;