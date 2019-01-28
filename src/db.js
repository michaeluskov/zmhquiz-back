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
