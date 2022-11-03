const { MongoClient,Db } = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://212.128.44.50:27017'

var client;
var db;



// Database Name
const dbName = 'CRAI-UPCT'; // ==BBDD SQL

client = new MongoClient(url);
client.connect((err)=>{
  if(!err){
    console.log('Connected successfully to Database');
  }
});

db = client.db(dbName)


const getDatabase = () => {
    return db;
}

const getCollection = (colec) => {   // == Table SQL
    return db.collection(colec);
}





module.exports = {getDatabase,getCollection};