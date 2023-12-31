const { Client, Collection, GatewayIntentBits, RESTJSONErrorCodes } = require("discord.js");
require("dotenv").config();

const sqlite = require("better-sqlite3");
const fs = require("fs");

// DB Creation check
let db;
(async() => {
    // TODO: Convert this to async fs.access
    // eslint-disable-next-line n/no-sync
    if (!fs.existsSync("data.db")) {
        db = new sqlite("./data.db");
        await createDB();
    }
    else db = new sqlite("./data.db");
})();


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

module.exports = client; // export client

// Global Variables
client.slashCommands = new Collection();
client.config = require("./config");
client.db = db;

client.pronote = require("./pronote");


client.login(process.env.BOT_TOKEN).catch((err) => {
    if (err.code === RESTJSONErrorCodes.InvalidToken || err.code === "TokenInvalid") {
        throw new Error("Can't login. The bot token is invalid.");
    }
    console.error("Can't login. Please check your config or bot token.");
    throw err;
});
require("./handler")(client);


async function createDB() {
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
            "name" TEXT NOT NULL UNIQUE,
            "value" TEXT
        );

        CREATE TABLE "holidays" (
            "name" TEXT,
            "from" INTEGER,
            "to" TEXT,
            "reminder_before_start" INTEGER DEFAULT 0,
            "reminder_start" INTEGER DEFAULT 0,
            "reminder_before_end" INTEGER DEFAULT 0,
            "reminder_end" INTEGER DEFAULT 0
    );`);
        db.prepare("INSERT INTO moyenne (matiere) VALUES (?)").run("global");
        console.log("DB successfully created !");
    } catch (error) {
        throw new Error("Cannot create DB... Aborting... " + error);
    }
}