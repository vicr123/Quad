const ws = require('ws');
const http = require('http');
const log = require('log');
const i18n = require('i18n');
const config = require('config');
const handler = require('handler');
const ServerConnection = require('./serverconnection');

const t = i18n.t;

const server = http.createServer();
const wss = new ws.Server({
    server: server
});

handler.on("quit", () => {
    server.close();
})
process.on("uncaughtException", err => {
    server.close();
});

wss.on("listening", () => {
    log(t("Configuration server started."), log.success);
});
wss.on("connection", (socket, request) => {
    let oldSend = socket.send.bind(socket);
    socket.send = (data, options, callback) => {
        if (data instanceof Object) data = JSON.stringify(data);
        return oldSend(data, options, callback);
    }
    new ServerConnection(socket);
});

wss.on("error", e => {
    if (e.code === "EADDRINUSE") {
        log(t("Configuration server can't be started because the local socket is in use."), log.error);
    }
})
server.listen(`/tmp/${config.get("bot.name")}-ctl`);