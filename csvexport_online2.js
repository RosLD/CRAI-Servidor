const fs = require('fs');
const { execSync } = require("child_process");

var database = require("./models/async_mongo");

var CronJob = require('cron').CronJob;

var interval = 5

if (interval > 60){

    console.log("Max sampling period is 60!")
    exit()

}


let cabeceradoor = 'Fecha;Hora;NSeq;Sensor;Evento In-Out(1/0);Entradas Derecha;Salidas Derecha;Entradas Izquierda;Salidas Izquierda;Entradas Derecha 2;Salidas Derecha 2;Ocupacion estimada\r\n'
let cabecerawifi = 'Fecha;Hora;Id;NSeq;Canal;SSID;MAC Origen;RSSI;Rate;HTC Cap;Vendor Specific;Extended Rates;Extended HTC;VHT Cap\r\n'

let cabecerable = 'Fecha;Hora;Id;NSeq;MAC;Tipo MAC;ADV Size;RSP Size;Tipo ADV;Advertisement;RSSI\r\n'

/* File targets for python scripts */
wifi_trg = "csv/int/raw/wifi_"
ble_trg = "csv/int/raw/ble_"
pcount_trg = "csv/int/raw/pcount_"
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



let content = {}


//Funcion para obtener los datos del sensor de puerta desde Mongo
const door = async (puertadatos) => {

    pcount_trg_t = pcount_trg+getInt()+"-"+getHora()+".csv";

    fs.writeFile(pcount_trg_t, cabeceradoor, { flag: 'w' }, err => {});    
    var query = {"timestamp": {"$gte": `${getFecha()} 07:00:00`, "$lt": `${getFecha()} ${getHora()}:00`}};//, "$lt": `${getFecha()} 22:00:00`

    var cursor = await puertadatos.find(query).sort({"Timestamp":1});
    
    //console.log(cursor)
    await cursor.forEach(
        function(doc) {
            
            if(doc.timestamp !== undefined){
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.nseq};${doc.sensor};${doc.eventoIO ? 1 : 0};${doc.entradasSensorDer};${doc.salidasSensorDer};${doc.entradasSensorIzq};${doc.salidasSensorIzq};${doc.entradasSensorDer2};${doc.salidasSensorDer2};${doc.entradasTotal-doc.salidasTotal}\r\n`
                fs.writeFile(pcount_trg_t, content, { flag: 'a' }, err => {});
            
            } 
        
        }
    );  

    
    
    console.log("Person count data saved: ", pcount_trg_t);

        
    
}

//Funcion para obtener los datos de Wifi desde Mongo
const wifi = async (wifidatos) => {

    wifi_trg_t = wifi_trg+getInt()+"-"+getHora()+".csv";

    fs.writeFile(wifi_trg_t, cabecerawifi, { flag: 'w' }, err => {});
    
    var query = {"timestamp": {"$gte": `${getFecha()} ${getInt()}:00`, "$lt": `${getFecha()} ${getHora()}:00`}};

    var cursor = await wifidatos.find(query);
    
    cursor.sort({timestamp:1}).allowDiskUse();

    console.log(`Saving Wifi data of the day`)

    
    await cursor.forEach(
        function(doc) {
            if(doc.timestamp !== undefined){
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.id};${doc.nseq};${doc.canal};"${doc.ssid}";${doc.OrigMAC};${doc.rssi};${doc.rate};${doc.htccap};${doc.vendorspecific};${doc.extendedrates};${doc.extendedhtc};${doc.vhtcap}\r\n`
                fs.writeFile(wifi_trg_t, content, { flag: 'a' }, err => {});
            
            }
        
        }
    );   

    
    
    console.log("Wifi data saved: ", wifi_trg_t);
        
   
}

//Funcion para obtener los datos de BLE desde Mongo
const ble = async (bledatos) => {

    ble_trg_t = ble_trg+getInt()+"-"+getHora()+".csv";
    
    fs.writeFile(ble_trg_t, cabecerable, { flag: 'w' }, err => {});

    var query = {"timestamp": {"$gte": `${getFecha()} ${getInt()}:00`, "$lt": `${getFecha()} ${getHora()}:00`}};
    var cursor = await bledatos.find(query);
    
    cursor.sort({timestamp:1}).allowDiskUse();
    
    console.log(`Saving BLE data of the day`)

    await cursor.forEach(
        function(doc) {
            
            if(doc.timestamp !== undefined){
                
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.idRasp};${doc.nseq};${doc.mac};${doc.tipoMac};${doc.bleSize};${doc.rspSize};${doc.tipoADV};${doc.bleData};${doc.rssi}\r\n`
                    fs.writeFile(ble_trg_t, content, { flag: 'a' }, err => {
                    
                });
                
                
            }
        }
    );   
    
    //fs.writeFile(ble_trg_t,"END-OF-LINE",{flag:'a'}, err => {})
    
     
    console.log("BLE data saved: ",ble_trg_t);

}

//Funcion para controlar el flujo de trabajo de las funciones previas
const inicio = async () => {

    await database.main()//Hace que el script de mongo se conecte
    
    const puertadatos = database.getCollection('DoorSensors')
    const bledatos = database.getCollection('BLE2')
    const wifidatos = database.getCollection('wifi')

    await door(puertadatos)
    await ble(bledatos)
    await wifi(wifidatos)
    
}

//Esta es la funcion principal
const descargaryprocesaronline = async () => {

    await inicio();

    //A continuacion, se llaman a los scripts de Python
    console.log("Processing P Count csv")
    await execSync(`python3.8 ./python/hd_PCprocess.py ${pcount_trg_t}`,(error,stdout,stderr)=>{
        if(error !== null){
            console.log("Python error PC-> "+ error)
        }
        console.log(stdout.toString())
    })
    
    console.log("Processing BLE")
    await execSync(`python3.8 ./python/hd_detect.py ${ble_trg_t} 1`,(error,stdout,stderr)=>{
        if(error !== null){
            console.log("Python error BLE-> "+ error)
        }
        console.log(stdout.toString())
        console.log(stderr.toString())
    })
    
    

}


var job = new CronJob(
    `0,5,10,15,20,25,30,35,40,45,50,55 7-22 * * *`,
    descargaryprocesaronline
);

console.log("Starting CRON job");
job.start()






