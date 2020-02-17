import React from 'react';
import ReactDOM from 'react-dom';
import Heading from '../src/configurator/heading'

let modalShown = false;
let ModalUnmountHandler = () => {
    Modal.unmount();
}

class Modal extends React.Component {
    constructor(props) {
        super(props);
    }
      
    renderTitle() {
        if (this.props.title) {
            return <Heading title={this.props.title} renderBack={this.props.renderBack} onBack={Modal.unmount}/>
        } else {
            return null;
        }
    }
    
    render() {
        let backgroundClickHandler = () => {
            if (this.props.cancelable) Modal.unmount();
        }
        
        let dummyHandler = (e) => {
            e.stopPropagation();
        };
        
        return <div className="modalBackground" onClick={backgroundClickHandler}>
            <div className="modalBox" style={{"width": this.props.width}} onClick={dummyHandler} >
                <div className="modalBoxContainer" style={{"width": this.props.width}}>
                    {this.renderTitle()}
                    <div className="modalBoxContents">
                        {this.props.children}
                    </div>
                </div>
            </div>
        </div>
    }
    
    static mount(jsx) {
        if (modalShown) Modal.unmount();
        ReactDOM.render(jsx, document.getElementById('modalContainer'));
        document.getElementById('modalContainer').classList.add("active");
        modalShown = true;
    }
    
    static unmount() {
        ReactDOM.render(null, document.getElementById('modalContainer'));
        document.getElementById('modalContainer').classList.remove("active");
        modalShown = false;
    }
}

export default Modal;
