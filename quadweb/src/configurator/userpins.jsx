import React from 'react';
import Fetch from 'fetch';
import Markdown from 'markdown';
import LoadingPane from './loadingpane';
import Heading from './heading';

class Pin extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			pinData: null
		};
	}

	async componentDidMount() {
        Fetch.get(`/user/pins/${this.props.pin}`).then(response => {
			this.setState({
				pinData: response
			});
        });
	}

	handleDeleteClick() {
		this.props.unpin(this.props.id);
	}

	renderPreheader() {
		if (this.state.pinData.state === "available") {

		}
	}

	renderContents() {
		if (this.state.pinData.state === "available") {
			let parts = [];
			if (this.state.pinData.image) {
				parts.push(<a key="pinImage" href={this.state.pinData.image} target="_blank" >
					<div className="pinImage" style={{
						backgroundImage: `url(${this.state.pinData.image})`
					}} />
				</a>)
			}

			if (this.state.pinData.content) {
				parts.push(<div className="pinContent" key="pinContent">
					<Markdown md={this.state.pinData.content} />
				</div>);
			}

			parts.push(<div className="pinFooter" key="pinFooter">
				<img src={this.state.pinData.avatar} />
				<span>{this.state.pinData.author}</span>
			</div>)

			return parts;
		} else {
			return <>
				<div className="pinContent">
					<span>This pin is unavailable.</span>
				</div>
			</>
		}
	}

	unpin() {
        Fetch.delete(`/user/pins/${this.props.pin}`);
		this.props.onUnpin();
	}

	render() {
		if (this.state.pinData) {
			return <div className="pinContainer">
				{this.renderPreheader()}
				<div className="pinHeader">
					<span className="pinId">#{this.props.pin}</span>
					<div>
						<a href={this.state.pinData.url} target={"_blank"}><div className="button">View on Discord</div></a>
						<div className="button destructive" onClick={this.unpin.bind(this)}>Unpin</div>
					</div>
				</div>
				{this.renderContents()}
			</div>
		} else {
			return <div className="pinContainer">
				<div className="pinHeader">
					<span className="pinId">#{this.props.pin}</span>
				</div>
				{/* TODO: render a loader or something */}
			</div>
		}
	}
}

class UserPins extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			pins: []
		};
	}

	async componentDidMount() {
        Fetch.get("/user/pins").then(response => {
			this.setState({
				pins: response
			});
        });
	}

	pins() {
		if (this.state.pins.length === 0) {
			return <p>There's nothing here yet!</p>
		}

		return this.state.pins.map(pin => {
			let onUnpin = () => {
				console.log(pin);
				this.setState(oldState => ({
					pins: oldState.pins.filter(pinId => pinId !== pin)
				}));
			};

			return <Pin key={pin} pin={pin} onUnpin={onUnpin} />
		})
	}

	render() {
		if (this.state.pins) {
			return <div style={{position: "relative"}} className="containerVertical grow">
				<Heading title="Portable Pins" />
				<div className="containerScrollable pinsContainer">
					{this.pins()}
				</div>
			</div>
		} else {
			return <LoadingPane />
		}
	}
}

export default UserPins;
