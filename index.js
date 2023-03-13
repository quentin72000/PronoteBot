const {Client, Collection} = require('discord.js')
require('dotenv').config();
let pronote = require('./pronote.js')
let sqlite = require('sqlite3')
const fs = require("fs")


let db;
(async() => {
    if(!fs.existsSync("data.db")){
        db = new sqlite.Database('./data.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
        await createDB(db);
    }
    else db = new sqlite.Database('./data.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
})()




const client = new Client({
    intents: 32767
});

module.exports = client; // export client

// Global Variables
client.commands = new Collection();
client.slashCommands = new Collection();
client.config = require("./config");
client.db = db

client.pronote = require("./pronote")


client.login(process.env.BOT_TOKEN)
require("./handler")(client);



async function createDB(db){

    db.run(`CREATE TABLE "changementedt" (
        "date"	TEXT,
        "prof"	TEXT,
        "matiere"	TEXT,
        "horaire"	TEXT
    )`, (r, err) => handleError(err))

    db.run(`CREATE TABLE "homework" (
        "id"	TEXT NOT NULL UNIQUE,
        "matiere"	TEXT,
        "description"	TEXT,
        "date_rendue"	TEXT,
        "date_donne"	TEXT,
        "fichiers"	TEXT,
        "fait"	INTEGER,
        "message_id"	TEXT,
        PRIMARY KEY("id")
    )`, (r, err) => handleError(err))
    
    db.run(`CREATE TABLE "moyenne" (
        "matiere"	TEXT,
        "moyenne"	INTEGER,
        "moyenne_classe"	INTEGER
    )`, (r, err) => handleError(err))

    function handleError(err){
        if(err){
            console.log("Cannot create DB... Aborting...")
            console.error(err)
            process.exit(1)
        }
    }

}