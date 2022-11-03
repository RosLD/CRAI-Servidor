const { MongoClient } = require('mongodb');


// Connection URL
const url = 'mongodb://localhost:27017'
const dbName = 'CRAI-UPCT'; // ==BBDD SQL

    client = new MongoClient(url);
var client;
var db;



// Database Name
async function main(){

    await client.connect();

    console.log('Connected successfully to Database');

    db = client.db(dbName)
    
}

const getDatabase = () => {
    return db;
}

const getCollection = (colec) => {   // == Table SQL
    return db.collection(colec);
}





module.exports = {getDatabase,getCollection,main};