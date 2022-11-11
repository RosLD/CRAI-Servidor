const { MongoClient } = require('mongodb');


// Connection URL
const url = 'mongodb://212.128.44.50:27017'
const dbName = 'CRAI-UPCT'; // ==BBDD SQL

client = new MongoClient(url);
var client;
var db;



// Use this function to start connection with database
async function main(){

    await client.connect();

    console.log('Connected successfully to Database');

    db = client.db(dbName)
    
}

const getDatabase = () => {
    return db;
}

//Use this function to get collection
const getCollection = (colec) => {   // Colection is similar to Table SQL
    return db.collection(colec);
}





module.exports = {getDatabase,getCollection,main};