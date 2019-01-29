const config = require("config");
const MongoClient = require("mongodb").MongoClient;

let dbConnection;

module.exports.getDbConnection = async () => {
  if (dbConnection)
      return dbConnection;
  const client = await MongoClient.connect(config.get("dbUrl"));
  dbConnection = client.db("zmhquiz");
  return dbConnection;
};

module.exports.getQuiz = async (quizId) => {
    if (!quizId)
        return null;
    const dbConnection = await module.exports.getDbConnection();
    const quizes = dbConnection.collection("quizes");
    const quiz = await quizes.findOne({
        id: quizId
    });
    return quiz;
};
