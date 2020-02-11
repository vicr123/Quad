import React from "react";
import Fetch from "fetch";

let loginWin;

class Login extends React.Component {
    constructor(props) {
        super(props);
        
        window.performLogin = this.performLogin.bind(this);
        let url = localStorage.getItem("loginUrlCallback");
        if (url) {
            localStorage.removeItem("loginUrlCallback");
            
            //POST to the API
            let urlObj = new URL(url);
            console.log(urlObj);
            
            let code = urlObj.searchParams.get("code");
            if (code) {
                Fetch.post("/auth/login", {
                    code: code
                }).then(response => {
                    if (response.status === "success") {
                        localStorage.setItem("token", response.token);
                        this.props.tokenChanged();
                    }
                });
            }
        }
    }
    
    login() {
        loginWin = window.open("https://discordapp.com/api/oauth2/authorize?client_id=676277282825830441&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2FpopupCallback.html&response_type=code&scope=identify%20guilds", "_blank", "dependent");
    }
    
    performLogin() {
        console.log(loginWin.location.href);
    }
    
    render() {
        return <div className="mainContainer containerVertical containerCenter">
            <h1>Welcome to Quad</h1>
            <p>Let's get you logged in</p>
            <a className="button" onClick={this.login.bind(this)}>Log in to Discord</a>
        </div>
    }
}

export default Login;