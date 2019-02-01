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
        const quiz = await db.getQuiz(req.query.quiz);
        const now = new Date();
        if (new Date(quiz.from) > now || now > new Date(quiz.till))
            return (res.status(403), res.json({ error: "Увы, время истекло и ты больше не можешь отвечать на вопросы"}));
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
        const now = new Date();
        if (new Date(quiz.from) > now || now > new Date(quiz.till))
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
                login: req.body.login,
                answerNum: req.body.answerNum
            };
            await answersCollection.insertOne(answer);
        }
        res.json({
            rightAnswerNum: quiz
                .questions
                .find(q => q.id === answer.questionId)
                .answers
                .findIndex(a => a.isRight)
        });
    }));

};
