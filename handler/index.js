const { glob } = require("glob");
const path = require("path");
const { Client } = require("discord.js");



/**
 * @param {Client} client
 */
module.exports = async (client) => {

    // Commands
    // const commandFiles = await glob(`${process.cwd()}/commands/**/*.js`);
    // commandFiles.map((value) => {
    //     const file = require(value);
    //     const splitted = value.split("/");
    //     const directory = splitted[splitted.length - 2];

    //     if (file.name) {
    //         const properties = { directory, ...file };
    //         client.commands.set(file.name, properties);
    //     }
    // });

    // Events
    const eventFiles = await glob(`${process.cwd()}/events/*.js`);
    eventFiles.map((value) => require(path.resolve(value)));

    // Slash Commands
    const slashCommands = await glob(
        `${process.cwd()}/SlashCommands/*/*.js`
    );

    const arrayOfSlashCommands = [];
    slashCommands.map((value) => {
        const file = require(path.resolve(value));
        if (!file?.name) return;
        client.slashCommands.set(file.name, file);

        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
        arrayOfSlashCommands.push(file);
    });
    client.on("ready", async () => {
        // Register for a single guild
        await client.guilds.cache
            .get(client.config.slashCommandGuildId)
            .commands.set(arrayOfSlashCommands);

        // Register for all the guilds the bot is in
        // await client.application.commands.set(arrayOfSlashCommands);
    });
};

