const crypto = require('crypto');
const config = require("config");

module.exports.checkAccess = (req, res) => {
    const params = req.method.toUpperCase() === "GET" ? req.query : req.body;
    if (config.get("adminHash") && params.hash === config.get("adminHash"))
        return true;
    const url = `https://zmh.wtf/${params.quiz}`;
    const md5Str = `${url};${decodeURIComponent(params.login)};${config.get("hashSalt")}`;
    const trueHash = crypto.createHash('md5').update(md5Str).digest("hex");
    if (parseInt(params.hash, 16) === parseInt(trueHash, 16))
        return true;
    res.status(403);
    res.json({ error: "У тебя нет доступа или неправильная ссылка" });
};

module.exports.checkAdminAccess = (req, res) => {
    const params = req.method.toUpperCase() === "GET" ? req.query : req.body;
    const sessionId = params.sessionId;
    if (module.exports.adminSessions.isValid(sessionId))
        return true;
    res.status(403);
    res.json({ error: "Нет админского доступа" });
    return false;
};

const adminSessions = {};

function makeId() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 36; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports.adminSessions = {
  makeNew() {
      const sessionId = makeId();
      adminSessions[sessionId] = true;
      return sessionId;
  },

  isValid: (sessionId) => {
      return (sessionId in adminSessions);
  },

};
