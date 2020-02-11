import React from 'react';

class Header extends React.Component {
    username() {
        return `${this.props.user.username}#${this.props.user.discriminator}`;
    }
    
    render() {
        return <div className="header containerHorizontal">
            <span className="headerTitle">Quad</span>
            <div className="grow" />
            <div className="button flat">{this.username()}</div>
        </div>
    }
}

export default Header;