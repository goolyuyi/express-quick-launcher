const util = require('util');

async function launch(app, port = 0, {
    protocol = 'http',
    launchTimeout = 3000,
    ca = undefined
}) {
    port = normalizePort(port);
    let server;
    if (protocol === 'http') {
        server = require('http').createServer(app);
    } else if (protocol === 'https') {
        if (!ca) {
            const fs = require('fs');

            const privateKey = await fs.promises.readFile(require.resolve('./mock-cert/localhostSSL.key'), 'utf8');
            const certificate = await fs.promises.readFile(require.resolve('./mock-cert/localhostSSL.pem'), 'utf8');
            ca = {key: privateKey, cert: certificate};
        }
        server = require('https').createServer(ca, app);
    }

    server.listen(port);
    let addr = new Promise((resolve, reject) => {
        server.on('listening', () => {
            let addr = server.address();
            let localhostURL = new URL('http://localhost');
            localhostURL.protocol = protocol;
            localhostURL.port = addr.port;
            addr.localhostURL = localhostURL;
            addr.close = function () {
                return util.promisify(server.close);
            };
            resolve(addr);
        });
        setTimeout(reject, launchTimeout);
    });

    server.on('error', onError);


    return addr;
}

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(' requires elevated privileges');
            break;
        case 'EADDRINUSE':
            console.error(' is already in use');
            break;
        default:
            throw error;
    }
}

module.exports = launch;
