const serverless = require('serverless-http');
const express = require('express');
const app = express();
const db = require("./src/db");

const asyncHandler = (func) => (req, res, next) => {
  func(req, res)
      .catch(e => next(e));
};

app.get('/', asyncHandler(async function (req, res) {
    const dbConnection = await db.getDbConnection();
    res.send('Hello World!')
}));

const errorHandler = (err, req, res, next) => {
    res.status(500);
    res.json({ error: {
        message: err.message,
        stack: err.stack
        }
    });
};

app.use(errorHandler);

module.exports.app = app;
if (process.argv[1].indexOf("runlocal") === -1)
    module.exports.handler = serverless(app);
