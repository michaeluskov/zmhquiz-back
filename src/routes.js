const config = require("config");
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
        const quiz = await db.getQuiz(req.query.quiz);
        const now = new Date().getTime();
        if (new Date(quiz.from).getTime() > now || now > new Date(quiz.till).getTime()) {
            console.log(`${new Date(quiz.from).getTime()} ${now} ${new Date(quiz.till).getTime()}`)
            return (res.status(403), res.json({error: "Увы, время истекло и ты больше не можешь отвечать на вопросы"}));
        }
        if (config.get("onlyOnce")) {
            const dbConnection = await db.getDbConnection();
            const answersCount = await dbConnection.collection("answers").count({
                quizId: quiz.id,
                login: decodeURIComponent(req.query.login)
            });
            if (answersCount === quiz.questions.length) {
                return (res.status(403), res.json({error: "Ты уже ответил на этот квиз" }))
            }
        }
        return res.json({
            questions: quiz.questions.map(q => ({
                ...q,
                answers: q.answers.map(a => ({
                    title: a.title
                }))
            }))
        });
    }));

    app.post('/answer', asyncHandler(async function (req, res) {
        if (!checkAccess(req, res)) return;
        const quiz = await db.getQuiz(req.body.quiz);
        const now = new Date().getTime();
        if (new Date(quiz.from).getTime() > now || now > new Date(quiz.till).getTime())
            return (res.status(403), res.json({ error: "Увы, время истекло и ты больше не можешь отвечать на вопросы"}));
        const dbConnection = await db.getDbConnection();
        const answersCollection = dbConnection.collection("answers");
        let answer = await answersCollection.findOne({
           quizId: req.body.quiz,
           questionNum: req.body.questionNum,
           login: req.body.login,
        });
        if (!answer) {
            answer = {
                quizId: req.body.quiz,
                questionNum: req.body.questionNum,
                login: decodeURIComponent(req.body.login),
                answerNum: req.body.answerNum,
                createdAt: Date.now()
            };
            await answersCollection.insertOne(answer);
        }
        res.json({
            rightAnswerNum: quiz
                .questions[req.body.questionNum]
                .answers
                .findIndex(a => a.isRight)
        });
    }));

};
