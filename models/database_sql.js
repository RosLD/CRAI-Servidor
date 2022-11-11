const { query } = require('express');
const mysql = require('mysql'); 
require("dotenv").config();

var connection = mysql.createConnection({
    host     : process.env.sqlink,
    user     : process.env.squser,
    password : process.env.sqpass,
    database : process.env.sqdb
  });
  
  connection.connect((err)=>{
  
    if (err) throw err;
  
  console.log("SQL Database operative!");
  
  });


const store = (values) => {

    let sql = `INSERT into datos (Id,NSeq,CO2,Temperature,Humidity,Battery,Timestamp) values (?, ?, ?, ?, ?, ? ,?)`
    
    let misdatos = [values.Id,values['Num. Secuencia'],values.CO2,values.Temperature,values.Humidity,values.Battery,values.Timestamp]

    connection.query(sql, misdatos, (err,result) => {
        if(err) throw err;
        console.log("Number of records inserted: ",result.affectedRows);
        console.log("----------------------")
    });

}


module.exports = {store};