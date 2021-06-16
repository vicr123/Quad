import React from 'react';
import Fetch from 'fetch';
import LoadingPane from './loadingpane';
import Heading from './heading';

class Pin extends React.Component {
	constructor(props) {
		super(props)
	}

	handleDeleteClick() {
		this.props.unpin(this.props.id);
	}

	render() {
		return <div className="pinContainer">
			<div className="pinHeader">
				<span className="pinId">#{this.props.id}</span>
				<div>
					<a href={this.props.pin.url} target={"_blank"}><div className="button">View on Discord</div></a>
					<div className="button destructive" onClick={this.handleDeleteClick.bind(this)}>Unpin</div>
				</div>
			</div>
			<div className="pinContent">
				<span>{this.props.pin.content}</span>
			</div>
			<div className="pinFooter">
				<img src={this.props.pin.avatar} />
				<span>{this.props.pin.author}</span>
			</div>
		</div>
	}
}

class UserPins extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			pins: null
		};
	}

	componentDidMount() {
		this.setState({pins: {
			ids: [1],
			pins: {
				1: {
					content: "This is a pinned message.",
					author: "discordtag#1234",
					avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
					url: "https://discord.com/"
				}
			}
		}});
	}

	unpin(id) {
		// TODO
	}

	pins() {
		let els = [];

		for (let id in this.state.pins.pins) {
			els.push(<Pin key={id} id={id} pin={this.state.pins.pins[id]} unpin={this.unpin.bind(this)} />);
		}

		return els;
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
