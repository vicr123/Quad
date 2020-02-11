import React from 'react';

class Heading extends React.Component {
    render() {
        return <div className="heading">
            {this.props.title}
        </div>
    }
}

export default Heading;