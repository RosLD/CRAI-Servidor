const mqtt = require('mqtt')
const database = require('./database')
const sqldata = require('./database_sql')



//const botcrai = require('./bot_tel')

class Mqtt_cli{

    constructor(){

       

    }
    
}

let coseq = new Array(255)
let cotf;

function getSensorById(code) {
  return cotf.filter(
      function(cotf){ return cotf.Id == code }
  );
}

function unchecksen(){

  cotf.forEach(element => {
    element.found = 0
    delete element["_id"]
  });

}



let topics = ['CRAIUPCT_co2ble','CRAIUPCTPersonCount','CRAIUPCT_BLEdata','CRAIUPCT_WifiData','keepalive','CRAIUPCT_co2']
//const client = mqtt.connect('mqtt://localhost'); 
const door = database.getCollection('DoorSensors')
const ble = database.getCollection('BLE')
const wifi = database.getCollection('wifi')
const monitor = database.getCollection('monitor')
const esp = database.getCollection('AirMeasurement')
const nsen = database.getCollection("SensorManagement")

nsen.find({}).toArray(function(err, result) {
  if (err) throw err;
  
  cotf = result
  
  unchecksen()
  
});

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
  BLEface:'unknown',
  error:true

}

for(let i = 0;i<5;i++){
  sniffers[i] = empty
}

//botcrai.updateInfo(sniffers)

let okCount = 0
const maxTemp = 55;

//Bot report status every 15 minutes
/*
setInterval(()=>{

  let msg = `Dispositivos OK: ${okCount}.\n`;
  for(let i = 0;i<5;i++){

    if(sniffers[i].updated){
      sniffers[i].updated = false;

      if(sniffers[i].error){
        msg += `Raspberry ${i+1} tiene errores.\n`
      }
      
    }else{
      msg += `Raspberry ${i+1} no ha enviado nada.\n`
    }
    
  }

  botcrai.botSendMessage(msg)
  okCount = 0;
},60 * 1000 * 15)*/ //Cada 15 minutos
/*
let ind = 1;

const saveMonitor = (dato) => {

  
  ind = parseInt((dato.id).split('y')[1])-1

  

  if(dato.id != "Raspberry6"){


    
    sniffers[ind].iface1status = 'OK'
    sniffers[ind].iface2status = 'OK'
    sniffers[ind].iface3status = 'OK'
    sniffers[ind].tempstatus = 'OK'
    sniffers[ind].error = false
    sniffers[ind].BLEface = dato.BLEface
    sniffers[ind].id = dato.id
    sniffers[ind].temp = dato.temp
    sniffers[ind].timestamp = dato.timestamp
    

    //Checking Wifi Interfaces
    
    if(dato.iface1 == 'KO'){

      sniffers[ind].iface1 = 0
      sniffers[ind].iface1status = 'KO'
      sniffers[ind].error = true

    }else if(sniffers[ind].iface1 < dato.iface1){

      sniffers[ind].iface1 = dato.iface1

    }else{
      sniffers[ind].iface1status = 'NoK'
      sniffers[ind].iface1 = dato.iface1
      sniffers[ind].error = true
    }

    if(dato.iface2 == 'KO'){

      sniffers[ind].iface2 = 0
      sniffers[ind].iface2status = 'KO'
      sniffers[ind].error = true

    }else if(sniffers[ind].iface2 < dato.iface2){

      sniffers[ind].iface2 = dato.iface2

    }else{
      sniffers[ind].iface2status = 'NoK'
      sniffers[ind].iface2 = dato.iface2
      sniffers[ind].error = true
    }

    if(dato.iface3 == 'KO'){

      sniffers[ind].iface3 = 0
      sniffers[ind].iface3status = 'KO'
      sniffers[ind].error = true

    }else if(sniffers[ind].iface3 < dato.iface3){

      sniffers[ind].iface3 = dato.iface3

    }else{
      sniffers[ind].iface3status = 'NoK'
      sniffers[ind].iface3 = dato.iface3
      sniffers[ind].error = true
    }

    if(sniffers[ind].BLEface == 'KO')
      sniffers[ind].error = true
    
    if(sniffers[ind].temp > maxTemp){
      sniffers[ind].tempstatus = "HOT"
      sniffers[ind].error = true
    }
    

    if(!sniffers[ind].error)
      okCount++;

    console.log("Updating bots sniffers info\n")
    botcrai.updateInfo(sniffers)

    sniffers[ind].updated = true



  }else{
    console.log("Falta programar terabee")
  }
}
*/

/* Timestamp*/
function pad(n, z) {
  z = z || 2;
  return ("00" + n).slice(-z);
}

const getFechaCompleta = () => {
  let d = new Date(),
    dformat =
      [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join("-") +
      " " +
      [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(":");

  return dformat;
};

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

      
      /*let rasp = JSON.parse(message)
      console.log("Received: ")
      console.log(rasp)
      saveMonitor(rasp);*/
      //botcrai.botSendMessage(`${rasp.id}--> T: ${rasp.temp}ºC`)
      monitor.insertOne(JSON.parse(message))
      break;

    case 'CRAIUPCT_co2':

      //console.log(message)

      let datosco2 = {
        'Id':"esp32co2_"+parseInt(message[0]),
        'Num. Secuencia':parseInt(message[1]),
        'CO2':(message[2]<<8|message[3]),
        'Temperature':(message[4]+message[5]/256).toFixed(2),
        'Humidity':(message[6]+message[7]/256).toFixed(2),
        'Timestamp':getFechaCompleta(),
        'Battery':228
      }
      console.log(datosco2)
      esp.insertOne(datosco2)
      sqldata.store(datosco2)
      
      getSensorById(datosco2.Id)[0].found = 1
      getSensorById(datosco2.Id)[0].CO2 = datosco2.CO2
      getSensorById(datosco2.Id)[0].Temperature = datosco2.Temperature
      getSensorById(datosco2.Id)[0].Humidity = datosco2.Humidity
      getSensorById(datosco2.Id)[0].Battery = datosco2.Battery
      getSensorById(datosco2.Id)[0].Timestamp = datosco2.Timestamp
      nsen.updateOne({Id:datosco2.Id},{ $set: getSensorById(datosco2.Id)[0]})
      break;
      


    case 'CRAIUPCT_co2ble':

      let id = parseInt(message[0])
      let nseq = parseInt(message[1])
      let bat = parseInt(message[14])
      if(bat > 100){
        bat = bat-128

      }

      if(coseq[id] != nseq){

        let datosco2 = {
          'Id':"esp32co2_"+id,
          'Num. Secuencia':nseq,
          'CO2':(message[2]<<8|message[3]),
          'Temperature':(message[4]+message[5]/100).toFixed(2),
          'Humidity':(message[6]+message[7]/100).toFixed(2),
          'Timestamp':getFechaCompleta(),
          'Battery':bat,
          
        }
        
        getSensorById(datosco2.Id)[0].found = 1
        getSensorById(datosco2.Id)[0].CO2 = datosco2.CO2
        getSensorById(datosco2.Id)[0].Temperature = datosco2.Temperature
        getSensorById(datosco2.Id)[0].Humidity = datosco2.Humidity
        getSensorById(datosco2.Id)[0].Battery = datosco2.Battery
        getSensorById(datosco2.Id)[0].Timestamp = datosco2.Timestamp
        nsen.updateOne({Id:datosco2.Id},{ $set: getSensorById(datosco2.Id)[0]})
        console.log(datosco2)
        esp.insertOne(datosco2)

        sqldata.store(datosco2)
        
        
        if(message[10]!=0){

          if(nseq == 0){

            if(coseq[id]!=255){

              nseq = 255
            
              datosco2 = {
                'Id':"esp32co2_"+id,
                'Num. Secuencia':nseq,
                'CO2':(message[8]<<8|message[9]),
                'Temperature':(message[10]+message[11]/256).toFixed(2),
                'Humidity':(message[12]+message[13]/256).toFixed(2),
                'Timestamp':getFechaCompleta(),
                'Battery':bat,

              }
              console.log(datosco2)
              esp.insertOne(datosco2)
              sqldata.store(datosco2)

            }

          }else if(coseq[id]+1 != nseq){



            datosco2 = {
              'Id':"esp32co2_"+id,
              'Num. Secuencia':nseq-1,
              'CO2':(message[8]<<8|message[9]),
              'Temperature':(message[10]+message[11]/100).toFixed(2),
              'Humidity':(message[12]+message[13]/100).toFixed(2),
              'Timestamp':getFechaCompleta(),
              'Battery':bat,

            }
            console.log(datosco2)
            esp.insertOne(datosco2)
            sqldata.store(datosco2)

          }
        }

        coseq[id] = nseq

      }

      

      break;

  }
  
    

})

setInterval(()=> {
  
  cotf.forEach(element => {
    if(element.found==0){
      nsen.updateOne({Id:element.Id},{ $set: getSensorById(element.Id)[0]})
    }
  });
  unchecksen();
},1000*60*10)

module.exports = Mqtt_cli;