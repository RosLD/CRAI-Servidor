const { MongoClient,Db } = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017';

var client;
var db;



// Database Name
const dbName = 'CRAI-UPCT'; // ==BBDD SQL

client = new MongoClient(url);
client.connect();
console.log('Connected successfully to Database');
db = client.db(dbName)

/*
async function init() {
  // Use connect method to connect to the server
  client = new MongoClient(url);
  await client.connect();
  console.log('Connected successfully to Database');
  db = client.db(dbName)
  
}*/

const getDatabase = () => {
    return db;
}

const getCollection = (colec) => {   // == Table SQL
    return db.collection(colec);
}




module.exports = {getDatabase,getCollection};