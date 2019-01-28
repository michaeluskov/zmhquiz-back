const serverless = require('serverless-http');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

const routes = require("./src/routes");

const isProduction = process.argv[1].indexOf("runlocal") === -1 || !process.env.IS_OFFLINE;

app.use(bodyParser.json());
app.use(cors());

routes(app);

const errorHandler = (err, req, res, next) => {
    res.status(500);
    res.json({ error: {
        message: err.message,
        stack: !isProduction && err.stack
        }
    });
    console.error(err);
};

app.use(errorHandler);

module.exports.app = app;
if (isProduction)
    module.exports.handler = serverless(app);
