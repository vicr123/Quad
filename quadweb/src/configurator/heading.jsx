import React from 'react';
// import { ReactComponent as BackImage } from '../img/go-previous.svg'

class Heading extends React.Component {
    backButton() {
        if (this.props.renderBack) {
            return <a className="button flat" onClick={this.props.onBack}><i class="icon-go-previous" /></a>
        }
    }
    
    render() {
        return <div className="heading">
            {this.backButton()}
            <span>{this.props.title}</span>
        </div>
    }
}

export default Heading;