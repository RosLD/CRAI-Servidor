const fs = require('fs');
const https = require('https');
const express = require('express');
var CronJob = require('cron').CronJob;
require('dotenv').config();


/* Timestamp functions*/
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

var fileRt = getFecha();

var job = new CronJob(
    '10 00 22 * * *',
    () => {
        fileRt = getFecha()
    });
console.log("Starting CRON job");
job.start()

//Aqui esta definido el funcionamiento del servicio REST
class Rest {
    constructor() {

        this.app = express();

        this.port = process.env.PORT
        
        //Middleware
        this.middlewares();

        //Rutas de mi aplicacion
        this.routes();

    }

    middlewares(){

        //directorio publico
        this.app.use(express.static('public'));
    }

    routes() {

        //Estas son las peticiones que responde

        //Get People count csvs
        this.app.get('/upct_hd/pcount', (req, res) => {
            
            res.download(`csv/PersonCount_${fileRt}_7-22.csv`)
        });
        
        //Si se quiere obtener por fecha
        this.app.get('/upct_hd/pcount/:fecha', (req, res) => {
            
            res.download(`csv/PersonCount_${req.params.fecha}_7-22.csv`)
        });

        //Get wifi csvs
        this.app.get('/upct_hd/wifi', (req, res) => {
            
            res.download(`csv/wifi_${fileRt}_7-22.csv`)
        });

        //Si se quiere obtener por fecha
        this.app.get('/upct_hd/wifi/:fecha', (req, res) => {
            
            res.download(`csv/wifi_${req.params.fecha}_7-22.csv`)
        });

        //Get wifi csvs
        this.app.get('/upct_hd/ble', (req, res) => {
            
            res.download(`csv/ble_${fileRt}_7-22.csv`)
        });

        //Si se quiere obtener por fecha
        this.app.get('/upct_hd/ble/:fecha', (req, res) => {
            
            res.download(`csv/ble_${req.params.fecha}_7-22.csv`)
        });

    }
    //Servicio HTTPS
    listen(){
        https.createServer({
            key: fs.readFileSync('./certs/pkey.pem'),
            cert: fs.readFileSync('./certs/servercrt.crt')
        }, this.app).listen( this.port, () => {
            console.log('HTTPS Server running on port', this.port);
        });
    }

}





module.exports = Rest;  