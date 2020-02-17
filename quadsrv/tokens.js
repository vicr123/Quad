const db = require("db");
const Fetch = require("fetch");

let users = {};

module.exports = async function(req, res, next) {
    let authHeader = req.get("Authorization");
    if (authHeader && authHeader.startsWith("Token ")) {
        let token = authHeader.substr(6);
        
        req.token = token;
        
        //Check the token
        let query = await db.getPool().query("SELECT * FROM webTokens WHERE token=$1", [token]);
        if (query.rowCount > 0) {
            //Get the user from the access token
            let user = {
                access: query.rows[0].accesstoken,
                refresh: query.rows[0].refreshtoken
            };
            
            if (users.hasOwnProperty(user.access)) {
                user.id = users[user.access];
            } else {
                try {
                    let userResp = await Fetch.req(user, "/users/@me", {
                        method: "GET"
                    });
                    user.id = userResp.id;
                } catch (err) {
                    //Ignore for the time being
                }
            }
            
            req.user = user;
        }
    }
    
    req.sendTimed401 = (error) => {
        setTimeout(() => {
            res.status(401).send({
                "error": error
            });
        }, 1000);
    };
    
    next();
}