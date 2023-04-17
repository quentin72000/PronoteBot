const client = require("../index");
let fs = require("fs")
const CronJob = require('cron').CronJob;

client.on('ready', async () => {
    let tasks = {}
    console.log(client.user.tag + ' is ready !')

    const  taksFiles = fs.readdirSync("./tasks").filter(file => file.endsWith('.js')); // get the name of every js file in the tasks folder.
    for(const file of taksFiles){ // require all tasks file and set the cron.
        const task = require(`../tasks/${file}`);
        
        let taskConfig = client.config.tasksConfig?.find(taskConfig => taskConfig.name === task.task.name)
        if(taskConfig && taskConfig.enabled === false){ // if the task is disabled in the config, skip it.
            console.warn("Task", task.task.name, "is disabled in the config, skipping it.");
            continue;
        }
        
        console.log("Loading task",task.task.name)
        tasks[task.task.name] = task // save the task in the tasks object.
        
        if(task.task.cron){new CronJob(task.task.cron, task.run, null, true, client.config.timezone ? client.config.timezone : "Europe/Paris", null, task.task.runOnStartup)}

    }
    client.tasks = tasks;
    
});