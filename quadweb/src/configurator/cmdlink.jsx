import React from 'react';

class Cmdlink extends React.Component {
    classes() {
        let classes = [
            "button",
            "cmdlink",
            "containerVertical"
        ];
        if (this.props.className) classes.push(this.props.className);
        return classes.join(" ");
    }
    
    render() {
        return <div className={this.classes()} onClick={this.props.onClick}>
            <div className="containerHorizontal">
                <i className="icon-go-next" />
                <span style={{fontWeight: "bold"}}>{this.props.title}</span>
            </div>
            <div className="containerHorizontal">
                <i className="icon-go-next cmdlinkDescriptionIcon" />
                <span>{this.props.description}</span>
            </div>
        </div>
    }
}

export default Cmdlink;