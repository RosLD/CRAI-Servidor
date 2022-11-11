const mqtt = require('mqtt')
const database = require('./database')



class Mqtt_cli{

    constructor(){

    }
    
}

let topics = ['CRAIUPCTPersonCount','CRAIUPCT_BLEdata','CRAIUPCT_WifiData']

const door = database.getCollection('DoorSensors')
const ble = database.getCollection('BLE2')
const wifi = database.getCollection('wifi')




/*MQTT */

const options = {
  clean: true, // retain session
connectTimeout: 4000, // Timeout period
// Authentication information
clientId: 'Server',
username: 'Server',
password: 'Server',
}

const connectUrl = "ws://localhost:8083/mqtt";
const client = mqtt.connect(connectUrl,options);

client.on('connect', function () {
  client.subscribe(topics, function (err) {
    if (!err) {
      console.log("MQTT CLIENT CONNECTED")
    }
  })
})


client.on('message', function (topic, message) {

  switch(topic){

    case 'CRAIUPCTPersonCount':
      
      
      door.insertOne(JSON.parse(message))
  
      break;

    case 'CRAIUPCT_BLEdata':
      
      ble.insertOne(JSON.parse(message));

      break;

    case 'CRAIUPCT_WifiData':
      
      
      wifi.insertOne(JSON.parse(message))

      break;
    
      

  }
  
    

})



module.exports = Mqtt_cli;