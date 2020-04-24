const expect = require('chai').expect;

const got = require('got');
const tough = require('tough-cookie');
const launch = require('../express-quick-launcher');
let express = require('express');
let cookieParser = require('cookie-parser');
let app = express();
app.use(cookieParser());
app.all('/', ((req, res) => {
    res.cookie('yuyi', 'cool', {secure: true});
    res.send('hello!');
}));

describe('basic', function () {
    it('http', async function () {
        const protocol = 'http';
        let addr = await launch(app, 0, {
            protocol: protocol,
        });

        let u = new URL('http://localhost');
        u.protocol = protocol;
        u.port = addr.port;
        u = u.toString();
        const cookieJar = new tough.CookieJar();
        const response = await got(u, {
            cookieJar
        });
        expect(response.statusCode).equal(200);
        await addr.close();
    });


    it('https', async function () {
        const protocol = 'https';

        let addr = await launch(app, 0, {
            protocol: protocol
        });
        let u = new URL('http://localhost');
        u.protocol = protocol;
        u.port = addr.port;
        u = u.toString();
        const cookieJar = new tough.CookieJar();
        const response = await got(u, {
            rejectUnauthorized: false,
            cookieJar
        });
        expect(response.statusCode).equal(200);
        await addr.close();
    })
});
