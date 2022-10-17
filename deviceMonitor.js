var request = require('request');
const botcrai = require('./models/bot_tel')
const database = require('./models/database')
var CronJob = require('cron').CronJob;

require("dotenv").config();

const nsen = database.getCollection("SensorManagement")

var options = {
  'method': 'GET',
  'url': `http://${process.env.sqlink}:18083/api/v4/clients`,
  'headers': {
    'Authorization': process.env.mqtt
  }
};
let ids = [{"id":'Raspberry1'},{"id":'Raspberry2'},{"id":'Raspberry3'},{"id":'Raspberry5'},{"id":'Raspberry6'},{"id":'Raspberry7'}]



const main = () => {

    request(options, function (error, response) {
        if (error) throw new Error(error);
        
        let datos = JSON.parse(response.body).data
        let okCount = 0;
        for(let i = 0;i<datos.length;i++){
            for(let j = 0;j<ids.length;j++){
                if((datos[i].clientid).includes((ids[j].id))){
                    
                 
                    let aux = (datos[i].clientid).split("_")[1]

                    ids[j].status = "OK"
                    
                    
                    switch(aux){

                        case "BLE":
                            ids[j].BLEface = "OK"
                        break;

                        case "c1":
                            ids[j].iface1 = "OK"
                        break;

                        case "c6":
                            ids[j].iface2 = "OK"
                        break;

                        case "c11":
                            ids[j].iface3 = "OK"
                        break;

                    }     
                    
                }
            }
        }
        
        //Check out
        let chain = 'Estado Raspberry y Sensores: \n'
        let sub = ''
        for(c in ids){
            let count = 0
            chain += `${ids[c].id}: `

            if(ids[c].status == undefined){
                sub += "Desconectado de MQTT"
            }else if(ids[c].id != "Raspberry6"){
                
                if(ids[c].BLEface == undefined)
                    sub += "BLE down "
                
                if(ids[c].iface1 == undefined)
                    count++;
                
                if(ids[c].iface2 == undefined)
                    count++;
                
                if(ids[c].iface3 == undefined)
                    count++;    
                
                if(count == 3)
                    sub += `${count} wifi antennas down`
                
                
            }

            if(sub == ''){
                sub += "OK"
                okCount += 1
            }
                  
              
            sub += "\n"
            
            chain += sub
            sub = ''
        }

        //console.log(ids)

        ids = [{"id":'Raspberry1'},{"id":'Raspberry2'},{"id":'Raspberry3'},{"id":'Raspberry5'},{"id":'Raspberry6'},{"id":'Raspberry7'}]
        
        console.log(chain)

        if(okCount == 6){
            chain = "Todo OK"
        }
        botcrai.botSendMessage(chain)

      });

}

let maxco2 = 1000

const main2 = () => {

    
    let chain = "ESP32 Sensors OK: "
    let sok = 0
    let sc = "ESP32 Down: "
    let cod = "CO2 Warning: "
    let bw = "Battery Warning: "

    nsen.find({}).toArray(function(err, result) {
        if (err) throw err;
        
        result.forEach(element => {
            
            if(element.found == 1){
                sok++
            }else{
                sc += element.Id+", "
            }

            if(element.CO2 > maxco2)
                cod += element.Id+", "
            
            if(element.Battery < 20)
                bw += element.Id+", "

        });

        chain += sok+"\n"+sc+"\n"

        if(cod.length > 13)
            chain += cod+"\n"
        
        if(bw.length > 17)
            chain += bw+"\n"

        botcrai.botSendMessage(chain)

        
      });

}


main()
//main2()

var job = new CronJob(
    `0,5,10,15,20,25,30,35,40,45,50,55 7-22 * * *`,
    //'00 00 22 * * *',
    main
);

console.log("Starting CRON job");
job.start()