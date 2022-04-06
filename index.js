const Discord = require('discord.js')
require('dotenv').config();
let pronote = require('./pronote.js')
let sqlite = require('sqlite3')
const fs = require('fs');
// const moment = require('moment')
const CronJob = require('cron').CronJob;
const config = require('./config.json')
let db = new sqlite.Database('./data.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);

const client = new Discord.Client({
    intents: 32767
})
let tasks = {}


client.on('ready', async () => {
    console.log(client.user.tag + ' is ready !')
    
    await pronote.getAllData(async(reponse) => { // get all data from pronote and save it to db.json
        // console.log(reponse)
        const  taksFiles = fs.readdirSync("./tasks").filter(file => file.endsWith('.js')); // get the name of every js file in the tasks folder.
        for(const file of taksFiles){ // require all tasks file and set the cron.
            const task = require(`./tasks/${file}`);
            console.log("Loading task",task.task.name)
            tasks[task.task.name] = task
            if(task.task.cron){let cron = new CronJob(task.task.cron, task.run, null, true, 'Europe/Paris')}
            if(task.task.runOnStartup === true)task.run();
        }
    })
    // setInterval(pronote.getAllData, 60000 * 30)
})

client.on("messageCreate", async (message) => {
    if (message.content.startsWith("!moyenne")) {
        await pronote.getMoyenne((m) => message.reply("Votre moyenne actuelle est de " + m))
    }
    if(message.content.startsWith("!refetch"))pronote.getAllData()
    if (message.content.startsWith("!task")) {
        let args = message.content.split(" ")
        if(args[1] === "list"){
            return message.reply("La liste des tache disponibles est: " + Object.getOwnPropertyNames(tasks).join(", ") + ".")
        }
        let task = tasks[args[1]]
        if(!task){
            return message.reply("La tache " +args[1] + " n'éxiste pas !" + "\nLes taches suivantes sont disponible: " + Object.getOwnPropertyNames(tasks).join(", "))
        }
        else{
            task.run()
            message.reply("La tache " + args[1] + " a bien été lancée.")
        }
    }
})

client.login(process.env.BOT_TOKEN)

async function updateMoyenne() {
}

async function checkAbsence() {
    await pronote.checkAbsentProfORCoursAnnule((reponse) => {
        // console.log(reponse)
        db.get(`SELECT * FROM changementedt WHERE date="${new Date().getDay() + "-" + new Date().getMonth()}" AND number_of_absence=${reponse.absence ? reponse.absence : "0"} AND number_of_cours_annule=${reponse.annule ? reponse.annule : "0"}`, (err, data) => {
            console.log(0)
            if (!data) {
                console.log(1)
                if (reponse.absence != null && reponse.annule != null) {
                    console.log(2)
                    client.channels.cache.get("799769654502490142").send(`<@${config.owner_id}> Vous avez ${reponse.absence} prof absent et ${reponse.annule} cours annulé. Vous devriez allez voir sur pronote.`)
                    db.run(`INSERT INTO absence (date, number_of_absence, number_of_cours_annule)VALUES ("${new Date().getDay() + "-" + new Date().getMonth()}", ${reponse.absence}, ${reponse.annule})`)
                } else if (reponse.absence != null) {
                    console.log(3)
                    client.channels.cache.get("799769654502490142").send(`<@${config.owner_id}> Vous avez ${reponse.absence} prof absent. Vous devriez allez voir sur pronote.`)
                    db.run(`INSERT INTO absence (date, number_of_absence, number_of_cours_annule)VALUES ("${new Date().getDay() + "-" + new Date().getMonth()}", ${reponse.absence}, 0)`)
                } else if (reponse.annule != null) {
                    console.log(4)
                    client.channels.cache.get("799769654502490142").send(`<@${config.owner_id}> Vous avez ${reponse.annule} cours annulé. Vous devriez allez voir sur pronote.`)
                    db.run(`INSERT INTO absence (date, number_of_absence, number_of_cours_annule)VALUES ("${new Date().getDay() + "-" + new Date().getMonth()}", 0, ${reponse.annule})`)
                }
            }
        })


    })
}





async function main() {

}

module.exports = {
    db: db,
    client: client,
    
}