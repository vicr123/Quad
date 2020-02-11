import React from 'react';
import Heading from './heading';
import PaneGroup from './panegroup';
import LoadingPane from './loadingpane';
import Fetch from 'fetch';

class UserSettings extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            settings: null
        };
    }
    
    componentDidMount() {
        Fetch.get("/user/settings").then(response => {
            this.setState({
                settings: response
            })
        });
    }
    
    onLocaleChange(event) {
        let newLocale = event.target.value;
        Fetch.post("/user/set", {
            locale: newLocale
        });
        this.setState(state => {
            let settings = state.settings;
            settings.locale = newLocale;
            return {
                settings: settings
            };
        });
    }
    
    render() {
        if (this.state.settings) {
            return <div className="verticalContainer grow">
                <Heading title="User Settings" />
                <PaneGroup title="Locale">
                    <p>Set the language that Quad will use on Discord</p>
                    <select value={this.state.settings.locale} onChange={this.onLocaleChange.bind(this)}>
                        {this.state.settings.availableLocales.map(value => {
                            return <option value={value} key={value}>{value}</option>
                        })}
                    </select>
                </PaneGroup>
            </div>
        } else {
            return <LoadingPane />
        }
    }
}

export default UserSettings;