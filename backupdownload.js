const { exec } = require("child_process");
var CronJob = require('cron').CronJob;
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

const main = () => {

    exec(`./backupdownload.sh ${getFecha()}`, (error,stdout,stderr) => {

        if(error){
            console.log(error)
        }
        console.log(stdout)
        console.log("error ->"+stderr)
    
    })

}




var job = new CronJob(
    '00 22 * * *',
    
    main
);

console.log("Starting CRON job");
job.start()