import React from 'react';
import Heading from './heading';
import PaneGroup from './panegroup';
import LoadingPane from './loadingpane';
import Fetch from 'fetch';
import Modal from 'modal';
import Cmdlink from './cmdlink';

class SetLatLngDialog extends React.Component {
    constructor(props) {
        super(props);
        
        if (props.current) {
            this.state = {
                lat: props.current[0],
                lng: props.current[1]
            }
        } else {
            this.state = {
                lat: 0,
                lng: 0
            }
        }
        
    }
    
    set(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }
    
    check() {
        let newState = {};
        
        for (let key of ["lat", "lng"]) {
            let val = this.state[key];
            
            if (val === "") val = 0;
            if (isNaN(val)) val = 0;
            
            if (key === "lat") {
                val = val < -90 ? -90 : (val > 90 ? 90 : val);
            } else {
                val = val < -180 ? -180 : (val > 180 ? 180 : val);
            }
            
            newState[key] = parseFloat(val);
        }
        
        this.setState(newState);
    }
    
    accept() {
        this.props.accept([this.state.lat, this.state.lng]);
        Modal.unmount();
    }
    
    render() {
        return <div className="containerVertical containerPadded">
            <div className="containerHorizontal"><span>Latitude:&nbsp;</span><input className="grow" type="text" name="lat" value={this.state.lat} onChange={this.set.bind(this)} onBlur={this.check.bind(this)}/></div>
            <div className="containerHorizontal"><span>Longitude:&nbsp;</span><input className="grow" type="text" name="lng" value={this.state.lng} onChange={this.set.bind(this)} onBlur={this.check.bind(this)}/></div>
            <a className="button" onClick={this.accept.bind(this)}>Set Location</a>
        </div>
    }
}

class UserSettings extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            settings: null,
            setlatlng: {
                lat: 0,
                lng: 0
            }
        };
    }
    
    componentDidMount() {
        Fetch.get("/user/settings").then(response => {
            this.setState({
                settings: response
            })
        });
    }
    
    setUserSetting(event) {
        let key = event.target.name;
        let value = event.target.value;
        Fetch.post(`/user/set`, {
            [key]: value
        });
        this.setState(state => {
            let oldSettings = state.settings;
            oldSettings[key] = value;
            return {
                settings: oldSettings
            };
        });
    }
    
    setLocation(loc) {
        this.setUserSetting({
            target: {
                name: "geography",
                value: loc
            }
        });
    }
    
    execUseGeolocation() {
        Modal.unmount();
        navigator.geolocation.getCurrentPosition((pos) => {
            let lat = Math.round(pos.coords.latitude * 2) / 2;
            let lng = Math.round(pos.coords.longitude * 2) / 2;
            this.setLocation([lat, lng]);
        }, (err) => {
            alert(`${err.code} ${err.message}`);
        }, {
            enableHighAccuracy: false
        })
    }
    
    execSetLatLng() {
        Modal.mount(<Modal title="Set Latitude and Longitude" width={400} cancelable={true} renderBack={true}>
            <SetLatLngDialog current={this.state.settings.geography} accept={this.setLocation.bind(this)}/>
        </Modal>)
    }
    
    execClearLoc() {
        this.setLocation(null);
    }
    
    currentLocString() {
        if (this.state.settings.geography) {
            return <p>{this.state.settings.geography[0]}°, {this.state.settings.geography[1]}°</p>
        } else {
            return <p>Not set</p>
        }
    }
    
    execSetLocationPopover() {
        Modal.mount(<Modal title="Set Location" width={400} cancelable={true} renderBack={true}>
            <div className="containerVertical containerPadded">
                How do you want to set your location?
                <a className="button" onClick={this.execUseGeolocation.bind(this)}>Use current location</a>
                {/*<a className="button">Search on map</a>*/}
                <a className="button" onClick={this.execSetLatLng.bind(this)}>Enter Latitude/Longitude</a>
            </div>
        </Modal>)
    }
    
    render() {
        if (this.state.settings) {
            return <div className="containerVertical grow">
                <Heading title="User Settings" />
                <PaneGroup title="Locale">
                    <p>Set the language that {CONFIG.bot.name} will use on Discord</p>
                    <select name="locale" value={this.state.settings.locale} onBlur={this.setUserSetting.bind(this)}>
                        {this.state.settings.availableLocales.map(value => {
                            return <option value={value} key={value}>{value}</option>
                        })}
                    </select>
                </PaneGroup>
                <PaneGroup title="Geography">
                    <p>Set the location that {CONFIG.bot.name} will use for location based commands.</p>
                    <p><b>IMPORTANT:</b> To alleviate privacy concerns, you should not point {CONFIG.bot.name} too close to your residence. It's recommended that you use a nearby major city.</p>
                    <Cmdlink title="Set Location" description={this.currentLocString()} onClick={this.execSetLocationPopover.bind(this)}/>
                    <Cmdlink className="destructive" title="Clear Saved Location" description="Clear your saved location" onClick={this.execClearLoc.bind(this)} />
                </PaneGroup>
            </div>
        } else {
            return <LoadingPane />
        }
    }
}

export default UserSettings;