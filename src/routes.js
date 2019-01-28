const access = require("./access");
const checkAccess = access.checkAccess;
const asyncHandler = require("./asyncHandler");
const db = require("./db");

module.exports = app => {

    app.get('/', asyncHandler(async function (req, res) {
        res.send('Hello World!')
    }));

    app.get('/questionMeta', asyncHandler(async function (req, res) {
        if (!checkAccess(req, res)) return;
        const dbConnection = await db.getDbConnection();
        const quizes = dbConnection.collection("quizes");
        const quiz = await quizes.findOne({
            id: req.query.quiz
        });
        const now = new Date();
        if (new Date(quiz.from) > now || now > new Date(quiz.till))
            return (res.status(403), res.json({ error: "Увы, время истекло и ты больше не можешь отвечать на вопросы"}));
        return res.json({
            questions: quiz.questions
        });
    }));

};
