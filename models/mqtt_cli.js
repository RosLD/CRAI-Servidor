const mqtt = require('mqtt')
const database = require('./database')


class Mqtt_cli{

    constructor(){

       

    }
    
}

let topics = ['CRAIUPCTPersonCount','CRAIUPCT_BLEdata','CRAIUPCT_WifiData']
const client = mqtt.connect('mqtt://localhost'); 
const door = database.getCollection('DoorSensors')
const ble = database.getCollection('BLE')

client.on('connect', function () {
  client.subscribe(topics, function (err) {
    if (!err) {
      console.log("MQTT CLIENT CONNECTED")
    }
  })
})

/*
function pad(n, z){
  z = z || 2;
return ('00' + n).slice(-z);
}

const getFechaCompleta = () => {
  let d = new Date,
  dformat =   [d.getFullYear(),
              pad(d.getMonth()+1),
              pad(d.getDate())].join('-')+' '+
              [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds()),
              pad(d.getMilliseconds(),3)].join(':');

  return dformat;
} */


client.on('message', function (topic, message) {

  switch(topic){

    case 'CRAIUPCTPersonCount':
      
      door.insertOne(JSON.parse(message))
  
      break;

    case 'CRAIUPCT_BLEdata':
      
      ble.insertOne(JSON.parse(message));

      break;

    case 'CRAIUPCT_WifiData':

      break;

  }
  
    

})

module.exports = Mqtt_cli;