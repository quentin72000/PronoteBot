const moment = require("moment");
require("moment-duration-format");
const { ApplicationCommandType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Renvoie le ping de discord et du bot.",
    type: ApplicationCommandType.ChatInput,

    run: async(client, interaction) => {
        const uptime = moment.duration(client.uptime)
            .format(" D [jours(s)], H [heure(s)], m [minute(s)], s [seconde(s)]");
        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setTitle("Ping et Uptime")
                .setDescription(`**Uptime** : ${uptime}`
                  + `\n**Latence du bot** : ${Date.now() - interaction.createdTimestamp}ms`
                  + `\n**Latence API discord** : ${client.ws.ping}ms`)
                .setColor("#1E7751")]
        });
    }
};
