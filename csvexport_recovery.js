const fs = require('fs');
const { exec } = require("child_process");

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
wifi_trg = "csv/recover/raw/wifi_"
ble_trg = "csv/recover/raw/ble_"
pcount_trg = "csv/recover/raw/pcount_"
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

  //return dformat;
  return process.argv[2]
} 


var query = {"timestamp": {"$gte": `${getFecha()} 07:00:00`, "$lt": `${getFecha()} 22:00:00`}};

let content = {}



const door = async (puertadatos) => {

    pcount_trg_t = pcount_trg+getFecha()+".csv";

    fs.writeFile(pcount_trg_t, cabeceradoor, { flag: 'w' }, err => {});    

    var cursor = await puertadatos.find(query).sort({"timestamp":1});
    
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

const wifi = async (wifidatos) => {

    wifi_trg_t = wifi_trg+getFecha()+".csv";

    fs.writeFile(wifi_trg_t, cabecerawifi, { flag: 'w' }, err => {});
    
    var cursor = await wifidatos.find(query);
    
    cursor.sort({timestamp:1}).allowDiskUse();

    console.log(`Saving Wifi data of the day`)

    
    await cursor.forEach(
        function(doc) {
            if(doc.timestamp !== undefined){
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.id};${doc.NSeq};${doc.canal};"${doc.SSID}";${doc.MAC_origen};${doc.RSSI};${doc.Rates};${doc.HTC_Capabilities};${doc.Vendor_Specific};${doc.Extended_rates};${doc.Extended_HTC_Capabilities};${doc.VHT_Capabilities}\r\n`
                fs.writeFile(wifi_trg_t, content, { flag: 'a' }, err => {});
            
            }
        
        }
    );   

    
    
    console.log("Wifi data saved: ", wifi_trg_t);
        
   
}


const ble = async (bledatos) => {

    ble_trg_t = ble_trg+getFecha()+".csv";
    
    fs.writeFile(ble_trg_t, cabecerable, { flag: 'w' }, err => {});


    var cursor = await bledatos.find(query);
    
    cursor.sort({timestamp:1}).allowDiskUse();
    
    console.log(`Saving BLE data of the day`)

    await cursor.forEach(
        function(doc) {
            if(doc.timestamp !== undefined){
                
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.idRasp};${doc.Nseq};${doc.MAC};${doc.TipoMAC};${doc.BLE_Size};${doc.RSP_Size};${doc.TipoADV};${doc.BLE_Data};${doc.RSSI}\r\n`
                    fs.writeFile(ble_trg_t, content, { flag: 'a' }, err => {
                    
                });
                
                
            }
        }
    );   
    
    //fs.writeFile(ble_trg_t,"END-OF-LINE",{flag:'a'}, err => {})
    
     
    console.log("BLE data saved: ",ble_trg_t);

}

const inicio = async () => {

    await database.main()
    
    const puertadatos = database.getCollection('DoorSensorsRecovery')
    const bledatos = database.getCollection('BLERecovery')
    const wifidatos = database.getCollection('WifiRecovery')

    await door(puertadatos)
    await ble(bledatos)
    await wifi(wifidatos)
    
}

const main = async () => {

    await inicio();
    /*door();
    wifi();
    ble();*/
    

    setTimeout(()=> {

        exec(`python3.8 ./python/hd_offlinepcount.py ${pcount_trg_t}`,(error,stdout,stderr)=>{
            if(error !== null){
                console.log("Python error PC-> "+ error)
            }
            console.log(stdout.toString())
        })
        
        
        exec(`python3.8 ./python/hd_offlineBLE.py ${ble_trg_t}`,(error,stdout,stderr)=>{
            if(error !== null){
                console.log("Python error BLE-> "+ error)
            }
            console.log(stdout.toString())
            console.log(stderr.toString())
        })


    },1000*60*60*2) //Dos horas de margen
    
   

    

}

main();


/*
var job = new CronJob(
    '00 22 * * *',
    //'00 00 22 * * *',
    main
);

console.log("Starting CRON job");
job.start()*/

