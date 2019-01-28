const crypto = require('crypto');
const config = require("config");

module.exports.checkAccess = (req, res) => {
    if (process.env.NODE_ENV !== "production")
        return true;
    const params = req.method.toUpperCase() === "GET" ? req.query : req.body;
    const url = `https://api.zmh.wtf/${params.quiz}`;
    const md5Str = `${url};${decodeURIComponent(params.login)};${config.get("hashSalt")}`;
    const trueHash = crypto.createHash('md5').update(md5Str).digest("hex");
    if (params.hash === trueHash)
        return true;
    res.status(403);
    res.json({ error: "У тебя нет доступа или неправильная ссылка" });
};
