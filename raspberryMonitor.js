var request = require('request');
const botcrai = require('./models/bot_tel')

var options = {
  'method': 'GET',
  'url': 'http://10.147.18.134:18083/api/v4/clients',
  'headers': {
    'Authorization': 'Basic YWRtaW46NTgyMzE5Mzd1cGN0MjAyMg=='
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
        let chain = 'Estado Raspberry: \n'
        let sub = ''
        for(c in ids){
            let count = 0
            chain += `${ids[c].id}: `

            if(ids[c].status == undefined){
                sub += "Disconnected from MQTT"
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

        if(okCount = 6){
            chain = "Todo OK"
        }
        botcrai.botSendMessage(chain)

      });

}


main()
setInterval(main,1000*60*10)