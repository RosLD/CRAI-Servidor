const mqtt = require('mqtt')
const database = require('./database')
const botcrai = require('./bot_tel')

class Mqtt_cli{

    constructor(){

       

    }
    
}

let topics = ['CRAIUPCTPersonCount','CRAIUPCT_BLEdata','CRAIUPCT_WifiData','keepalive']
//const client = mqtt.connect('mqtt://localhost'); 
const door = database.getCollection('DoorSensors')
const ble = database.getCollection('BLE')
const wifi = database.getCollection('wifi')
const monitor = database.getCollection('monitor')

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


let sniffers = []

let empty = {
  updated:false,
  iface1:0,
  iface1status:'unknown',
  iface2:0,
  iface2status:'unknown',
  iface3:0,
  iface3status:'unknown',
  temp:0,
  tempstatus:'unknown',
  BLEface:'unknown'

}

for(let i = 0;i<6;i++){
  sniffers[i] = empty
}

botcrai.updateInfo(sniffers)

let okCount = 0
const maxTemp = 55;

setInterval(()=>{

  let msg = `Dispositivos OK: ${okCount}.\n`;
  for(let i = 0;i<6;i++){

    if(sniffers[i].updated){
      sniffers.updated = false;
      msg += `Raspberry ${i+1} tiene errores.\n`
    }else{
      msg += `Raspberry ${i+1} no ha enviado nada.\n`
    }
    
  }

  botcrai.botSendMessage(msg)
  okCount = 0;
},60 * 1000 * 15) //Cada 15 minutos

const saveMonitor = (dato) => {

  console.log("Saving")
  let id = parseInt((dato.id).split['y'][1])
  console.log(id)

  if(dato.id != "Raspberry6"){

    console.log("Receive Message")

    sniffers[id-1].iface1status = 'OK'
    sniffers[id-1].iface2status = 'OK'
    sniffers[id-1].iface3status = 'OK'
    sniffers[id-1].tempstatus = 'OK'
    
    sniffers[id-1].updated = true

    if(dato.iface1 > sniffers[id-1].iface1 && dato.iface2 > sniffers[id-1].iface2 && dato.iface3 > sniffers[id-1].iface3 && dato.BLEface == 'OK' && dato.temp < maxTemp){

      if(!sniffers[id-1].updated)
        okCount++;

      

    }else{  //Checking what went wrong

      if(dato.iface1 == 'KO' || dato.iface1 <= sniffers[id-1].iface1)
        sniffers[id-1].iface1status = 'KO'


      if(dato.iface2 == 'KO' || dato.iface2 <= sniffers[id-1].iface2)
        sniffers[id-1].iface2status = 'KO'
        
      
      if(dato.iface3 == 'KO' || dato.iface3 <= sniffers[id-1].iface3)
        sniffers[id-1].iface3status = 'KO'
        
      

      /*if(dato.BLEface == 'KO')
        koSniff[id-1].BLEfacestatus = 'KO'*/
      
        

      if(dato.temp >= maxTemp)
        sniffers[id-1].tempstatus = "HOT"
        
      sniffers[id-1].updated = true

      sniffers[id-1] = dato

      console.log("Updating bot info\n"+sniffers)
      botcrai.updateInfo(sniffers)

    }

  }else{
    console.log("Falta")
  }
}


client.on('message', function (topic, message) {

  switch(topic){

    case 'CRAIUPCTPersonCount':
      
      //console.log(JSON.parse(message))
      door.insertOne(JSON.parse(message))
  
      break;

    case 'CRAIUPCT_BLEdata':
      
      ble.insertOne(JSON.parse(message));

      break;

    case 'CRAIUPCT_WifiData':
      
      //console.log(JSON.parse(message))
      wifi.insertOne(JSON.parse(message))

      break;
    
    case 'keepalive':

      
      let rasp = JSON.parse(message)
      console.log("Received: ")
      console.log(rasp)
      saveMonitor(rasp);
      //botcrai.botSendMessage(`${rasp.id}--> T: ${rasp.temp}ºC`)
      monitor.insertOne(JSON.parse(message))
      break;

  }
  
    

})

module.exports = Mqtt_cli;