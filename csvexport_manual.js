const fs = require('fs');
const { exec } = require("child_process");

var database = require("./models/database");

var CronJob = require('cron').CronJob;

var interval = 5

if (interval > 60){

    console.log("Max sampling period is 60!")
    exit()
}

    


const puertadatos = database.getCollection('DoorSensors')
const bledatos = database.getCollection('BLE2')
const wifidatos = database.getCollection('wifi')

let cabeceradoor = 'Fecha;Hora;NSeq;Sensor;Evento In-Out(1/0);Entradas Derecha;Salidas Derecha;Entradas Izquierda;Salidas Izquierda;Entradas Derecha 2;Salidas Derecha 2;Ocupacion estimada\r\n'
let cabecerawifi = 'Fecha;Hora;Id;Canal;SSID;MAC Origen;RSSI;Rate;HTC Cap;Vendor Specific;Extended Rates;Extended HTC;VHT Cap\r\n'

let cabecerable = 'Fecha;Hora;Id;MAC;Tipo MAC;ADV Size;RSP Size;Tipo ADV;Advertisement;RSSI\r\n'

/* File targets for python scripts */
wifi_trg = "csv/off/raw/wifi_"
ble_trg = "csv/off/raw/ble_"
pcount_trg = "csv/off/raw/pcount_"
wifi_trg_t = ""
ble_trg_t = ""
pcount_trg_t = ""

/* Timestamp*/
function pad(n, z){
    z = z || 2;
  return ('00' + n).slice(-z);
}
  
const getFecha = () => {
  let d = new Date,
  dformat =   [d.getFullYear(),
              pad(d.getMonth()+1),
              pad(d.getDate())].join('-');

  return dformat;
} 

const getHora = () => {

    let d = new Date,
    dformat = [pad(d.getHours()),
              pad(d.getMinutes())].join(":");
    
    return dformat; 
}

const getInt = () => {

    let d = new Date;
    let dformat;

    
    if ((d.getMinutes() - interval) < 0)
        dformat = [pad(d.getHours()-1),pad(d.getMinutes()-interval+60)].join(":")
    else
        dformat = [pad(d.getHours()),pad(d.getMinutes()-interval)].join(":")
    
    return dformat
} 

let dia = "2022-10-26"
//var query = {"timestamp": {"$gte": `${getFecha()} 07:00:00`, "$lt": `${getFecha()} 22:00:00`}};
var query = {"timestamp": {"$gte": `${dia} 07:00:00`, "$lt": `${dia} 22:00:00`}};

let content = {}


const door = () => {

    pcount_trg_t = pcount_trg+dia+".csv";

    fs.writeFile(pcount_trg_t, cabeceradoor, { flag: 'w' }, err => {});    

    var cursor = puertadatos.find(query).sort({"timestamp":1});
    
    
    //console.log(cursor)
    cursor.forEach(
        function(doc) {
            
            if(doc.timestamp !== undefined){
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.nseq};${doc.sensor};${doc.eventoIO ? 1 : 0};${doc.entradasSensorDer};${doc.salidasSensorDer};${doc.entradasSensorIzq};${doc.salidasSensorIzq};${doc.entradasSensorDer2};${doc.salidasSensorDer2};${doc.entradasTotal-doc.salidasTotal}\r\n`
                fs.writeFile(pcount_trg_t, content, { flag: 'a' }, err => {});
            
            } 
        
        }
    );  

    
    
    console.log("Person count data saved: ", pcount_trg_t);

        
    
}

const wifi = () => {

    wifi_trg_t = wifi_trg+getFecha()+".csv";

    fs.writeFile(wifi_trg_t, cabecerawifi, { flag: 'w' }, err => {});
    
    var cursor = wifidatos.find(query);
    
    cursor.sort({timestamp:1}).allowDiskUse();

    console.log(`Saving Wifi data of the day`)

    
    cursor.forEach(
        function(doc) {
            if(doc.timestamp !== undefined){
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.id};${doc.canal};"${doc.ssid}";${doc.OrigMAC};${doc.rssi};${doc.rate};${doc.htccap};${doc.vendorspecific};${doc.extendedrates};${doc.extendedhtc};${doc.vhtcap}\r\n`
                fs.writeFile(wifi_trg_t, content, { flag: 'a' }, err => {});
            
            }
        
        }
    );   

    
    
    console.log("Wifi data saved: ", wifi_trg_t);
        
   
}


const ble = () => {

    ble_trg_t = ble_trg+dia+".csv";
    
    fs.writeFile(ble_trg_t, cabecerable, { flag: 'w' }, err => {});


    var cursor = bledatos.find(query);
    
    cursor.sort({timestamp:1}).allowDiskUse();
    
    console.log(`Saving BLE data of the day`)

    cursor.forEach(
        function(doc) {
            if(doc.timestamp !== undefined){
                
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.idRasp};${doc.mac};${doc.tipoMac};${doc.bleSize};${doc.rspSize};${doc.tipoADV};${doc.bleData};${doc.rssi}\r\n`
                fs.writeFile(ble_trg_t, content, { flag: 'a' }, err => {
                    
                });
                
                
            }
        }
    );   
    
    //fs.writeFile(ble_trg_t,"END-OF-LINE",{flag:'a'}, err => {})
    
     
    console.log("BLE data saved: ",ble_trg_t);

}

const main = () => {
    door();
    //wifi();
    //ble();

    
    
    /*
    exec(`python3.8 ./python/hd_offlinewifi.py ${wifi_trg_t} ${pcount_trg_t}`,(error,stdout,stderr)=>{
        if(error !== null){
            console.log("Python error Wifi-> "+ error)
        }
        console.log(stdout.toString())
        console.log(stderr.toString())
    })*/

    

}

main()

/*
var job = new CronJob(
    '00 22 * * *',
    //'00 00 22 * * *',
    main
);

console.log("Starting CRON job");
job.start()
*/
