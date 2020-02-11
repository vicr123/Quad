import React from 'react';

class PaneGroup extends React.Component {
    render() {
        return <div class="paneGroup containerVertical">
            <span class="paneGroupTitle">{this.props.title}</span>
            {this.props.children}
        </div>
    }
}

export default PaneGroup;