import React from 'react';

class PaneGroup extends React.Component {
    render() {
        return <div className="paneGroup containerVertical">
            <span className="paneGroupTitle">{this.props.title}</span>
            {this.props.children}
        </div>
    }
}

export default PaneGroup;
