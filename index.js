const {Client, Collection} = require('discord.js')
require('dotenv').config();
let pronote = require('./pronote.js')
let sqlite = require('sqlite3')
// const config = require('./config.json')

let db = new sqlite.Database('./data.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);

const client = new Client({
    intents: 32767
});

module.exports = client; // export client

// Global Variables
client.commands = new Collection();
client.slashCommands = new Collection();
client.config = require("./config.json");
client.db = db


client.on("messageCreate", async (message) => {
    if(message.content.startsWith("!refetch"))pronote.getAllData()
})

client.login(process.env.BOT_TOKEN)
require("./handler")(client);

