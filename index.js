const {Client, Collection, Intents } = require('discord.js')
require('dotenv').config();

const sqlite = require('better-sqlite3')
const fs = require("fs")

// DB Creation check
let db;
(async() => {
    if(!fs.existsSync("data.db")){
        db = new sqlite('./data.db');
        await createDB(db);
    }
    else db = new sqlite('./data.db');
})()




const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

module.exports = client; // export client

// Global Variables
client.slashCommands = new Collection();
client.config = require("./config");
client.db = db

client.pronote = require("./pronote")


client.login(process.env.BOT_TOKEN)
require("./handler")(client);



async function createDB(db){
    try {
        db.exec(`
        CREATE TABLE "changementedt" (
            "id" TEXT NOT NULL,
            "timestamp" INTEGER,
            "prof" TEXT,
            "matiere" TEXT,
            "raison" TEXT
        );
        
        CREATE TABLE "homework" (
            "id" TEXT NOT NULL UNIQUE,
            "matiere" TEXT,
            "description" TEXT,
            "date_rendue" TEXT,
            "date_donne" TEXT,
            "fichiers" TEXT,
            "fait" INTEGER,
            "message_id" TEXT,
            PRIMARY KEY("id")
        );
        
        CREATE TABLE "moyenne" (
            "matiere" TEXT,
            "moyenne" INTEGER,
            "moyenne_classe" INTEGER
        );

        CREATE TABLE "config" (
            "name"	TEXT NOT NULL UNIQUE,
            "value"	TEXT
        );

        CREATE TABLE "holidays" (
            "name"	TEXT,
            "from"	INTEGER,
            "to"	TEXT,
            "reminder_before_start"	INTEGER DEFAULT 0,
            "reminder_start"	INTEGER DEFAULT 0,
            "reminder_before_end"	INTEGER DEFAULT 0,
            "reminder_end"	INTEGER DEFAULT 0
    );`);
    db.prepare('INSERT INTO moyenne (matiere) VALUES (?)').run("global");
    console.log("DB successfully created !");
    } catch (error) {
        console.log("Cannot create DB... Aborting...")
        throw error;
    }
}