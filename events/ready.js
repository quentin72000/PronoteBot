const client = require("../index");
const fs = require("fs");
const { CronJob } = require("cron");

const tasksFiles = fs.readdirSync("./tasks").filter(file => file.endsWith(".js"));

client.on("ready", async() => {
    const tasks = {};
    console.log(client.user.tag + " is ready !");

    for (const file of tasksFiles) {
        const task = require(`../tasks/${file}`);

        const taskConfig = client.config.tasksConfig?.find(currentTaskConfig =>
            currentTaskConfig.name === task.task.name
        );
        if (taskConfig && !taskConfig.enabled) {
            console.warn("Task", task.task.name, "is disabled in the config, skipping it.");
            continue;
        }

        console.log("Loading task",task.task.name);
        tasks[task.task.name] = task;

        if (task.task.cron) {
            // eslint-disable-next-line no-new
            new CronJob(task.task.cron, task.run, null, true, client.config.timezone ?
                client.config.timezone
                : "Europe/Paris",
            null,task.task.runOnStartup);
        }

    }
    client.tasks = tasks;
});