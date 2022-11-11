const Database = require('better-sqlite3')
const database = require('./models/async_mongo')
const fs = require('fs');

const {descargaryprocesar} = require("./csvexport_recovery")

let fecha = process.argv[2]
let first = `${fecha} 07:00:00`
let last = `${fecha} 22:00:00`


async function inicio(){

    await database.main()       //Llama a la funcion para conectar con BBDD
    
    //Obtiene las colecciones
    const ble = database.getCollection('BLERecovery')
    const door = database.getCollection('DoorSensorsRecovery')
    const wifi = database.getCollection('WifiRecovery')
    
    //Person Count

    
    const dbpc = new Database(`sqlite_databases/${fecha}/Raspberry8/${fecha}_PersonCount.db`);

    //Se obtienen los resultados
    try{
        const stmt = dbpc.prepare(`select * from PersonCounter Where Timestamp BETWEEN ? and ? ORDER BY Timestamp`);
        const datos = stmt.all(first,last);



        for (let i = 0; i < datos.length; i++){
            datos[i].ocupacion = datos[i].entradasTotal - datos[i].salidasTotal
        }

        //El paquete SQL lo devuelve en forma de array de JSONs así que los guardamos todos
        await door.insertMany(datos)
        console.log(`PCount: Recovered ${datos.length} messages`)
    }catch(Exc){
    
        if (Exc.code == 'SQLITE_ERROR'){

            fs.writeFile("./sqlite_log.txt", `${fecha} Sqlite does not exist PC count\n`, { flag: 'a' }, err => {});
        }
    }

    dbpc.close()


    let listado = ["Raspberry1", "Raspberry2", "Raspberry3", "Raspberry5", "Raspberry7"]


    //BLE
    //mismo Proceso para obtener datos BLE, la diferencia es que recorremos la lista de Raspberrys
    for (i in listado){

        let dbble = new Database(`sqlite_databases/${fecha}/${listado[i]}/${fecha}_DatosBLE_${listado[i]}.db`);


        try{
            const stmt = dbble.prepare(`select * from ble_data Where Timestamp BETWEEN ? and ? ORDER BY Timestamp`);
            const datos = stmt.all(first,last);

            for (j in datos){

                datos[j].idRasp = listado[i]

            }

            await ble.insertMany(datos)
            console.log(`BLE: Recovered ${datos.length} messages from ${listado[i]}`)
            //dbble.close()


        }catch(Exc){
        
            if (Exc.code == 'SQLITE_ERROR'){

                fs.writeFile("./sqlite_log.txt", `${fecha} Sqlite does not exist BLE ${listado[i]}\n`, { flag: 'a' }, err => {});
            }else if(Exc.code == 'SQLITE_CORRUPT'){

                //Tocaria volver a descargar

            }else{
                console.log(Exc)
            }
        }

    }


    //Mismo procedimiento para Wifi para los 3 canales

    
    //Wifi canal 1
    
    for (i in listado){

        let dbwifi = new Database(`sqlite_databases/${fecha}/${listado[i]}/${fecha}_Sniffer-Wific1_${listado[i]}.db`);
    
    
        try{
            const stmt = dbwifi.prepare(`select * from ProbeRequestFrames Where Timestamp BETWEEN ? and ? ORDER BY Timestamp`);
            const datos = stmt.all(first,last);
    
            for (j in datos){
    
                datos[j].id = listado[i]
    
            }
    
            await wifi.insertMany(datos)
            console.log(`Recovered wifi c1 ${datos.length} messages from ${listado[i]}\n`)
            dbwifi.close()
    
    
        }catch(Exc){
        
            if (Exc.code == 'SQLITE_ERROR'){
    
                fs.writeFile("./sqlite_log.txt", `${fecha} Sqlite does not exist Wifi channel 1 ${listado[i]}`, { flag: 'a' }, err => {});
            }
        }
    
    }
    
    //Wifi canal 6
    
    
    for (i in listado){
    
        let dbwifi = new Database(`sqlite_databases/${fecha}/${listado[i]}/${fecha}_Sniffer-Wific6_${listado[i]}.db`);
    
    
        try{
            const stmt = dbwifi.prepare(`select * from ProbeRequestFrames Where Timestamp BETWEEN ? and ? ORDER BY Timestamp`);
            const datos = stmt.all(first,last);
    
            for (j in datos){
    
                datos[j].id = listado[i]
                
            }
    
            await wifi.insertMany(datos)
            console.log(`Recovered wifi c6 ${datos.length} messages from ${listado[i]}\n`)
            dbwifi.close()
    
    
        }catch(Exc){
        
            if (Exc.code == 'SQLITE_ERROR'){
    
                fs.writeFile("./sqlite_log.txt", `${fecha} Sqlite does not exist Wifi channel 6 ${listado[i]}`, { flag: 'a' }, err => {});
            }
        }
    
    }
    
    //Wifi canal 11
    
    
    for (i in listado){
    
        let dbwifi = new Database(`sqlite_databases/${fecha}/${listado[i]}/${fecha}_Sniffer-Wific11_${listado[i]}.db`);
    
    
        try{
            const stmt = dbwifi.prepare(`select * from ProbeRequestFrames Where Timestamp BETWEEN ? and ? ORDER BY Timestamp`);
            const datos = stmt.all(first,last);
    
            for (j in datos){
    
                datos[j].id = listado[i]
                
            }
    
            await wifi.insertMany(datos)
            console.log(`Recovered Wifi c11 ${datos.length} messages from ${listado[i]}\n`)
            dbwifi.close()
    
    
        }catch(Exc){
        
            if (Exc.code == 'SQLITE_ERROR'){
    
                fs.writeFile("./sqlite_log.txt", `${fecha} Sqlite does not exist Wifi channel 11 ${listado[i]}`, { flag: 'a' }, err => {});
            }
        }
    
    }

    
}   

//Funcion principal
async function main(){

    await inicio()

    console.log("Ahora a recuperar")

    await descargaryprocesar(fecha)
}

main()




