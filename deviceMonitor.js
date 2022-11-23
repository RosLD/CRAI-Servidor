var request = require('request');
const botcrai = require('./models/bot_tel')
var CronJob = require('cron').CronJob;

require("dotenv").config();



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

        //Get every sensor status
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

        //Here we loop in case something is wrong -> if the raspberry wasnt returned in api call
        for(c in ids){
            let count = 0
            chain += `${ids[c].id}: `

            //If something is wrong it will add the status in the msg chain
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
                
                
                if(count > 0){

                    sub += `${count} wifi antennas down`
                    
                }
                
                
                
            }

            if(sub == ""){
                sub += "OK"
                okCount += 1
            }
                  
              
            sub += "\n"
            
            chain += sub
            sub = ''
        }

        
        ids = [{"id":'Raspberry1'},{"id":'Raspberry2'},{"id":'Raspberry3'},{"id":'Raspberry5'},{"id":'Raspberry6'},{"id":'Raspberry7'}]
        
        console.log(chain)

        if(okCount == 6){
            chain = "Todo OK"
        }else{
            botcrai.failureWarn(chain)
        }
        botcrai.botSendMessage(chain)

      });

}


main()      //Invoke function once at start
   

var job = new CronJob(//Invoke every 10 minutes from 7 to 22
    `0,10,20,30,40,50 7-22 * * *`,
    //'00 00 22 * * *',
    main
);

console.log("Starting CRON job");
job.start()