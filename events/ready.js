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
            currentTaskConfig.name === task.name);

        if (taskConfig && !taskConfig.enabled) {
            console.warn("Task", task.name, "is disabled in the config, skipping it.");
            continue;
        }

        console.log("Loading task",task.name);
        tasks[task.name] = task;
    }
    client.cronTasks = new CronJob(client.config.cron, runTasks, null, true, client.config.timezone ?
        client.config.timezone
        : "Europe/Paris",
    null);
    client.tasks = tasks;
});

async function runTasks() {
    console.log("Running tasks...");
    const session = await client.pronote.login();
    try {
        for (const task in client.tasks) {
            await client.tasks[task].run(session);
        }
    } catch (error) {
        console.error("Error while running tasks:", error);
    } finally {
        await client.pronote.logout(session, "cron tasks run");
    }
}