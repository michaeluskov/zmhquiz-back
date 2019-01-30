const config = require("config");
const adminSessions = require("./access").adminSessions;

const asyncHandler = require("./asyncHandler");

module.exports = function (app) {

    app.post('/admin/session', asyncHandler(async function (req, res) {
        const password = req.body.password;
        if (password !== config.get("adminPassword"))
            return (res.status(403), res.json({ error: "Неверный пароль" }))
        return res.json({ sessionId: adminSessions.makeNew()});
    }));

};
