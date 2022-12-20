const client = require("../index");
let pronote = require("../pronote.js")
let fs = require("fs")
const CronJob = require('cron').CronJob;
client.on('ready', async () => {
    let tasks = {}
    console.log(client.user.tag + ' is ready !')

    const  taksFiles = fs.readdirSync("./tasks").filter(file => file.endsWith('.js')); // get the name of every js file in the tasks folder.
    for(const file of taksFiles){ // require all tasks file and set the cron.
        const task = require(`../tasks/${file}`);
        console.log("Loading task",task.task.name)
        tasks[task.task.name] = task // save the task in the tasks object with 
        if(task.task.cron){new CronJob(task.task.cron, task.run, null, true, 'Europe/Paris', null, task.task.runOnStartup)}
    }
    client.tasks = tasks;
    
});