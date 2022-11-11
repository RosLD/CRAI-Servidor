const Mqtt_cli = require('./models/mqtt_cli')
const Server = require('./models/rest');

//Llamada y puesta en marcha  del servicio Rest
const server = new Server();

server.listen();

//Llamada al cliente mqtt
const mqttclient = new Mqtt_cli();

