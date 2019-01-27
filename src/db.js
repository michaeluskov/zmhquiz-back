const config = require("config");
const MongoClient = require("mongodb").MongoClient;

let dbConnection;

module.exports.getDbConnection = async () => {
  if (dbConnection)
      return dbConnection;
  dbConnection = await MongoClient.connect(config.get("dbUrl"));
  return dbConnection;
};
