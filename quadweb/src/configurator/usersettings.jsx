import React from 'react';
import Heading from './heading';
import PaneGroup from './panegroup';
import LoadingPane from './loadingpane';
import Fetch from 'fetch';
import Modal from 'modal';
import Cmdlink from './cmdlink';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

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

class MapDialog extends React.Component {
    constructor(props) {
        super(props);
        
        let latlng = {
            lat: props.current ? props.current[0] : 0,
            lng: props.current ? props.current[1] : 0,
        }
        
        this.state = {
            lat: latlng.lat,
            lng: latlng.lng,
            zoom: 3,
            viewport: {
                center: [latlng.lat, latlng.lng],
                zoom: 3
            }
        }
        
    }
    
    mapClicked(event) {
        let latlng = {
            lat: event.latlng.lat,
            lng: ((((event.latlng.lng + 180) % 360) + 360) % 360) - 180
        }
        console.log(event.latlng.lng + " -> " + latlng.lng);
        this.props.accept([latlng.lat, latlng.lng]);
        this.setState({
            lat: latlng.lat,
            lng: latlng.lng
        });
    }
    
    viewportChanged(viewport) {
        if (viewport.center[1] < -180 || viewport.center[1] > 180) {
            viewport = {
                center: [
                    viewport.center[0],
                    ((((viewport.center[1] + 180) % 360) + 360) % 360) - 180
                ],
                zoom: viewport.zoom
            }
        }
        
        this.setState({
            viewport: viewport
        });
    }
    
    renderMarker() {
        if (this.state.lat) {
            return <Marker position={[this.state.lat, this.state.lng]}>
                <Popup isOpen={true}>
                    <div className="verticalContainer">
                        <span>Location: {this.state.lat} {this.state.lng}</span>
                    </div>
                </Popup>
            </Marker>
        }
        return null;
    }
    
    render() {
        return <div className="containerVertical grow">
            <Map viewport={this.state.viewport} onClick={this.mapClicked.bind(this)} onViewportChanged={this.viewportChanged.bind(this)}>
                <TileLayer attribution={CONFIG.api.osmAttribution} url={CONFIG.api.osmTileMapUrl} />
                {this.renderMarker()}
            </Map>
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
    
    execSearchOnMap() {
        Modal.mount(<Modal title="Select Location on map" width={900} cancelable={true} renderBack={true}>
            <MapDialog current={this.state.settings.geography} accept={this.setLocation.bind(this)}/>
        </Modal>)
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
        let searchOnMapButton = null;
        if (CONFIG.api && CONFIG.api.osmTileMapUrl) searchOnMapButton = <a className="button" onClick={this.execSearchOnMap.bind(this)}>Search on map</a>
        
        Modal.mount(<Modal title="Set Location" width={400} cancelable={true} renderBack={true}>
            <div className="containerVertical containerPadded">
                How do you want to set your location?
                <a className="button" onClick={this.execUseGeolocation.bind(this)}>Use current location</a>
                {searchOnMapButton}
                <a className="button" onClick={this.execSetLatLng.bind(this)}>Enter Latitude/Longitude</a>
            </div>
        </Modal>)
    }

    async execImportAM() {
        Modal.mount(<Modal title="Import Portable Pins from AstralMod" width={400} cancelable={false} renderBack={false}>
            <div className="containerVertical containerPadded">
                We're importing your Portable Pins now. Please don't leave this page...
            </div>
        </Modal>)

        try {
            await Fetch.post("/user/importAM", {});
            // throw new Error();

            let number = this.state.settings.canImportAM.numPins;
            this.setState((state) => ({
                settings: {
                    ...state.settings,
                    canImportAM: false
                }
            }));

            Modal.mount(<Modal title="Import Portable Pins from AstralMod" width={400} cancelable={true} renderBack={true}>
                <div className="containerVertical containerPadded">
                    <p>{number} Portable Pins were imported into Quad.</p>
                    <a className="button" onClick={Modal.unmount}>Finish</a>
                </div>
            </Modal>)
        } catch {
            Modal.mount(<Modal title="Import Portable Pins from AstralMod" width={400} cancelable={true} renderBack={true}>
                <div className="containerVertical containerPadded">
                    <p>Your Portable Pins could not be imported into Quad. Please try again later.</p>
                    <a className="button" onClick={Modal.unmount}>Finish</a>
                </div>
            </Modal>)
        }


    }

    execImportAMPopover() {
        Modal.mount(<Modal title="Import Portable Pins from AstralMod" width={400} cancelable={true} renderBack={true}>
            <div className="containerVertical containerPadded">
                <p>{this.state.settings.canImportAM.numPins} Portable Pins from AstralMod will be imported into (and become available within) Quad.</p>
                <p>Once your portable pins are imported, there's no easy way to remove them, short of unpinning each message one by one.</p>
                <p>Each pin will be given a new pin ID inside Quad.</p>
                <p>Your current portable pins will be kept and merged with your AstralMod Portable Pins.</p>
                <a className="button" onClick={this.execImportAM.bind(this)}>Import AstralMod Pins</a>
            </div>
        </Modal>)
    }

    async execExportPopover() {
        Modal.mount(<Modal title="Export Data" width={400} cancelable={false} renderBack={false}>
            <div className="containerVertical containerPadded">
                Please wait...
            </div>
        </Modal>)

        try {
            const exportToken = await Fetch.post("/user/exportToken", {});

            Modal.mount(<Modal title="Export Data" width={400} cancelable={true} renderBack={true}>
                <div className="containerVertical containerPadded">
                    <p>In order to export data from Quad, provide the token below:</p>
                    <code>{exportToken.token}</code>
                    <p>This token expires in one hour. You can always return to Quad and request a new export token if
                        required.</p>
                    <a className="button" onClick={Modal.unmount}>Finish</a>
                </div>
            </Modal>)
        } catch {
            Modal.mount(<Modal title="Export Data" width={400} cancelable={true} renderBack={true}>
                <div className="containerVertical containerPadded">
                    <p>Sorry, we can't export your data right now. Please try again later.</p>
                    <a className="button" onClick={Modal.unmount}>Sorry</a>
                </div>
            </Modal>)
        }
    }

    renderImportButton() {
            return <PaneGroup title="Advanced">
                {this.state.settings.canImportAM &&
                    <Cmdlink title="Import Portable Pins from AstralMod" description="Import your old portable pins from AstralMod" onClick={this.execImportAMPopover.bind(this)}/>
                }
                <Cmdlink title="Export Data" description="Export your data to a service that supports importing data from Quad" onClick={this.execExportPopover.bind(this)}/>
            </PaneGroup>
    }
    
    render() {
        if (this.state.settings) {
            return <div className="containerVertical grow">
                <Heading title="User Settings" />
                <div className="containerScrollable">
                    <PaneGroup title="Locale">
                        <p>Set the language that {CONFIG.bot.name} will use on Discord</p>
                        <select name="locale" value={this.state.settings.locale} onChange={this.setUserSetting.bind(this)}>
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
                    {/* <PaneGroup title="Advanced"> */}
                        {this.renderImportButton()}
                        {/* <Cmdlink className="destructive" title="Reset Settings" description="Reset all of your settings to defaults" onClick={this.execClearLoc.bind(this)} /> */}
                    {/* </PaneGroup> */}
                </div>
            </div>
        } else {
            return <LoadingPane />
        }
    }
}

export default UserSettings;
