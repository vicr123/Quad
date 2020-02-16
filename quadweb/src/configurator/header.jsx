import React from 'react';
import Modal from 'modal';

class Header extends React.Component {
    username() {
        return `${this.props.user.username}#${this.props.user.discriminator}`;
    }
    
    performLogOut() {
        Modal.unmount();
        localStorage.removeItem("token");
        this.props.tokenChanged();
    }
    
    showUserSettings() {
        Modal.mount(<Modal title="You, yourself and... you?" width={400} cancelable={true} renderBack={true}>
            <div className="containerVertical grow">
                <div className="button destructive" onClick={this.performLogOut.bind(this)}>Log Out</div>
            </div>
        </Modal>)
    }
    
    render() {
        return <div className="header containerHorizontal">
            <span className="headerTitle">{CONFIG.bot.name}</span>
            <div className="grow" />
            <div className="button flat" onClick={this.showUserSettings.bind(this)}>{this.username()}</div>
        </div>
    }
}

export default Header;