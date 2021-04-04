const express = require("express");
const axios = require("axios");

const makeApi = require("./api");
const logger = require("./logger");
const config = require("./config");

const api = makeApi(true);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

api.getAccessToken().then(() => {
    app.get('/ping', (req, res) => res.send('pong '+ Date.now()))

    app.post('/hook', (req, res) => {
        console.log(req.data);
        res.send('OK')
    })

    app.listen(config.PORT,()=>logger.debug('Server started on ', config.PORT))
})

