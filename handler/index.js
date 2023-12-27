const { glob } = require("glob");
const path = require("path");

module.exports = async(client) => {
    const eventFiles = await glob(`${process.cwd()}/events/*.js`);
    eventFiles.map((value) => require(path.resolve(value)));

    const slashCommands = await glob(`${process.cwd()}/SlashCommands/*/*.js`);

    const arrayOfSlashCommands = slashCommands.map((value) => {
        const file = require(path.resolve(value));
        if (!file?.name) return null; // If there's no name, ignore the file.
        client.slashCommands.set(file.name, file);
        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;

        return file;
    }).filter(x => x !== null);

    client.on("ready", async() => {
        // Register for a single guild
        await client.guilds.cache
            .get(client.config.slashCommandGuildId)
            .commands.set(arrayOfSlashCommands);
    });
};

