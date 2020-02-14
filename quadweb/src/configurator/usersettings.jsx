import React from 'react';
import Heading from './heading';
import PaneGroup from './panegroup';
import LoadingPane from './loadingpane';
import Fetch from 'fetch';
import Modal from 'modal';

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
    
    execSetLatLng() {
        Modal.mount(<Modal title="Set Latitude and Longitude" width={400} cancelable={true} renderBack={true}>
            Set lat and lng here
        </Modal>)
    }
    
    render() {
        if (this.state.settings) {
            return <div className="containerVertical grow">
                <Heading title="User Settings" />
                <PaneGroup title="Locale">
                    <p>Set the language that {CONFIG.bot.name} will use on Discord</p>
                    <select value={this.state.settings.locale} onChange={this.onLocaleChange.bind(this)}>
                        {this.state.settings.availableLocales.map(value => {
                            return <option value={value} key={value}>{value}</option>
                        })}
                    </select>
                </PaneGroup>
                <PaneGroup title="Geography">
                    <p>Set the location that {CONFIG.bot.name} will use for location based commands.</p>
                    <p><b>IMPORTANT:</b> To alleviate privacy concerns, you should not point {CONFIG.bot.name} too close to your residence. It's recommended that you use a nearby major city.</p>
                    <a className="button">Search on map</a>
                    <a className="button" onClick={this.execSetLatLng.bind(this)}>Enter Latitude/Longitude</a>
                </PaneGroup>
            </div>
        } else {
            return <LoadingPane />
        }
    }
}

export default UserSettings;