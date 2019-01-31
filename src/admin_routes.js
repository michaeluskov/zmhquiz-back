const config = require("config");
const access = require("./access");
const db = require("./db");
const adminSessions = access.adminSessions;

const asyncHandler = require("./asyncHandler");

module.exports = function (app) {

    app.post('/admin/session', asyncHandler(async function (req, res) {
        const password = req.body.password;
        if (password !== config.get("adminPassword"))
            return (res.status(403), res.json({ error: "Неверный пароль" }))
        return res.json({ sessionId: adminSessions.makeNew()});
    }));

    app.get('/admin/quizes', asyncHandler(async function (req, res) {
        if (!access.checkAdminAccess(req, res)) return;
        const dbConnection = await db.getDbConnection();
        const quizesCollection = dbConnection.collection("quizes");
        const quizes = await quizesCollection.find({}).toArray();
        return res.json({
            quizes
        })
    }));

};
