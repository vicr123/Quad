import React from 'react';
import Fetch from 'fetch';
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
			console.log(response);
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
					<span>{this.state.pinData.content}</span>
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

	render() {
		if (this.state.pinData) {
			return <div className="pinContainer">
				{this.renderPreheader()}
				<div className="pinHeader">
					<span className="pinId">#{this.props.pin}</span>
					<div>
						<a href={this.state.pinData.url} target={"_blank"}><div className="button">View on Discord</div></a>
						<div className="button destructive" onClick={this.handleDeleteClick.bind(this)}>Unpin</div>
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
			console.log(response);
			this.setState({
				pins: response
			});
        });

		// this.setState({
		// 	pins: [
		// 		{
		// 			id: 1,
		// 			content: "This is a pinned message.",
		// 			author: "discordtag#1234",
		// 			avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
		// 			url: "https://discord.com/"
		// 		}
		// 	]
		// })
	}

	unpin(id) {
		// TODO
	}

	pins() {
		return this.state.pins.map(pin => <Pin key={pin.id} pin={pin} unpin={this.unpin.bind(this)} />)
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
